/**
 * Custom inline SVG illustrations for the Market Day with Megan portal.
 * All artwork uses the amber/gold/warm sunset palette. No external
 * dependencies — pure React SVG components.
 */

/** Unique gradient IDs are namespaced to avoid collisions when multiple SVGs render on one page. */
let gradientCounter = 0;
function nextId(prefix: string): string {
  gradientCounter += 1;
  return `md-${prefix}-${gradientCounter}`;
}

/* ──────────────────────────── TobagoHamperHero ──────────────────────────── */

export function TobagoHamperHero({ className }: { className?: string }) {
  const sunsetId = nextId("sunset");
  const oceanId = nextId("ocean");
  const skyId = nextId("sky");
  const basketId = nextId("basket");
  const basketRim = nextId("brim");
  const sunGlow = nextId("sunglow");
  const mangoGrad = nextId("mango");
  const breadfruitGrad = nextId("breadfruit");
  const provisionGrad = nextId("provision");

  return (
    <svg
      viewBox="0 0 600 500"
      className={className}
      role="img"
      aria-label="A woven hamper overflowing with Caribbean produce beneath a Tobago sunset"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd97d" />
          <stop offset="30%" stopColor="#ffb347" />
          <stop offset="60%" stopColor="#ff8c42" />
          <stop offset="85%" stopColor="#e76f51" />
          <stop offset="100%" stopColor="#c44536" />
        </linearGradient>
        <radialGradient id={sunGlow} cx="0.5" cy="0.45" r="0.35">
          <stop offset="0%" stopColor="#fff3d6" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#ffd97d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={sunsetId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffd97d" />
          <stop offset="50%" stopColor="#ff8c42" />
          <stop offset="100%" stopColor="#e76f51" />
        </linearGradient>
        <linearGradient id={oceanId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e76f51" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#c44536" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b2635" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={basketId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a017" />
          <stop offset="50%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <linearGradient id={basketRim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6b800" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <radialGradient id={mangoGrad} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="50%" stopColor="#ffaa00" />
          <stop offset="100%" stopColor="#cc7a00" />
        </radialGradient>
        <radialGradient id={breadfruitGrad} cx="0.3" cy="0.25" r="0.8">
          <stop offset="0%" stopColor="#a3c948" />
          <stop offset="50%" stopColor="#7a9d2e" />
          <stop offset="100%" stopColor="#4a6b1f" />
        </radialGradient>
        <linearGradient id={provisionGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#daa520" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
      </defs>

      {/* Sky / sunset gradient */}
      <rect width="600" height="500" fill={`url(#${skyId})`} />

      {/* Sun glow */}
      <circle cx="300" cy="200" r="120" fill={`url(#${sunGlow})`} />
      <circle cx="300" cy="200" r="50" fill="#fff3d6" opacity="0.9" />
      <circle cx="300" cy="200" r="35" fill="#ffeaa7" />

      {/* Ocean horizon */}
      <path d="M 0 280 Q 150 270 300 278 T 600 282 L 600 500 L 0 500 Z" fill={`url(#${oceanId})`} />
      {/* Sun reflection on water */}
      <ellipse cx="300" cy="300" rx="60" ry="4" fill="#ffd97d" opacity="0.6" />
      <ellipse cx="300" cy="320" rx="45" ry="3" fill="#ffb347" opacity="0.4" />
      <ellipse cx="300" cy="338" rx="30" ry="2" fill="#ff8c42" opacity="0.3" />

      {/* Distant palm silhouette */}
      <g opacity="0.3" fill="#3d1e00">
        <path d="M 80 280 L 82 240 L 78 240 Z" />
        <path d="M 82 245 Q 60 235 50 242 Q 65 240 82 246 Z" />
        <path d="M 78 245 Q 100 235 110 242 Q 95 240 78 246 Z" />
        <path d="M 80 243 Q 65 228 58 235 Q 72 232 80 244 Z" />
        <path d="M 80 243 Q 95 228 102 235 Q 88 232 80 244 Z" />
      </g>
      <g opacity="0.25" fill="#3d1e00">
        <path d="M 520 285 L 522 245 L 518 245 Z" />
        <path d="M 520 248 Q 500 240 492 246 Q 505 244 520 250 Z" />
        <path d="M 520 248 Q 540 240 548 246 Q 535 244 520 250 Z" />
      </g>

      {/* === Hamper / Basket === */}
      <g style={{ transformOrigin: "300px 380px", animation: "basket-sway 6s ease-in-out infinite" }}>
        {/* Basket body — woven texture */}
        <path
          d="M 180 340 Q 180 460 300 460 Q 420 460 420 340 Z"
          fill={`url(#${basketId})`}
        />
        {/* Woven horizontal bands */}
        {[350, 365, 380, 395, 410, 425, 440].map((y, i) => (
          <path
            key={y}
            d={`M ${185 + i * 0.5} ${y} Q 300 ${y + 3} ${415 - i * 0.5} ${y}`}
            fill="none"
            stroke="#8b6914"
            strokeWidth="1.5"
            opacity={0.35}
          />
        ))}
        {/* Woven vertical strands */}
        {Array.from({ length: 12 }, (_, i) => {
          const x = 195 + i * 19;
          return (
            <path
              key={x}
              d={`M ${x} 340 Q ${x + 2} 400 ${x} 458`}
              fill="none"
              stroke="#a07810"
              strokeWidth="2"
              opacity={0.3}
            />
          );
        })}

        {/* Basket rim */}
        <ellipse cx="300" cy="340" rx="120" ry="18" fill={`url(#${basketRim})`} />
        <ellipse cx="300" cy="340" rx="120" ry="18" fill="none" stroke="#8b6914" strokeWidth="2" />
        <ellipse cx="300" cy="337" rx="116" ry="14" fill="#5a4a1a" opacity="0.5" />

        {/* === Produce overflowing === */}

        {/* Breadfruit (back, large) */}
        <g style={{ transformOrigin: "260px 320px", animation: "float 5s ease-in-out infinite" }}>
          <circle cx="260" cy="320" r="45" fill={`url(#${breadfruitGrad})`} />
          <circle cx="260" cy="320" r="45" fill="none" stroke="#4a6b1f" strokeWidth="1" opacity="0.3" />
          {/* Breadfruit texture dots */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 15 + (i % 3) * 8;
            return (
              <circle
                key={i}
                cx={260 + Math.cos(angle) * r}
                cy={320 + Math.sin(angle) * r}
                r="1.5"
                fill="#3d5a1a"
                opacity="0.4"
              />
            );
          })}
          {/* Leaf */}
          <path d="M 250 282 Q 245 270 260 268 Q 270 272 265 285 Z" fill="#4a6b1f" />
        </g>

        {/* Mango (left) */}
        <g style={{ transformOrigin: "210px 350px", animation: "float 4.5s ease-in-out infinite 0.5s" }}>
          <ellipse cx="210" cy="350" rx="32" ry="38" fill={`url(#${mangoGrad})`} transform="rotate(-15 210 350)" />
          {/* Mango blush */}
          <ellipse cx="225" cy="335" rx="12" ry="18" fill="#ff6b6b" opacity="0.3" transform="rotate(-15 225 335)" />
          {/* Stem */}
          <path d="M 200 316 Q 198 308 205 305" fill="none" stroke="#5a4a1a" strokeWidth="3" strokeLinecap="round" />
          {/* Leaf */}
          <path d="M 195 308 Q 185 300 188 312 Q 192 315 200 313 Z" fill="#5a8a2a" />
        </g>

        {/* Mango (right, larger) */}
        <g style={{ transformOrigin: "350px 330px", animation: "float 5.5s ease-in-out infinite 1s" }}>
          <ellipse cx="350" cy="330" rx="38" ry="42" fill={`url(#${mangoGrad})`} transform="rotate(20 350 330)" />
          <ellipse cx="370" cy="315" rx="14" ry="20" fill="#ff6b6b" opacity="0.3" transform="rotate(20 370 315)" />
          <path d="M 335 292 Q 332 282 340 278" fill="none" stroke="#5a4a1a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 330 282 Q 318 272 322 285 Q 328 290 336 287 Z" fill="#5a8a2a" />
        </g>

        {/* Provisions / dasheen (front center) */}
        <g style={{ transformOrigin: "300px 360px", animation: "float 4s ease-in-out infinite 0.3s" }}>
          <ellipse cx="300" cy="360" rx="35" ry="28" fill={`url(#${provisionGrad})`} />
          <ellipse cx="300" cy="355" rx="30" ry="20" fill="none" stroke="#8b6914" strokeWidth="1" opacity="0.4" />
          {/* Root texture lines */}
          <path d="M 275 358 Q 300 355 325 358" fill="none" stroke="#5a4a1a" strokeWidth="1" opacity="0.3" />
          <path d="M 278 365 Q 300 362 322 365" fill="none" stroke="#5a4a1a" strokeWidth="1" opacity="0.3" />
        </g>

        {/* Small produce scattered */}
        <circle cx="240" cy="375" r="10" fill="#ff6b6b" opacity="0.85" style={{ animation: "float 3.5s ease-in-out infinite 0.8s" }} />
        <circle cx="360" cy="378" r="9" fill="#e76f51" opacity="0.85" style={{ animation: "float 4s ease-in-out infinite 1.2s" }} />
        <circle cx="280" cy="385" r="7" fill="#ffd97d" opacity="0.9" style={{ animation: "float 3s ease-in-out infinite 0.4s" }} />
        <circle cx="320" cy="388" r="8" fill="#ffaa00" opacity="0.85" style={{ animation: "float 3.8s ease-in-out infinite 1.5s" }} />
      </g>

      {/* Foreground sand glow */}
      <ellipse cx="300" cy="460" rx="180" ry="20" fill="#ffd97d" opacity="0.15" />
    </svg>
  );
}

