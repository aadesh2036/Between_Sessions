import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import CrisisBanner from './CrisisBanner';
import CheckinModal from './CheckinModal';
import LogPracticeModal from './LogPracticeModal';

const NAV_ITEMS = [
  { to: '/app', label: 'Home', icon: 'cottage', end: true, badge: null },
  { to: '/app/practice', label: 'Practice', icon: 'target', end: false, badge: null },
  { to: '/app/toolkit', label: 'Toolkit', icon: 'grid_view', end: false, badge: 'Calm' },
  { to: '/app/learn', label: 'Learn', icon: 'menu_book', end: false, badge: 'Books' },
  { to: '/app/care', label: 'Care', icon: 'medical_services', end: false, badge: null },
];

export default function DashboardShell({ children, onDataRefresh }) {
  const { user, logout } = useAuth();
  const [showCheckin, setShowCheckin] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col selection:bg-brand-teal/20">
      {/* 24/7 Crisis Support Persistent Banner */}
      <CrisisBanner />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Modals */}
        {showCheckin && (
          <CheckinModal
            onClose={() => setShowCheckin(false)}
            onSaved={() => {
              if (onDataRefresh) onDataRefresh();
            }}
          />
        )}
        {showPractice && (
          <LogPracticeModal
            userId={user?.id}
            onClose={() => setShowPractice(false)}
            onSaved={() => {
              if (onDataRefresh) onDataRefresh();
            }}
          />
        )}

        {/* ── Mobile Top Bar ────────────────────────────────────────────── */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-brand-border/60 sticky top-[37px] z-20 shadow-xs">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCheckin(true)}
              className="px-3 py-1.5 rounded-full bg-brand-softerTeal hover:bg-brand-teal hover:text-white text-brand-teal text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">monitor_heart</span>
              <span>Check-in</span>
            </button>
            <Link
              to="/app/settings"
              className="w-8 h-8 rounded-full bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-ink/70 hover:text-brand-teal hover:border-brand-teal transition-all"
              title="Settings"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </Link>
          </div>
        </div>

        {/* ── Mobile Fixed Bottom Navigation (Phone Reference Parity) ────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border/70 py-1 px-2 flex justify-around items-center shadow-[0_-4px_24px_rgba(23,50,58,0.06)]">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                  isActive
                    ? 'text-brand-teal bg-brand-softerTeal font-semibold scale-105'
                    : 'text-brand-ink/60 hover:text-brand-ink hover:bg-brand-canvas font-medium'
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px] leading-none">{item.icon}</span>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.badge && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Desktop Sticky Sidebar ────────────────────────────────────── */}
        <aside className="hidden md:flex w-[240px] lg:w-[260px] bg-white border-r border-brand-border/60 shrink-0 flex-col sticky top-[37px] h-[calc(100vh-37px)] z-20">
          <div className="p-6 shrink-0">
            <Logo />
          </div>

          <div className="flex-1 px-4 overflow-y-auto pb-4 space-y-6">
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 block mb-2">
                Sanctuary
              </span>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-brand-softerTeal text-brand-teal font-semibold shadow-xs'
                          : 'text-brand-ink/70 hover:bg-brand-canvas hover:text-brand-ink font-medium'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                      <span className="text-xs">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-paper text-brand-teal border border-brand-teal/20">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Quick Actions in Sidebar */}
            <div className="pt-2 border-t border-brand-border/40 space-y-2">
              <button
                onClick={() => setShowCheckin(true)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-brand-border/80 hover:border-brand-teal hover:bg-brand-softerTeal/40 text-brand-ink text-xs font-medium transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-brand-teal">monitor_heart</span>
                  <span>Daily Check-in</span>
                </div>
                <span className="text-[10px] text-brand-ink/40 font-mono">0–10</span>
              </button>

              <button
                onClick={() => setShowPractice(true)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  <span>Log Practice</span>
                </div>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 shrink-0 mt-auto border-t border-brand-border/60 bg-brand-canvas/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-ink text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-ink truncate">{user?.name || user?.email}</p>
                <p className="text-[10px] text-brand-ink/50 font-mono truncate">{user?.email}</p>
              </div>
              <Link
                to="/app/settings"
                title="Settings"
                className="p-1 text-brand-ink/40 hover:text-brand-teal transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">settings</span>
              </Link>
              <button
                onClick={logout}
                title="Log out"
                className="p-1 text-brand-ink/40 hover:text-brand-coral transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Viewport Content (Padding bottom for mobile bottom nav) ── */}
        <main className="flex-1 min-w-0 bg-brand-canvas relative overflow-y-auto pb-28 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
