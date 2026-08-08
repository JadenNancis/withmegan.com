"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Full-screen crossfading photo slideshow, modelled on the tha.tt front
 * page: three stacked images, active layer rotates every 8s, 4s opacity
 * fade, dim/gradient/vignette overlays on top.
 */
const BACKGROUND_IMAGES = [
  "/images/tobago/pigeon-point.jpg",
  "/images/tobago/fort-george-sunset.jpg",
  "/images/tobago/tobago-rainforest.jpg",
];

const ROTATE_MS = 8_000;

export function RotatingBackground() {
  // Server always renders layer 0; rotation starts after hydration.
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Respect reduced-motion: keep the first photo static.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BACKGROUND_IMAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      {BACKGROUND_IMAGES.map((src, layer) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[4000ms] ease-in-out motion-reduce:transition-none ${
            layer === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            preload={layer === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dim, gradient tint, vignette — same overlay stack as the reference */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-cyan-900/15" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.12) 100%)",
        }}
      />
    </div>
  );
}
