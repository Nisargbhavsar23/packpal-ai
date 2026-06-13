import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Alert from "../components/Alert";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ChecklistBoard from "../components/ChecklistBoard";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { deleteTrip, getTripById } from "../api/tripApi";
import { useAuth } from "../context/AuthContext";

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function getErrorMessage(error, fallback) {
  if (error?.response?.status === 401) {
    return "Session expired. Please login again.";
  }
  if (error?.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  return fallback;
}

function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function loadTrip() {
      setIsLoading(true);
      setError("");
      try {
        const tripData = await getTripById(tripId);
        setTrip(tripData);
      } catch (loadError) {
        if (loadError?.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        setError(getErrorMessage(loadError, "Failed to load trip."));
      } finally {
        setIsLoading(false);
      }
    }

    loadTrip();
  }, [logout, navigate, tripId]);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteTrip(tripId);
      navigate("/dashboard", { replace: true });
    } catch (deleteFailure) {
      if (deleteFailure?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setDeleteError(getErrorMessage(deleteFailure, "Failed to delete trip."));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <LoadingSpinner label="Loading trip details" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
        <Alert>{error || "Failed to load trip."}</Alert>
        <Button to="/dashboard" variant="secondary" className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <PageHeader
        badge={trip.trip_type}
        title={trip.title}
        description={`${trip.destination} • ${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`}
        actions={
          <>
            <Button to="/dashboard" variant="secondary">
              Back to Dashboard
            </Button>
            <Button to={`/trips/${trip.id}/edit`} variant="secondary">
              Edit Trip
            </Button>
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete Trip
            </button>
          </>
        }
      />

      {deleteError && (
        <div className="mt-6">
          <Alert>{deleteError}</Alert>
        </div>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Trip information</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination</dt>
              <dd className="mt-1 font-semibold text-slate-950">{trip.destination}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trip type</dt>
              <dd className="mt-1 font-semibold text-slate-950">{trip.trip_type}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start date</dt>
              <dd className="mt-1 font-semibold text-slate-950">{formatDate(trip.start_date)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">End date</dt>
              <dd className="mt-1 font-semibold text-slate-950">{formatDate(trip.end_date)}</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-lg bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Description</p>
            <p className="mt-2 text-sm leading-6 text-emerald-950">{trip.description || "No description added."}</p>
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Creator</h2>
          <p className="mt-3 font-semibold text-slate-950">{trip.creator?.name || "Unknown"}</p>
          <p className="mt-1 text-sm text-slate-500">{trip.creator?.email}</p>
        </aside>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Members</h2>
            <p className="mt-1 text-sm text-slate-500">Member management UI will be added later.</p>
          </div>
          <Badge tone="slate">{trip.members?.length || 0} members</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(trip.members || []).map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-semibold text-slate-950">{member.name}</p>
                <p className="text-sm text-slate-500">{member.email}</p>
              </div>
              <Badge tone={member.role === "OWNER" ? "emerald" : "slate"}>{member.role}</Badge>
            </div>
          ))}
        </div>
      </section>

      <ChecklistBoard tripId={trip.id} members={trip.members || []} />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        isLoading={isDeleting}
        title="Delete this trip?"
        description="This action removes the trip for all members. Backend permissions decide whether this action is allowed."
        confirmLabel="Delete Trip"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default TripDetailPage;
