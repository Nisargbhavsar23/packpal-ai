function FeatureCard({ icon, title, description }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}

export default FeatureCard;
