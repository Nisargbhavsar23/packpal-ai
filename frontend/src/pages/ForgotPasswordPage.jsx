import { useState } from "react";
import { Link } from "react-router-dom";

import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { forgotPassword } from "../api/authApi";

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  return "Something went wrong";
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email });
      setResult(response);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Password Recovery</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Reset access to your workspace.</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Enter your account email. If it exists, PackPal AI will generate password reset instructions.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Forgot password</h2>
        <p className="mt-2 text-sm text-slate-500">We will never reveal whether an email is registered.</p>

        {error && (
          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">{result.message}</p>
            {result.reset_url && (
              <div className="mt-3 rounded-lg bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Development reset link</p>
                <a className="mt-1 block break-all font-semibold text-emerald-800 hover:text-emerald-900" href={result.reset_url}>
                  {result.reset_url}
                </a>
              </div>
            )}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            id="forgot-email"
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoadingSpinner label="Sending" className="text-white" spinnerClassName="border-emerald-200 border-t-white" />
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Back to login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
