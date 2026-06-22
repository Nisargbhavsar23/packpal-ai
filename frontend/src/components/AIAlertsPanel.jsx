const priorityClasses = {
  HIGH: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  LOW: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
};

function AIAlertsPanel({ alerts = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">Active alerts</h3>
      <div className="mt-4 space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">No active alerts.</p>
        ) : (
          alerts.map((alert) => (
            <div key={`${alert.priority}-${alert.message}`} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${priorityClasses[alert.priority] || priorityClasses.LOW}`}>
              {alert.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AIAlertsPanel;
