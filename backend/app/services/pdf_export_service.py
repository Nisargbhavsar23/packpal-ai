import re
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from html import escape
from io import BytesIO
from typing import Any

from fastapi import HTTPException, status
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.ai_suggestion import AISuggestion
from app.models.enums import ItemPriority, ItemStatus
from app.models.item import Item
from app.models.trip import Trip
from app.models.trip_member import TripMember
from app.models.user import User
from app.services.trip_service import ensure_trip_member


def build_trip_pdf_report(db: Session, trip_id: uuid.UUID, current_user: User) -> tuple[bytes, str]:
    ensure_trip_member(db, trip_id, current_user.id)
    trip = db.scalar(
        select(Trip)
        .options(
            selectinload(Trip.members).selectinload(TripMember.user),
            selectinload(Trip.items).selectinload(Item.category),
            selectinload(Trip.items).selectinload(Item.assigned_user),
        )
        .where(Trip.id == trip_id)
    )
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    suggestions = db.scalars(
        select(AISuggestion)
        .where(AISuggestion.trip_id == trip_id)
        .order_by(AISuggestion.created_at.desc())
        .limit(3)
    ).all()

    pdf_bytes = _render_trip_report(trip, suggestions)
    return pdf_bytes, f'attachment; filename="{build_report_filename(trip.title)}"'


def build_report_filename(trip_title: str) -> str:
    safe_title = re.sub(r"[^a-zA-Z0-9]+", "-", trip_title.strip().lower()).strip("-")
    if not safe_title:
        safe_title = "trip"
    return f"packpal-trip-report-{safe_title[:60]}.pdf"


def _render_trip_report(trip: Trip, suggestions: list[AISuggestion]) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.65 * inch,
        title="PackPal AI Trip Packing Report",
    )
    styles = _build_styles()
    story = []
    generated_at = datetime.now(timezone.utc)
    items = sorted(trip.items, key=lambda item: ((item.category.name if item.category else "Uncategorized").lower(), item.name.lower()))
    summary = _build_summary(items)

    story.extend(
        [
            Paragraph("PackPal AI", styles["Brand"]),
            Paragraph("PackPal AI Trip Packing Report", styles["Title"]),
            Spacer(1, 0.16 * inch),
            _key_value_table(
                [
                    ("Trip name", trip.title),
                    ("Destination", trip.destination),
                    ("Trip type", trip.trip_type),
                    ("Date range", f"{_format_date(trip.start_date)} - {_format_date(trip.end_date)}"),
                    ("Description", trip.description or "-"),
                    ("Generated on", _format_datetime(generated_at)),
                ],
                styles,
            ),
            Spacer(1, 0.22 * inch),
            _section_heading("Checklist & Status Summary", styles),
            _summary_table(summary, styles),
            Spacer(1, 0.22 * inch),
            _section_heading("Members", styles),
            _members_table(trip.members, styles),
            Spacer(1, 0.22 * inch),
            _section_heading("Packing Checklist", styles),
        ]
    )

    story.extend(_checklist_section(items, styles))
    story.extend([Spacer(1, 0.16 * inch), _section_heading("High Priority Pending", styles)])
    story.extend(_high_priority_pending_section(items, styles))
    story.extend([Spacer(1, 0.16 * inch), _section_heading("Member-wise Assignments", styles)])
    story.extend(_member_assignment_section(items, trip.members, styles))
    story.extend([Spacer(1, 0.16 * inch), _section_heading("Recent AI Recommendations", styles)])
    story.extend(_ai_recommendations_section(suggestions, styles))

    doc.build(story, onFirstPage=_draw_footer, onLaterPages=_draw_footer)
    buffer.seek(0)
    return buffer.getvalue()


def _build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "Brand": ParagraphStyle(
            "PackPalBrand",
            parent=base["Normal"],
            textColor=colors.HexColor("#047857"),
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=14,
            alignment=TA_CENTER,
        ),
        "Title": ParagraphStyle(
            "PackPalTitle",
            parent=base["Title"],
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "Heading": ParagraphStyle(
            "PackPalHeading",
            parent=base["Heading2"],
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            spaceBefore=6,
            spaceAfter=7,
        ),
        "Small": ParagraphStyle(
            "PackPalSmall",
            parent=base["Normal"],
            textColor=colors.HexColor("#334155"),
            fontSize=8.5,
            leading=11,
        ),
        "Cell": ParagraphStyle(
            "PackPalCell",
            parent=base["Normal"],
            textColor=colors.HexColor("#1e293b"),
            fontSize=8.5,
            leading=11,
        ),
        "Label": ParagraphStyle(
            "PackPalLabel",
            parent=base["Normal"],
            textColor=colors.HexColor("#475569"),
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
        ),
        "Footer": ParagraphStyle(
            "PackPalFooter",
            parent=base["Normal"],
            textColor=colors.HexColor("#64748b"),
            fontSize=8,
            leading=10,
            alignment=TA_RIGHT,
        ),
    }