/* ──────────────────────────── BreadfruitIcon ──────────────────────────── */

export function BreadfruitIcon({ className }: { className?: string }) {
  const grad = nextId("bf");
  const leaf = nextId("bfl");
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Breadfruit" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={grad} cx="0.3" cy="0.25" r="0.8">
          <stop offset="0%" stopColor="#a3c948" />
          <stop offset="50%" stopColor="#7a9d2e" />
          <stop offset="100%" stopColor="#4a6b1f" />
        </radialGradient>
        <linearGradient id={leaf} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5a8a2a" />
          <stop offset="100%" stopColor="#3d5a1a" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="52" r="36" fill={`url(#${grad})`} />
      <circle cx="50" cy="52" r="36" fill="none" stroke="#3d5a1a" strokeWidth="1.5" opacity="0.4" />
      {/* Segmented texture */}
      {Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M ${50 + Math.cos(angle) * 8} ${52 + Math.sin(angle) * 8} Q ${50 + Math.cos(angle + 0.3) * 25} ${52 + Math.sin(angle + 0.3) * 25} ${50 + Math.cos(angle + 0.6) * 33} ${52 + Math.sin(angle + 0.6) * 33}`}
            fill="none"
            stroke="#3d5a1a"
            strokeWidth="0.8"
            opacity="0.25"
          />
        );
      })}
      {/* Surface dots */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 + 0.2;
        const r = 12 + (i % 4) * 6;
        return <circle key={i} cx={50 + Math.cos(angle) * r} cy={52 + Math.sin(angle) * r} r="1.2" fill="#3d5a1a" opacity="0.4" />;
      })}
      {/* Leaf */}
      <path d="M 48 18 Q 38 8 42 20 Q 48 24 54 19 Z" fill={`url(#${leaf})`} />
      {/* Highlight */}
      <ellipse cx="40" cy="42" rx="10" ry="6" fill="#c5e88a" opacity="0.25" />
    </svg>
  );
}

/* ──────────────────────────── MangoIcon ──────────────────────────── */

export function MangoIcon({ className }: { className?: string }) {
  const grad = nextId("mg");
  const blush = nextId("mb");
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Mango" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={grad} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="50%" stopColor="#ffaa00" />
          <stop offset="100%" stopColor="#cc7a00" />
        </radialGradient>
        <radialGradient id={blush} cx="0.7" cy="0.3" r="0.4">
          <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="55" rx="32" ry="38" fill={`url(#${grad})`} transform="rotate(-18 50 55)" />
      <ellipse cx="62" cy="40" rx="14" ry="20" fill={`url(#${blush})`} transform="rotate(-18 62 40)" />
      <path d="M 38 20 Q 35 12 42 10" fill="none" stroke="#5a4a1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M 32 14 Q 22 6 26 18 Q 34 20 40 16 Z" fill="#5a8a2a" />
      {/* Highlight */}
      <ellipse cx="42" cy="45" rx="8" ry="12" fill="#fff3d6" opacity="0.2" transform="rotate(-18 42 45)" />
    </svg>
  );
}

