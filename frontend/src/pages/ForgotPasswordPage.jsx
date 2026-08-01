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
  return "Something went wrong. Please try again.";
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Password Recovery</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Reset access to your workspace.</h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          Enter your email and we&rsquo;ll send you a link to reset your password.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400">&#10003;</span>
            Secure one-time reset link
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400">&#10003;</span>
            Link expires in 15 minutes
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400">&#10003;</span>
            Your current password stays active until you reset it
          </li>
        </ul>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Forgot password</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">We will never reveal whether an email is registered.</p>

        {error && (
          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>
        )}

        {/* Result — shown after submission */}
        {result && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                   className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  {result.message}
                </p>

                {/* Production: SMTP configured — no link shown, check email */}
                {!result.reset_url && (
                  <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                    Please check your inbox (and spam folder) for an email from PackPal AI.
                    The reset link expires in 15 minutes.
                  </p>
                )}

                {/* Development / SMTP unconfigured: show the reset link inline */}
                {result.reset_url && (
                  <div className="mt-3 rounded-lg bg-white p-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Reset link (development mode)
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      SMTP is not configured. Click the link below to test the reset flow.
                    </p>
                    <a
                      className="mt-2 block break-all text-sm font-semibold text-emerald-800 hover:text-emerald-900 dark:text-emerald-200 dark:hover:text-emerald-100"
                      href={result.reset_url}
                    >
                      {result.reset_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hide the form after a successful submission */}
        {!result && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <FormInput
              id="forgot-email"
              label="Email address"
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
        )}

        {/* Try again link shown after submission */}
        {result && (
          <button
            type="button"
            onClick={() => { setResult(null); setEmail(""); }}
            className="mt-4 w-full text-center text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            Try a different email
          </button>
        )}

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
            Back to login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
