import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { journalApi, checkinsApi, progressApi } from '../services/api';
import Logo from '../components/Logo';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const RESPONSE_TYPE_META = {
  delay:       { label: 'Delay',        icon: 'pause_circle',       color: 'brand-amber',    bg: 'brand-amberSoft' },
  resist:      { label: 'Resist',       icon: 'shield',              color: 'brand-teal',     bg: 'brand-softerTeal' },
  return:      { label: 'Return',       icon: 'undo',                color: 'brand-lavender', bg: 'brand-lavenderSoft' },
  continue:    { label: 'Continue',     icon: 'arrow_forward_ios',   color: 'brand-teal',     bg: 'brand-softerTeal' },
  compulsion:  { label: 'Compulsion',   icon: 'repeat',              color: 'brand-coral',    bg: 'brand-coralSoft' },
  avoidance:   { label: 'Avoidance',    icon: 'block',               color: 'brand-coral',    bg: 'brand-coralSoft' },
  reassurance: { label: 'Reassurance',  icon: 'chat_bubble',         color: 'brand-lavender', bg: 'brand-lavenderSoft' },
  no_response: { label: 'No Response',  icon: 'radio_button_unchecked', color: 'brand-ink',   bg: 'brand-canvas' },
};

const SUDS_COLOR = (n) => {
  if (n <= 3) return 'text-clinical-success';
  if (n <= 6) return 'text-brand-amber';
  return 'text-brand-coral';
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/** Group entries by calendar date (YYYY-MM-DD) */
function groupByDate(entries, dateField = 'createdAt') {
  const groups = {};
  for (const e of entries) {
    const d = (e[dateField] || e.createdAt || '').slice(0, 10);
    if (!d) continue;
    if (!groups[d]) groups[d] = [];
    groups[d].push(e);
  }
  return groups;
}

/* ── Mini Sparkline (SVG) ─────────────────────────────────────────────────── */
function Sparkline({ data, height = 40 }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.avgSuds).filter(v => v != null);
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 120;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="opacity-70">
      <polyline points={pts} fill="none" stroke="#176B67" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#176B67" />;
      })}
    </svg>
  );
}

