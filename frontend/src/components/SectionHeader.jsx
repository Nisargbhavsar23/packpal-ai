function SectionHeader({ eyebrow, title, description, align = "left" }) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>}
    </div>
  );
}

export default SectionHeader;
