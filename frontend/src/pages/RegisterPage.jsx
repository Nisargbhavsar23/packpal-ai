import Button from "../components/Button";

function RegisterPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Start organized</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Create your PackPal AI workspace.</h1>
        <p className="mt-4 leading-7 text-slate-600">
          This registration form is a polished static UI for Phase 1.5. Real account creation will be added
          with JWT authentication later.
        </p>
        <div className="mt-6 rounded-xl bg-gradient-to-br from-emerald-50 to-white p-5">
          <p className="text-sm font-semibold text-slate-950">Coming soon</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Trip invites, member roles, checklist assignments, and PDF exports will build on this interface.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Register</h2>
        <p className="mt-2 text-sm text-slate-500">Set up your planning profile.</p>
        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input
              type="text"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="Trip Planner"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="Create a password"
            />
          </label>
          <Button type="button" className="w-full">
            Create account
          </Button>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;