def _section_heading(text: str, styles: dict[str, ParagraphStyle]) -> Paragraph:
    return Paragraph(_safe(text), styles["Heading"])


def _key_value_table(rows: list[tuple[str, Any]], styles: dict[str, ParagraphStyle]) -> Table:
    data = [[Paragraph(_safe(label), styles["Label"]), Paragraph(_safe(value), styles["Cell"])] for label, value in rows]
    table = Table(data, colWidths=[1.35 * inch, 5.05 * inch])
    table.setStyle(_base_table_style())
    return table


def _summary_table(summary: dict[str, int], styles: dict[str, ParagraphStyle]) -> Table:
    rows = [
        ("Total checklist items", summary["total"]),
        ("Pending items", summary["pending"]),
        ("Packed items", summary["packed"]),
        ("Delivered items", summary["delivered"]),
        ("High-priority pending", summary["high_pending"]),
        ("Readiness score", f"{summary['readiness_score']}%"),
    ]
    return _key_value_table(rows, styles)


def _members_table(members: list[TripMember], styles: dict[str, ParagraphStyle]) -> Table:
    data = [[_header("Name", styles), _header("Email", styles), _header("Role", styles)]]
    if not members:
        data.append([_cell("No members found.", styles), _cell("-", styles), _cell("-", styles)])
    for member in sorted(members, key=lambda trip_member: trip_member.user.name.lower()):
        data.append(
            [
                _cell(member.user.name, styles),
                _cell(member.user.email, styles),
                _cell(member.role.value, styles),
            ]
        )
    table = Table(data, colWidths=[1.7 * inch, 3.25 * inch, 1.15 * inch], repeatRows=1)
    table.setStyle(_base_table_style(header=True))
    return table


def _checklist_section(items: list[Item], styles: dict[str, ParagraphStyle]) -> list[Any]:
    if not items:
        return [Paragraph("No checklist items added yet.", styles["Cell"])]

    grouped_items: dict[str, list[Item]] = defaultdict(list)
    for item in items:
        grouped_items[item.category.name if item.category else "Uncategorized"].append(item)

    flowables: list[Any] = []
    for category, category_items in grouped_items.items():
        flowables.append(Paragraph(_safe(category), styles["Label"]))
        flowables.append(_items_table(category_items, styles))
        flowables.append(Spacer(1, 0.12 * inch))
    return flowables


def _items_table(items: list[Item], styles: dict[str, ParagraphStyle]) -> Table:
    data = [[
        _header("Item", styles),
        _header("Qty", styles),
        _header("Priority", styles),
        _header("Status", styles),
        _header("Assigned", styles),
        _header("Due", styles),
        _header("Notes", styles),
    ]]
    for item in items:
        data.append(
            [
                _cell(item.name, styles),
                _cell(item.quantity, styles),
                _cell(item.priority.value, styles),
                _cell(item.status.value, styles),
                _cell(item.assigned_user.name if item.assigned_user else "Unassigned", styles),
                _cell(_format_date(item.due_date), styles),
                _cell(item.notes or "-", styles),
            ]
        )
    table = Table(data, colWidths=[1.35 * inch, 0.38 * inch, 0.75 * inch, 0.72 * inch, 1.0 * inch, 0.72 * inch, 1.18 * inch], repeatRows=1)
    table.setStyle(_base_table_style(header=True))
    return table


def _high_priority_pending_section(items: list[Item], styles: dict[str, ParagraphStyle]) -> list[Any]:
    high_pending = [item for item in items if item.priority == ItemPriority.HIGH and item.status == ItemStatus.PENDING]
    if not high_pending:
        return [Paragraph("No high-priority pending items.", styles["Cell"])]
    return [_items_table(high_pending, styles)]


