function StatCard({ label, value, helper }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      {helper && <p className="mt-2 text-xs font-medium text-emerald-700">{helper}</p>}
    </article>
  );
}

export default StatCard;
