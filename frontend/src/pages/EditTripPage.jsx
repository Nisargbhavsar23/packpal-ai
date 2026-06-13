import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import TripForm from "../components/TripForm";
import { getTripById, updateTrip } from "../api/tripApi";
import { useAuth } from "../context/AuthContext";

function getErrorMessage(error, fallback) {
  if (error?.response?.status === 401) {
    return "Session expired. Please login again.";
  }
  if (error?.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  return fallback;
}

function toFormValues(trip) {
  return {
    title: trip.title || "",
    destination: trip.destination || "",
    trip_type: trip.trip_type || "",
    start_date: trip.start_date || "",
    end_date: trip.end_date || "",
    description: trip.description || "",
  };
}

function EditTripPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  async function handleUpdate(payload) {
    setIsSubmitting(true);
    setError("");
    try {
      await updateTrip(tripId, payload);
      navigate(`/trips/${tripId}`);
    } catch (updateError) {
      if (updateError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getErrorMessage(updateError, "Failed to update trip."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
      <PageHeader
        badge="Edit Trip"
        title="Update trip details"
        description="Edit the core trip information. Backend permissions decide who can save changes."
      />

      <div className="mt-8">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <LoadingSpinner label="Loading trip" />
          </div>
        )}
        {!isLoading && error && !trip && <Alert>{error}</Alert>}
        {!isLoading && trip && (
          <TripForm
            initialValues={toFormValues(trip)}
            submitLabel="Save Changes"
            cancelTo={`/trips/${tripId}`}
            isSubmitting={isSubmitting}
            error={error}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default EditTripPage;
