const priorityStyles = {
  LOW: "border-slate-200 bg-slate-100 text-slate-600",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
};

function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        priorityStyles[priority] || priorityStyles.MEDIUM
      }`}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;
