import Badge from "../components/Badge";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

const stats = [
  { label: "Active Trips", value: "0", helper: "Trip integration coming next" },
  { label: "Pending Items", value: "0", helper: "No real checklist data yet" },
  { label: "Packed Items", value: "0", helper: "No real checklist data yet" },
  { label: "Upcoming Trip", value: "Not scheduled", helper: "Create trips in the next phase" },
];

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge>Authenticated Dashboard</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, {user?.name || "traveler"}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Your account is connected. Trip data integration will be added in the next phase.
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-bold text-emerald-700">
          0
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">No trips created yet</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Your real trips will appear here after trip frontend integration is added in the next phase.
        </p>
        <button
          type="button"
          disabled
          className="mt-6 inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500"
        >
          Trip integration coming next
        </button>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Checklist preview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Checklist items will appear here once a real trip is selected.
          </p>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Alerts</h2>
          <p className="mt-2 text-sm text-slate-600">No active alerts.</p>
        </aside>
      </section>
    </div>
  );
}

export default DashboardPage;
