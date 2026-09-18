import React from 'react';

/**
 * DoubtGroundingAnimation.jsx
 * 
 * Ambient organic SVG animation for the Daily Grounding Focus card.
 * Concept: "You do not need to solve the doubt to continue living your life."
 * 
 * Visual Architecture (inspired by soft organic geometric art):
 * - Left: Warm coral/amber scalloped 6-lobed flower blob (mind's urgent alarm)
 * - Center-Left: Mindful Question Mark (?) floating serenely inside a translucent white pod (the doubt held gently)
 * - Center: Soft breathing translucent white/cream circle with subtle concentric orbit
 * - Center-Right: Soft lavender/purple rounded shield/pebble with multiply blend mode
 * - Far-Right: Warm apricot/peach translucent crescent arc bleeding off the card edge
 * - Thought Drift Particles: Mindful defusion dots floating into open awareness
 * 
 * Desktop only: hidden on mobile (< md) to conserve vertical space.
 */
export default function DoubtGroundingAnimation({ className = "" }) {
  // Symmetrical smooth 6-lobed organic flower blob path
  const flowerPath =
    "M 160.0 120.0 C 160.0 126.2, 141.6 130.6, 137.0 138.5 C 132.5 146.4, 137.8 164.5, 132.5 167.6 C 127.2 170.7, 114.2 157.0, 105.0 157.0 C 95.8 157.0, 82.8 170.7, 77.5 167.6 C 72.2 164.5, 77.5 146.4, 73.0 138.5 C 68.4 130.6, 50.0 126.2, 50.0 120.0 C 50.0 113.8, 68.4 109.4, 73.0 101.5 C 77.5 93.6, 72.2 75.5, 77.5 72.4 C 82.8 69.3, 95.8 83.0, 105.0 83.0 C 114.2 83.0, 127.2 69.3, 132.5 72.4 C 137.8 75.5, 132.5 93.6, 137.0 101.5 C 141.6 109.4, 160.0 113.8, 160.0 120.0 Z";

  return (
    <div
      className={`relative w-[280px] sm:w-[320px] lg:w-[350px] h-[200px] select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 350 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Coral/Amber gradient for the flower blob */}
          <linearGradient id="doubtBlobGrad" x1="50" y1="70" x2="160" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F26A36" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E8856C" stopOpacity="0.82" />
          </linearGradient>

          {/* Lavender/Purple gradient for the rounded pebble */}
          <linearGradient id="doubtPebbleGrad" x1="180" y1="80" x2="256" y2="156" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9C87DB" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7E68BA" stopOpacity="0.75" />
          </linearGradient>

          {/* Peach/Apricot gradient for the outer crescent arc */}
          <linearGradient id="doubtArcGrad" x1="220" y1="50" x2="350" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFC499" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#F79F79" stopOpacity="0.45" />
          </linearGradient>

          {/* Soft drop shadow for floating elements */}
          <filter id="doubtSoftShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#17323A" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* ── 1. Far Right: Large Translucent Peach Arc (bleeding into card edge) ── */}
        <g className="anim-doubt-arc">
          <circle
            cx="295"
            cy="120"
            r="82"
            fill="url(#doubtArcGrad)"
            style={{ mixBlendMode: 'multiply' }}
          />
        </g>

        {/* ── 2. Center: Soft Translucent Pulsing Glow Circle ── */}
        <g className="anim-doubt-pulse">
          <circle
            cx="165"
            cy="120"
            r="44"
            fill="#FFFFFF"
            fillOpacity="0.55"
            style={{ mixBlendMode: 'screen' }}
          />
          {/* Subtle concentric ripple */}
          <circle
            cx="165"
            cy="120"
            r="56"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
          />
        </g>

        {/* ── 3. Middle-Right: Purple Rounded Diamond/Pebble ── */}
        <g className="anim-doubt-pebble">
          <rect
            x="182"
            y="82"
            width="76"
            height="76"
            rx="28"
            transform="rotate(45 220 120)"
            fill="url(#doubtPebbleGrad)"
            style={{ mixBlendMode: 'multiply' }}
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 4. Left: Warm 6-Lobed Scalloped Flower Blob ── */}
        <g className="anim-doubt-blob">
          <path
            d={flowerPath}
            fill="url(#doubtBlobGrad)"
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 5. The Doubt Question Mark (?) Symbol ── */}
        {/* Floating serenely in a soft white capsule over the flower blob */}
        <g className="anim-doubt-mark">
          {/* Translucent pod cradling the question mark */}
          <circle
            cx="105"
            cy="120"
            r="21"
            fill="#FFFFFF"
            fillOpacity="0.88"
            filter="drop-shadow(0 4px 8px rgba(23, 50, 58, 0.12))"
          />
          {/* Delicate inner accent ring */}
          <circle
            cx="105"
            cy="120"
            r="18"
            stroke="#E8856C"
            strokeWidth="1"
            strokeOpacity="0.25"
            fill="none"
          />
          {/* Question Mark glyph in editorial Newsreader font */}
          <text
            x="105"
            y="128"
            textAnchor="middle"
            dominantBaseline="auto"
            fill="#17323A"
            fontSize="26"
            fontFamily="'Newsreader', Georgia, serif"
            fontStyle="italic"
            fontWeight="600"
            className="select-none"
          >
            ?
          </text>
        </g>

        {/* ── 6. Thought Drift Particles: Mindful Defusion ── */}
        {/* Three small gentle dots drifting from the question mark into openness */}
        <g className="anim-doubt-drift opacity-70">
          <circle cx="146" cy="116" r="3" fill="#E8856C" fillOpacity="0.65" />
          <circle cx="158" cy="122" r="2.2" fill="#8B7EC8" fillOpacity="0.7" />
          <circle cx="170" cy="114" r="1.8" fill="#17323A" fillOpacity="0.45" />
        </g>
      </svg>
    </div>
  );
}
