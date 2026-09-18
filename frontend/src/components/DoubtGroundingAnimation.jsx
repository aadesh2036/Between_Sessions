import React from 'react';

/**
 * DoubtGroundingAnimation.jsx
 * 
 * Ambient organic SVG illustration for the Daily Grounding Focus card.
 * Concept: "You do not need to solve the doubt to continue living your life."
 * 
 * Layout & Architecture:
 * - Stacked in a column layout underneath the daily grounding quote.
 * - Sequence of organic shapes from left to right:
 *   1. Question Mark: A separate entity formed of TWO distinct organic sub-shapes:
 *      - Sub-shape A: Organic curved upper hook
 *      - Sub-shape B: Organic rounded lower dot
 *   2. Organic 6-lobed scalloped flower blob (warm alarm response)
 *   3. Translucent breathing aura circle (mindful presence)
 *   4. Lavender/purple rounded pebble rotated 45° with multiply blend mode
 *   5. Warm apricot/peach crescent disc
 *   6. Mindful thought-drift particles floating between the gaps
 * 
 * Animation:
 * - Spacing between all shapes increases and reduces in a soothing 6.5s breathing loop.
 * - Spacing between the question mark hook and dot ALSO increases and reduces in sync.
 * - Desktop only: hidden on mobile (< md) to preserve compact vertical spacing.
 */
export default function DoubtGroundingAnimation({ className = "" }) {
  // Symmetrical 6-lobed organic flower blob path centered at (195, 75)
  const flowerPath =
    "M 238.0 75.0 C 238.0 79.8, 223.7 83.3, 220.1 89.5 C 216.5 95.7, 220.7 109.8, 216.5 112.2 C 212.3 114.7, 202.2 104.0, 195.0 104.0 C 187.8 104.0, 177.7 114.7, 173.5 112.2 C 169.3 109.8, 173.5 95.7, 169.9 89.5 C 166.3 83.3, 152.0 79.8, 152.0 75.0 C 152.0 70.2, 166.3 66.7, 169.9 60.5 C 173.5 54.3, 169.3 40.2, 173.5 37.8 C 177.7 35.3, 187.8 46.0, 195.0 46.0 C 202.2 46.0, 212.3 35.3, 216.5 37.8 C 220.7 40.2, 216.5 54.3, 220.1 60.5 C 223.7 66.7, 238.0 70.2, 238.0 75.0 Z";

  return (
    <div
      className={`relative w-full max-w-[540px] h-[120px] sm:h-[135px] select-none pointer-events-none flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 540 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Question Mark gradient: rich warm terracotta/coral */}
          <linearGradient id="doubtQmGrad" x1="60" y1="40" x2="110" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F05E32" />
            <stop offset="100%" stopColor="#D94E28" />
          </linearGradient>

          {/* Coral/Amber gradient for the flower blob */}
          <linearGradient id="doubtBlobGrad" x1="155" y1="40" x2="238" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF7A45" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#E8856C" stopOpacity="0.78" />
          </linearGradient>

          {/* Lavender/Purple gradient for the rounded pebble */}
          <linearGradient id="doubtPebbleGrad" x1="335" y1="45" x2="395" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9C87DB" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7E68BA" stopOpacity="0.75" />
          </linearGradient>

          {/* Peach/Apricot gradient for the outer disc */}
          <linearGradient id="doubtArcGrad" x1="410" y1="35" x2="500" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFC499" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F79F79" stopOpacity="0.5" />
          </linearGradient>

          {/* Soft drop shadow for floating elements */}
          <filter id="doubtSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#17323A" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* ── 1. Far Right: Peach/Apricot Disc (Spacing Drift 5) ── */}
        <g className="anim-spacing-arc">
          <circle
            cx="445"
            cy="75"
            r="54"
            fill="url(#doubtArcGrad)"
            style={{ mixBlendMode: 'multiply' }}
          />
        </g>

        {/* ── 2. Middle-Right: Lavender/Purple Rounded Diamond Pebble (Spacing Drift 4) ── */}
        <g className="anim-spacing-pebble">
          <rect
            x="337"
            y="47"
            width="56"
            height="56"
            rx="20"
            transform="rotate(45 365 75)"
            fill="url(#doubtPebbleGrad)"
            style={{ mixBlendMode: 'multiply' }}
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 3. Center: Translucent Breathing Aura Circle (Spacing Scale 3) ── */}
        <g className="anim-spacing-aura">
          <circle
            cx="285"
            cy="75"
            r="38"
            fill="#FFFFFF"
            fillOpacity="0.55"
            style={{ mixBlendMode: 'screen' }}
          />
          {/* Delicate concentric dashed halo */}
          <circle
            cx="285"
            cy="75"
            r="48"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
          />
        </g>

        {/* ── 4. Center-Left: Warm 6-Lobed Organic Flower Blob (Spacing Drift 2) ── */}
        <g className="anim-spacing-flower">
          <path
            d={flowerPath}
            fill="url(#doubtBlobGrad)"
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 5. Left: Separate Organic Question Mark (?) (Spacing Drift 1) ── */}
        {/* Composed of TWO separate organic sub-shapes whose distance also expands & contracts */}
        <g className="anim-spacing-qm">
          {/* Sub-shape A: Organic Curved Upper Hook */}
          <path
            d="M 66 54 C 66 34, 106 34, 106 58 C 106 78, 86 84, 86 102"
            fill="none"
            stroke="url(#doubtQmGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="anim-spacing-qm-hook"
            filter="url(#doubtSoftShadow)"
          />

          {/* Sub-shape B: Organic Lower Dot / Pebble */}
          <ellipse
            cx="86"
            cy="128"
            rx="8.5"
            ry="8"
            fill="url(#doubtQmGrad)"
            className="anim-spacing-qm-dot"
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 6. Mindful Thought Drift Particles floating in the gaps ── */}
        <g className="anim-spacing-drift">
          <circle cx="140" cy="73" r="2.8" fill="#E8856C" fillOpacity="0.6" />
          <circle cx="248" cy="77" r="2.2" fill="#8B7EC8" fillOpacity="0.65" />
          <circle cx="330" cy="71" r="2.5" fill="#176B67" fillOpacity="0.45" />
          <circle cx="408" cy="79" r="2" fill="#F79F79" fillOpacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
