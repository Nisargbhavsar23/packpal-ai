const styles = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Packed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Delivered: "border-sky-200 bg-sky-50 text-sky-700",
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-100 text-slate-600",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.Low
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
