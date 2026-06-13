import ItemStatusBadge from "./ItemStatusBadge";
import LoadingSpinner from "./LoadingSpinner";
import PriorityBadge from "./PriorityBadge";

function formatDateTime(value) {
  if (!value) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ItemDetailModal({ error, isLoading, isOpen, item, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 px-5 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{item?.name || "Checklist item"}</h2>
            <p className="mt-1 text-sm text-slate-500">Item detail and status history</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>

        {isLoading && (
          <div className="mt-8 text-center">
            <LoadingSpinner label="Loading item" />
          </div>
        )}

        {error && <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        {!isLoading && item && (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <ItemStatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} />
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {item.category_name}
              </span>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</dt>
                <dd className="mt-1 font-semibold text-slate-950">{item.quantity}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due date</dt>
                <dd className="mt-1 font-semibold text-slate-950">{item.due_date || "Not set"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned to</dt>
                <dd className="mt-1 font-semibold text-slate-950">{item.assigned_to?.name || "Unassigned"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created by</dt>
                <dd className="mt-1 font-semibold text-slate-950">{item.created_by?.name || "Unknown"}</dd>
              </div>
            </dl>

            {item.notes && <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">{item.notes}</p>}

            <div className="mt-6">
              <h3 className="text-lg font-bold text-slate-950">Status logs</h3>
              {item.status_logs?.length ? (
                <div className="mt-3 space-y-3">
                  {item.status_logs.map((log) => (
                    <div key={log.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">{log.old_status || "NONE"}</span>
                        <span className="text-slate-400">to</span>
                        <ItemStatusBadge status={log.new_status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Changed by {log.changed_by?.name || "Unknown"} on {formatDateTime(log.changed_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No status changes yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ItemDetailModal;
