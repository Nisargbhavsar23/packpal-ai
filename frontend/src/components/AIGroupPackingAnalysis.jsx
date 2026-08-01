import LoadingSpinner from "./LoadingSpinner";

function ReadinessRing({ score }) {
  const color =
    score >= 80 ? "text-emerald-600 dark:text-emerald-400" :
    score >= 50 ? "text-amber-500 dark:text-amber-400" :
    "text-rose-500 dark:text-rose-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-4xl font-black tabular-nums ${color}`}>{score}%</div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Group Readiness</p>
    </div>
  );
}

function LoadBadge({ status }) {
  const map = {
    Balanced: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    Overloaded: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    Underloaded: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    Empty: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] || map.Empty}`}>
      {status}
    </span>
  );
}

function MemberCard({ member }) {
  const readinessColor =
    member.readiness_score >= 80 ? "bg-emerald-500" :
    member.readiness_score >= 50 ? "bg-amber-400" :
    "bg-rose-500";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {member.member_name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">{member.member_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {member.assigned_items} assigned · {member.pending_items} pending
            </p>
          </div>
        </div>
        <LoadBadge status={member.load_status} />
      </div>
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Readiness</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{member.readiness_score}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all ${readinessColor}`}
            style={{ width: `${member.readiness_score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DuplicateCard({ duplicate }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">⚠️</span>
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Duplicate: <span className="font-black">{duplicate.item_name}</span>
          </p>
          <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">
            Assigned to: {duplicate.assigned_to.join(", ")}
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{duplicate.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

function AIGroupPackingAnalysis({ analysis, isLoading, onGenerate }) {
  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center py-10">
        <LoadingSpinner label="Analyzing group packing" />
      </div>
    );
  }

  return (
    <div className="mt-5">
      {!analysis ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950">
          <p className="text-2xl">👥</p>
          <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
            Analyze how your group is managing packing
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Detect duplicates, identify load imbalances, and get a group readiness score.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Analyze Group Packing
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary + Score */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Group Summary</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{analysis.summary}</p>
              {analysis.group_readiness_notes?.map((note, i) => (
                <p key={i} className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{note}</p>
              ))}
            </div>
            <ReadinessRing score={analysis.group_readiness_score} />
          </div>

          {/* Member Cards */}
          {analysis.member_summaries?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Member Breakdown</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.member_summaries.map((member) => (
                  <MemberCard key={member.member_name} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Unassigned essentials alert */}
          {analysis.unassigned_essential_count > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
              <p className="font-semibold text-rose-800 dark:text-rose-200">
                🚨 {analysis.unassigned_essential_count} essential item{analysis.unassigned_essential_count !== 1 ? "s" : ""} unassigned
              </p>
              <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                Critical items like passport, tickets, or medicines have no owner. Assign them now.
              </p>
            </div>
          )}

          {/* Duplicates */}
          {analysis.duplicate_detections?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Duplicate Detections ({analysis.duplicate_detections.length})
              </h3>
              <div className="space-y-3">
                {analysis.duplicate_detections.map((dup, i) => (
                  <DuplicateCard key={i} duplicate={dup} />
                ))}
              </div>
            </div>
          )}

          {/* Load Balance Recommendations */}
          {analysis.load_balance_recommendations?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Load Balancing Recommendations
              </h3>
              <ul className="space-y-2">
                {analysis.load_balance_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={onGenerate}
            className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300"
          >
            Re-analyze group
          </button>
        </div>
      )}
    </div>
  );
}

export default AIGroupPackingAnalysis;
