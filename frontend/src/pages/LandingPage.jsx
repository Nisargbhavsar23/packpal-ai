import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "🤖",
    title: "AI Packing Intelligence",
    description:
      "Gemini-powered packing list generation that adapts to your destination, weather, trip type, and travel style.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: "✅",
    title: "Travel Readiness Score",
    description:
      "Real-time readiness dashboard with category-level scores, risk alerts, and deadline tracking for your entire group.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: "🌍",
    title: "Destination Intelligence",
    description:
      "Destination-specific local tips, cultural notes, common packing mistakes, and safety reminders powered by AI.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: "🌤️",
    title: "Real-Time Weather Context",
    description:
      "Live weather forecasts from Open-Meteo integrated into your AI context so recommendations are always climate-aware.",
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: "💰",
    title: "Smart Budget Planner",
    description:
      "AI-generated travel budget breakdowns across 7 categories in 6 currencies, with money-saving tips and hidden cost warnings.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: "👥",
    title: "Collaborative Group AI",
    description:
      "Group packing analysis with duplicate detection, per-member load balancing, and a collective group readiness score.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: "📄",
    title: "Professional PDF Export",
    description:
      "Export a complete trip report including checklist, member assignments, AI recommendations, and readiness score as a PDF.",
    color: "from-slate-500 to-gray-600",
  },
];

const steps = [
  {
    step: "01",
    icon: "🗺️",
    title: "Create Your Trip",
    description:
      "Add destination, travel dates, trip type, and invite your group members. PackPal AI immediately starts pulling real weather data.",
  },
  {
    step: "02",
    icon: "🤖",
    title: "Let AI Do The Heavy Lifting",
    description:
      "Generate packing lists, detect missing essentials, analyze your group's readiness, and plan your budget — all in one AI assistant.",
  },
  {
    step: "03",
    icon: "🧳",
    title: "Pack With Confidence",
    description:
      "Assign items to group members, track packing status in real-time, and export a professional PDF report before you depart.",
  },
];

const techStack = [
  { name: "FastAPI", icon: "⚡", desc: "Python backend" },
  { name: "React 18", icon: "⚛️", desc: "Frontend UI" },
  { name: "PostgreSQL", icon: "🐘", desc: "Database" },
  { name: "Google Gemini", icon: "✨", desc: "AI engine" },
  { name: "TailwindCSS", icon: "🎨", desc: "Styling" },
  { name: "Open-Meteo", icon: "🌤️", desc: "Weather API" },
];

const faqs = [
  {
    q: "Is PackPal AI free to use?",
    a: "PackPal AI is an open-source portfolio project. You can self-host it with your own Gemini API key. The AI features require a Google Gemini API key, which has a generous free tier.",
  },
  {
    q: "How does the AI packing list work?",
    a: "PackPal AI sends your trip details — destination, dates, trip type, weather forecast, and existing checklist items — to Google Gemini. The AI generates destination-aware, weather-aware packing recommendations, avoiding items you've already added.",
  },
  {
    q: "What is Travel Readiness Score?",
    a: "It's a 0–100 score computed from your packing completion rate, presence of essential items (documents, medicines, chargers), and any overdue high-priority items. The AI also provides context-aware risk analysis.",
  },
  {
    q: "Can multiple people collaborate on a trip?",
    a: "Yes! Trip owners can invite members via email. Members can add items, update packing status, and view the AI recommendations. The Group AI tab analyzes load distribution across all members.",
  },
  {
    q: "What does the Budget Planner do?",
    a: "It estimates travel costs across 7 categories (accommodation, food, transport, activities, shopping, miscellaneous, emergency buffer) for your specific destination, duration, and group size. You can choose between budget, mid-range, and premium styles in 6 currencies.",
  },
];

const testimonials = [
  {
    quote:
      "PackPal AI caught that no one in our 8-person group had packed a first aid kit. The group readiness feature literally saved our trek.",
    name: "Priya M.",
    role: "Adventure Traveler",
    initials: "PM",
  },
  {
    quote:
      "The budget planner estimated our Goa trip costs within 12% of actual. Used it to negotiate a hotel upgrade with leftover budget.",
    name: "Arjun K.",
    role: "Group Trip Organizer",
    initials: "AK",
  },
  {
    quote:
      "The destination insights for Japan were incredibly detailed — power adapter reminders, IC card tips, cultural dos and don'ts. 10/10.",
    name: "Shreya L.",
    role: "International Traveler",
    initials: "SL",
  },
];

