function AITripSummary({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Trip readiness</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{summary.summary}</p>
        </div>
        <div className="rounded-2xl bg-emerald-600 px-5 py-4 text-center text-white">
          <p className="text-3xl font-black">{summary.readiness_score}%</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Ready</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[
          ["Total", summary.total_items],
          ["Pending", summary.pending_items],
          ["Packed", summary.packed_items],
          ["Delivered", summary.delivered_items],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white p-3 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div>
          <h4 className="text-sm font-bold text-slate-950 dark:text-white">High priority notes</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {summary.high_priority_notes?.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-950 dark:text-white">Members</h4>
          <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {summary.member_summary?.map((member) => (
              <p key={member.member_name}>
                {member.member_name}: {member.pending_items}/{member.assigned_items} pending
              </p>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-950 dark:text-white">Recommendations</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {summary.recommendations?.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AITripSummary;
