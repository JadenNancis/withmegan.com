"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Cinematic rotating gallery — one large photo tile that crossfades
 * between all images in the platform's gallery with a slow Ken Burns
 * pan/zoom. No dots, no thumbs, no counters — just the photo, rotating.
 *
 * Live photo feed: polls /api/gallery every REFRESH_MS so newly uploaded
 * photos join the rotation without a page reload, and removed photos
 * cycle out gracefully.
 */

const ROTATE_MS = 5_000;
const KEN_BURNS_MS = 6_500;
const REFRESH_MS = 20_000;

interface Props {
  /** Initial photos rendered at SSR. */
  initialImages: string[];
  /** Site key so we can poll for fresh photos. */
  site: "bts" | "md";
  /** Brand-friendly label shown above the showcase. */
  label: string;
  /** Link target for the "Full gallery" CTA. */
  galleryHref: string;
}

export function RotatingGallery({ initialImages, site, label, galleryHref }: Props) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Preserve the current photo's key across list refreshes so the visible
  // slide doesn't jump when a new photo appears in the middle.
  const currentKey = useRef<string | null>(null);

  // Poll for fresh photos. Merges the new list while keeping the visible
  // photo stable. If the visible photo was removed, jumps to the next one.
  useEffect(() => {
    if (typeof window === "undefined" || images.length === 0) {
      currentKey.current = images[index] ?? null;
    }

    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/gallery?site=${site}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: { photos?: string[] } = await res.json();
        const fresh = Array.isArray(data.photos) ? data.photos : [];
        if (!fresh.length || cancelled) return;

        setImages((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fresh)) return prev;

          // If the currently-visible photo still exists, keep showing it.
          const visible = currentKey.current ?? prev[index];
          const stillThere = visible && fresh.includes(visible);
          const nextIndex = stillThere ? fresh.indexOf(visible!) : 0;
          // Defer setIndex until after images are swapped.
          queueMicrotask(() => {
            if (!cancelled) {
              setIndex(nextIndex);
              currentKey.current = fresh[nextIndex];
            }
          });
          return fresh;
        });
      } catch {
        // Silently keep the current list on network/parse errors.
      }
    };

    const id = setInterval(tick, REFRESH_MS);
    // Also refresh when the tab regains focus — covers "photo uploaded
    // while I was on another tab".
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  // Track the current slide's URL so refresh can re-anchor on it.
  useEffect(() => {
    if (images[index]) currentKey.current = images[index];
  }, [images, index]);

  // Auto-rotate. Honor reduced-motion: keep photo 0 static.
  useEffect(() => {
    if (paused || images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [images.length, paused]);

  if (images.length === 0) return null;

  return (
    <section
      className="mx-auto max-w-4xl px-4 py-10 sm:py-14"
      aria-label={`${label} — rotating photo showcase`}
    >
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-title text-white [text-shadow:0_3px_12px_rgba(0,0,0,0.55)]">
          {label}
        </h2>
        <Link
          href={galleryHref}
          className="text-sm font-semibold text-white hover:opacity-80 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)] transition-colors min-h-[44px] flex items-center"
        >
          Full gallery &rarr;
        </Link>
      </div>

      {/* Hero tile — crossfading Ken Burns image */}
      <div
        className="group relative mt-5 aspect-[4/3] sm:aspect-[21/9] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/25"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className={[
              "absolute inset-0 transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none",
              i === index ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden={i !== index}
          >
            {/* Ken Burns — slow pan/zoom only on the active slide */}
            <div
              className={i === index ? "ken-burns-active h-full w-full" : "h-full w-full"}
            >
              {/* Plain <img> because uploaded photos come from /api/gallery-file
                  (dev) or blob URLs (prod) — neither fits next/image's static
                  optimisation cleanly at runtime. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        ))}

        {/* Soft vignette so the photo reads cleanly */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.18) 100%)",
          }}
        />
      </div>

      {/* Ken Burns keyframes */}
      <style jsx>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.08) translate(-1.5%, -1.5%);
          }
        }
        .ken-burns-active {
          animation: ken-burns ${KEN_BURNS_MS}ms ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .ken-burns-active {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
