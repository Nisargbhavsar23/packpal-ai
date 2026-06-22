const severityClasses = {
  HIGH: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  LOW: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
};

function AIRiskPanel({ risks = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">Risk analysis</h3>
      <div className="mt-4 space-y-3">
        {risks.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">No active travel risks detected.</p>
        ) : (
          risks.map((risk) => (
            <div key={`${risk.severity}-${risk.title}`} className="rounded-lg bg-white p-4 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${severityClasses[risk.severity] || severityClasses.LOW}`}>
                  {risk.severity}
                </span>
                <h4 className="font-bold text-slate-950 dark:text-white">{risk.title}</h4>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{risk.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AIRiskPanel;
