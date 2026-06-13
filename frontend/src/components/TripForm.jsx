import { useState } from "react";
import { Link } from "react-router-dom";

import Alert from "./Alert";
import FormInput from "./FormInput";
import LoadingSpinner from "./LoadingSpinner";

const emptyTrip = {
  title: "",
  destination: "",
  trip_type: "",
  start_date: "",
  end_date: "",
  description: "",
};

function validateTrip(values) {
  if (!values.title.trim()) {
    return "Title is required";
  }
  if (!values.destination.trim()) {
    return "Destination is required";
  }
  if (!values.trip_type.trim()) {
    return "Trip type is required";
  }
  if (!values.start_date) {
    return "Start date is required";
  }
  if (!values.end_date) {
    return "End date is required";
  }
  if (values.start_date > values.end_date) {
    return "Start date cannot be after end date";
  }
  return "";
}

function TripForm({ initialValues = emptyTrip, submitLabel, cancelTo = "/dashboard", isSubmitting, error, onSubmit }) {
  const [values, setValues] = useState({ ...emptyTrip, ...initialValues });
  const [validationError, setValidationError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const message = validateTrip(values);
    if (message) {
      setValidationError(message);
      return;
    }

    setValidationError("");
    await onSubmit({
      title: values.title.trim(),
      destination: values.destination.trim(),
      trip_type: values.trip_type.trim(),
      start_date: values.start_date,
      end_date: values.end_date,
      description: values.description.trim() || null,
    });
  }

  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
      {(validationError || error) && (
        <div className="mb-5">
          <Alert>{validationError || error}</Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormInput
            id="trip-title"
            label="Trip title"
            name="title"
            type="text"
            value={values.title}
            onChange={handleChange}
            placeholder="Goa Beach Trip"
            required
          />
        </div>
        <FormInput
          id="trip-destination"
          label="Destination"
          name="destination"
          type="text"
          value={values.destination}
          onChange={handleChange}
          placeholder="Goa, India"
          required
        />
        <FormInput
          id="trip-type"
          label="Trip type"
          name="trip_type"
          type="text"
          value={values.trip_type}
          onChange={handleChange}
          placeholder="Beach Trip"
          required
        />
        <FormInput
          id="trip-start-date"
          label="Start date"
          name="start_date"
          type="date"
          value={values.start_date}
          onChange={handleChange}
          required
        />
        <FormInput
          id="trip-end-date"
          label="End date"
          name="end_date"
          type="date"
          value={values.end_date}
          onChange={handleChange}
          required
        />
        <label className="block sm:col-span-2" htmlFor="trip-description">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea
            id="trip-description"
            name="description"
            rows="4"
            value={values.description || ""}
            onChange={handleChange}
            placeholder="Add optional trip notes"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Link
          to={cancelTo}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <LoadingSpinner label="Saving" className="text-white" spinnerClassName="border-emerald-200 border-t-white" />
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

export default TripForm;
