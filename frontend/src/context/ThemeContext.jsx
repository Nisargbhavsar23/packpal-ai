import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

const THEME_KEY = "packpal_theme";
const ThemeContext = createContext(null);
const themeOptions = ["light", "dark", "system"];

function isValidTheme(theme) {
  return themeOptions.includes(theme);
}

export function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSavedTheme() {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  return isValidTheme(storedTheme) ? storedTheme : "system";
}

function resolveTheme(theme) {
  return theme === "system" ? getSystemTheme() : theme;
}

export function applyTheme(theme) {
  const safeTheme = isValidTheme(theme) ? theme : "system";
  const resolvedTheme = resolveTheme(safeTheme);

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  return resolvedTheme;
}

export function initializeTheme() {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedTheme = getSavedTheme();
  window.localStorage.setItem(THEME_KEY, savedTheme);
  applyTheme(savedTheme);
  return savedTheme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getSavedTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useLayoutEffect(() => {
    const savedTheme = getSavedTheme();
    window.localStorage.setItem(THEME_KEY, savedTheme);
    setThemeState(savedTheme);
    setSystemTheme(getSystemTheme());
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemChange(event) {
      const nextSystemTheme = event.matches ? "dark" : "light";
      setSystemTheme(nextSystemTheme);

      if (getSavedTheme() === "system") {
        document.documentElement.classList.toggle("dark", nextSystemTheme === "dark");
      }
    }

    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, resolvedTheme]);

  function setTheme(nextTheme) {
    if (!isValidTheme(nextTheme)) {
      return;
    }

    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
    setSystemTheme(getSystemTheme());
    setThemeState(nextTheme);
  }

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