/* ──────────────────────────── BasketIcon ──────────────────────────── */

export function BasketIcon({ className }: { className?: string }) {
  const grad = nextId("bsk");
  const rim = nextId("rim");
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Woven basket" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a017" />
          <stop offset="50%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6b800" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      {/* Handle */}
      <path d="M 25 35 Q 50 10 75 35" fill="none" stroke="#8b6914" strokeWidth="5" strokeLinecap="round" />
      <path d="M 25 35 Q 50 14 75 35" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Basket body */}
      <path d="M 18 38 Q 18 82 50 82 Q 82 82 82 38 Z" fill={`url(#${grad})`} />
      {/* Woven bands */}
      {[44, 52, 60, 68, 76].map((y) => (
        <path key={y} d={`M 20 ${y} Q 50 ${y + 2} 80 ${y}`} fill="none" stroke="#8b6914" strokeWidth="1.5" opacity="0.4" />
      ))}
      {/* Vertical strands */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 24 + i * 8;
        return <path key={x} d={`M ${x} 38 Q ${x + 1} 60 ${x} 80`} fill="none" stroke="#a07810" strokeWidth="1.5" opacity="0.35" />;
      })}
      {/* Rim */}
      <ellipse cx="50" cy="38" rx="32" ry="6" fill={`url(#${rim})`} />
      <ellipse cx="50" cy="38" rx="32" ry="6" fill="none" stroke="#8b6914" strokeWidth="1.5" />
      <ellipse cx="50" cy="36" rx="29" ry="4" fill="#5a4a1a" opacity="0.5" />
    </svg>
  );
}

