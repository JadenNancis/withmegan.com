import type { SVGProps } from "react";

/* ------------------------------------------------------------------ */
/*  TobagoBooksHero — large hero illustration                          */
/*  Stack of books with palm tree silhouette, ocean waves, sun rays    */
/* ------------------------------------------------------------------ */
export function TobagoBooksHero(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a stack of books under a palm tree beside the Tobago sea, with warm sun rays"
      {...props}
    >
      <defs>
        <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="45%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="heroSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <radialGradient id="heroSun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="book1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="book2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="book3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#155e75" />
        </linearGradient>
        <linearGradient id="book4" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="palmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <filter id="heroSoftShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0c4a6e" floodOpacity="0.25" />
        </filter>
        <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky background */}
      <rect width="600" height="260" fill="url(#heroSky)" />

      {/* Sun glow */}
      <circle cx="470" cy="90" r="110" fill="url(#heroSun)" className="bts-hero-glow" />

      {/* Sun rays */}
      <g className="bts-sun-rays" stroke="#fef9c3" strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <line x1="470" y1="20" x2="470" y2="0" />
        <line x1="540" y1="90" x2="560" y2="90" />
        <line x1="530" y1="30" x2="545" y2="15" />
        <line x1="530" y1="150" x2="545" y2="165" />
        <line x1="410" y1="30" x2="395" y2="15" />
        <line x1="410" y1="150" x2="395" y2="165" />
        <line x1="400" y1="90" x2="380" y2="90" />
      </g>

      {/* Distant clouds */}
      <g className="bts-cloud-drift" opacity="0.7">
        <ellipse cx="120" cy="70" rx="50" ry="14" fill="white" />
        <ellipse cx="160" cy="65" rx="30" ry="11" fill="white" />
        <ellipse cx="90" cy="80" rx="25" ry="9" fill="white" opacity="0.8" />
      </g>
      <g className="bts-cloud-drift-slow" opacity="0.55">
        <ellipse cx="320" cy="50" rx="40" ry="10" fill="white" />
        <ellipse cx="345" cy="46" rx="22" ry="8" fill="white" />
      </g>

      {/* Palm tree silhouette */}
      <g filter="url(#heroSoftShadow)">
        {/* Trunk */}
        <path
          d="M 110 250 Q 105 200 112 150 Q 118 120 125 100"
          stroke="url(#trunkGrad)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        {/* Trunk segments */}
        <g stroke="#5a1a08" strokeWidth="1.5" opacity="0.4">
          <line x1="108" y1="240" x2="116" y2="238" />
          <line x1="110" y1="220" x2="118" y2="218" />
          <line x1="112" y1="200" x2="120" y2="197" />
          <line x1="114" y1="180" x2="122" y2="176" />
          <line x1="116" y1="160" x2="124" y2="155" />
          <line x1="120" y1="140" x2="128" y2="134" />
        </g>

        {/* Palm fronds */}
        <g className="bts-palm-sway">
          <path d="M 125 100 Q 80 80 50 85 Q 75 95 125 108 Z" fill="url(#palmGrad)" />
          <path d="M 125 100 Q 95 65 70 55 Q 95 80 125 105 Z" fill="url(#palmGrad)" />
          <path d="M 125 100 Q 160 65 195 55 Q 165 80 130 105 Z" fill="url(#palmGrad)" />
          <path d="M 125 100 Q 180 85 215 90 Q 180 100 130 108 Z" fill="url(#palmGrad)" />
          <path d="M 125 100 Q 130 60 150 40 Q 140 75 128 105 Z" fill="url(#palmGrad)" />
          <path d="M 125 100 Q 110 60 95 40 Q 115 75 122 105 Z" fill="url(#palmGrad)" />
          {/* Coconuts */}
          <circle cx="115" cy="108" r="5" fill="#451a03" />
          <circle cx="122" cy="112" r="5" fill="#451a03" />
        </g>
      </g>

      {/* Stack of books */}
      <g filter="url(#heroSoftShadow)" className="bts-book-stack">
        {/* Bottom book — red (T&T accent) */}
        <g>
          <rect x="280" y="230" width="180" height="28" rx="3" fill="url(#book4)" />
          <rect x="280" y="230" width="180" height="6" rx="3" fill="#7f1d1d" opacity="0.6" />
          <line x1="285" y1="244" x2="455" y2="244" stroke="#fee2e2" strokeWidth="1" opacity="0.4" />
          <rect x="288" y="248" width="8" height="5" rx="1" fill="#fef2f2" opacity="0.6" />
        </g>
        {/* Third book — teal */}
        <g>
          <rect x="290" y="202" width="160" height="28" rx="3" fill="url(#book3)" />
          <rect x="290" y="202" width="160" height="6" rx="3" fill="#0f3a4a" opacity="0.6" />
          <line x1="295" y1="216" x2="445" y2="216" stroke="#cffafe" strokeWidth="1" opacity="0.4" />
          <rect x="298" y="220" width="8" height="5" rx="1" fill="#ecfeff" opacity="0.6" />
        </g>
        {/* Second book — cyan */}
        <g>
          <rect x="275" y="174" width="170" height="28" rx="3" fill="url(#book2)" />
          <rect x="275" y="174" width="170" height="6" rx="3" fill="#0e4a5a" opacity="0.6" />
          <line x1="280" y1="188" x2="440" y2="188" stroke="#cffafe" strokeWidth="1" opacity="0.4" />
          <rect x="283" y="192" width="8" height="5" rx="1" fill="#ecfeff" opacity="0.6" />
        </g>
        {/* Top book — blue */}
        <g>
          <rect x="295" y="146" width="140" height="28" rx="3" fill="url(#book1)" />
          <rect x="295" y="146" width="140" height="6" rx="3" fill="#172554" opacity="0.6" />
          <line x1="300" y1="160" x2="430" y2="160" stroke="#dbeafe" strokeWidth="1" opacity="0.4" />
          <rect x="303" y="164" width="8" height="5" rx="1" fill="#eff6ff" opacity="0.6" />
        </g>
        {/* Open book on top */}
        <g className="bts-open-book">
          <path d="M 340 146 L 365 130 L 390 146 L 390 120 L 365 108 L 340 120 Z" fill="white" stroke="#e0f2fe" strokeWidth="1.5" />
          <path d="M 365 130 L 365 108" stroke="#bae6fd" strokeWidth="1" />
          <path d="M 350 122 L 360 115" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.5" />
          <path d="M 345 126 L 358 118" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.5" />
          <path d="M 372 122 L 382 115" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.5" />
          <path d="M 375 126 L 385 118" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.5" />
        </g>
      </g>

      {/* Graduation cap floating above */}
      <g className="bts-cap-float" filter="url(#heroGlow)">
        <path d="M 200 60 L 240 45 L 280 60 L 240 72 Z" fill="#1e3a8a" />
        <path d="M 200 60 L 200 75 L 240 90 L 240 72 Z" fill="#172554" />
        <path d="M 280 60 L 280 75 L 240 90 L 240 72 Z" fill="#1e40af" />
        <line x1="240" y1="72" x2="240" y2="100" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="240" cy="103" r="4" fill="#fbbf24" />
        <line x1="240" y1="103" x2="248" y2="108" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <line x1="240" y1="103" x2="232" y2="108" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <line x1="240" y1="103" x2="248" y2="112" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <line x1="240" y1="103" x2="232" y2="112" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Ocean waves at bottom */}
      <g>
        <rect x="0" y="258" width="600" height="142" fill="url(#heroSea)" />
        {/* Wave layer 1 */}
        <path
          d="M 0 260 Q 50 250 100 260 Q 150 270 200 260 Q 250 250 300 260 Q 350 270 400 260 Q 450 250 500 260 Q 550 270 600 260 L 600 280 L 0 280 Z"
          fill="#0891b2"
          opacity="0.7"
          className="bts-wave-layer bts-wave-1"
        />
        {/* Wave layer 2 */}
        <path
          d="M 0 275 Q 75 265 150 275 Q 225 285 300 275 Q 375 265 450 275 Q 525 285 600 275 L 600 295 L 0 295 Z"
          fill="#0e7490"
          opacity="0.6"
          className="bts-wave-layer bts-wave-2"
        />
        {/* Wave layer 3 — foreground */}
        <path
          d="M 0 295 Q 60 285 120 295 Q 180 305 240 295 Q 300 285 360 295 Q 420 305 480 295 Q 540 285 600 295 L 600 400 L 0 400 Z"
          fill="#0c4a6e"
          opacity="0.85"
          className="bts-wave-layer bts-wave-3"
        />
        {/* Sparkle highlights */}
        <g fill="white" opacity="0.6">
          <ellipse cx="80" cy="265" rx="12" ry="2" />
          <ellipse cx="220" cy="272" rx="8" ry="1.5" />
          <ellipse cx="400" cy="268" rx="10" ry="2" />
          <ellipse cx="520" cy="275" rx="6" ry="1.5" />
        </g>
      </g>

      {/* Floating book icons */}
      <g className="bts-float-book-1" opacity="0.85">
        <rect x="480" y="180" width="24" height="18" rx="2" fill="#22d3ee" />
        <rect x="480" y="180" width="24" height="4" rx="2" fill="#0e7490" opacity="0.5" />
      </g>
      <g className="bts-float-book-2" opacity="0.75">
        <rect x="50" y="200" width="22" height="16" rx="2" fill="#3b82f6" />
        <rect x="50" y="200" width="22" height="4" rx="2" fill="#1e3a8a" opacity="0.5" />
      </g>
      <g className="bts-float-book-3" opacity="0.7">
        <rect x="520" y="210" width="20" height="14" rx="2" fill="#0e7490" />
        <rect x="520" y="210" width="20" height="3" rx="1.5" fill="#155e75" opacity="0.5" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  PalmTreeIcon — small palm for decorative use                       */
