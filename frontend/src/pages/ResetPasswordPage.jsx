import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { resetPassword } from "../api/authApi";

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  return "Something went wrong";
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!token) {
      setError("Reset link is missing. Please request a new reset link.");
      return;
    }
    if (formData.new_password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords must match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword({ token, new_password: formData.new_password });
      setSuccessMessage(response.message);
      setFormData({ new_password: "", confirm_password: "" });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Secure Reset</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create a new password</h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          Choose a secure password for your PackPal AI account.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Reset password</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter and confirm your new password.</p>

        {error && (
          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {successMessage}
          </div>
        )}

        {!token && (
          <div className="mt-5">
            <Alert>Reset link is missing. Please request a new reset link.</Alert>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            id="reset-new-password"
            label="New password"
            name="new_password"
            type="password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Enter new password"
            autoComplete="new-password"
            required
          />
          <FormInput
            id="reset-confirm-password"
            label="Confirm password"
            name="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoadingSpinner label="Resetting" className="text-white" spinnerClassName="border-emerald-200 border-t-white" />
            ) : (
              "Reset password"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Ready to sign in?{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
            Go to login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ResetPasswordPage;
