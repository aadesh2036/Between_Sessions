import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { dashboardApi, checkinsApi, practiceApi, aiSummaryApi, connectionsApi, recommendationsApi } from '../services/api';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const SUDS_LABELS = {
  0: 'None', 1: 'Minimal', 2: 'Mild', 3: 'Mild+', 4: 'Moderate',
  5: 'Moderate', 6: 'High', 7: 'Significant', 8: 'Severe', 9: 'Extreme', 10: 'Peak',
};

const RESPONSE_TYPE_META = {
  delay:     { label: 'Delay',        color: 'brand-amber',   bg: 'brand-amberSoft' },
  resist:    { label: 'Resist',       color: 'brand-teal',    bg: 'brand-softerTeal' },
  return:    { label: 'Return',       color: 'brand-lavender',bg: 'brand-lavenderSoft' },
  continue:  { label: 'Continue',     color: 'brand-coral',   bg: 'brand-coralSoft' },
  compulsion:{ label: 'Compulsion',   color: 'brand-coral',   bg: 'brand-coralSoft' },
  avoidance: { label: 'Avoidance',    color: 'brand-amber',   bg: 'brand-amberSoft' },
  reassurance:{label: 'Reassurance',  color: 'brand-lavender',bg: 'brand-lavenderSoft' },
  no_response:{label: 'No Response',  color: 'brand-ink',     bg: 'brand-canvas' },
};

function RelativeTime({ iso }) {
  if (!iso) return null;
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return <span className="text-[10px] text-brand-ink/40 font-mono">just now</span>;
  if (mins < 60) return <span className="text-[10px] text-brand-ink/40 font-mono">{mins}m ago</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span className="text-[10px] text-brand-ink/40 font-mono">{hrs}h ago</span>;
  const days = Math.floor(hrs / 24);
  return <span className="text-[10px] text-brand-ink/40 font-mono">{days}d ago</span>;
}

/* ── SUDS Check-in Modal ─────────────────────────────────────────────────── */
function CheckinModal({ onClose, onSaved }) {
  const [score, setScore] = useState(5);
  const [urge, setUrge] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await checkinsApi.create({ sudsScore: score, urgeScore: urge });
      onSaved({ sudsScore: score, urgeScore: urge });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save check-in.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-dashboard w-full max-w-sm mx-4 p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-ink/30 hover:text-brand-ink transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-2 text-brand-teal mb-4">
          <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
          <span className="text-xs font-bold uppercase tracking-widest">Daily Check-in</span>
        </div>
        <h2 className="font-editorial text-3xl text-brand-ink mb-1">How distressed do you feel right now?</h2>
        <p className="text-brand-ink/50 text-xs mb-6">SUDS: Subjective Units of Distress Scale (0 = none, 10 = peak)</p>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-brand-ink uppercase tracking-wider">Distress (SUDS)</label>
              <span className="font-mono text-2xl font-medium text-brand-ink">{score}
                <span className="text-xs text-brand-ink/50 font-sans ml-1">{SUDS_LABELS[score]}</span>
              </span>
            </div>
            <input
              type="range" min={0} max={10} value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="w-full accent-brand-teal"
            />
            <div className="flex justify-between text-[10px] text-brand-ink/40 font-mono mt-1">
              <span>0</span><span>5</span><span>10</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-brand-ink uppercase tracking-wider">Urge Intensity</label>
              <span className="font-mono text-2xl font-medium text-brand-ink">{urge}</span>
            </div>
            <input
              type="range" min={0} max={10} value={urge}
              onChange={e => setUrge(Number(e.target.value))}
              className="w-full accent-brand-coral"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-brand-coral text-xs">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full py-3 rounded-full bg-brand-ink text-white text-sm font-bold hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Check-in'}
        </button>
      </div>
    </div>
  );
}

