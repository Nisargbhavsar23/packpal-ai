import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TripCard from "../components/TripCard";
import Button from "../components/Button";
import { getTrips } from "../api/tripApi";
import { useAuth } from "../context/AuthContext";

function formatApiError(error, fallback) {
  if (error?.response?.status === 401) {
    return "Session expired. Please login again.";
  }
  if (error?.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  return fallback;
}

function getUpcomingTrip(trips) {
  const today = new Date().toISOString().slice(0, 10);
  const upcomingTrips = trips
    .filter((trip) => trip.start_date >= today)
    .sort((first, second) => first.start_date.localeCompare(second.start_date));

  return upcomingTrips[0]?.title || "Not scheduled";
}

function DashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrips() {
      setIsLoading(true);
      setError("");
      try {
        const tripData = await getTrips();
        setTrips(tripData);
      } catch (loadError) {
        if (loadError?.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        setError(formatApiError(loadError, "Failed to load trips."));
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, [logout, navigate]);

  const stats = useMemo(
    () => [
      { label: "Active Trips", value: String(trips.length), helper: "Real trips from your account" },
      { label: "Pending Items", value: "0", helper: "Checklist integration coming next" },
      { label: "Packed Items", value: "0", helper: "Checklist integration coming next" },
      { label: "Upcoming Trip", value: getUpcomingTrip(trips), helper: "Based on real trip dates" },
    ],
    [trips],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <PageHeader
        badge="Trip Dashboard"
        title={`Welcome back, ${user?.name || "traveler"}`}
        description="View and manage your real PackPal AI trips. Checklist integration will be added in the next phase."
        actions={<Button to="/trips/new">Create Trip</Button>}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Your trips</h2>
            <p className="mt-1 text-sm text-slate-500">Trips returned by the backend trip management API.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <LoadingSpinner label="Loading trips" />
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            title="No trips created yet"
            text="Create your first group trip to start planning packing and logistics."
            actionLabel="Create Trip"
            actionTo="/trips/new"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Checklist preview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Checklist items will appear after selecting a trip in the checklist phase.
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
