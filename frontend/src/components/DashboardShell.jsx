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
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-brand-border/60 sticky top-[37px] z-20">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCheckin(true)}
              className="px-2.5 py-1.5 rounded-full bg-brand-softerTeal text-brand-teal text-[11px] font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">monitor_heart</span>
              Check-in
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-brand-ink/70 hover:text-brand-ink"
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown Nav ────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-brand-border px-4 py-3 space-y-1 z-20 animate-fade-in">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-softerTeal text-brand-teal font-semibold'
                      : 'text-brand-ink/70 hover:bg-brand-canvas hover:text-brand-ink font-medium'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-brand-teal border border-brand-teal/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between">
              <Link
                to="/app/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-brand-ink/60 hover:text-brand-ink flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Settings
              </Link>
              <button
                onClick={logout}
                className="text-xs text-brand-coral hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign out
              </button>
            </div>
          </div>
        )}

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
                      `flex items-center justify-between px-3 py-2.5 rounded transition-all group ${
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
                className="w-full py-2 px-3 rounded border border-brand-border/80 hover:border-brand-teal hover:bg-brand-softerTeal/40 text-brand-ink text-xs font-medium transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-brand-teal">monitor_heart</span>
                  <span>Daily Check-in</span>
                </div>
                <span className="text-[10px] text-brand-ink/40 font-mono">0–10</span>
              </button>

              <button
                onClick={() => setShowPractice(true)}
                className="w-full py-2 px-3 rounded bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-between"
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

        {/* ── Main Viewport Content ─────────────────────────────────────── */}
        <main className="flex-1 min-w-0 bg-brand-canvas relative overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
