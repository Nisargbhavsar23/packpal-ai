import Button from "../components/Button";

function LoginPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">PackPal AI</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Plan together with less friction.</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Sign in screens are UI-only in Phase 1.5. Authentication, protected routes, and real user sessions
          will arrive in a later phase.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-slate-600">
          {["Shared packing lists", "Role-based ownership", "Clean trip dashboards"].map((item) => (
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
        <form className="mt-6 space-y-4">
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
              placeholder="Enter your password"
            />
          </label>
          <Button type="button" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
