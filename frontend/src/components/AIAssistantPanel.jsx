import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  applyAISuggestedItems,
  askAssistant,
  findMissingEssentials,
  getDestinationInsights,
  getTravelReadiness,
  generatePackingList,
  generateTripSummary,
} from "../api/aiApi";
import { useAuth } from "../context/AuthContext";
import Alert from "./Alert";
import AIDestinationInsights from "./AIDestinationInsights";
import AIReadinessDashboard from "./AIReadinessDashboard";
import AIPackingList, { getItemKey } from "./AIPackingList";
import AIQuestionBox from "./AIQuestionBox";
import AITripSummary from "./AITripSummary";
import LoadingSpinner from "./LoadingSpinner";

const tabs = [
  { id: "packing", label: "Generate Packing List" },
  { id: "missing", label: "Missing Essentials" },
  { id: "summary", label: "Trip Summary" },
  { id: "ask", label: "Ask Assistant" },
  { id: "insights", label: "Destination Insights" },
  { id: "readiness", label: "Travel Readiness" },
];

function getApiError(error, fallback) {
  if ([502, 503].includes(error?.response?.status)) {
    return "AI assistant could not answer right now. Please check provider configuration and try again.";
  }
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (error?.response?.status === 403) {
    return "You do not have permission to use this AI action.";
  }
  return fallback;
}

function getUserRole(members, user) {
  return members.find((member) => member.user_id === user?.id)?.role;
}

function getAssignedUserId(item) {
  return item.assigned_to?.id || item.assigned_to_id || null;
}

function getItemCategory(item) {
  return item.category_name || item.category || "Uncategorized";
}

function buildCategoryBreakdown(checklistItems) {
  const groupedItems = checklistItems.reduce((groups, item) => {
    const category = getItemCategory(item);
    return { ...groups, [category]: [...(groups[category] || []), item] };
  }, {});

  return Object.entries(groupedItems).map(([category, items]) => {
    const packed = items.filter((item) => item.status === "PACKED").length;
    const delivered = items.filter((item) => item.status === "DELIVERED").length;
    const pending = items.filter((item) => item.status === "PENDING").length;
    return {
      category,
      total_items: items.length,
      pending_items: pending,
      readiness_score: items.length === 0 ? 0 : Math.round(((packed + delivered) / items.length) * 100),
    };
  });
}

function buildLiveSummary(summary, checklistItems, members) {
  if (!summary) {
    return null;
  }

  const total = checklistItems.length;
  const pending = checklistItems.filter((item) => item.status === "PENDING").length;
  const packed = checklistItems.filter((item) => item.status === "PACKED").length;
  const delivered = checklistItems.filter((item) => item.status === "DELIVERED").length;
  const highPending = checklistItems.filter((item) => item.priority === "HIGH" && item.status === "PENDING").length;
  const readinessScore = total === 0 ? 0 : Math.round(((packed + delivered) / total) * 100);

  return {
    ...summary,
    readiness_score: readinessScore,
    total_items: total,
    pending_items: pending,
    packed_items: packed,
    delivered_items: delivered,
    category_breakdown: buildCategoryBreakdown(checklistItems),
    top_missing_priorities: checklistItems
      .filter((item) => item.priority === "HIGH" && item.status === "PENDING")
      .map((item) => item.name)
      .slice(0, 5),
    high_priority_notes: highPending > 0 ? [`${highPending} high priority item${highPending === 1 ? "" : "s"} still pending.`] : ["No high priority items are pending."],
    member_summary: members.map((member) => {
      const assignedItems = checklistItems.filter((item) => getAssignedUserId(item) === member.user_id);
      return {
        member_name: member.name,
        assigned_items: assignedItems.length,
        pending_items: assignedItems.filter((item) => item.status === "PENDING").length,
      };
    }),
  };
}

