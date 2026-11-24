import { useCallback, useSyncExternalStore } from "react";

/**
 * Theme preference: "system" (default, follows the OS), "light" or "dark".
 * The resolved theme is written to <html data-theme="...">.
 * index.html applies it before first paint; initTheme() keeps it in sync.
 */

const STORAGE_KEY = "flagger-theme";
const THEME_COLORS = { dark: "#0B0B0C", light: "#FAF9F6" };

const listeners = new Set();

const readPreference = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
};

const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const resolveTheme = (preference) =>
  preference === "system" ? (systemPrefersDark() ? "dark" : "light") : preference;

const applyTheme = (preference) => {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[resolved]);
};

const notify = () => listeners.forEach((listener) => listener());

export const setThemePreference = (preference) => {
  try {
    if (preference === "system") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, preference);
    }
  } catch {
    // storage unavailable (private mode) – the theme still applies for this session
  }
  applyTheme(preference);
  notify();
};

/** Call once at startup: follows OS theme changes and changes made in other tabs. */
export const initTheme = () => {
  applyTheme(readPreference());

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readPreference() === "system") {
      applyTheme("system");
      notify();
    }
  };
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      applyTheme(readPreference());
      notify();
    }
  };

  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);

  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useTheme = () => {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system");
  const setTheme = useCallback((next) => setThemePreference(next), []);

  return { preference, setTheme };
};
