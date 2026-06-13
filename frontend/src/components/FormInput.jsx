function FormInput({ label, id, error, className = "", ...props }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        id={id}
        className={`mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`}
        {...props}
      />
      {error && <span className="mt-2 block text-xs font-semibold text-rose-600">{error}</span>}
    </label>
  );
}

export default FormInput;