/* ------------------------------------------------------------------ */
export function PalmTreeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Palm tree icon"
      {...props}
    >
      <defs>
        <linearGradient id="palmIconFrond" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="palmIconTrunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
      {/* Trunk */}
      <path
        d="M 22 44 Q 20 35 23 26 Q 24 20 25 16"
        stroke="url(#palmIconTrunk)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Fronds */}
      <g>
        <path d="M 24 16 Q 14 14 8 16 Q 16 18 24 18 Z" fill="url(#palmIconFrond)" />
        <path d="M 24 16 Q 14 10 6 10 Q 14 16 24 18 Z" fill="url(#palmIconFrond)" />
        <path d="M 24 16 Q 34 10 42 10 Q 34 16 24 18 Z" fill="url(#palmIconFrond)" />
        <path d="M 24 16 Q 34 14 40 16 Q 32 18 24 18 Z" fill="url(#palmIconFrond)" />
        <path d="M 24 16 Q 24 8 28 4 Q 26 12 25 18 Z" fill="url(#palmIconFrond)" />
        <path d="M 24 16 Q 20 8 16 4 Q 22 12 24 18 Z" fill="url(#palmIconFrond)" />
      </g>
      {/* Coconut */}
      <circle cx="22" cy="18" r="2" fill="#451a03" />
      <circle cx="25" cy="19" r="2" fill="#451a03" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  PelicanIcon — flying pelican (iconic Tobago bird)                  */
