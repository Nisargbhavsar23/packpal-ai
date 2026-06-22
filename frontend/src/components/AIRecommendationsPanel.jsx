function AIRecommendationsPanel({ recommendations = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">Recommended next actions</h3>
      <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {recommendations.length === 0 ? (
          <li>No recommendations available yet.</li>
        ) : (
          recommendations.map((recommendation) => (
            <li key={recommendation} className="rounded-lg bg-white p-3 dark:bg-slate-900">
              {recommendation}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

export default AIRecommendationsPanel;
