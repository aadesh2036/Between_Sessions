import React from 'react';

/**
 * BetweenLoading
 *
 * Signature loading animation embodying the core philosophy of Between Sessions:
 * The 1-hour session anchor at 12 o'clock, with the 167 hours of daily life continuously
 * orbiting and being held safely in the steady space between therapeutic appointments.
 *
 * Props:
 * - size: 'xs' (18px), 'sm' (28px), 'md' (44px), 'lg' (64px), 'xl' (84px)
 * - label: Optional primary text shown beneath the loader
 * - sublabel: Optional secondary micro-text (e.g. "Holding space for the 167 hours")
 * - fullScreen: If true, centers in a fixed/modal-like glassmorphic canvas
 * - inline: If true, renders a compact inline spinner
 * - className: Additional container classes
 */
export default function BetweenLoading({
  size = 'md',
  label,
  sublabel,
  fullScreen = false,
  inline = false,
  className = '',
}) {
  const sizeMap = {
    xs: {
      box: 'w-5 h-5',
      svg: 'w-3 h-3',
      stroke: 2,
      halo: 'inset-[-3px]',
      dot: 1.2,
    },
    sm: {
      box: 'w-8 h-8',
      svg: 'w-4.5 h-4.5',
      stroke: 1.75,
      halo: 'inset-[-4px]',
      dot: 1.4,
    },
    md: {
      box: 'w-12 h-12',
      svg: 'w-7 h-7',
      stroke: 1.75,
      halo: 'inset-[-6px]',
      dot: 1.5,
    },
    lg: {
      box: 'w-16 h-16',
      svg: 'w-9 h-9',
      stroke: 1.75,
      halo: 'inset-[-8px]',
      dot: 1.6,
    },
    xl: {
      box: 'w-20 h-20',
      svg: 'w-12 h-12',
      stroke: 1.75,
      halo: 'inset-[-10px]',
      dot: 1.8,
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const loaderVisual = (
    <div className={`relative flex items-center justify-center shrink-0 ${currentSize.box}`} aria-hidden="true">
      {/* Outer subtle 7-day orbit track */}
      {size !== 'xs' && (
        <div
          className={`absolute ${currentSize.halo} rounded-full border border-brand-teal/25 border-dashed anim-time-orbit-track pointer-events-none`}
          style={{ animationDuration: '14s' }}
        />
      )}

      {/* Ambient glowing breath halo */}
      <div
        className={`absolute inset-0 rounded-full bg-brand-teal/20 blur-sm anim-time-pulse pointer-events-none`}
      />

      {/* The Core Brand Logo Emblem (Teal Disc) */}
      <div
        className={`w-full h-full rounded-full bg-brand-teal flex items-center justify-center text-white shadow-md relative overflow-hidden anim-time-disc`}
      >
        <svg
          className={`${currentSize.svg} overflow-visible`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Static sector fill: the 167 hours space */}
          <path
            d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9 2.03 0 3.9-.67 5.4-1.8L12 13V2z"
            fill="rgba(255, 255, 255, 0.18)"
            stroke="white"
            strokeWidth={currentSize.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="anim-time-sector"
          />

          {/* Orbiting Time Sweep: Hands moving through the hours between sessions */}
          <g className="anim-time-sweep" style={{ transformOrigin: '12px 12px' }}>
            <line
              x1="12"
              y1="12"
              x2="12"
              y2="2.5"
              stroke="#FFF0EC"
              strokeWidth={currentSize.stroke}
              strokeLinecap="round"
              opacity="0.9"
            />
            <circle cx="12" cy="2.5" r={currentSize.dot} fill="#FFFFFF" />
            {/* Subtle orbital trail */}
            <circle cx="12" cy="2.5" r={currentSize.dot * 2.2} fill="#E8856C" opacity="0.35" />
          </g>

          {/* Central Session Anchor Pivot (Steady Patient Anchor) */}
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="white"
            className="anim-time-center"
            style={{ transformOrigin: '12px 12px' }}
          />
          <circle cx="12" cy="12" r="1.4" fill="#176B67" />
        </svg>
      </div>
    </div>
  );

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
        {loaderVisual}
        {label && <span className="text-xs font-medium text-brand-ink/80">{label}</span>}
      </span>
    );
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-canvas/80 backdrop-blur-md flex flex-col items-center justify-center p-6 transition-all duration-300" role="status" aria-live="polite" aria-label={label || 'Loading'}>
        <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
          {loaderVisual}
          <div className="space-y-1">
            <p className="font-editorial text-xl sm:text-2xl text-brand-ink font-medium">
              {label || 'Holding the space between sessions...'}
            </p>
            <p className="text-xs font-sans text-brand-ink/75">
              {sublabel || 'Bridging your continuity and mindful response'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 text-center space-y-3 ${className}`} role="status" aria-live="polite" aria-label={label || 'Loading'}>
      {loaderVisual}
      {(label || sublabel) && (
        <div className="space-y-0.5">
          {label && (
            <p className="font-sans text-xs font-semibold text-brand-ink/80">{label}</p>
          )}
          {sublabel && (
            <p className="font-sans text-xs text-brand-ink/75">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Named alias for convenience
export { BetweenLoading as TimeBridgeLoader };