/* ------------------------------------------------------------------ */
export function PelicanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pelican in flight"
      {...props}
    >
      <defs>
        <linearGradient id="pelicanBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="pelicanWing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {/* Body */}
      <ellipse cx="32" cy="24" rx="8" ry="6" fill="url(#pelicanBody)" />
      {/* Head */}
      <circle cx="42" cy="20" r="5" fill="url(#pelicanBody)" />
      {/* Beak */}
      <path d="M 46 20 Q 56 18 58 22 Q 54 22 46 23 Z" fill="#fbbf24" />
      <path d="M 46 22 Q 54 24 57 26 Q 52 24 46 24 Z" fill="#f59e0b" />
      {/* Eye */}
      <circle cx="43" cy="19" r="1" fill="#0c4a6e" />
      {/* Tail */}
      <path d="M 24 22 L 16 20 L 16 26 Z" fill="url(#pelicanWing)" />
      {/* Wings spread */}
      <path
        d="M 30 20 Q 18 8 4 10 Q 14 16 22 24 Q 12 22 6 26 Q 18 26 28 24 Z"
        fill="url(#pelicanWing)"
        opacity="0.9"
      />
      <path
        d="M 34 20 Q 46 8 60 10 Q 50 16 42 24 Q 52 22 58 26 Q 46 26 36 24 Z"
        fill="url(#pelicanWing)"
        opacity="0.7"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SchoolBookIcon — open book with graduation cap                    */
