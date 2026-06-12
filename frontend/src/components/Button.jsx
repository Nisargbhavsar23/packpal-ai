import { Link } from "react-router-dom";

const variants = {
  primary: "bg-emerald-600 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700",
  secondary: "border border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:bg-emerald-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
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
