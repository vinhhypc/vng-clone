"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * By default the server render assumes reduced motion so static fallbacks (posters, still logos)
 * ship in the HTML; the client upgrades to motion after hydration.
 */
export function useReducedMotion(serverValue = true) {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => serverValue,
  );
}
