"""create initial packpal ai tables

Revision ID: 20260611_0001
Revises:
Create Date: 2026-06-11
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260611_0001"
down_revision = None
branch_labels = None
depends_on = None


trip_role_enum = postgresql.ENUM("OWNER", "ADMIN", "MEMBER", "VIEWER", name="trip_role")
item_priority_enum = postgresql.ENUM("LOW", "MEDIUM", "HIGH", name="item_priority")
item_status_enum = postgresql.ENUM("PENDING", "PACKED", "DELIVERED", name="item_status")


def upgrade() -> None:
    bind = op.get_bind()
    trip_role_enum.create(bind, checkfirst=True)
    item_priority_enum.create(bind, checkfirst=True)
    item_status_enum.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)

    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_categories")),
    )

    op.create_table(
        "templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("trip_type", sa.String(length=100), nullable=False),
        sa.Column("template_data", sa.JSON(), nullable=False),
        sa.Column("is_system_template", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_templates")),
    )

    op.create_table(
        "trips",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("destination", sa.String(length=255), nullable=False),
        sa.Column("trip_type", sa.String(length=100), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], name=op.f("fk_trips_created_by_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_trips")),
    )

    op.create_table(
        "trip_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", postgresql.ENUM(name="trip_role", create_type=False), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"], name=op.f("fk_trip_members_trip_id_trips")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_trip_members_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_trip_members")),
        sa.UniqueConstraint("trip_id", "user_id", name="uq_trip_members_trip_id_user_id"),
    )

    op.create_table(
        "items",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("priority", postgresql.ENUM(name="item_priority", create_type=False), nullable=False),
        sa.Column("status", postgresql.ENUM(name="item_status", create_type=False), nullable=False),
        sa.Column("assigned_to_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"], name=op.f("fk_items_assigned_to_id_users")),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], name=op.f("fk_items_category_id_categories")),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], name=op.f("fk_items_created_by_id_users")),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"], name=op.f("fk_items_trip_id_trips")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_items")),
    )

    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", sa.String(length=100), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"], name=op.f("fk_notifications_trip_id_trips")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_notifications_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_notifications")),
    )

    op.create_table(
        "ai_suggestions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("suggestion_type", sa.String(length=100), nullable=False),
        sa.Column("input_data", sa.JSON(), nullable=False),
        sa.Column("output_data", sa.JSON(), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"], name=op.f("fk_ai_suggestions_trip_id_trips")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ai_suggestions")),
    )

    op.create_table(
        "item_status_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("old_status", postgresql.ENUM(name="item_status", create_type=False), nullable=True),
        sa.Column("new_status", postgresql.ENUM(name="item_status", create_type=False), nullable=False),
        sa.Column("changed_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["changed_by_id"], ["users.id"], name=op.f("fk_item_status_logs_changed_by_id_users")),
        sa.ForeignKeyConstraint(["item_id"], ["items.id"], name=op.f("fk_item_status_logs_item_id_items")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_item_status_logs")),
    )


def downgrade() -> None:
    op.drop_table("item_status_logs")
    op.drop_table("ai_suggestions")
    op.drop_table("notifications")
    op.drop_table("items")
    op.drop_table("trip_members")
    op.drop_table("trips")
    op.drop_table("templates")
    op.drop_table("categories")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    item_status_enum.drop(bind, checkfirst=True)
    item_priority_enum.drop(bind, checkfirst=True)
    trip_role_enum.drop(bind, checkfirst=True)
