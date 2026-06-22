import AIAlertsPanel from "./AIAlertsPanel";
import AIRecommendationsPanel from "./AIRecommendationsPanel";
import AIRiskPanel from "./AIRiskPanel";
import LoadingSpinner from "./LoadingSpinner";
import ReadinessScoreCard from "./ReadinessScoreCard";

function AIReadinessDashboard({ isLoading, onGenerate, readiness }) {
  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? <LoadingSpinner label="Checking" className="text-white" spinnerClassName="border-emerald-200 border-t-white" /> : "Check Travel Readiness"}
      </button>

      {readiness && (
        <div className="mt-5 space-y-5">
          <ReadinessScoreCard
            categoryScores={readiness.category_scores}
            overallScore={readiness.overall_score}
            status={readiness.status}
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <AIRiskPanel risks={readiness.top_risks} />
            <AIAlertsPanel alerts={readiness.alerts} />
          </div>
          <AIRecommendationsPanel recommendations={readiness.recommendations} />
        </div>
      )}
    </div>
  );
}

export default AIReadinessDashboard;
