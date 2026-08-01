import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const CURRENCIES = [
  { code: "INR", label: "₹ INR", symbol: "₹" },
  { code: "USD", label: "$ USD", symbol: "$" },
  { code: "EUR", label: "€ EUR", symbol: "€" },
  { code: "GBP", label: "£ GBP", symbol: "£" },
  { code: "AED", label: "د.إ AED", symbol: "د.إ" },
  { code: "SGD", label: "S$ SGD", symbol: "S$" },
];

const BUDGET_STYLES = [
  { value: "budget", label: "Budget 🎒", description: "Hostels, street food, public transit" },
  { value: "mid-range", label: "Mid-Range 🏨", description: "3-star hotels, restaurants, taxis" },
  { value: "premium", label: "Premium ✨", description: "Luxury stays, fine dining, private transfers" },
];

const CATEGORY_ICONS = {
  Accommodation: "🏨",
  Food: "🍽️",
  Transportation: "🚗",
  Activities: "🎭",
  Shopping: "🛍️",
  Miscellaneous: "📦",
  "Emergency Buffer": "🛡️",
};

function formatNumber(value, symbol) {
  if (value == null || isNaN(value)) return "—";
  const formatted = Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return `${symbol}${formatted}`;
}

function BudgetCategoryCard({ category, symbol }) {
  const icon = CATEGORY_ICONS[category.category] || "💰";
  const isBuffer = category.category === "Emergency Buffer";

  return (
    <div className={`rounded-xl border p-4 ${
      isBuffer
        ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <p className="font-semibold text-slate-950 dark:text-white">{category.category}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-950 dark:text-white">{formatNumber(category.estimated_amount, symbol)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatNumber(category.per_person_amount, symbol)}/person</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{category.notes}</p>
    </div>
  );
}

function AIBudgetPlanner({ budget, isLoading, onGenerate }) {
  const [currency, setCurrency] = useState("INR");
  const [budgetStyle, setBudgetStyle] = useState("mid-range");
  const [groupSize, setGroupSize] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [viewMode, setViewMode] = useState("total"); // total | per-person

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const symbol = selectedCurrency.symbol;

  function handleGenerate(event) {
    event.preventDefault();
    onGenerate({
      currency,
      budget_style: budgetStyle,
      group_size: groupSize ? parseInt(groupSize, 10) : undefined,
      extra_notes: extraNotes || undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center py-10">
        <LoadingSpinner label="Estimating travel budget" />
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      {/* Configuration Form */}
      <form onSubmit={handleGenerate} className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-950 dark:text-white">Budget Preferences</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Currency */}
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </label>

          {/* Group Size */}
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Group Size <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <input
              type="number"
              min="1"
              max="50"
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              placeholder="Auto-detect from members"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950"
            />
          </label>
        </div>

        {/* Budget Style */}
        <div className="mt-4">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Travel Style</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {BUDGET_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setBudgetStyle(style.value)}
                className={`rounded-lg border p-3 text-left transition ${
                  budgetStyle === style.value
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/50"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                }`}
              >
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{style.label}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Extra Notes */}
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Extra Notes <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="e.g. we plan to camp 2 nights, avoiding restaurants..."
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950"
          />
        </label>

        <button
          type="submit"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {budget ? "Regenerate Budget" : "Generate Budget Estimate"}
        </button>
      </form>

      {/* Budget Results */}
      {budget && (
        <div className="space-y-5">
          {/* Total Summary */}
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-slate-900">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Budget Summary</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{budget.summary}</p>
            <div className="mt-4 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total for {budget.group_size} person(s) · {budget.duration_days} days</p>
                <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                  {formatNumber(budget.total_estimated, symbol)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Per person</p>
                <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatNumber(budget.per_person_total, symbol)}
                </p>
              </div>
              {budget.usd_equivalent != null && currency !== "USD" && (
                <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">≈ USD</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">${budget.usd_equivalent.toLocaleString()}</p>
                </div>
              )}
              {budget.inr_equivalent != null && currency !== "INR" && (
                <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">≈ INR</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">₹{budget.inr_equivalent.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* View toggle */}
            <div className="mt-4 flex gap-2">
              {["total", "per-person"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    viewMode === mode
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {mode === "total" ? "Group Total" : "Per Person"}
                </button>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Cost Breakdown
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {budget.categories?.map((cat) => (
                <BudgetCategoryCard
                  key={cat.category}
                  category={viewMode === "per-person"
                    ? { ...cat, estimated_amount: cat.per_person_amount }
                    : cat
                  }
                  symbol={symbol}
                />
              ))}
            </div>
          </div>

          {/* Budget Advice */}
          {budget.budget_advice?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Budget Advice</h3>
              <ul className="space-y-2">
                {budget.budget_advice.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                    <span className="mt-0.5 text-emerald-500">💡</span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Money Saving Tips */}
          {budget.money_saving_tips?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Money-Saving Tips</h3>
              <ul className="space-y-2">
                {budget.money_saving_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <span className="mt-0.5">🪙</span>
                    <span className="text-sm text-emerald-900 dark:text-emerald-100">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hidden Costs */}
          {budget.hidden_costs?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hidden Costs to Watch</h3>
              <ul className="space-y-2">
                {budget.hidden_costs.map((cost, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                    <span className="mt-0.5">⚠️</span>
                    <span className="text-sm text-amber-900 dark:text-amber-100">{cost}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500">
            * Budget estimates are AI-generated approximations based on destination type and travel style. Actual costs may vary. Verify with current prices before finalizing.
          </p>
        </div>
      )}
    </div>
  );
}

export default AIBudgetPlanner;