/* ──────────────────────────── CommunityIcon ──────────────────────────── */

export function CommunityIcon({ className }: { className?: string }) {
  const skinL = nextId("skinL");
  const skinR = nextId("skinR");
  const bsk = nextId("cb");
  return (
    <svg viewBox="0 0 120 100" className={className} role="img" aria-label="Hands sharing a hamper together" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={skinL} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4a373" />
          <stop offset="100%" stopColor="#c08552" />
        </linearGradient>
        <linearGradient id={skinR} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c08552" />
          <stop offset="100%" stopColor="#a06b3e" />
        </linearGradient>
        <linearGradient id={bsk} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a017" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
      </defs>
      {/* Left arm */}
      <path d="M 10 90 Q 30 70 45 55 L 55 62 Q 40 78 22 92 Z" fill={`url(#${skinL})`} />
      {/* Right arm */}
      <path d="M 110 90 Q 90 70 75 55 L 65 62 Q 80 78 98 92 Z" fill={`url(#${skinR})`} />
      {/* Left hand */}
      <ellipse cx="48" cy="55" rx="10" ry="7" fill="#c08552" transform="rotate(-20 48 55)" />
      {/* Right hand */}
      <ellipse cx="72" cy="55" rx="10" ry="7" fill="#a06b3e" transform="rotate(20 72 55)" />
      {/* Basket (center, held) */}
      <ellipse cx="60" cy="48" rx="22" ry="6" fill={`url(#${bsk})`} />
      <path d="M 38 48 Q 38 65 60 65 Q 82 65 82 48 Z" fill={`url(#${bsk})`} />
      {/* Woven lines */}
      {[52, 57, 62].map((y) => (
        <path key={y} d={`M 40 ${y} Q 60 ${y + 1} 80 ${y}`} fill="none" stroke="#8b6914" strokeWidth="1" opacity="0.4" />
      ))}
      {/* Produce peeking out */}
      <circle cx="52" cy="44" r="6" fill="#ffaa00" />
      <circle cx="60" cy="42" r="7" fill="#e76f51" />
      <circle cx="68" cy="44" r="6" fill="#ffd97d" />
      {/* Hearts above */}
      <path d="M 55 30 Q 50 25 53 22 Q 57 25 57 28 Q 57 25 61 22 Q 65 25 60 30 Z" fill="#e76f51" opacity="0.7" style={{ animation: "float 3s ease-in-out infinite" }} />
    </svg>
  );
}

