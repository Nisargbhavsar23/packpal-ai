function Alert({ children, tone = "error" }) {
  const tones = {
    error: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
    info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </div>
  );
}

export default Alert;
