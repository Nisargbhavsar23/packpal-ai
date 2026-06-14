function StatCard({ label, value, helper }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
      {helper && <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">{helper}</p>}
    </article>
  );
}

export default StatCard;
