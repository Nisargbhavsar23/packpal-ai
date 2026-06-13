const statusStyles = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PACKED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DELIVERED: "border-sky-200 bg-sky-50 text-sky-700",
};

function ItemStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] || statusStyles.PENDING
      }`}
    >
      {status}
    </span>
  );
}

export default ItemStatusBadge;
