function ReadinessScoreCard({ categoryScores = {}, overallScore = 0, status = "Not Ready" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Travel readiness</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{status}</p>
        </div>
        <div className="rounded-2xl bg-emerald-600 px-5 py-4 text-center text-white">
          <p className="text-3xl font-black">{overallScore}%</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Overall</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(categoryScores).map(([category, score]) => (
          <div key={category} className="rounded-lg bg-white p-3 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{category}</p>
            <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{score.score}%</p>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{score.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReadinessScoreCard;