/* ------------------------------------------------------------------ */
export function SchoolBookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Open book with graduation cap"
      {...props}
    >
      <defs>
        <linearGradient id="sbiPage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
        <linearGradient id="sbiCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="sbiCover" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      {/* Open book */}
      <path d="M 8 34 L 32 28 L 56 34 L 56 50 L 32 44 L 8 50 Z" fill="url(#sbiCover)" />
      {/* Left page */}
      <path d="M 8 34 L 32 28 L 32 44 L 8 50 Z" fill="url(#sbiPage)" />
      {/* Right page */}
      <path d="M 56 34 L 32 28 L 32 44 L 56 50 Z" fill="url(#sbiPage)" />
      {/* Page lines */}
      <g stroke="#0ea5e9" strokeWidth="0.8" opacity="0.4">
        <line x1="13" y1="38" x2="27" y2="34" />
        <line x1="13" y1="42" x2="27" y2="38" />
        <line x1="13" y1="46" x2="27" y2="42" />
        <line x1="37" y1="34" x2="51" y2="38" />
        <line x1="37" y1="38" x2="51" y2="42" />
        <line x1="37" y1="42" x2="51" y2="46" />
      </g>
      {/* Spine */}
      <line x1="32" y1="28" x2="32" y2="44" stroke="#0e7490" strokeWidth="1.5" />

      {/* Graduation cap on top */}
      <g>
        <path d="M 16 14 L 32 8 L 48 14 L 32 20 Z" fill="url(#sbiCap)" />
        <path d="M 16 14 L 16 22 L 32 28 L 32 20 Z" fill="#172554" />
        <path d="M 48 14 L 48 22 L 32 28 L 32 20 Z" fill="#1e40af" />
        <line x1="48" y1="14" x2="48" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
        <circle cx="48" cy="25" r="2.5" fill="#fbbf24" />
        <line x1="48" y1="25" x2="53" y2="28" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="48" y1="25" x2="43" y2="28" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="48" y1="25" x2="53" y2="31" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="48" y1="25" x2="43" y2="31" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  WaveDivider — animated SVG wave between sections                  */
/* ------------------------------------------------------------------ */
export function WaveDivider(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1200 80"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="wd1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="wd2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="wd3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7490" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Back wave */}
      <path
        d="M 0 40 Q 150 20 300 40 Q 450 60 600 40 Q 750 20 900 40 Q 1050 60 1200 40 L 1200 80 L 0 80 Z"
        fill="url(#wd1)"
        className="bts-wd-wave bts-wd-back"
      />
      {/* Mid wave */}
      <path
        d="M 0 50 Q 100 30 200 50 Q 300 70 400 50 Q 500 30 600 50 Q 700 70 800 50 Q 900 30 1000 50 Q 1100 70 1200 50 L 1200 80 L 0 80 Z"
        fill="url(#wd2)"
        className="bts-wd-wave bts-wd-mid"
      />
      {/* Front wave */}
      <path
        d="M 0 60 Q 120 45 240 60 Q 360 75 480 60 Q 600 45 720 60 Q 840 75 960 60 Q 1080 45 1200 60 L 1200 80 L 0 80 Z"
        fill="url(#wd3)"
        className="bts-wd-wave bts-wd-front"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  TobagoMapBadge — simplified island outline as a seal/badge       */
/* ------------------------------------------------------------------ */
export function TobagoMapBadge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Simplified outline of Tobago island"
      {...props}
    >
      <defs>
        <linearGradient id="badgeBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
        <linearGradient id="badgeIsland" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <radialGradient id="badgeShine" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="40" cy="40" r="38" fill="url(#badgeBg)" stroke="#0891b2" strokeWidth="2" />
      {/* Inner ring */}
      <circle cx="40" cy="40" r="34" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.6" />
      {/* Tobago island shape — simplified, elongated NE-SW */}
      <path
        d="M 22 26 Q 28 22 38 24 Q 48 26 56 32 Q 62 38 60 44 Q 56 52 48 56 Q 38 58 30 54 Q 22 48 20 40 Q 19 32 22 26 Z"
        fill="url(#badgeIsland)"
      />
      {/* Highlight on island */}
      <ellipse cx="40" cy="36" rx="14" ry="6" fill="url(#badgeShine)" opacity="0.4" />
      {/* Dots for towns */}
      <circle cx="44" cy="36" r="1.5" fill="#fde68a" />
      <circle cx="35" cy="44" r="1.2" fill="#fde68a" />
      <circle cx="50" cy="42" r="1" fill="#fde68a" />
      {/* Label arc */}
      <text
        x="40"
        y="72"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="#0c4a6e"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        TOBAGO
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SuccessCheckmark — for registration complete screen               */
/* ------------------------------------------------------------------ */
export function SuccessCheckmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Success checkmark"
      {...props}
    >
      <defs>
        <linearGradient id="checkBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="checkMark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#checkBg)" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
      <path
        d="M 20 32 L 28 40 L 44 24"
        stroke="url(#checkMark)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="bts-check-draw"
      />
    </svg>
  );
}