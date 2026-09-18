import React from 'react';

/**
 * DoubtGroundingAnimation.jsx
 * 
 * Ambient organic SVG illustration for the Daily Grounding Focus card.
 * Concept: "You do not need to solve the doubt to continue living your life."
 * 
 * Design Details:
 * - Chubby, friendly, organic shapes that deeply intersect with multiply blend modes.
 * - Separate, wide, fat Question Mark composed of two distinct organic sub-shapes:
 *   - Sub-shape A: Thick, bulbous curved upper hook (strokeWidth 24 with round caps)
 *   - Sub-shape B: Plump organic lower dot pebble
 * - Fat 6-lobed scalloped star/flower blob with subtle organic rotation during breathing.
 * - Breathing aura circle, rounded purple pebble, and large peach disc overlapping.
 * - Dynamic spacing loop: all shapes expand apart and contract together rhythmically.
 */
export default function DoubtGroundingAnimation({ className = "" }) {
  // Symmetrical chubby 6-lobed organic flower blob path centered at (210, 95)
  const flowerPath =
    "M 275.0 95.0 C 275.0 101.5, 249.2 105.1, 243.8 114.5 C 238.4 123.9, 248.1 148.0, 242.5 151.3 C 236.9 154.5, 220.8 134.0, 210.0 134.0 C 199.2 134.0, 183.1 154.5, 177.5 151.3 C 171.9 148.0, 181.6 123.9, 176.2 114.5 C 170.8 105.1, 145.0 101.5, 145.0 95.0 C 145.0 88.5, 170.8 84.9, 176.2 75.5 C 181.6 66.1, 171.9 42.0, 177.5 38.7 C 183.1 35.5, 199.2 56.0, 210.0 56.0 C 220.8 56.0, 236.9 35.5, 242.5 38.7 C 248.1 42.0, 238.4 66.1, 243.8 75.5 C 249.2 84.9, 275.0 88.5, 275.0 95.0 Z";

  return (
    <div
      className={`relative w-full max-w-[580px] h-[160px] sm:h-[185px] lg:h-[200px] select-none pointer-events-none flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 580 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Question Mark gradient: rich warm terracotta/coral */}
          <linearGradient id="doubtQmGrad" x1="70" y1="30" x2="140" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F25828" />
            <stop offset="100%" stopColor="#DB4218" />
          </linearGradient>

          {/* Coral/Amber gradient for the chubby flower blob */}
          <linearGradient id="doubtBlobGrad" x1="150" y1="40" x2="275" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF7A42" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E88265" stopOpacity="0.82" />
          </linearGradient>

          {/* Lavender/Purple gradient for the chunky rounded pebble */}
          <linearGradient id="doubtPebbleGrad" x1="340" y1="50" x2="430" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9C87DB" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#7E68BA" stopOpacity="0.78" />
          </linearGradient>

          {/* Peach/Apricot gradient for the large outer disc */}
          <linearGradient id="doubtArcGrad" x1="410" y1="30" x2="550" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFC8A2" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F79F79" stopOpacity="0.55" />
          </linearGradient>

          {/* Soft drop shadow for floating elements */}
          <filter id="doubtSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#17323A" floodOpacity="0.09" />
          </filter>
        </defs>

        {/* ── 1. Far Right: Large Peach/Apricot Disc (deeply intersecting purple pebble) ── */}
        <g className="anim-spacing-arc">
          <circle
            cx="480"
            cy="95"
            r="74"
            fill="url(#doubtArcGrad)"
            style={{ mixBlendMode: 'multiply' }}
          />
        </g>

        {/* ── 2. Middle-Right: Chunky Lavender/Purple Rounded Diamond (intersecting both sides) ── */}
        <g className="anim-spacing-pebble">
          <rect
            x="343"
            y="53"
            width="84"
            height="84"
            rx="30"
            transform="rotate(45 385 95)"
            fill="url(#doubtPebbleGrad)"
            style={{ mixBlendMode: 'multiply' }}
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 3. Center: Soft Translucent Breathing Aura (intersecting center stage) ── */}
        <g className="anim-spacing-aura">
          <circle
            cx="310"
            cy="95"
            r="60"
            fill="#FFFFFF"
            fillOpacity="0.55"
            style={{ mixBlendMode: 'screen' }}
          />
          {/* Subtle concentric halo ring */}
          <circle
            cx="310"
            cy="95"
            r="72"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeOpacity="0.45"
          />
        </g>

        {/* ── 4. Center-Left: Fat Chubby 6-Lobed Star/Flower Blob (with subtle rotation) ── */}
        <g className="anim-spacing-flower">
          <path
            d={flowerPath}
            fill="url(#doubtBlobGrad)"
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 5. Left: Separate Fat Organic Question Mark (?) (2 Sub-Shapes) ── */}
        <g className="anim-spacing-qm">
          {/* Sub-shape A: Chubby Curved Upper Hook (strokeWidth 24 with rounded bulbous caps) */}
          <path
            d="M 80 64 C 80 34, 134 34, 134 68 C 134 94, 108 100, 108 126"
            fill="none"
            stroke="url(#doubtQmGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="anim-spacing-qm-hook"
            filter="url(#doubtSoftShadow)"
          />

          {/* Sub-shape B: Plump Lower Dot Pebble */}
          <ellipse
            cx="108"
            cy="158"
            rx="14"
            ry="13.5"
            fill="url(#doubtQmGrad)"
            className="anim-spacing-qm-dot"
            filter="url(#doubtSoftShadow)"
          />
        </g>

        {/* ── 6. Mindful Thought Drift Particles: Connecting the Opening Gaps ── */}
        <g className="anim-spacing-drift">
          <circle cx="158" cy="92" r="3.6" fill="#E8856C" fillOpacity="0.65" />
          <circle cx="260" cy="98" r="3" fill="#8B7EC8" fillOpacity="0.7" />
          <circle cx="348" cy="92" r="3.2" fill="#176B67" fillOpacity="0.45" />
          <circle cx="432" cy="100" r="2.8" fill="#F79F79" fillOpacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
