function LoadingSpinner({ label = "Loading", className = "", spinnerClassName = "" }) {
  return (
    <div className={`inline-flex items-center gap-3 text-sm font-semibold text-slate-600 ${className}`}>
      <span className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600 ${spinnerClassName}`} />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
