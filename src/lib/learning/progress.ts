"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Which lessons this browser has been marked as finished.
 *
 * There are no learner accounts, so there is nowhere on the server this could honestly live.
 * Keeping it in the browser means it is per-device and disappears when site data is cleared —
 * a real limitation, so the interface says so rather than implying a saved record.
 *
 * Read through `useSyncExternalStore` because that is what it is: state owned by something
 * outside React. That also gets the server render right for free, and keeps two open tabs
 * agreeing with each other.
 *
 * Every access is wrapped. Storage throws outright in some private-window configurations,
 * and a lesson must not fail to render because a checkbox could not remember itself.
 */
const KEY = "ruaphra.lessons.done.v1";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Fires only for other tabs; changes made here are announced by `emit`.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

/** The raw string, so the snapshot stays referentially stable between reads. */
function getSnapshot() {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** Nothing is known during server rendering, and guessing would be a lie. */
function getServerSnapshot() {
  return "";
}

function parse(raw: string): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** A lesson is identified across courses, so two courses cannot collide on a shared slug. */
export function lessonKey(courseSlug: string, lessonSlug: string) {
  return `${courseSlug}/${lessonSlug}`;
}

export function useLessonProgress() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const completed = useMemo(() => new Set(parse(raw)), [raw]);

  const toggle = useCallback((key: string) => {
    const current = new Set(parse(getSnapshot()));
    if (current.has(key)) current.delete(key);
    else current.add(key);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...current]));
    } catch {
      // Storage unavailable. The page still works; this browser just will not remember.
    }
    emit();
  }, []);

  return { completed, toggle };
}
