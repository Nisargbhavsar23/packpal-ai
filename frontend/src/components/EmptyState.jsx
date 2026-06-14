import Button from "./Button";

function EmptyState({ title, text, actionLabel, actionTo, disabledAction = false }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        0
      </div>
      <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
      {actionLabel && disabledAction && (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        >
          {actionLabel}
        </button>
      )}
      {actionLabel && !disabledAction && actionTo && (
        <Button to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </section>
  );
}

export default EmptyState;
