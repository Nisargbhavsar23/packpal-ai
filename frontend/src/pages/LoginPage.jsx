import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">PackPal AI</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Plan together with less friction.</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Sign in to access your PackPal AI workspace, keep your session active, and prepare for trip
          management in the next frontend phase.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-slate-600">
          {["JWT-backed sessions", "Protected dashboard", "Clean trip planning foundation"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Login</h2>
        <p className="mt-2 text-sm text-slate-500">Access your travel packing workspace.</p>

        {error && (
          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            id="login-email"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <FormInput
            id="login-password"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          <div className="-mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoadingSpinner
                label="Logging in"
                className="text-white"
                spinnerClassName="border-emerald-200 border-t-white"
              />
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          New to PackPal AI?{" "}
          <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