def _member_assignment_section(items: list[Item], members: list[TripMember], styles: dict[str, ParagraphStyle]) -> list[Any]:
    if not items:
        return [Paragraph("No assignments yet because no checklist items have been added.", styles["Cell"])]

    grouped_items: dict[str, list[Item]] = {member.user.name: [] for member in members}
    grouped_items["Unassigned"] = []
    for item in items:
        name = item.assigned_user.name if item.assigned_user else "Unassigned"
        grouped_items.setdefault(name, []).append(item)

    flowables: list[Any] = []
    for member_name, assigned_items in grouped_items.items():
        if not assigned_items:
            continue
        flowables.append(Paragraph(_safe(member_name), styles["Label"]))
        compact_rows = [[_header("Item", styles), _header("Status", styles), _header("Priority", styles), _header("Category", styles)]]
        for item in assigned_items:
            compact_rows.append(
                [
                    _cell(item.name, styles),
                    _cell(item.status.value, styles),
                    _cell(item.priority.value, styles),
                    _cell(item.category.name if item.category else "Uncategorized", styles),
                ]
            )
        table = Table(compact_rows, colWidths=[2.3 * inch, 1.1 * inch, 1.1 * inch, 1.6 * inch], repeatRows=1)
        table.setStyle(_base_table_style(header=True))
        flowables.extend([table, Spacer(1, 0.12 * inch)])
    return flowables


def _ai_recommendations_section(suggestions: list[AISuggestion], styles: dict[str, ParagraphStyle]) -> list[Any]:
    if not suggestions:
        return [Paragraph("No AI recommendations generated yet.", styles["Cell"])]

    data = [[_header("Type", styles), _header("Provider", styles), _header("Created", styles), _header("Summary", styles)]]
    for suggestion in suggestions:
        data.append(
            [
                _cell(suggestion.suggestion_type, styles),
                _cell(suggestion.provider, styles),
                _cell(_format_datetime(suggestion.created_at), styles),
                _cell(_extract_suggestion_summary(suggestion.output_data), styles),
            ]
        )
    table = Table(data, colWidths=[1.35 * inch, 0.85 * inch, 1.25 * inch, 2.65 * inch], repeatRows=1)
    table.setStyle(_base_table_style(header=True))
    return [table]


def _extract_suggestion_summary(output_data: dict[str, Any] | None) -> str:
    if not output_data:
        return "-"
    for key in ("summary", "answer"):
        value = output_data.get(key)
        if isinstance(value, str) and value.strip():
            return _truncate(value.strip(), 220)
    for key in ("items", "missing_items", "suggested_actions"):
        value = output_data.get(key)
        if isinstance(value, list) and value:
            return _truncate(f"{len(value)} suggested item/action(s)", 220)
    return "-"


def _build_summary(items: list[Item]) -> dict[str, int]:
    total = len(items)
    pending = sum(1 for item in items if item.status == ItemStatus.PENDING)
    packed = sum(1 for item in items if item.status == ItemStatus.PACKED)
    delivered = sum(1 for item in items if item.status == ItemStatus.DELIVERED)
    high_pending = sum(1 for item in items if item.priority == ItemPriority.HIGH and item.status == ItemStatus.PENDING)
    readiness_score = 0 if total == 0 else round(((packed + delivered) / total) * 100)
    return {
        "total": total,
        "pending": pending,
        "packed": packed,
        "delivered": delivered,
        "high_pending": high_pending,
        "readiness_score": readiness_score,
    }


def _base_table_style(header: bool = False) -> TableStyle:
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e1")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]
    if header:
        commands.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ecfdf5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#065f46")),
            ]
        )
    return TableStyle(commands)


def _header(text: Any, styles: dict[str, ParagraphStyle]) -> Paragraph:
    return Paragraph(_safe(text), styles["Label"])


def _cell(text: Any, styles: dict[str, ParagraphStyle]) -> Paragraph:
    return Paragraph(_safe(text), styles["Cell"])


def _draw_footer(canvas, doc) -> None:
    canvas.saveState()
    footer = f"Generated by PackPal AI  |  Page {doc.page}"
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawRightString(letter[0] - 0.55 * inch, 0.35 * inch, footer)
    canvas.restoreState()


def _format_date(value: Any) -> str:
    if value is None:
        return "-"
    return value.strftime("%b %d, %Y") if hasattr(value, "strftime") else str(value)


def _format_datetime(value: datetime | None) -> str:
    if value is None:
        return "-"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).strftime("%b %d, %Y %H:%M UTC")


def _safe(value: Any) -> str:
    text = "-" if value is None else str(value)
    return escape(text).replace("\n", "<br/>")


def _truncate(value: str, max_length: int) -> str:
    if len(value) <= max_length:
        return value
    return f"{value[: max_length - 3].rstrip()}..."
