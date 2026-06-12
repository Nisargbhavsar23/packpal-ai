import Badge from "../components/Badge";
import Button from "../components/Button";
import FeatureCard from "../components/FeatureCard";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";

const features = [
  {
    icon: "AI",
    title: "AI Packing List Generator",
    description: "Generate practical packing ideas for group trips, treks, college tours, and events.",
  },
  {
    icon: "RL",
    title: "Role-Based Collaboration",
    description: "Keep organizers, trip leads, and members aligned around clear packing ownership.",
  },
  {
    icon: "RT",
    title: "Real-Time Checklist Tracking",
    description: "Track every item from pending to packed to delivered with a shared group view.",
  },
  {
    icon: "PDF",
    title: "PDF Export",
    description: "Prepare clean checklist exports for travel days, offline access, and final reviews.",
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
    title: "Generate or add checklist items",
    description: "Start from a smart template, mock AI suggestions, or your own custom packing list.",
  },
  {
    number: "03",
    title: "Assign, track, and export",
    description: "Give every item an owner, monitor progress, and export the final checklist.",
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
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <Badge>AI-Powered Travel Logistics</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Pack smarter. Travel together.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              PackPal AI helps groups plan packing lists, assign owners, track progress, and stay ready
              for every trip without spreadsheet chaos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/register">Get Started</Button>
              <Button to="/dashboard" variant="secondary">
                View Dashboard
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Trip</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Goa Beach Trip</h2>
              </div>
              <Badge tone="blue">Demo Preview</Badge>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <ProgressBar value={72} label="Packed" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">Pending</p>
                <div className="mt-3 space-y-2">
                  {pendingItems.map((item) => (
                    <div key={item} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-600">{item}</span>
                      <StatusBadge status="Pending" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">Members</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {members.map((member) => (
                    <span key={member} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
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
          description="A polished foundation for the packing workflows coming in later phases."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <SectionHeader
            eyebrow="How it works"
            title="From trip idea to final checklist"
            description="The workflow is intentionally simple so groups can prepare quickly."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-emerald-700">{step.number}</p>
                <h3 className="mt-3 text-lg font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Templates"
          title="Start from common trip types"
          description="Static template cards for now, ready to become real checklist starters later."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <h3 className="text-lg font-bold text-slate-950">{template}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A clean starter checklist layout for planning a {template.toLowerCase()}.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Ready to organize your next group trip?</h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Use the Phase 1.5 interface to preview how PackPal AI will feel as features come online.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button to="/register">Start Planning</Button>
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
