import { Link } from "react-router-dom";

import Badge from "./Badge";

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function TripCard({ trip }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{trip.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{trip.destination}</p>
        </div>
        <Badge tone="slate">{trip.role}</Badge>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Trip type</p>
          <p className="mt-1 font-semibold text-slate-950 dark:text-white">{trip.trip_type}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Date range</p>
          <p className="mt-1 font-semibold text-emerald-900 dark:text-emerald-100">
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">Created {formatDate(trip.created_at?.slice(0, 10))}</p>
        <Link
          to={`/trips/${trip.id}`}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export default TripCard;
