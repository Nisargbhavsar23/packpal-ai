import { useTheme } from "../context/ThemeContext";

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <span className="sr-only">Theme</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        className="bg-transparent text-sm font-semibold outline-none dark:text-slate-200"
        aria-label="Choose theme"
      >
        {Object.entries(themeLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ThemeToggle;
