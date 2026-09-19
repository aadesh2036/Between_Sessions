import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * MobileBottomNav
 * 
 * Floating curved dark pill bottom navigation matching the mobile reference design.
 * Features:
 * - Floating dark ink pill bar with rounded ends
 * - Raised center mound with circular action button (+)
 * - Liquid spring action sheet pop-up on tap (+) -> (✕)
 * - Dot indicator below the active tab
 * - Fully accessible and responsive
 */
export default function MobileBottomNav({
  items = [], // 4 items: 2 left, 2 right
  actionTitle = "Quick Logging",
  actionPills = [],
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2, 4);

  const handleActionClick = (action) => {
    setIsOpen(false);
    if (action.onClick) action.onClick();
  };

  return (
    <>
      {/* ── Backdrop Overlay when Action Sheet is Open ── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-brand-ink/40 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Floating Container ── */}
      <div className={`md:hidden fixed bottom-4 left-4 right-4 z-40 max-w-[420px] mx-auto pointer-events-none ${className}`}>
        <div className="relative pointer-events-auto">

          {/* ── Liquidy Action Sheet (Pops Up from Center Button) ── */}
          {isOpen && (
            <div
              className="absolute bottom-[76px] left-0 right-0 z-50 rounded-[32px] p-5 shadow-[0_20px_50px_rgba(23,50,58,0.25)] border border-white/20 animate-liquid-pop"
              style={{
                backgroundColor: '#94A87D', // Calming organic sage matching the reference design
                transformOrigin: 'bottom center',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-2 mb-3 text-brand-ink">
                <span className="font-sans font-bold text-base tracking-tight">
                  {actionTitle}
                </span>
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                  <span className="material-symbols-outlined text-[18px]">nature</span>
                </div>
              </div>

              {/* Action Pills List */}
              <div className="space-y-2.5">
                {actionPills.map((action, idx) => {
                  const isHighlight = action.highlight ?? (idx === 0);
                  return (
                    <button
                      key={action.id || idx}
                      onClick={() => handleActionClick(action)}
                      className={`w-full rounded-full py-3 px-4 flex items-center justify-between text-left transition-all duration-200 active:scale-98 ${
                        isHighlight
                          ? 'bg-white text-brand-ink shadow-sm hover:bg-white/95'
                          : 'bg-white/40 hover:bg-white/60 text-brand-ink backdrop-blur-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isHighlight ? 'bg-brand-canvas text-brand-ink' : 'bg-white/60 text-brand-ink'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            {action.icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate leading-tight">
                            {action.label}
                          </span>
                          {action.subtitle && (
                            <span className="text-[10px] text-brand-ink/65 block truncate leading-tight mt-0.5">
                              {action.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-brand-ink/45 text-[18px] shrink-0 ml-2">
                        chevron_right
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Main Dark Pill Navigation Bar ── */}
          <div className="relative w-full h-[62px]">
            {/* Background pill */}
            <div className="absolute inset-0 bg-brand-ink rounded-full shadow-[0_12px_36px_rgba(23,50,58,0.3)] flex items-center px-3">
              {/* Left 2 items - equal 2-column grid */}
              <div className="flex-1 grid grid-cols-2 place-items-center">
                {leftItems.map((item) => renderNavItem(item))}
              </div>

              {/* Center spacer for mound */}
              <div className="w-[60px] shrink-0" />

              {/* Right 2 items - equal 2-column grid */}
              <div className="flex-1 grid grid-cols-2 place-items-center">
                {rightItems.map((item) => renderNavItem(item))}
              </div>
            </div>

            {/* ── Center Mound & Circular Action Button ── */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
              {/* Organic curved dome backdrop with smooth wings */}
              <div className="relative flex items-center justify-center">
                {/* Left wing curve */}
                <svg
                  className="absolute -left-3 bottom-0 w-3.5 h-3.5 pointer-events-none"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path d="M 0,14 C 7,14 10,7 14,0 L 14,14 Z" fill="#17323A" />
                </svg>

                {/* Center dome ring */}
                <div className="w-[52px] h-[30px] bg-brand-ink rounded-t-full shadow-xs" />

                {/* Right wing curve */}
                <svg
                  className="absolute -right-3 bottom-0 w-3.5 h-3.5 pointer-events-none"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path d="M 0,0 C 4,7 7,14 14,14 L 0,14 Z" fill="#17323A" />
                </svg>
              </div>

              {/* Center Circular Action Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-0.5 w-11 h-11 rounded-full bg-white text-brand-ink shadow-[0_4px_16px_rgba(0,0,0,0.22)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-300 z-10"
                aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
              >
                <span
                  className={`material-symbols-outlined text-[24px] font-bold text-brand-ink transition-transform duration-300 ${
                    isOpen ? 'rotate-135' : 'rotate-0'
                  }`}
                >
                  add
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/** Helper to render each nav item with active dot indicator */
function renderNavItem(item) {
  if (item.to) {
    return (
      <NavLink
        key={item.id || item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `w-full flex flex-col items-center justify-center py-1 transition-all relative ${
            isActive ? 'text-white font-bold' : 'text-white/55 hover:text-white font-medium'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined text-[22px] leading-none">
              {item.icon}
            </span>
            {/* White dot indicator directly below active tab */}
            {isActive ? (
              <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-xs animate-fade-in" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
            )}
            {item.badge && (
              <span className="absolute -top-1 right-1/4 w-2 h-2 rounded-full bg-brand-coral animate-pulse" />
            )}
          </>
        )}
      </NavLink>
    );
  }

  // Button item for state-driven tabs (e.g. practitioner dashboard)
  const isActive = item.isActive;
  return (
    <button
      key={item.id || item.label}
      type="button"
      onClick={item.onClick}
      className={`w-full flex flex-col items-center justify-center py-1 transition-all relative ${
        isActive ? 'text-white font-bold' : 'text-white/55 hover:text-white font-medium'
      }`}
    >
      <span className="material-symbols-outlined text-[22px] leading-none">
        {item.icon}
      </span>
      {/* White dot indicator directly below active tab */}
      {isActive ? (
        <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-xs animate-fade-in" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
      )}
      {item.badge && (
        <span className="absolute -top-1 right-1/4 min-w-[14px] h-3.5 px-1 rounded-full bg-brand-coral text-white text-[9px] font-bold flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </button>
  );
}
