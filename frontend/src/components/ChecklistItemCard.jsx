import ItemStatusBadge from "./ItemStatusBadge";
import PriorityBadge from "./PriorityBadge";

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

const statusOptions = ["PENDING", "PACKED", "DELIVERED"];

function ChecklistItemCard({ item, isUpdatingStatus, onDelete, onEdit, onStatusChange, onView }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{item.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {item.category_name} • Quantity {item.quantity}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={item.priority} />
          <ItemStatusBadge status={item.status} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned to</p>
          <p className="mt-1 font-semibold text-slate-950">{item.assigned_to?.name || "Unassigned"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due date</p>
          <p className="mt-1 font-semibold text-slate-950">{item.due_date ? formatDate(item.due_date) : "Not set"}</p>
        </div>
      </div>

      {item.notes && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">{item.notes}</p>}

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              disabled={isUpdatingStatus || item.status === status}
              onClick={() => onStatusChange(item, status)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                item.status === status
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onView(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            View
          </button>
          <button type="button" onClick={() => onEdit(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Edit
          </button>
          <button type="button" onClick={() => onDelete(item)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default ChecklistItemCard;