function AIAssistantPanel({ checklistItems = [], members = [], onItemsApplied, readinessRefreshSignal = 0, trip }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("packing");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [packingForm, setPackingForm] = useState({
    travel_style: "",
    weather_notes: "",
    special_needs: "",
    extra_instructions: "",
  });
  const [missingFocus, setMissingFocus] = useState("");
  const [question, setQuestion] = useState("");
  const [packingResult, setPackingResult] = useState(null);
  const [missingResult, setMissingResult] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [destinationInsights, setDestinationInsights] = useState(null);
  const [readinessResult, setReadinessResult] = useState(null);
  const [selectedPackingKeys, setSelectedPackingKeys] = useState([]);
  const [selectedMissingKeys, setSelectedMissingKeys] = useState([]);
  const askRequestIdRef = useRef(0);
  const readinessRequestIdRef = useRef(0);
  const lastReadinessRefreshSignalRef = useRef(0);

  const role = getUserRole(members, user);
  const canApplyItems = role === "OWNER" || role === "ADMIN";
  const permissionMessage = "Only trip owners and admins can add AI suggestions to the checklist.";
  const liveSummary = useMemo(
    () => buildLiveSummary(summaryResult, checklistItems, members),
    [checklistItems, members, summaryResult],
  );

  const loadTravelReadiness = useCallback(async ({ clearMessages = false, showLoading = true } = {}) => {
    const requestId = readinessRequestIdRef.current + 1;
    readinessRequestIdRef.current = requestId;
    if (clearMessages) {
      resetMessages();
    }
    if (showLoading) {
      setLoadingAction("readiness");
    }
    try {
      const result = await getTravelReadiness(trip.id);
      if (readinessRequestIdRef.current === requestId) {
        setReadinessResult(result);
      }
    } catch (requestError) {
      if (readinessRequestIdRef.current === requestId) {
        setError(getApiError(requestError, "Failed to check travel readiness."));
      }
    } finally {
      if (showLoading && readinessRequestIdRef.current === requestId) {
        setLoadingAction("");
      }
    }
  }, [trip.id]);

  useEffect(() => {
    const shouldRefresh = readinessRefreshSignal > 0
      && lastReadinessRefreshSignalRef.current !== readinessRefreshSignal
      && (Boolean(readinessResult) || activeTab === "readiness");
    if (shouldRefresh) {
      lastReadinessRefreshSignalRef.current = readinessRefreshSignal;
      loadTravelReadiness({ showLoading: activeTab === "readiness" });
    }
  }, [activeTab, loadTravelReadiness, readinessRefreshSignal, readinessResult]);

  function resetMessages() {
    setError("");
    setSuccessMessage("");
  }

  function updatePackingForm(event) {
    const { name, value } = event.target;
    setPackingForm((current) => ({ ...current, [name]: value }));
  }

  function togglePackingKey(itemKey) {
    setSelectedPackingKeys((current) =>
      current.includes(itemKey) ? current.filter((key) => key !== itemKey) : [...current, itemKey],
    );
  }

  function toggleMissingKey(itemKey) {
    setSelectedMissingKeys((current) =>
      current.includes(itemKey) ? current.filter((key) => key !== itemKey) : [...current, itemKey],
    );
  }

  async function handleGeneratePackingList(event) {
    event.preventDefault();
    resetMessages();
    setLoadingAction("packing");
    try {
      const result = await generatePackingList(trip.id, packingForm);
      setPackingResult(result);
      setSelectedPackingKeys(result.items.map(getItemKey));
    } catch (requestError) {
      setError(getApiError(requestError, "Failed to generate packing list."));
    } finally {
      setLoadingAction("");
    }
  }

  async function handleMissingEssentials(event) {
    event.preventDefault();
    resetMessages();
    setLoadingAction("missing");
    try {
      const result = await findMissingEssentials(trip.id, { focus: missingFocus });
      setMissingResult(result);
      setSelectedMissingKeys(result.missing_items.map(getItemKey));
    } catch (requestError) {
      setError(getApiError(requestError, "Failed to analyze missing essentials."));
    } finally {
      setLoadingAction("");
    }
  }

  async function handleTripSummary() {
    resetMessages();
    setLoadingAction("summary");
    try {
      const result = await generateTripSummary(trip.id, { detail_level: "concise" });
      setSummaryResult(result);
    } catch (requestError) {
      setError(getApiError(requestError, "Failed to generate trip summary."));
    } finally {
      setLoadingAction("");
    }
  }

  async function handleAskAssistant() {
    const currentQuestion = question.trim();
    if (!currentQuestion) {
      return;
    }

    const requestId = askRequestIdRef.current + 1;
    askRequestIdRef.current = requestId;
    resetMessages();
    setAnswerResult(null);
    setLoadingAction("ask");
    if (import.meta.env.DEV) {
      console.log("PackPal AI question sent:", currentQuestion);
    }
    try {
      const result = await askAssistant(trip.id, { question: currentQuestion });
      if (askRequestIdRef.current === requestId) {
        if (import.meta.env.DEV) {
          console.log("PackPal AI answer received:", result);
        }
        setAnswerResult(result);
      }
    } catch (requestError) {
      if (askRequestIdRef.current === requestId) {
        setAnswerResult(null);
        setError(getApiError(requestError, "Failed to get AI answer."));
      }
    } finally {
      if (askRequestIdRef.current === requestId) {
        setLoadingAction("");
      }
    }
  }

  async function handleDestinationInsights() {
    resetMessages();
    setLoadingAction("insights");
    try {
      const result = await getDestinationInsights(trip.id);
      setDestinationInsights(result);
    } catch (requestError) {
      setError(getApiError(requestError, "Failed to generate destination insights."));
    } finally {
      setLoadingAction("");
    }
  }

  async function handleTravelReadiness() {
    await loadTravelReadiness({ clearMessages: true, showLoading: true });
  }

  async function handleApplyItems(suggestionId, selectedItems) {
    resetMessages();
    if (!canApplyItems) {
      setError("You do not have permission to add suggestions to the checklist.");
      return;
    }
    setLoadingAction(`apply-${suggestionId}`);
    try {
      const result = await applyAISuggestedItems(trip.id, {
        suggestion_id: suggestionId,
        items: selectedItems.map((item) => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          priority: item.priority || "MEDIUM",
          notes: item.notes || item.reason || "",
        })),
      });
      setSuccessMessage(
        `${result.created_items.length} item${result.created_items.length === 1 ? "" : "s"} added. ${result.skipped_items.length} duplicate${result.skipped_items.length === 1 ? "" : "s"} skipped.`,
      );
      onItemsApplied?.();
    } catch (requestError) {
      setError(getApiError(requestError, "Failed to add suggestions to the checklist."));
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">AI Assistant</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">AI Packing Assistant</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Generate packing ideas, spot missing essentials, summarize readiness, and ask trip planning questions.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          {canApplyItems ? "Can add suggestions" : "View suggestions only"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              resetMessages();
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-5">
          <Alert>{error}</Alert>
        </div>
      )}
      {successMessage && (
        <div className="mt-5">
          <Alert tone="success">{successMessage}</Alert>
        </div>
      )}

      {activeTab === "packing" && (
        <div className="mt-5">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGeneratePackingList}>
            {[
              ["travel_style", "Travel style", "Beach vacation, trek, business trip..."],
              ["weather_notes", "Weather notes", "Hot and humid, cold evenings..."],
              ["special_needs", "Special needs", "Swimming, photography, college friends..."],
              ["extra_instructions", "Extra instructions", "Keep it practical and avoid overpacking"],
            ].map(([name, label, placeholder]) => (
              <label key={name} className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                <input
                  name={name}
                  value={packingForm[name]}
                  onChange={updatePackingForm}
                  placeholder={placeholder}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950"
                />
              </label>
            ))}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loadingAction === "packing"}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingAction === "packing" ? <LoadingSpinner label="Generating" className="text-white" spinnerClassName="border-emerald-200 border-t-white" /> : "Generate Packing List"}
              </button>
            </div>
          </form>
          <AIPackingList
            title="Suggested packing list"
            summary={packingResult?.summary}
            suggestionId={packingResult?.suggestion_id}
            items={packingResult?.items || []}
            selectedKeys={selectedPackingKeys}
            onToggle={togglePackingKey}
            canApply={canApplyItems}
            permissionMessage={permissionMessage}
            isApplying={loadingAction === `apply-${packingResult?.suggestion_id}`}
            onApply={handleApplyItems}
          />
        </div>
      )}

      {activeTab === "missing" && (
        <div className="mt-5">
          <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={handleMissingEssentials}>
            <label className="block flex-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Focus</span>
              <input
                value={missingFocus}
                onChange={(event) => setMissingFocus(event.target.value)}
                placeholder="safety, documents, tech, hygiene"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950"
              />
            </label>
            <button
              type="submit"
              disabled={loadingAction === "missing"}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingAction === "missing" ? <LoadingSpinner label="Checking" className="text-white" spinnerClassName="border-emerald-200 border-t-white" /> : "Find Missing Essentials"}
            </button>
          </form>
          <AIPackingList
            title="Missing essentials"
            summary={missingResult?.summary}
            suggestionId={missingResult?.suggestion_id}
            items={missingResult?.missing_items || []}
            selectedKeys={selectedMissingKeys}
            onToggle={toggleMissingKey}
            canApply={canApplyItems}
            permissionMessage={permissionMessage}
            isApplying={loadingAction === `apply-${missingResult?.suggestion_id}`}
            onApply={handleApplyItems}
          />
        </div>
      )}

      {activeTab === "summary" && (
        <div className="mt-5">
          <button
            type="button"
            onClick={handleTripSummary}
            disabled={loadingAction === "summary"}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingAction === "summary" ? <LoadingSpinner label="Summarizing" className="text-white" spinnerClassName="border-emerald-200 border-t-white" /> : "Generate Trip Summary"}
          </button>
          <AITripSummary summary={liveSummary} />
        </div>
      )}

      {activeTab === "ask" && (
        <AIQuestionBox
          answer={answerResult}
          isLoading={loadingAction === "ask"}
          onAsk={handleAskAssistant}
          question={question}
          setQuestion={setQuestion}
        />
      )}

      {activeTab === "insights" && (
        <AIDestinationInsights
          insights={destinationInsights}
          isLoading={loadingAction === "insights"}
          onGenerate={handleDestinationInsights}
        />
      )}

      {activeTab === "readiness" && (
        <AIReadinessDashboard
          isLoading={loadingAction === "readiness"}
          onGenerate={handleTravelReadiness}
          readiness={readinessResult}
        />
      )}
    </section>
  );
}

export default AIAssistantPanel;
