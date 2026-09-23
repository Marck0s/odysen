"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import ptBR from "./pt-BR.json";
import enUS from "./en-US.json";
import { SITE, type Locale } from "@/lib/config";

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  "en-US": enUS,
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "odysen-locale";

/**
 * The locale preference lives in localStorage (an external store). Keeping it
 * in a single `useSyncExternalStore` subscription avoids a hydration mismatch
 * (server renders the default locale, then the client snapshots storage) and
 * keeps the "listen for external change" bookkeeping out of an effect.
 */
function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const locale: Locale =
    stored && SITE.locales.includes(stored as Locale) ? (stored as Locale) : SITE.defaultLocale;

  const setLocale = (next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    // storage events are not fired in the tab that mutates storage, so signal
    // the (same-tab) subscribers manually before the state is read back.
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: next }));
  };

  const t = useMemo(() => {
    const dict = dictionaries[locale];
    return (key: string) => dict[key] ?? key;
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : "en";
  }, [locale]);

  const value: LanguageContextValue = { locale, setLocale, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}