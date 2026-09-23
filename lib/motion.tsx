"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

/**
 * Client-wide "prefers-reduced-motion" preference.
 *
 * Sections no longer receive a `reduced` boolean via props — they read it from
 * this context, which keeps the page tree flat and decouples sections from the
 * root. Backed by `useSyncExternalStore` so the single matchMedia listener is
 * created only when subscribers exist.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const MotionPreferenceContext = createContext<boolean>(false);

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <MotionPreferenceContext.Provider value={reduced}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference(): boolean {
  return useContext(MotionPreferenceContext);
}