/* ── Log Practice Modal ─────────────────────────────────────────────────── */
function LogPracticeModal({ onClose, onSaved, userId }) {
  const [trigger, setTrigger] = useState('');
  const [urge, setUrge] = useState(5);
  const [responseType, setResponseType] = useState('delay');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!responseType) { setError('Please select a response type.'); return; }
    setSaving(true);
    setError('');
    try {
      // Legacy practice endpoint for quick log
      await practiceApi.logEvent(userId, responseType);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-dashboard w-full max-w-sm mx-4 p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-ink/30 hover:text-brand-ink transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-2 text-brand-coral mb-4">
          <span className="material-symbols-outlined text-[20px]">psychology</span>
          <span className="text-xs font-bold uppercase tracking-widest">Log Practice</span>
        </div>
        <h2 className="font-editorial text-3xl text-brand-ink mb-5">What just happened?</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Urge Intensity</label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={10} value={urge} onChange={e => setUrge(Number(e.target.value))} className="flex-1 accent-brand-coral" />
              <span className="font-mono text-lg w-6 text-center">{urge}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-ink mb-2 uppercase tracking-wider">Response Chosen</label>
            <div className="grid grid-cols-2 gap-2">
              {['delay', 'resist', 'return', 'continue'].map(rt => {
                const meta = RESPONSE_TYPE_META[rt];
                const active = responseType === rt;
                return (
                  <button
                    key={rt}
                    onClick={() => setResponseType(rt)}
                    className={`py-2.5 px-4 rounded-2xl text-xs font-bold transition-all border ${
                      active
                        ? `bg-brand-ink text-white border-brand-ink`
                        : `bg-brand-canvas text-brand-ink/70 border-brand-border hover:border-brand-ink/40`
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Brief note (optional)</label>
            <input
              type="text"
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
              placeholder="What triggered this?"
              className="w-full px-4 py-2 bg-brand-canvas border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal"
            />
          </div>
        </div>
        {error && <p className="mt-2 text-brand-coral text-xs">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 w-full py-3 rounded-full bg-brand-ink text-white text-sm font-bold hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Practice Log'}
        </button>
      </div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, logout } = useAuth();

  // Modals
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  // Dashboard data
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  // AI Summary
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);

  // Clinical recommendations authored by connected practitioner
  const [recommendations, setRecommendations] = useState([]);

  // Pause & Choose tool
  const [pauseStep, setPauseStep] = useState('idle');
  const [selectedResponse, setSelectedResponse] = useState(null);

  // Practitioner discovery banner
  const [hasConnection, setHasConnection] = useState(null); // null=loading, true/false

  // Load dashboard data on mount
  const loadDashboard = useCallback(async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const res = await dashboardApi.get();
      setStats(res.data);
    } catch (err) {
      setStatsError(err.message || 'Could not load dashboard data.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load AI summary (non-blocking)
  const loadAiSummary = useCallback(async () => {
    try {
      const res = await aiSummaryApi.get();
      setAiSummary(res.data);
    } catch {
      // No summary for this week yet — that's fine
    }
  }, []);

  // Load clinician recommendations
  const loadRecommendations = useCallback(async () => {
    try {
      const res = await recommendationsApi.list();
      setRecommendations(res.data || []);
    } catch {
      setRecommendations([]);
    }
  }, []);

  // Check connections for discovery banner
  const loadConnections = useCallback(async () => {
    try {
      const res = await connectionsApi.list();
      const active = (res.data || []).filter(c => ['ACTIVE', 'active', 'pending', 'PENDING'].includes(c.status));
      setHasConnection(active.length > 0);
    } catch {
      setHasConnection(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadAiSummary();
    loadRecommendations();
    loadConnections();
  }, [loadDashboard, loadAiSummary, loadRecommendations, loadConnections]);

  // Generate AI summary on demand
  const handleGenerateSummary = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await aiSummaryApi.generate();
      setAiSummary(res.data);
      setAiGenerated(true);
    } catch (err) {
      setAiError(err.message || 'Could not generate summary.');
    } finally {
      setAiLoading(false);
    }
  };

  // Pause & Choose
  const handlePauseFlow = (step) => {
    setPauseStep(step);
    if (step === 'idle') setSelectedResponse(null);
  };

  const handleResponse = async (response) => {
    setSelectedResponse(response);
    try {
      await practiceApi.logEvent(user?.id, response);
    } catch { /* best effort */ }
    setTimeout(() => {
      setPauseStep('idle');
      loadDashboard(); // refresh stats after logging
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col md:flex-row overflow-x-hidden selection:bg-brand-teal/20">

      {/* MODALS */}
      {showCheckinModal && (
        <CheckinModal
          onClose={() => setShowCheckinModal(false)}
          onSaved={() => loadDashboard()}
        />
      )}
      {showPracticeModal && (
        <LogPracticeModal
          userId={user?.id}
          onClose={() => setShowPracticeModal(false)}
          onSaved={() => loadDashboard()}
        />
      )}

      {/* ── STICKY SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="w-full md:w-[260px] lg:w-[280px] bg-white border-r border-brand-border/40 shrink-0 flex flex-col md:sticky md:top-0 md:h-screen z-20">
        <div className="p-6 md:p-8 shrink-0">
          <Logo />
        </div>

        <div className="flex-1 px-4 md:px-6 overflow-y-auto pb-6 space-y-8">
          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Sanctuary</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-brand-softerTeal text-brand-teal font-bold shadow-sm" to="/app">
                <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                </div>
                <span className="text-[14px]">Home</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
              </Link>
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm" to="/app/practice">
                <div className="w-8 h-8 rounded-full bg-brand-coralSoft flex items-center justify-center text-brand-coral">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                </div>
                <span className="text-[14px] font-medium">Practice History</span>
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Care Continuity</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm group" to="/app/clinician">
                <div className="w-8 h-8 rounded-full bg-brand-canvas flex items-center justify-center text-brand-ink/60 group-hover:text-brand-ink">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                </div>
                <span className="text-[14px] font-medium">Clinician Connect</span>
              </Link>
            </nav>
          </div>

          {/* Quick check-in CTA in sidebar */}
          <div className="px-2">
            <button
              onClick={() => setShowCheckinModal(true)}
              className="w-full py-2.5 rounded-full bg-brand-ink text-white text-[11px] font-bold hover:bg-brand-teal transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">monitor_heart</span>
              Daily Check-in
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 shrink-0 mt-auto border-t border-brand-border/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-ink text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold text-brand-ink truncate">{user?.name || user?.email}</div>
              <div className="text-[10px] text-brand-ink/50 font-mono mt-0.5 truncate">ID: {user?.id}</div>
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
      <div className="flex-1 min-w-0 relative">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-softerTeal blur-[120px] opacity-70 pointer-events-none z-0"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-brand-coralSoft blur-[140px] opacity-70 pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-brand-teal font-bold text-xs uppercase tracking-widest mb-2">Welcome Back</p>
              <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal leading-tight">
                {user?.name ? <>Welcome, <span className="italic text-brand-teal">{user.name.split(' ')[0]}.</span></> : <>Make more room <span className="italic text-brand-teal">for life outside the loop.</span></>}
              </h1>
            </div>
            <button
              onClick={() => setShowPracticeModal(true)}
              className="self-start sm:self-end px-5 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold shadow-sm hover:bg-brand-teal transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Log Practice</span>
            </button>
          </header>

          {/* ── Email verification banner ───────────────────────────────── */}
          {user && !user.isVerified && (
            <div className="p-4 bg-brand-amberSoft border border-brand-amber/30 rounded-2xl flex items-center justify-between text-brand-ink shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-amber">mail</span>
                <div>
                  <h4 className="text-xs font-bold">Verify your email address</h4>
                  <p className="text-[11px] opacity-80 mt-0.5">Please click the link in the email we sent you to secure your sanctuary.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Practitioner discovery banner ───────────────────────────── */}
          {hasConnection === false && (
            <div className="p-5 bg-brand-lavenderSoft border border-brand-lavender/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-brand-lavender text-[22px] shrink-0 mt-0.5">person_search</span>
                <div>
                  <h4 className="text-sm font-bold text-brand-ink">Connect with a verified practitioner</h4>
                  <p className="text-xs text-brand-ink/60 mt-0.5 max-w-md">Dr. Kavita Mehra (MD, MCI Registered · ERP Specialist) is available for consent-controlled behavioral review. You decide exactly what data they see.</p>
                </div>
              </div>
              <Link to="/app/clinician" className="shrink-0 px-5 py-2 rounded-full bg-brand-lavender text-white text-xs font-bold hover:opacity-90 transition-colors whitespace-nowrap">
                View Clinician Connect →
              </Link>
            </div>
          )}

          {/* ── Stats row ─────────────────────────────────────────────── */}
          {loadingStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-brand-border/30"></div>
              ))}
            </div>
          ) : statsError ? (
            <div className="p-4 bg-brand-coralSoft border border-brand-coral/20 rounded-2xl text-brand-coral text-xs">
              {statsError}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up">
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Practice (7d)</div>
                <div className="font-mono text-3xl font-medium text-brand-ink">{stats.thisWeekPractice ?? 0}<span className="text-base text-brand-ink/40 ml-1">sessions</span></div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Check-ins (7d)</div>
                <div className="font-mono text-3xl font-medium text-brand-ink">{stats.checkinCountThisWeek ?? stats.checkinStreak ?? 0}<span className="text-base text-brand-ink/40 ml-1">logged</span></div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Avg SUDS (7d)</div>
                <div className="font-mono text-3xl font-medium text-brand-ink">
                  {stats.avgSudsThisWeek != null ? stats.avgSudsThisWeek : '—'}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Journal entries</div>
                <div className="font-mono text-3xl font-medium text-brand-ink">{stats.totalJournalThisWeek ?? 0}</div>
              </div>
            </div>
          ) : null}

          {/* ── Active Clinical Recommendations ─────────────────────────── */}
          {recommendations.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-teal/20 shadow-dashboard animate-fade-up relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-brand-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-softerTeal flex items-center justify-center text-brand-teal shrink-0">
                    <span className="material-symbols-outlined text-[22px]">clinical_notes</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">Curated Structured Practice</span>
                      <span className="px-2 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal text-[10px] font-bold">Human-Authored Note</span>
                    </div>
                    <h3 className="font-editorial text-2xl text-brand-ink mt-0.5">
                      {recommendations[0].practitionerName ? `Recommendation from ${recommendations[0].practitionerName}` : 'Clinical Recommendation'}
                    </h3>
                  </div>
                </div>
                <div className="text-left sm:text-right sm:self-center">
                  <div className="text-xs font-bold text-brand-ink/80">{recommendations[0].practitionerCredentials || 'Verified Clinician'}</div>
                  <div className="text-[11px] text-brand-ink/40 font-mono">
                    {recommendations[0].authoredAt ? new Date(recommendations[0].authoredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recommended Next Step / Practice */}
                <div className="p-5 rounded-2xl bg-brand-softerTeal/60 border border-brand-teal/20 space-y-2">
                  <div className="flex items-center gap-2 text-brand-teal text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    Recommended Practice Window
                  </div>
                  <p className="text-sm font-medium text-brand-ink leading-relaxed">
                    {recommendations[0].nextStep}
                  </p>
                </div>

                {/* Clinical Observation */}
                {recommendations[0].observation && (
                  <div className="p-5 rounded-2xl bg-brand-canvas border border-brand-border/40 space-y-2">
                    <div className="flex items-center gap-2 text-brand-ink/60 text-xs font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Clinical Observation
                    </div>
                    <p className="text-sm text-brand-ink/80 leading-relaxed italic">
                      "{recommendations[0].observation}"
                    </p>
                  </div>
                )}
              </div>

              {/* Direct Note to User */}
              {recommendations[0].noteToUser && (
                <div className="mt-4 p-4 rounded-2xl bg-brand-amberSoft/60 border border-brand-amber/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-brand-amber text-[18px] shrink-0 mt-0.5">edit_note</span>
                  <div className="text-xs text-brand-ink/80 leading-relaxed">
                    <span className="font-bold text-brand-ink">Note from practitioner: </span>
                    {recommendations[0].noteToUser}
                  </div>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-brand-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-brand-ink/40">
                <span>This structured practice is authored by your clinician based on your shared logs. Not an automated diagnosis.</span>
                <Link to="/app/clinician" className="text-brand-teal font-bold hover:underline shrink-0">
                  Manage Sharing &amp; Clinician →
                </Link>
              </div>
            </section>
          )}

          {/* ── Bento Grid ─────────────────────────────────────────────── */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up" style={{ animationDelay: '100ms' }}>

            {/* LEFT column */}
            <div className="lg:col-span-7 space-y-6">

              {/* Recent Journal ─────────────────────────────────────────── */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-brand-teal">
                    <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Recent Patterns</span>
                  </div>
                  <Link to="/app/practice" className="text-[11px] text-brand-ink/50 hover:text-brand-teal font-bold transition-colors flex items-center gap-1">
                    View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>

                {loadingStats ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-brand-canvas rounded-2xl"></div>)}
                  </div>
                ) : stats?.recentJournal?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentJournal.map(entry => {
                      const meta = RESPONSE_TYPE_META[entry.responseType] || RESPONSE_TYPE_META.no_response;
                      return (
                        <div key={entry.entryId} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-canvas">
                          <div className={`w-10 h-10 rounded-full bg-${meta.bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-[10px] font-bold text-${meta.color} uppercase`}>{meta.label.slice(0, 3)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-brand-ink truncate">{entry.trigger || 'No trigger noted'}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-bold text-${meta.color}`}>{meta.label}</span>
                              {entry.urge != null && (
                                <span className="text-[10px] text-brand-ink/40 font-mono">urge: {entry.urge}</span>
                              )}
                              {entry.tags?.slice(0, 2).map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-brand-border text-[9px] font-bold text-brand-ink/50">{t}</span>
                              ))}
                            </div>
                          </div>
                          <RelativeTime iso={entry.createdAt} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-brand-ink/40 text-sm">
                    No journal entries this week yet.
                    <Link to="/app/practice" className="block mt-2 text-brand-teal text-xs font-bold hover:underline">Start logging →</Link>
                  </div>
                )}
              </section>

              {/* Pause & Choose Tool ─────────────────────────────────────── */}
              <section className={`rounded-3xl p-6 sm:p-8 border border-brand-border/30 transition-colors duration-500 ${
                pauseStep === 'idle'   ? 'bg-brand-ink text-white' :
                pauseStep === 'pause'  ? 'bg-brand-amber text-white' :
                pauseStep === 'allow'  ? 'bg-brand-lavender text-white' : 'bg-brand-teal text-white'
              }`}>
                {pauseStep === 'idle' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h2 className="font-editorial text-3xl mb-2">Pause &amp; Choose</h2>
                      <p className="text-white/70 text-sm">A brief intervention when an urge hits. You don't need to make the urge disappear.</p>
                    </div>
                    <button onClick={() => handlePauseFlow('pause')} className="shrink-0 w-16 h-16 rounded-full bg-white text-brand-ink flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                    </button>
                  </div>
                )}
                {pauseStep === 'pause' && (
                  <div className="text-center py-6 animate-fade-in">
                    <h2 className="font-editorial text-4xl mb-4">An urge is here.</h2>
                    <p className="text-white/80 text-sm mb-8">Notice it. It is just a temporary neurochemical event.</p>
                    <button onClick={() => handlePauseFlow('allow')} className="px-8 py-3 rounded-full bg-white text-brand-amber font-bold text-sm shadow-md hover:scale-105 transition-transform">Continue</button>
                  </div>
                )}
                {pauseStep === 'allow' && (
                  <div className="text-center py-6 animate-fade-in">
                    <h2 className="font-editorial text-4xl mb-4">I allow this feeling.</h2>
                    <p className="text-white/80 text-sm mb-8">I don't need to fix it. I don't need to make it disappear.</p>
                    <button onClick={() => handlePauseFlow('choose')} className="px-8 py-3 rounded-full bg-white text-brand-lavender font-bold text-sm shadow-md hover:scale-105 transition-transform">Make a choice</button>
                  </div>
                )}
                {pauseStep === 'choose' && !selectedResponse && (
                  <div className="animate-fade-in">
                    <h2 className="font-editorial text-3xl mb-6 text-center">What response fits the direction I want to move in?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['delay', 'resist', 'return', 'continue'].map(rt => (
                        <button key={rt} onClick={() => handleResponse(rt)} className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-left">
                          <div className="font-bold text-sm mb-1">{RESPONSE_TYPE_META[rt].label}</div>
                          <div className="text-xs text-white/70">
                            {rt === 'delay' && 'I will wait 10 minutes.'}
                            {rt === 'resist' && 'I will not perform the ritual.'}
                            {rt === 'return' && 'I am going back to what I was doing.'}
                            {rt === 'continue' && 'I will stay in this situation.'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {pauseStep === 'choose' && selectedResponse && (
                  <div className="text-center py-6 animate-fade-up">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center text-brand-teal shadow-lg mb-4">
                      <span className="material-symbols-outlined text-[32px]">check</span>
                    </div>
                    <h2 className="font-editorial text-3xl mb-2">Response logged.</h2>
                    <p className="text-white/80 text-sm">You are building new neuroplastic pathways.</p>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT column */}
            <div className="lg:col-span-5 space-y-6">

              {/* Active patterns ────────────────────────────────────────── */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
                <div className="flex items-center gap-2 text-brand-teal mb-4">
                  <span className="material-symbols-outlined text-[20px]">pattern</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Active Patterns</span>
                </div>
                {stats?.activePatterns?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.activePatterns.map(({ type, count }) => {
                      const meta = RESPONSE_TYPE_META[type] || RESPONSE_TYPE_META.no_response;
                      return (
                        <div key={type} className="flex items-center justify-between p-4 rounded-2xl bg-brand-canvas">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-${meta.bg} flex items-center justify-center`}>
                              <span className="material-symbols-outlined text-[18px] text-brand-ink/60">repeat</span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-brand-ink capitalize">{meta.label}</div>
                              <div className="text-xs text-brand-ink/50">This week</div>
                            </div>
                          </div>
                          <div className="font-mono text-xl font-medium text-brand-ink">{count}×</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-brand-ink/40 text-sm">No patterns logged this week.</div>
                )}
              </section>

              {/* AI Weekly Summary ──────────────────────────────────────── */}
              <section className="bg-brand-canvas rounded-3xl p-6 sm:p-8 border border-brand-border/40 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-brand-lavender">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Weekly Insight</span>
                  </div>
                  {stats?.lastSummaryDate && (
                    <span className="text-[10px] text-brand-ink/40 font-mono">Week of {stats.lastSummaryDate}</span>
                  )}
                </div>

                {aiSummary ? (
                  <div>
                    <p className="text-brand-ink/80 text-sm leading-relaxed mb-3">{aiSummary.summary}</p>
                    <p className="text-[10px] text-brand-ink/40 italic">{aiSummary.disclaimer}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-brand-ink/50 text-sm mb-4">
                      Generate a grounded summary of your week based on your logs.
                    </p>
                    {aiError && <p className="text-brand-coral text-xs mb-3">{aiError}</p>}
                    <button
                      onClick={handleGenerateSummary}
                      disabled={aiLoading}
                      className="px-5 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-lavender transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {aiLoading
                        ? <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Generating...</>
                        : <><span className="material-symbols-outlined text-[14px]">auto_awesome</span> Generate Insight</>
                      }
                    </button>
                  </div>
                )}

                {aiGenerated && (
                  <button
                    onClick={handleGenerateSummary}
                    disabled={aiLoading}
                    className="mt-3 text-[10px] text-brand-ink/40 hover:text-brand-lavender transition-colors font-bold underline"
                  >
                    Regenerate
                  </button>
                )}
              </section>

              {/* Values / Life outside ─────────────────────────────────── */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
                <div className="flex items-center gap-2 text-brand-lavender mb-4">
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Life Outside OCD</span>
                </div>
                <h2 className="font-editorial text-2xl text-brand-ink mb-1">More room for:</h2>
                <p className="text-brand-ink/50 text-xs mb-5">Your chosen values acting as your compass.</p>
                <div className="flex flex-wrap gap-2">
                  {(user?.values && user.values.length > 0 ? user.values : ['Add your values in settings']).map(val => (
                    <span key={val} className="px-4 py-2 rounded-full bg-brand-canvas text-brand-ink text-sm font-medium shadow-sm border border-brand-border/30">{val}</span>
                  ))}
                </div>
              </section>
            </div>
          </main>

          {/* ── Safety Footer ──────────────────────────────────────────── */}
          <footer className="border-t border-brand-border/40 pt-6 text-center text-[11px] text-brand-ink/40">
            <span className="font-bold text-brand-coral">Need immediate support?</span>
            {' '}Tele-MANAS: <span className="font-mono">14416</span> · <span className="font-mono">1800-891-4416</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
