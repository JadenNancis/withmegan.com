"use client";

import { useEffect, useRef, useState } from "react";

/**
 * localStorage autosave for the registration wizard.
 * Hydrates lazily on first render (client-only), then autosaves
 * debounced on every change. Caller clears on submit.
 */
export function useWizardDraft<T>(
  key: string,
  initial: T,
  options?: { enabled?: boolean },
): {
  value: T;
  setValue: (v: T | ((prev: T) => T)) => void;
  clear: () => void;
  hydrated: boolean;
  hadDraft: boolean;
  dismissDraft: () => void;
} {
  const enabled = options?.enabled ?? true;
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(enabled ? false : true);
  const [hadDraft, setHadDraft] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = key;

  // Hydrate once on mount
  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        if (parsed && Object.keys(parsed).length > 0) {
          // Merge so fields added after a draft was saved get their defaults.
          setValue({ ...initial, ...parsed });
          setHadDraft(true);
        }
      }
    } catch {
      // malformed or unavailable storage — start fresh
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (debounced)
  useEffect(() => {
    if (!enabled) return;
    if (!hydrated) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // storage full / private mode — non-fatal
      }
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, hydrated, storageKey, enabled]);

  function clear() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setHadDraft(false);
  }

  function dismissDraft() {
    // User said "start fresh" — wipe storage and reset state.
    clear();
    setValue(initial);
  }

  return { value, setValue, clear, hydrated, hadDraft, dismissDraft };
}
