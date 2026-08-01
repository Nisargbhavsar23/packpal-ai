import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Alert from "../components/Alert";
import AIAssistantPanel from "../components/AIAssistantPanel";
import Button from "../components/Button";
import ChecklistBoard from "../components/ChecklistBoard";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import MembersSection from "../components/MembersSection";
import PageHeader from "../components/PageHeader";
import PDFExportButton from "../components/PDFExportButton";
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
  const { user, logout } = useAuth();
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);
  const [readinessRefreshKey, setReadinessRefreshKey] = useState(0);

  useEffect(() => {
    async function loadTrip() {
      setIsLoading(true);
      setError("");
      try {
        const tripData = await getTripById(tripId);
        setTrip(tripData);
        setMembers(tripData.members || []);
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

  /**
   * Called by MembersSection after any mutation.
   * freshMembers: updated member list (or null if only a signal is needed).
   */
  function handleMembersChanged(freshMembers) {
    if (freshMembers) {
      setMembers(freshMembers);
    }
    // Bump readiness signal so Group AI + Travel Readiness tabs auto-refresh
    setReadinessRefreshKey((k) => k + 1);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
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

  const isOwner = members.find((m) => m.user_id === user?.id)?.role === "OWNER";

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
            {isOwner && (
              <Button to={`/trips/${trip.id}/edit`} variant="secondary">
                Edit Trip
              </Button>
            )}
            <PDFExportButton tripId={trip.id} />
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete Trip
              </button>
            )}
          </>
        }
      />

      {deleteError && (
        <div className="mt-6">
          <Alert>{deleteError}</Alert>
        </div>
      )}

      {/* Trip Info + Creator */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Trip information</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Destination</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{trip.destination}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Trip type</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{trip.trip_type}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Start date</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{formatDate(trip.start_date)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">End date</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{formatDate(trip.end_date)}</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Description</p>
            <p className="mt-2 text-sm leading-6 text-emerald-950 dark:text-emerald-100">{trip.description || "No description added."}</p>
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Creator</h2>
          <p className="mt-3 font-semibold text-slate-950 dark:text-white">{trip.creator?.name || "Unknown"}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{trip.creator?.email}</p>
        </aside>
      </section>

      {/* Members — full management panel */}
      <MembersSection
        tripId={tripId}
        initialMembers={members}
        currentUser={user}
        onMembersChanged={handleMembersChanged}
      />

      {/* AI Assistant — uses live members state */}
      <AIAssistantPanel
        trip={trip}
        checklistItems={checklistItems}
        members={members}
        onItemsApplied={() => {
          setChecklistRefreshKey((k) => k + 1);
          setReadinessRefreshKey((k) => k + 1);
        }}
        readinessRefreshSignal={readinessRefreshKey}
      />

      {/* Checklist */}
      <ChecklistBoard
        tripId={trip.id}
        members={members}
        onItemsChange={setChecklistItems}
        onMutationComplete={() => setReadinessRefreshKey((k) => k + 1)}
        refreshSignal={checklistRefreshKey}
      />

      {/* Delete trip dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        isLoading={isDeleting}
        title="Delete this trip?"
        description="This action removes the trip for all members."
        confirmLabel="Delete Trip"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default TripDetailPage;
