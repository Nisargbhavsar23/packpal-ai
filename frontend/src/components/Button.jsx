import { Link } from "react-router-dom";

const variants = {
  primary: "bg-emerald-600 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700",
  secondary:
    "border border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
};

function Button({ children, to, type = "button", variant = "primary", className = "" }) {
  const classes = `inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}

export default Button;
