import LoadingSpinner from "./LoadingSpinner";

const sections = [
  ["local_travel_tips", "Local travel tips"],
  ["cultural_considerations", "Cultural considerations"],
  ["common_mistakes", "Common mistakes"],
  ["packing_warnings", "Packing warnings"],
  ["transportation_notes", "Transportation notes"],
  ["safety_reminders", "Safety reminders"],
];

function AIDestinationInsights({ insights, isLoading, onGenerate }) {
  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? <LoadingSpinner label="Analyzing" className="text-white" spinnerClassName="border-emerald-200 border-t-white" /> : "Generate Destination Insights"}
      </button>

      {insights && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Destination insights</h3>
            <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {insights.provider === "gemini" ? "Powered by Gemini" : "Local test assistant"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{insights.summary}</p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {sections.map(([key, title]) => (
              <div key={key} className="rounded-lg bg-white p-4 dark:bg-slate-900">
                <h4 className="text-sm font-bold text-slate-950 dark:text-white">{title}</h4>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {(insights[key] || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIDestinationInsights;
