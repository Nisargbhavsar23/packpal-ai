import { NavLink } from "react-router-dom";

import Button from "./Button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-black text-white shadow-sm">
            PP
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight text-slate-950">PackPal AI</span>
            <span className="block text-xs font-medium text-slate-500">Travel logistics</span>
          </span>
        </NavLink>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button to="/register" className="hidden sm:inline-flex">
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
