import React, { useState } from 'react';

export default function CrisisBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      aria-label="24/7 Crisis Support Resources"
      className="bg-brand-paper border-b border-brand-border/60 text-brand-ink text-xs px-4 py-2 sticky top-0 z-30 transition-all shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-coralSoft text-brand-coral font-bold text-[10px]">
            SOS
          </span>
          <span className="font-semibold text-brand-ink">24/7 Crisis Support:</span>
          <span className="text-brand-ink/75">
            Tele-MANAS{' '}
            <a
              href="tel:14416"
              className="font-mono font-bold text-brand-teal hover:underline tracking-tight"
            >
              14416
            </a>
            {' / '}
            <a
              href="tel:18008914416"
              className="font-mono font-bold text-brand-teal hover:underline tracking-tight"
            >
              1800-891-4416
            </a>
          </span>
          <span className="hidden sm:inline-block text-brand-ink/30">•</span>
          <span className="hidden sm:inline-block text-brand-ink/60">
            Between Sessions is a between-session continuity tool, not an emergency medical service.
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-medium text-brand-teal hover:text-brand-tealDark flex items-center gap-1 focus:outline-none"
        >
          <span>{expanded ? 'Hide Details' : 'More Crisis Helplines'}</span>
          <span className="material-symbols-outlined text-[14px]">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto pt-3 pb-1 border-t border-brand-border/40 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-[11px]">
          <div className="p-3 rounded-2xl bg-brand-canvas border border-brand-border/60">
            <p className="font-bold text-brand-ink">Tele-MANAS (Govt of India)</p>
            <p className="text-brand-ink/60 mt-0.5">National tele-mental health programme, 24/7 toll-free in 20+ languages.</p>
            <p className="font-mono font-bold text-brand-teal mt-1">14416 / 1800-891-4416</p>
          </div>
          <div className="p-3 rounded-2xl bg-brand-canvas border border-brand-border/60">
            <p className="font-bold text-brand-ink">Kiran Mental Health Helpline</p>
            <p className="text-brand-ink/60 mt-0.5">Ministry of Social Justice and Empowerment 24/7 helpline.</p>
            <p className="font-mono font-bold text-brand-teal mt-1">1800-599-0019</p>
          </div>
          <div className="p-3 rounded-2xl bg-brand-canvas border border-brand-border/60">
            <p className="font-bold text-brand-ink">Vandrevala Foundation</p>
            <p className="text-brand-ink/60 mt-0.5">Free, confidential mental health counseling via call or WhatsApp.</p>
            <p className="font-mono font-bold text-brand-teal mt-1">+91 9999 666 555</p>
          </div>
        </div>
      )}
    </aside>
  );
}
