"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Cinematic rotating gallery — one large photo tile that crossfades
 * between all images in the platform's gallery with a slow Ken Burns
 * pan/zoom. No dots, no thumbs, no counters — just the photo, rotating.
 *
 * Live photo feed: polls /api/gallery every REFRESH_MS so newly uploaded
 * photos join the rotation without a page reload, and removed photos
 * cycle out gracefully.
 *
 * Timing model: two recursive setTimeout schedulers (one for rotation,
 * one for the gallery poll). They capture state via refs — never stale
 * closures, never double-fire, never get wedged into a stuck interval.
 */

const ROTATE_MS = 5_000;
// Slow pan/zoom while a slide is active. Slightly longer than the rotation
// cycle so the photo is still drifting when the crossfade starts.
const KEN_BURNS_MS = 6_500;
// Must equal the opacity crossfade below — the outgoing slide melts back
// to scale(1) in the same time the incoming one fades in. Smaller than the
// forward zoom so zoom-out feels tighter than zoom-in, which reads as
// smooth rather than sluggish.
const ZOOM_OUT_MS = 1_400;
const FADE_MS = 1_400;
const REFRESH_MS = 20_000;
// First slide shows for a shorter burst so users landing mid-scroll see
// the rotation begin promptly. Subsequent beats use ROTATE_MS.
const FIRST_BEAT_MS = 3_500;

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

  // Refs kept in sync with state so timeout/interval callbacks see fresh
  // values without re-creating themselves.
  const imagesRef = useRef(images);
  const indexRef = useRef(index);
  const pausedRef = useRef(paused);
  // Tracks whether consumption is past the short "aperture" beat.
  const firstBeatRef = useRef(true);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  /* ─── Rotation scheduler ─────────────────────────────────────────────
     Recursive setTimeout — never double-fires, never wedges. Reads state
     via refs so it always sees the latest images/paused/firstBeat. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      if (cancelled) return;
      const imgs = imagesRef.current;
      const isPaused = pausedRef.current;

      if (!isPaused && imgs.length > 1) {
        setIndex((i) => (i + 1) % imgs.length);
        firstBeatRef.current = false;
      }
      schedule();
    };

    const schedule = () => {
      if (cancelled) return;
      const delay = firstBeatRef.current ? FIRST_BEAT_MS : ROTATE_MS;
      timer = setTimeout(tick, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  /* ─── Gallery polling scheduler ─────────────────────────────────────
     Refreshes the photo list from /api/gallery periodically and on
     visibility change. Picks up new uploads mid-session, removes deleted
     photos gracefully, and re-anchors the visible slide on its URL so the
     user doesn't see a jump. */
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelled) return;

      try {
        const res = await fetch(`/api/gallery?site=${site}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: { photos?: { url: string }[] } = await res.json();
        const fresh = Array.isArray(data.photos) ? data.photos.map((p) => p.url) : [];
        if (!fresh.length || cancelled) return;

        setImages((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fresh)) return prev;

          // If the currently-visible photo still exists, keep showing it —
          // re-anchor index onto its new position in the fresh list.
          const visible = prev[indexRef.current];
          const stillThere = visible && fresh.includes(visible);
          const nextIndex = stillThere ? fresh.indexOf(visible!) : 0;
          // Defer setIndex past the images state commit so the render
          // that follows sees consistent (images, index).
          queueMicrotask(() => {
            if (!cancelled) setIndex(nextIndex);
          });
          return fresh;
        });
      } catch {
        // Network or parse error — keep rotating the current list.
      }
    };

    const schedule = () => {
      if (cancelled) return;
      timer = setTimeout(async () => {
        await poll();
        schedule();
      }, REFRESH_MS);
    };

    schedule();

    const onVisibility = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [site]);

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
            className="slide absolute inset-0 motion-reduce:transition-none"
            style={{
              opacity: i === index ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
              // The incoming slide must paint above the outgoing one while
              // both are partially transparent. zIndex needs a DOM reflow to
              // take effect on crossfade, so we also flip a transform to hint
              // compositing without disturbing the zoom below.
              zIndex: i === index ? 1 : 0,
            }}
            aria-hidden={i !== index}
          >
            {/* Ken Burns — transition-driven so deactivation eases back to
                scale(1) instead of snapping. (Keyframe animation would be
                destroyed when the class is removed mid-fade, causing the
                "jump backwards" the user reported.) */}
            <div
              className="ken-burns h-full w-full"
              style={{
                transform:
                  i === index
                    ? "scale(1.08) translate(-1.5%, -1.5%)"
                    : "scale(1) translate(0, 0)",
                transition: `transform ${
                  i === index ? KEN_BURNS_MS : ZOOM_OUT_MS
                }ms ease-out`,
                willChange: "transform",
              }}
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

      {/* Reduced-motion: kill both transitions — show a static frame. */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .slide,
          .ken-burns {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
