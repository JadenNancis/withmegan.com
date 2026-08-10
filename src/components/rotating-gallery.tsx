"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Cinematic rotating gallery — one hero tile that crossfades + Ken-Burns
 * between all photos in the platform's gallery, with a thumbnail strip
 * underneath that auto-tracks the active image. Tapping a thumb jumps
 * straight to it; the rhythm resumes from the next photo.
 *
 * Drop-in replacement for a static photo grid on landing pages.
 */

const ROTATE_MS = 5_000;
const KEN_BURNS_MS = 6_500;

interface Props {
  /** Absolute paths to images (e.g. /images/gallery/bts/foo.jpg) */
  images: string[];
  /** Brand-friendly label shown while loading. */
  label: string;
  /** Link target for the "Full gallery" CTA. */
  galleryHref: string;
  /** Tailwind brand tint class for the active thumb ring (cyan-400 / amber-400). */
  accent: string;
}

export function RotatingGallery({ images, label, galleryHref, accent }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

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
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 896px"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          </div>
        ))}

        {/* Soft vignette so thumbs/text pop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.18) 100%)",
          }}
        />

        {/* Live dots indicator — top right */}
        <div className="absolute top-3 right-3 z-10 flex gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1.5 ring-1 ring-white/20">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Caption chip — bottom left */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white">
            {index + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumb strip — horizontal scroll, active thumb glows */}
      <div className="mt-4 flex gap-2.5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Photo ${i + 1}`}
            className={[
              "snap-start relative shrink-0 h-16 w-24 sm:h-20 sm:w-32 overflow-hidden rounded-xl border-2 transition-all duration-300 active:scale-95",
              i === index
                ? `border-white shadow-[0_0_18px_rgba(255,255,255,0.4)] scale-105`
                : "border-white/25 hover:border-white/60 opacity-75 hover:opacity-100",
            ].join(" ")}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-cover"
            />
          </button>
        ))}
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
