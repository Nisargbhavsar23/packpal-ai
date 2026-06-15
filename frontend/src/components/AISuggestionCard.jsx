import Badge from "./Badge";

function AISuggestionCard({ checked = false, item, onToggle, selectable = false }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        {selectable && (
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            aria-label={`Select ${item.name}`}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-slate-950 dark:text-white">{item.name}</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {item.category} • Qty {item.quantity || 1}
              </p>
            </div>
            <Badge tone={item.priority === "HIGH" ? "amber" : "slate"}>{item.priority || "MEDIUM"}</Badge>
          </div>
          {item.reason && <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.reason}</p>}
          {item.notes && (
            <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">
              {item.notes}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default AISuggestionCard;
