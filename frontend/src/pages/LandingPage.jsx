import Badge from "../components/Badge";
import Button from "../components/Button";
import FeatureCard from "../components/FeatureCard";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "TP",
    title: "Trip Planning Workspace",
    description: "Create organized trip spaces for group travel, treks, college tours, and events.",
  },
  {
    icon: "GO",
    title: "Group Packing Ownership",
    description: "Keep organizers, trip leads, and members aligned around clear packing ownership.",
  },
  {
    icon: "CL",
    title: "Checklist Progress Tracking",
    description: "Track every item from pending to packed to delivered with a shared group view.",
  },
  {
    icon: "TT",
    title: "Travel Task Clarity",
    description: "Keep the important packing details easy to scan before travel day.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create a trip",
    description: "Add the destination, travel dates, members, and the kind of trip you are planning.",
  },
  {
    number: "02",
    title: "Add checklist items",
    description: "Build a packing list with owners, priorities, due dates, and notes.",
  },
  {
    number: "03",
    title: "Assign and track",
    description: "Give every item an owner and monitor progress from one shared place.",
  },
];

const templates = [
  "Beach Trip",
  "Trekking Trip",
  "Business Trip",
  "Hackathon Trip",
  "College Tour",
  "International Travel",
];

const pendingItems = ["Sunscreen", "Power Bank", "First Aid Kit"];
const members = ["Trip Lead", "Member 1", "Member 2"];
const statuses = ["Pending", "Packed", "Delivered"];

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <Badge>AI-Powered Travel Logistics</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              Pack smarter. Travel together.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              PackPal AI helps groups plan packing lists, assign owners, track progress, and stay ready
              for every trip without spreadsheet chaos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to={isAuthenticated ? "/dashboard" : "/register"}>Get Started</Button>
              <Button to="/dashboard" variant="secondary">
                View Dashboard
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Trip</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Coastal Getaway</h2>
              </div>
              <Badge tone="blue">Trip Preview</Badge>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <ProgressBar value={72} label="Packed" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Pending</p>
                <div className="mt-3 space-y-2">
                  {pendingItems.map((item) => (
                    <div key={item} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{item}</span>
                      <StatusBadge status="Pending" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Members</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {members.map((member) => (
                    <span key={member} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {member}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <StatusBadge key={status} status={status} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Features"
          title="Built for coordinated group travel"
          description="Everything a group needs to coordinate packing without losing track of owners or progress."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <SectionHeader
            eyebrow="How it works"
            title="From trip idea to final checklist"
            description="The workflow is intentionally simple so groups can prepare quickly."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{step.number}</p>
                <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Templates"
          title="Start from common trip types"
          description="Reusable trip starters help your group get organized quickly."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
            >
              <div className="mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">{template}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                A clean starter checklist layout for planning a {template.toLowerCase()}.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-slate-900 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Ready to organize your next group trip?</h2>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                Bring packing lists, owners, and trip tasks into one calm shared workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button to={isAuthenticated ? "/dashboard" : "/register"}>Start Planning</Button>
              <Button to="/dashboard" variant="secondary">
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
