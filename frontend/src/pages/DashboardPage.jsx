import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import TripCard from "../components/TripCard";

const stats = [
  { label: "Active Trips", value: "3", helper: "2 need review" },
  { label: "Pending Items", value: "18", helper: "6 high priority" },
  { label: "Packed Items", value: "42", helper: "Across all trips" },
  { label: "Upcoming Trip", value: "Goa", helper: "Starts in 2 days" },
];

const trips = [
  {
    name: "Goa Beach Trip",
    destination: "Goa, India",
    date: "Jun 18",
    progress: 72,
    members: 8,
    pending: 9,
  },
  {
    name: "Manali Trek",
    destination: "Himachal Pradesh",
    date: "Jul 04",
    progress: 54,
    members: 6,
    pending: 7,
  },
  {
    name: "Hackathon Visit",
    destination: "Bengaluru",
    date: "Aug 12",
    progress: 86,
    members: 5,
    pending: 2,
  },
];

const checklistItems = [
  { item: "Sunscreen", assignedTo: "Trip Lead", priority: "High", status: "Pending" },
  { item: "Power Bank", assignedTo: "Member 1", priority: "Medium", status: "Packed" },
  { item: "First Aid Kit", assignedTo: "Member 2", priority: "High", status: "Pending" },
  { item: "Travel Documents", assignedTo: "Trip Lead", priority: "High", status: "Delivered" },
  { item: "Team Snacks", assignedTo: "Member 1", priority: "Low", status: "Packed" },
];

const alerts = [
  "High priority items pending",
  "Trip starts in 2 days",
  "Documents category incomplete",
];

function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge>Dashboard Preview</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Dashboard Preview
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            This is static preview data until authentication, registered users, and real trip data are added.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-64">
          <ProgressBar value={72} label="Goa Beach Trip" />
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Active trips</h2>
            <p className="mt-1 text-sm text-slate-500">Mock trip cards for the upcoming planning workflow.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.name} trip={trip} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold text-slate-950">Checklist preview</h2>
            <p className="mt-1 text-sm text-slate-500">Static data only. Backend integration comes later.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">Assigned to</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checklistItems.map((item) => (
                  <tr key={item.item} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-950">{item.item}</td>
                    <td className="px-5 py-4 text-slate-600">{item.assignedTo}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Alerts</h2>
          <div className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <div key={alert} className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800">{alert}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

export default DashboardPage;