/* ──────────────────────────── SunsetWaveDivider ──────────────────────────── */

export function SunsetWaveDivider({ className }: { className?: string }) {
  const grad = nextId("wave");
  return (
    <svg
      viewBox="0 0 1200 80"
      className={className}
      preserveAspectRatio="none"
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffd97d" />
          <stop offset="30%" stopColor="#ff8c42" />
          <stop offset="60%" stopColor="#e76f51" />
          <stop offset="100%" stopColor="#c44536" />
        </linearGradient>
      </defs>
      <path
        d="M 0 40 Q 150 10 300 30 T 600 25 T 900 35 T 1200 20 L 1200 80 L 0 80 Z"
        fill={`url(#${grad})`}
        className="md-wave-path"
      />
      <path
        d="M 0 50 Q 200 75 400 55 T 800 50 T 1200 60 L 1200 80 L 0 80 Z"
        fill="#c44536"
        opacity="0.4"
        className="md-wave-path-2"
      />
    </svg>
  );
}

/* ──────────────────────────── TobagoMapBadge ──────────────────────────── */

export function TobagoMapBadge({ className }: { className?: string }) {
  const grad = nextId("tmap");
  const ring = nextId("tring");
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Tobago island seal" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={grad} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#ffd97d" />
          <stop offset="50%" stopColor="#ffb347" />
          <stop offset="100%" stopColor="#e76f51" />
        </radialGradient>
        <linearGradient id={ring} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6b800" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      {/* Outer seal ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${ring})`} strokeWidth="3" />
      <circle cx="50" cy="50" r="42" fill="#fff8ee" />
      <circle cx="50" cy="50" r="42" fill={`url(#${grad})`} opacity="0.15" />
      {/* Stylized Tobago island shape (simplified, manta-ray-like silhouette) */}
      <path
        d="M 22 48 Q 28 35 40 38 Q 48 36 56 40 Q 65 36 73 42 Q 78 46 76 52 Q 72 58 65 56 Q 58 60 50 56 Q 42 60 35 56 Q 26 56 22 48 Z"
        fill={`url(#${grad})`}
        stroke="#c44536"
        strokeWidth="0.8"
        opacity="0.9"
      />
      {/* Small islet dot */}
      <circle cx="80" cy="50" r="2.5" fill="#e76f51" opacity="0.7" />
      {/* Stars — national accent (red, white, black dots) */}
      <circle cx="50" cy="20" r="2" fill="#d62828" />
      <circle cx="35" cy="78" r="1.5" fill="#000" />
      <circle cx="65" cy="78" r="1.5" fill="#fff" stroke="#ccc" strokeWidth="0.3" />
    </svg>
  );
}

/* ──────────────────────────── Decorative floating fruit ──────────────────────────── */

export function FloatingProduce({ className }: { className?: string }) {
  const grad = nextId("fp");
  return (
    <svg viewBox="0 0 60 60" className={className} role="presentation" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={grad} cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#cc7a00" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="22" fill={`url(#${grad})`} />
      <circle cx="25" cy="25" r="6" fill="#fff3d6" opacity="0.3" />
      <path d="M 28 8 Q 26 4 32 4" fill="none" stroke="#5a4a1a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}