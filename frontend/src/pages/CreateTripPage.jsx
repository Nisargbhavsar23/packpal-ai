import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import TripForm from "../components/TripForm";
import { createTrip } from "../api/tripApi";
import { useAuth } from "../context/AuthContext";

function getErrorMessage(error) {
  if (error?.response?.status === 401) {
    return "Session expired. Please login again.";
  }
  if (error?.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  return "Failed to create trip.";
}

function CreateTripPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(payload) {
    setIsSubmitting(true);
    setError("");
    try {
      const trip = await createTrip(payload);
      navigate(`/trips/${trip.id}`);
    } catch (createError) {
      if (createError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
      <PageHeader
        badge="New Trip"
        title="Create a trip"
        description="Add the basic trip details now. Members and checklists can be managed in later phases."
      />
      <div className="mt-8">
        <TripForm submitLabel="Create Trip" cancelTo="/dashboard" isSubmitting={isSubmitting} error={error} onSubmit={handleCreate} />
      </div>
    </div>
  );
}

export default CreateTripPage;
