"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "odysen-theme";

/**
 * The theme preference lives in localStorage (an external store), with the
 * system color-scheme as the fallback. Keeping it in a single
 * `useSyncExternalStore` subscription avoids a hydration mismatch (the server
 * renders the default dark theme, then the client snapshots storage) and keeps
 * the "listen for external change" bookkeeping out of an effect — the same
 * pattern as LanguageProvider.
 */
function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  media.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    media.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    // storage events are not fired in the tab that mutates storage, so signal
    // the (same-tab) subscribers manually before the state is read back.
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEY, newValue: next })
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    // Enable the color crossfade only while the theme is actually swapping.
    root.classList.add("theme-transition");
    root.setAttribute("data-theme", theme);
    const timeout = window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 400);
    return () => {
      window.clearTimeout(timeout);
      root.classList.remove("theme-transition");
    };
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}