/* ── New Journal Entry Modal ─────────────────────────────────────────────── */
function NewJournalModal({ onClose, onSaved }) {
  const TYPES = ['delay', 'resist', 'return', 'continue', 'compulsion', 'avoidance', 'reassurance', 'no_response'];
  const [trigger, setTrigger] = useState('');
  const [urge, setUrge] = useState(5);
  const [responseType, setResponseType] = useState('delay');
  const [outcome, setOutcome] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await journalApi.create({
        trigger: trigger || undefined,
        urge,
        responseType,
        outcome: outcome || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-dashboard w-full max-w-md mx-4 p-8 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-ink/30 hover:text-brand-ink">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-2 text-brand-coral mb-4">
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          <span className="text-xs font-bold uppercase tracking-widest">New Entry</span>
        </div>
        <h2 className="font-editorial text-3xl text-brand-ink mb-5">Log a behavioral response</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Trigger (optional)</label>
            <input type="text" value={trigger} onChange={e => setTrigger(e.target.value)} placeholder="What was the context?" className="w-full px-4 py-2 bg-brand-canvas border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold text-brand-ink uppercase tracking-wider">Urge Intensity</label>
              <span className="font-mono text-lg">{urge}</span>
            </div>
            <input type="range" min={0} max={10} value={urge} onChange={e => setUrge(Number(e.target.value))} className="w-full accent-brand-coral" />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">Response Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(rt => {
                const meta = RESPONSE_TYPE_META[rt];
                return (
                  <button
                    key={rt}
                    onClick={() => setResponseType(rt)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      responseType === rt
                        ? 'bg-brand-ink text-white border-brand-ink'
                        : 'bg-brand-canvas text-brand-ink/60 border-brand-border hover:border-brand-ink/40'
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Outcome note (optional)</label>
            <textarea value={outcome} onChange={e => setOutcome(e.target.value)} rows={2} placeholder="What happened next?" className="w-full px-4 py-2 bg-brand-canvas border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Tags (comma separated)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="checking, morning, study..." className="w-full px-4 py-2 bg-brand-canvas border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal" />
          </div>
        </div>

        {error && <p className="mt-2 text-brand-coral text-xs">{error}</p>}

        <button onClick={handleSave} disabled={saving} className="mt-5 w-full py-3 rounded-full bg-brand-ink text-white text-sm font-bold hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function PracticeHistoryPage() {
  const { user, logout } = useAuth();

  const [journalEntries, setJournalEntries] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('7d');
  const [tab, setTab] = useState('journal'); // 'journal' | 'checkins'
  const [showNewEntry, setShowNewEntry] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const days = range === '30d' ? 30 : 7;
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const [journalRes, checkinsRes, progressRes] = await Promise.all([
        journalApi.list(from),
        checkinsApi.list(from),
        progressApi.get(range),
      ]);

      setJournalEntries(journalRes.data || []);
      setCheckins(checkinsRes.data || []);
      setProgress(progressRes.data || null);
    } catch (err) {
      setError(err.message || 'Could not load history.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { loadData(); }, [loadData]);

  const journalByDate = groupByDate(journalEntries);
  const checkinByDate = groupByDate(checkins);
  const sortedJournalDates = Object.keys(journalByDate).sort().reverse();
  const sortedCheckinDates = Object.keys(checkinByDate).sort().reverse();

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col md:flex-row overflow-x-hidden">

      {showNewEntry && (
        <NewJournalModal onClose={() => setShowNewEntry(false)} onSaved={loadData} />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-[260px] lg:w-[280px] bg-white border-r border-brand-border/40 shrink-0 flex flex-col md:sticky md:top-0 md:h-screen z-20">
        <div className="p-6 md:p-8 shrink-0"><Logo /></div>
        <div className="flex-1 px-4 md:px-6 overflow-y-auto pb-6 space-y-8">
          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Sanctuary</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm" to="/app">
                <div className="w-8 h-8 rounded-full bg-brand-softerTeal flex items-center justify-center text-brand-teal">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                </div>
                <span className="text-[14px] font-medium">Home</span>
              </Link>
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-brand-coralSoft text-brand-coral font-bold shadow-sm" to="/app/practice">
                <div className="w-8 h-8 rounded-full bg-brand-coral/10 flex items-center justify-center text-brand-coral">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                </div>
                <span className="text-[14px]">Practice History</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-coral"></span>
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Care Continuity</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm group" to="/app/clinician">
                <div className="w-8 h-8 rounded-full bg-brand-canvas flex items-center justify-center text-brand-ink/60">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                </div>
                <span className="text-[14px] font-medium">Clinician Connect</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="p-4 md:p-6 shrink-0 mt-auto border-t border-brand-border/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-ink text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold text-brand-ink truncate">{user?.name || user?.email}</div>
            </div>
            <Link to="/app/settings" className="p-2 text-brand-ink/40 hover:text-brand-teal transition-colors">
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </Link>
            <button onClick={logout} className="p-2 text-brand-ink/40 hover:text-brand-coral transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
            <div>
              <Link to="/app" className="inline-flex items-center gap-1 text-brand-ink/40 hover:text-brand-teal text-xs font-bold mb-3 transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Dashboard
              </Link>
              <h1 className="font-editorial text-4xl text-brand-ink">Practice History</h1>
              <p className="text-brand-ink/50 text-sm mt-1">Your non-evaluative behavioral log.</p>
            </div>
            <button
              onClick={() => setShowNewEntry(true)}
              className="self-start sm:self-end px-5 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold shadow-sm hover:bg-brand-teal transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> New Entry
            </button>
          </header>

          {/* Range + Summary Row */}
          {progress && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up">
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Journal entries</div>
                <div className="font-mono text-3xl text-brand-ink">{progress.summary.totalJournal}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Check-ins</div>
                <div className="font-mono text-3xl text-brand-ink">{progress.summary.totalCheckins}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Practice logs</div>
                <div className="font-mono text-3xl text-brand-ink">{progress.summary.totalPractice}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Avg SUDS</div>
                <div className={`font-mono text-3xl ${SUDS_COLOR(progress.summary.avgSudsOverall)}`}>
                  {progress.summary.avgSudsOverall ?? '—'}
                </div>
              </div>
            </div>
          )}

          {/* SUDS sparkline */}
          {progress?.timeline?.length > 1 && (
            <div className="bg-white rounded-3xl p-6 border border-brand-border/30 shadow-sm animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-brand-teal">
                  <span className="material-symbols-outlined text-[18px]">show_chart</span>
                  <span className="text-xs font-bold uppercase tracking-widest">SUDS Trend</span>
                </div>
                <div className="flex gap-1">
                  {['7d', '30d'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        range === r ? 'bg-brand-ink text-white' : 'bg-brand-canvas text-brand-ink/50 hover:text-brand-ink'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-2 overflow-x-auto pb-2">
                {progress.timeline.map(day => (
                  <div key={day.date} className="flex flex-col items-center gap-1 min-w-[36px]">
                    <div
                      className="w-5 rounded-sm bg-brand-teal/20 transition-all"
                      style={{
                        height: `${day.avgSuds != null ? (day.avgSuds / 10) * 48 + 4 : 4}px`,
                        backgroundColor: day.avgSuds != null ? `rgba(23,107,103,${0.15 + (day.avgSuds / 10) * 0.7})` : undefined,
                      }}
                    ></div>
                    {day.avgSuds != null && (
                      <span className={`font-mono text-[9px] font-bold ${SUDS_COLOR(day.avgSuds)}`}>{day.avgSuds}</span>
                    )}
                    <span className="text-[8px] text-brand-ink/30">{day.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab('journal')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                tab === 'journal' ? 'bg-brand-ink text-white' : 'bg-white text-brand-ink/60 border border-brand-border hover:text-brand-ink'
              }`}
            >
              Behavioral Log ({journalEntries.length})
            </button>
            <button
              onClick={() => setTab('checkins')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                tab === 'checkins' ? 'bg-brand-ink text-white' : 'bg-white text-brand-ink/60 border border-brand-border hover:text-brand-ink'
              }`}
            >
              Check-ins ({checkins.length})
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-brand-coralSoft border border-brand-coral/20 rounded-2xl text-brand-coral text-sm">{error}</div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-brand-border/30"></div>)}
            </div>
          )}

          {/* Journal Tab ─────────────────────────────────────────────────── */}
          {!loading && tab === 'journal' && (
            <div className="space-y-8 animate-fade-up">
              {sortedJournalDates.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 border border-brand-border/30 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-amberSoft flex items-center justify-center text-brand-amber mb-4">
                    <span className="material-symbols-outlined text-[32px]">edit_note</span>
                  </div>
                  <h3 className="font-editorial text-2xl text-brand-ink mb-2">Your private log.</h3>
                  <p className="text-brand-ink/50 text-sm max-w-sm mx-auto">A non-evaluative timeline of your behavioral responses will appear here.</p>
                  <button onClick={() => setShowNewEntry(true)} className="mt-4 px-6 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-teal transition-colors">
                    Add first entry
                  </button>
                </div>
              ) : (
                sortedJournalDates.map(date => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-xs font-bold text-brand-ink/50 uppercase tracking-widest">{formatDate(date + 'T00:00:00')}</div>
                      <div className="flex-1 h-px bg-brand-border/40"></div>
                    </div>
                    <div className="space-y-3">
                      {journalByDate[date].map(entry => {
                        const meta = RESPONSE_TYPE_META[entry.responseType] || RESPONSE_TYPE_META.no_response;
                        return (
                          <div key={entry.entryId || entry.SK} className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm flex gap-4">
                            <div className={`w-10 h-10 rounded-full bg-${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <span className={`material-symbols-outlined text-[18px] text-${meta.color}`}>{meta.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider text-${meta.color}`}>{meta.label}</span>
                                  {entry.trigger && (
                                    <p className="text-sm font-semibold text-brand-ink mt-0.5">{entry.trigger}</p>
                                  )}
                                </div>
                                <span className="text-[10px] text-brand-ink/40 font-mono shrink-0">{formatTime(entry.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {entry.urge != null && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] uppercase tracking-wider text-brand-ink/40 font-bold">Urge</span>
                                    <span className={`font-mono text-sm font-bold ${SUDS_COLOR(entry.urge)}`}>{entry.urge}</span>
                                  </div>
                                )}
                                {entry.tags?.length > 0 && entry.tags.map(t => (
                                  <span key={t} className="px-2.5 py-0.5 rounded-full bg-brand-canvas border border-brand-border text-[9px] font-bold text-brand-ink/50 uppercase">{t}</span>
                                ))}
                              </div>
                              {entry.outcome && (
                                <p className="text-xs text-brand-ink/60 mt-2 italic">"{entry.outcome}"</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Check-ins Tab ─────────────────────────────────────────────── */}
          {!loading && tab === 'checkins' && (
            <div className="space-y-8 animate-fade-up">
              {sortedCheckinDates.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 border border-brand-border/30 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-softerTeal flex items-center justify-center text-brand-teal mb-4">
                    <span className="material-symbols-outlined text-[32px]">monitor_heart</span>
                  </div>
                  <h3 className="font-editorial text-2xl text-brand-ink mb-2">No check-ins yet.</h3>
                  <p className="text-brand-ink/50 text-sm max-w-sm mx-auto">Use the Daily Check-in button on the dashboard to log your SUDS score.</p>
                </div>
              ) : (
                sortedCheckinDates.map(date => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-xs font-bold text-brand-ink/50 uppercase tracking-widest">{formatDate(date + 'T00:00:00')}</div>
                      <div className="flex-1 h-px bg-brand-border/40"></div>
                    </div>
                    <div className="space-y-2">
                      {checkinByDate[date].map(c => (
                        <div key={c.checkinId || c.SK} className="bg-white rounded-2xl p-4 border border-brand-border/30 shadow-sm flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-softerTeal flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px] text-brand-teal">monitor_heart</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-brand-ink/40">SUDS</span>
                                <span className={`font-mono text-2xl font-bold ml-2 ${SUDS_COLOR(c.sudsScore)}`}>{c.sudsScore}</span>
                              </div>
                              {c.urgeScore != null && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-ink/40">Urge</span>
                                  <span className={`font-mono text-2xl font-bold ml-2 ${SUDS_COLOR(c.urgeScore)}`}>{c.urgeScore}</span>
                                </div>
                              )}
                              {c.mood && (
                                <span className="px-3 py-1 rounded-full bg-brand-canvas border border-brand-border text-[10px] font-bold text-brand-ink/60 capitalize">{c.mood}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-brand-ink/40 font-mono">{formatTime(c.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Safety Footer */}
          <footer className="border-t border-brand-border/40 pt-6 text-center text-[11px] text-brand-ink/40">
            <span className="font-bold text-brand-coral">Need immediate support?</span>
            {' '}Tele-MANAS: <span className="font-mono">14416</span> · <span className="font-mono">1800-891-4416</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