function FeatureCard({ feature }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-2xl shadow-sm`}>
        {feature.icon}
      </div>
      <h3 className="font-bold text-slate-950 dark:text-white">{feature.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
    </div>
  );
}

function FAQItem({ faq, index }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-semibold text-slate-950 dark:text-white">{faq.q}</span>
        <span className="flex-shrink-0 text-slate-400 transition group-open:rotate-180">▼</span>
      </summary>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.a}</p>
    </details>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm italic leading-7 text-slate-600 dark:text-slate-300">
        <span className="text-3xl leading-none text-emerald-300">&ldquo;</span>
        {testimonial.quote}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          {testimonial.initials}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{testimonial.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent blur-3xl dark:from-emerald-700/20 dark:via-teal-700/10" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span>✨</span>
            <span>Powered by Google Gemini AI</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
            The{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              AI-powered
            </span>{" "}
            way to plan group travel
          </h1>

          {/* Sub */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            PackPal AI combines Gemini AI, real-time weather, and collaborative checklists to give your travel group a
            complete readiness platform — from packing list to budget plan to PDF export.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                id="hero-go-to-dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  id="hero-get-started"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30"
                >
                  Get Started Free →
                </Link>
                <Link
                  to="/login"
                  id="hero-sign-in"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            Open-source · Google Gemini · FastAPI + React · Portfolio project
          </p>
        </div>

        {/* Hero visual — stat strip */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: "8", label: "AI Features" },
            { value: "6", label: "Currencies" },
            { value: "100%", label: "Weather-Aware" },
            { value: "PDF", label: "Export Ready" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Features</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">
              Everything your group needs to travel smart
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
              Seven powerful AI-driven features, all in one platform designed for modern group travel.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-slate-50 px-5 py-20 sm:px-8 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Workflow</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">
              From zero to packed in three steps
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="text-4xl font-black text-slate-100 dark:text-slate-800">{step.step}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PACKPAL AI ───────────────────────────────────────── */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-center text-white shadow-xl shadow-emerald-500/20 sm:p-12">
            <span className="text-4xl">🧳</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              AI that actually knows about your trip
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
              Every AI feature in PackPal has access to your destination, trip dates, weather forecast, existing
              checklist, and group members. This means no generic advice — every suggestion is tailored to your
              specific trip.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {["Destination-aware", "Weather-aware", "Checklist-aware", "Group-aware", "Duration-aware"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-emerald-400/50 bg-emerald-700/50 px-3 py-1 text-sm font-semibold text-emerald-100 backdrop-blur-sm"
                  >
                    ✓ {badge}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────────────────── */}
      <section id="tech-stack" className="bg-slate-50 px-5 py-20 sm:px-8 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Technology</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">
              Built with modern production stack
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="text-3xl">{tech.icon}</span>
                <p className="font-bold text-slate-950 dark:text-white">{tech.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Reviews</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">
              Travelers love PackPal AI
            </h2>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">(Illustrative testimonials)</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="bg-slate-50 px-5 py-20 sm:px-8 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">FAQ</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">
            Ready for your next adventure?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-300">
            Create your first trip, invite your group, and let PackPal AI handle the packing logistics.
          </p>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              id="cta-go-to-dashboard"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                id="cta-get-started"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700"
              >
                Get Started Free →
              </Link>
              <Link
                to="/login"
                id="cta-sign-in"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white px-5 py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-black text-white">
                PP
              </span>
              <div>
                <p className="font-bold text-slate-950 dark:text-white">PackPal AI</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered Travel Readiness Platform</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-slate-950 dark:hover:text-white">Home</Link>
              {!true && <Link to="/register" className="hover:text-slate-950 dark:hover:text-white">Register</Link>}
              <a
                href="https://github.com/Nisargbhavsar25/packpal-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-950 dark:hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
            &copy; {new Date().getFullYear()} PackPal AI &middot; Open-source portfolio project &middot; Built with FastAPI, React &amp; Google Gemini
          </p>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;
