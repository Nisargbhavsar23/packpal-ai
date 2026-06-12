import ProgressBar from "./ProgressBar";

function TripCard({ trip }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{trip.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{trip.destination}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {trip.date}
        </span>
      </div>
      <div className="mt-5">
        <ProgressBar value={trip.progress} label="Packed" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-950">{trip.members}</p>
          <p className="text-xs text-slate-500">Members</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="font-semibold text-amber-800">{trip.pending}</p>
          <p className="text-xs text-amber-700">Pending items</p>
        </div>
      </div>
    </article>
  );
}

export default TripCard;
