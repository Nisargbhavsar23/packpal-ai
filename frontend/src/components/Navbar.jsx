import { NavLink, useNavigate } from "react-router-dom";

import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const loggedOutLinks = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
];

const loggedInLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
];

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "PP";
  }
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const navLinks = isAuthenticated ? loggedInLinks : loggedOutLinks;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-black text-white shadow-sm">
            PP
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight text-slate-950 dark:text-white">PackPal AI</span>
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Travel logistics</span>
          </span>
        </NavLink>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900 sm:flex">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  {getInitials(user?.name)}
                </span>
                <span className="max-w-32 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Button to="/register" className="hidden sm:inline-flex">
              Get Started
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
