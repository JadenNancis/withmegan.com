"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  OTHER_SCHOOL_VALUE,
  schoolsByCategory,
  type School,
  type SchoolCategory,
} from "@/lib/bts-schools";

type CategoryFilter = "all" | SchoolCategory;

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All schools" },
  { value: "ECCE / Early Childhood", label: "ECCE" },
  { value: "Primary / Middle", label: "Primary" },
  { value: "Secondary / High", label: "Secondary" },
];

const CATEGORY_BADGE: Record<SchoolCategory, string> = {
  "ECCE / Early Childhood": "ECCE",
  "Primary / Middle": "Primary / Middle",
  "Secondary / High": "Secondary / High",
};

interface SchoolPickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

const LIST_MAX = 300;
const LIST_MIN = 180;

/**
 * Searchable school picker.
 *
 * Desktop: an anchored dropdown that flips above the trigger when it would
 * overflow the viewport. Mobile: a bottom sheet, so the list gets a large,
 * comfortable scroll area that the on-screen keyboard can't squeeze shut.
 */
export function SchoolPicker({ value, onChange, id, className }: SchoolPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [highlight, setHighlight] = useState(0);
  const [placement, setPlacement] = useState({ up: false, maxHeight: LIST_MAX });
  const [isMobile, setIsMobile] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Only auto-scroll the list for keyboard navigation. Mouse hover never
  // needs it — the row under the cursor is visible by definition — and
  // scrolling on hover made the list shift as the cursor crossed the
  // sticky category headers.
  const highlightViaKeyboard = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schoolsByCategory()
      .filter((cat) => filter === "all" || cat.category === filter)
      .map((cat) => ({
        ...cat,
        schools: cat.schools.filter((s) => !q || s.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.schools.length > 0);
  }, [query, filter]);

  const options = useMemo(() => {
    const flat: Array<{ type: "school"; school: School } | { type: "other" }> = [];
    for (const g of groups) {
      for (const s of g.schools) flat.push({ type: "school", school: s });
    }
    flat.push({ type: "other" });
    return flat;
  }, [groups]);

  const measurePlacement = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    const up = below < LIST_MIN + 24 && above > below;
    setPlacement({
      up,
      maxHeight: Math.max(LIST_MIN, Math.min(LIST_MAX, (up ? above : below) - 16)),
    });
  }, []);

  // Keep the keyboard highlight inside the option list.
  useEffect(() => {
    setHighlight(0);
  }, [query, filter, open]);

  useEffect(() => {
    if (!open || isMobile) return;
    measurePlacement();
    // Re-measure only for scrolls outside the panel. Listening in capture
    // mode without this guard meant every touch-scroll of the list itself
    // re-measured and re-rendered mid-gesture, which broke momentum scroll.
    const onScroll = (e: Event) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      measurePlacement();
    };
    window.addEventListener("resize", measurePlacement);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", measurePlacement);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, isMobile, measurePlacement]);

  useEffect(() => {
    if (!open || isMobile) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, isMobile]);

  // Lock the page behind the mobile sheet so scrolling the list never
  // chains into the page underneath.
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  // Focus the search field on desktop only. On mobile this would pop the
  // on-screen keyboard immediately and cover the list the user came to read.
  useEffect(() => {
    if (open && !isMobile) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, isMobile]);

  // Reset the panel scroll when the result set changes.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [query, filter]);

  function openPanel() {
    if (!isMobile) measurePlacement();
    setOpen(true);
  }

  function closePanel() {
    setOpen(false);
    setQuery("");
    setFilter("all");
  }

  // Keep the highlighted row visible by scrolling only the internal list —
  // never the page — and only when navigating with the keyboard.
  useEffect(() => {
    if (!open || !highlightViaKeyboard.current) return;
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-index="${highlight}"]`);
    if (!list || !el) return;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.top < listRect.top) {
      list.scrollTop -= listRect.top - elRect.top;
    } else if (elRect.bottom > listRect.bottom) {
      list.scrollTop += elRect.bottom - listRect.bottom;
    }
  }, [highlight, open]);

  const select = useCallback(
    (next: string) => {
      onChange(next);
      setOpen(false);
      setQuery("");
      setFilter("all");
    },
    [onChange],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closePanel();
        break;
      case "ArrowDown":
        e.preventDefault();
        highlightViaKeyboard.current = true;
        setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        highlightViaKeyboard.current = true;
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Enter": {
        e.preventDefault();
        const opt = options[highlight];
        if (!opt) return;
        select(opt.type === "other" ? OTHER_SCHOOL_VALUE : opt.school.name);
        break;
      }
    }
  }

  const buttonLabel =
    value === OTHER_SCHOOL_VALUE
      ? "Other (enter manually)"
      : value || "Select a school…";

  const searchField = (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3">
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type to filter schools…"
        className="min-h-[44px] w-full bg-transparent py-2 text-base sm:text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
        role="searchbox"
        aria-label="Search schools"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );

  const filterPills = (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
      {CATEGORY_FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => setFilter(f.value)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors min-h-[36px]",
            filter === f.value
              ? "bg-brand-700 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const optionList = (
    <>
      {groups.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-gray-500">
          No schools match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        groups.map((cat) => (
          <div key={cat.category}>
            <p className="sticky top-0 z-10 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              {CATEGORY_BADGE[cat.category]} · {cat.schools.length}
            </p>
            {cat.schools.map((s) => {
              const idx = options.findIndex((o) => o.type === "school" && o.school.name === s.name);
              const selected = value === s.name;
              const active = highlight === idx;
              return (
                <button
                  key={s.name}
                  type="button"
                  data-index={idx}
                  onMouseEnter={() => {
                    highlightViaKeyboard.current = false;
                    setHighlight(idx);
                  }}
                  onClick={() => select(s.name)}
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-3 sm:py-2.5 text-left text-[15px] sm:text-sm min-h-[48px] sm:min-h-0 transition-colors",
                    active ? "bg-brand-50" : "hover:bg-gray-50",
                    selected && "font-semibold text-brand-800",
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <HighlightedName name={s.name} query={query} />
                    {s.district && (
                      <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                        District
                      </span>
                    )}
                  </span>
                  {selected && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        ))
      )}
    </>
  );

  const otherOption = (
    <button
      type="button"
      data-index={options.length - 1}
      onMouseEnter={() => {
        highlightViaKeyboard.current = false;
        setHighlight(options.length - 1);
      }}
      onClick={() => select(OTHER_SCHOOL_VALUE)}
      role="option"
      aria-selected={value === OTHER_SCHOOL_VALUE}
      className={cn(
        "flex w-full items-center gap-3 border-t border-gray-200 bg-white px-3 py-3.5 text-left text-sm min-h-[52px] transition-colors",
        highlight === options.length - 1 ? "bg-brand-50" : "hover:bg-gray-50",
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className="font-semibold text-brand-700">Other (enter manually)</span>
    </button>
  );

  const trigger = (
    <button
      type="button"
      id={id}
      onClick={() => (open ? closePanel() : openPanel())}
      onKeyDown={onKeyDown}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label="School"
      className={cn(
        "w-full min-h-[52px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-left text-base text-gray-900 shadow-[0_0_0_0_rgba(8,145,178,0)] transition-all duration-150",
        "hover:border-brand-400 focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(8,145,178,0.12)] focus:outline-none",
        open && "border-brand-500 shadow-[0_0_0_4px_rgba(8,145,178,0.12)]",
        !value && "text-gray-500",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="truncate">
          {value && value !== OTHER_SCHOOL_VALUE ? (
            <span className="flex items-center gap-2">
              <SchoolIcon className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="text-gray-900">{value}</span>
            </span>
          ) : (
            buttonLabel
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={cn("h-5 w-5 shrink-0 text-gray-500 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </button>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {trigger}

      {/* ---- Mobile: bottom sheet ---- */}
      <AnimatePresence>
        {open && isMobile && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closePanel}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Select a school"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-2xl bg-white shadow-2xl"
            >
              <div className="shrink-0 rounded-t-2xl border-b border-gray-200 bg-white px-4 pb-3 pt-2">
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300" aria-hidden="true" />
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-gray-900">Select a school</h2>
                  <button
                    type="button"
                    onClick={closePanel}
                    aria-label="Close"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                {searchField}
                <div className="mt-3">{filterPills}</div>
              </div>

              <div
                ref={listRef}
                role="listbox"
                className="flex-1 overflow-y-auto overscroll-contain"
              >
                {optionList}
              </div>

              <div className="shrink-0 pb-[env(safe-area-inset-bottom)]">{otherOption}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---- Desktop: anchored dropdown ---- */}
      <AnimatePresence>
        {open && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: placement.up ? 6 : -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement.up ? 6 : -6, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute left-0 right-0 z-30 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl",
              placement.up ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top",
            )}
          >
            <div className="border-b border-gray-100 p-2">{searchField}</div>
            <div className="border-b border-gray-100 px-3 py-2">{filterPills}</div>
            <div
              ref={listRef}
              role="listbox"
              className="overflow-y-auto overscroll-contain py-1 picker-scroll"
              style={{ maxHeight: placement.maxHeight }}
            >
              {optionList}
            </div>
            {otherOption}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HighlightedName({ name, query }: { name: string; query: string }) {
  const q = query.trim().toLowerCase();
  if (!q) return <span className="truncate text-gray-900">{name}</span>;

  const idx = name.toLowerCase().indexOf(q);
  if (idx === -1) return <span className="truncate text-gray-900">{name}</span>;

  return (
    <span className="truncate text-gray-900">
      {name.slice(0, idx)}
      <span className="rounded-sm bg-amber-200 px-0.5 font-semibold text-gray-900">
        {name.slice(idx, idx + q.length)}
      </span>
      {name.slice(idx + q.length)}
    </span>
  );
}

function SchoolIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 9L12 4 2 9l10 5 10-5z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v5" />
    </svg>
  );
}
