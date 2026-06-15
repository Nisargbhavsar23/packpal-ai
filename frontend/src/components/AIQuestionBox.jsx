import LoadingSpinner from "./LoadingSpinner";

function getProviderLabel(provider) {
  if (provider === "gemini") {
    return "Powered by Gemini";
  }
  if (provider === "mock") {
    return "Local test assistant";
  }
  return "";
}

function AIQuestionBox({ answer, isLoading, onAsk, question, setQuestion }) {
  const providerLabel = getProviderLabel(answer?.provider);

  return (
    <div className="mt-5 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ask Assistant</span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows="4"
          placeholder="Ask about packing, travel preparation, or group logistics..."
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950"
        />
      </label>
      <button
        type="button"
        onClick={onAsk}
        disabled={isLoading || !question.trim()}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? <LoadingSpinner label="Asking" className="text-white" spinnerClassName="border-emerald-200 border-t-white" /> : "Ask AI"}
      </button>

      {isLoading && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Thinking through your trip question...
        </div>
      )}

      {answer && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Answer</h3>
            {providerLabel && (
              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                {providerLabel}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{answer.answer}</p>
          {answer.suggested_actions?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-950 dark:text-white">Suggested actions</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {answer.suggested_actions.map((action) => <li key={action}>{action}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIQuestionBox;
