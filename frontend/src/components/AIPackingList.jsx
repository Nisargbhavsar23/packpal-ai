import AISuggestionCard from "./AISuggestionCard";
import LoadingSpinner from "./LoadingSpinner";

function groupItems(items = []) {
  return items.reduce((groups, item) => {
    const category = item.category || "Custom";
    return { ...groups, [category]: [...(groups[category] || []), item] };
  }, {});
}

function getItemKey(item) {
  return `${item.category || "Custom"}:${item.name}`;
}

function AIPackingList({
  applyLabel = "Add selected to checklist",
  canApply,
  isApplying,
  items = [],
  onApply,
  onToggle,
  permissionMessage,
  selectedKeys = [],
  suggestionId,
  summary,
  title,
}) {
  if (!items.length) {
    return null;
  }

  const groupedItems = groupItems(items);
  const selectedItems = items.filter((item) => selectedKeys.includes(getItemKey(item)));

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
          {summary && <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{summary}</p>}
        </div>
        {canApply ? (
          <button
            type="button"
            onClick={() => onApply(suggestionId, selectedItems)}
            disabled={isApplying || selectedItems.length === 0}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isApplying ? <LoadingSpinner label="Adding" className="text-white" spinnerClassName="border-emerald-200 border-t-white" /> : applyLabel}
          </button>
        ) : (
          <p className="max-w-xs text-sm font-semibold text-slate-500 dark:text-slate-400">{permissionMessage}</p>
        )}
      </div>

      <div className="mt-5 space-y-5">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{category}</h4>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {categoryItems.map((item) => {
                const itemKey = getItemKey(item);
                return (
                  <AISuggestionCard
                    key={itemKey}
                    item={item}
                    checked={selectedKeys.includes(itemKey)}
                    onToggle={() => onToggle(itemKey)}
                    selectable={canApply}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { getItemKey };
export default AIPackingList;
