function LoadingSpinner({ label = "Loading", className = "", spinnerClassName = "" }) {
  return (
    <div className={`inline-flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300 ${className}`}>
      <span className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400 ${spinnerClassName}`} />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
