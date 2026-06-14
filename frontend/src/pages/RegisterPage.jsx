import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validateForm(formData) {
  if (!formData.name.trim()) {
    return "Name is required";
  }
  if (!formData.email.includes("@")) {
    return "Enter a valid email address";
  }
  if (formData.password.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (formData.password !== formData.confirmPassword) {
    return "Passwords must match";
  }
  return "";
}

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, register } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Start organized</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create your PackPal AI workspace.</h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          Plan trips, invite members, and manage packing from one place.
        </p>
        <div className="mt-6 rounded-xl bg-gradient-to-br from-emerald-50 to-white p-5 dark:from-emerald-950/40 dark:to-slate-950">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Start organized from day one.</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Keep every trip, packing item, and owner easy to find.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Register</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Set up your planning profile.</p>

        {error && (
          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            id="register-name"
            label="Full name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Trip Planner"
            autoComplete="name"
            required
          />
          <FormInput
            id="register-email"
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
            id="register-password"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
          <FormInput
            id="register-confirm-password"
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoadingSpinner
                label="Creating account"
                className="text-white"
                spinnerClassName="border-emerald-200 border-t-white"
              />
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
