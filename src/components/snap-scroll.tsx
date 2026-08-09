"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  count: number;
  scrollerClassName: string;
  hint?: string;
}

/**
 * Wraps a horizontal snap-scroll row with a live dot indicator.
 * Dots track scroll progress (active = which card is currently centered).
 * On sm+ the row is a regular grid and the indicator is hidden.
 */
export function SnapScrollRow({ children, count, scrollerClassName, hint }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const idx = Math.round((el.scrollLeft / max) * (count - 1));
      setActive(Math.max(0, Math.min(count - 1, idx)));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);

  return (
    <div>
      <div ref={scrollRef} className={scrollerClassName}>
        {children}
      </div>

      {/* Live dot indicator, mobile only */}
      <div className="mt-4 flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === active ? "w-6 bg-brand-300" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>

      {hint && (
        <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-white/70 sm:hidden [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
          {hint}
        </p>
      )}
    </div>
  );
}
