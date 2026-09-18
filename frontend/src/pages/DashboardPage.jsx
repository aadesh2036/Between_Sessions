import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import CheckinModal from '../components/CheckinModal';
import LogPracticeModal from '../components/LogPracticeModal';
import DoubtGroundingAnimation from '../components/DoubtGroundingAnimation';
import {
  dashboardApi,
  practiceApi,
  aiSummaryApi,
  connectionsApi,
  recommendationsApi,
  valuesApi,
  toolkitApi,
} from '../services/api';

const SUDS_LABELS = {
  0: 'None', 1: 'Minimal', 2: 'Mild', 3: 'Mild+', 4: 'Moderate',
  5: 'Moderate', 6: 'High', 7: 'Significant', 8: 'Severe', 9: 'Extreme', 10: 'Peak',
};

export default function DashboardPage() {
  const { user } = useAuth();

  // Modals
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [practicePlans, setPracticePlans] = useState([]);
  const [valuesData, setValuesData] = useState({ values: [], suggestedActions: [] });
  const [completedActions, setCompletedActions] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [hasConnection, setHasConnection] = useState(null);

  // Interactive Quick Tool inline state (Pause & Choose on Dashboard)
  const [inlinePauseStep, setInlinePauseStep] = useState('idle'); // idle | notice | allow | choose | committed
  const [chosenAction, setChosenAction] = useState(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, plansRes, recsRes, valuesRes, actionsRes, connsRes] = await Promise.allSettled([
        dashboardApi.get(),
        practiceApi.getPlans(),
        recommendationsApi.list(),
        valuesApi.get(),
        valuesApi.listActions(),
        connectionsApi.list(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (plansRes.status === 'fulfilled') {
        const plans = plansRes.value.data;
        const all = [...(plans.clinicianPlans || []), ...(plans.selfGuidedPlans || [])];
        setPracticePlans(all);
      }
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data || []);
      if (valuesRes.status === 'fulfilled') setValuesData(valuesRes.value.data || { values: [], suggestedActions: [] });
      if (actionsRes.status === 'fulfilled') {
        const acts = (actionsRes.value.data || []).map((a) => a.actionTitle);
        setCompletedActions(acts);
      }
      if (connsRes.status === 'fulfilled') {
        const active = (connsRes.value.data || []).filter((c) => ['ACTIVE', 'active', 'pending', 'PENDING'].includes(c.status));
        setHasConnection(active.length > 0);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAiSummary = useCallback(async () => {
    try {
      const res = await aiSummaryApi.get();
      setAiSummary(res.data);
    } catch {
      // summary non-blocking
    }
  }, []);

  useEffect(() => {
    loadAllData();
    loadAiSummary();
  }, [loadAllData, loadAiSummary]);

  // Complete a value action directly on dashboard
  const handleToggleAction = async (action) => {
    const isDone = completedActions.includes(action.title);
    if (isDone) return; // already completed today

    try {
      await valuesApi.logAction({
        value: action.value,
        actionTitle: action.title,
        durationMinutes: action.minutes || 15,
      });
      setCompletedActions((prev) => [...prev, action.title]);
    } catch {
      // optimistic fallback
      setCompletedActions((prev) => [...prev, action.title]);
    }
  };

  // Inline Pause & Choose execution
  const handleInlinePauseChoice = async (responseType) => {
    setChosenAction(responseType);
    setInlinePauseStep('committed');
    try {
      await practiceApi.logEvent(user?.id, responseType);
      await toolkitApi.logInteraction({
        toolId: 'pause-choose',
        actionChosen: responseType,
        details: 'Logged from Home Dashboard quick tool',
      });
    } catch { /* best effort */ }

    setTimeout(() => {
      setInlinePauseStep('idle');
      setChosenAction(null);
      loadAllData();
    }, 2400);
  };

  const activePractice = practicePlans[0] || {
    title: 'Delay checking ritual by 20 minutes',
    type: 'self-guided',
    instructions: 'When the urge to check arises, set a timer and return to your activity.',
  };

  return (
    <DashboardShell onDataRefresh={loadAllData}>
      {/* Modals */}
      {showCheckinModal && (
        <CheckinModal
          onClose={() => setShowCheckinModal(false)}
          onSaved={() => loadAllData()}
        />
      )}
      {showPracticeModal && (
        <LogPracticeModal
          userId={user?.id}
          initialPlan={selectedPlanForModal}
          onClose={() => {
            setShowPracticeModal(false);
            setSelectedPlanForModal(null);
          }}
          onSaved={() => loadAllData()}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

        {/* ── Top Sanctuary Header ────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-teal text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
              <span>Here is what may help you today</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium leading-tight">
              {user?.name ? (
                <>Good day, <span className="italic text-brand-teal">{user.name.split(' ')[0]}.</span></>
              ) : (
                <>Make room for <span className="italic text-brand-teal">what matters today.</span></>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCheckinModal(true)}
              className="px-4 py-2.5 rounded-xl border border-brand-border/80 bg-brand-paper hover:bg-brand-canvas text-brand-ink text-xs font-medium transition-all duration-200 active:scale-[0.98] shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-brand-teal">monitor_heart</span>
              <span>Check-in</span>
            </button>
            <button
              onClick={() => {
                setSelectedPlanForModal(activePractice);
                setShowPracticeModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-all duration-200 active:scale-[0.98] shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              <span>Log Practice</span>
            </button>
          </div>
        </header>

        {/* ── Practitioner Discovery Banner (if unconnected) ──────────────── */}
        {hasConnection === false && (
          <div className="p-5 bg-brand-softerTeal/70 border border-brand-teal/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-teal text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">medical_services</span>
              </div>
              <div>
                <span className="font-semibold text-brand-ink block text-sm">Consultation Sanctuary Available</span>
                <span className="text-brand-ink/70">
                  Connect with verified ERP clinicians like Dr. Kavita Mehra for structured, consent-gated review.
                </span>
              </div>
            </div>
            <Link
              to="/app/care"
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-brand-teal text-white font-medium hover:bg-brand-tealDark transition-colors shrink-0"
            >
              Find Practitioner →
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* INTERLOCKED BENTO GRID WITH ROW & COL SPANS                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── Bento Card 1: Today's Gentle Focus (Cols 1-8, Rows 1-2) ─────── */}
          <div className="lg:col-span-8 lg:row-span-2 bg-brand-amberSoft border border-brand-amber/30 rounded-3xl p-6 sm:p-8 shadow-card-lift relative overflow-hidden flex flex-col justify-between">
            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-amber px-3 py-1 rounded-full bg-white/80 border border-brand-amber/20 shadow-2xs">
                Daily Grounding Focus
              </span>
              <span className="text-xs font-mono text-brand-ink/50">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Middle Section: Grounding Quote on Left, Ambient Doubt SVG Animation on Desktop Right */}
            <div className="relative z-10 my-auto py-3 max-w-full md:max-w-[60%] lg:max-w-[62%] space-y-3.5">
              <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink leading-snug font-medium">
                “You do not need to solve the doubt to continue living your life.”
              </h2>

              <p className="text-xs sm:text-sm text-brand-ink/75 leading-relaxed">
                In OCD, the brain treats uncertainty as an urgent life-or-death puzzle. Today’s gentle practice is allowing the question to remain unanswered while you direct your attention to what genuinely matters.
              </p>
            </div>

            {/* Desktop-only Ambient Doubt & Soft Shapes Animation */}
            <div className="hidden md:flex absolute -right-2 lg:right-2 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
              <DoubtGroundingAnimation />
            </div>

            {/* Footer Bar */}
            <div className="pt-4 mt-6 border-t border-brand-amber/20 flex flex-wrap items-center gap-3 text-xs relative z-10">
              <Link
                to="/app/learn"
                className="font-medium text-brand-ink hover:text-brand-teal flex items-center gap-1.5 transition-colors"
              >
                <span>Read 'Embracing Maybe, Maybe Not'</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
              <span className="text-brand-amber/40">•</span>
              <span className="text-brand-ink/60 text-[11px]">Brain Lock & ERP Clinical Framework</span>
            </div>
          </div>

          {/* ── Bento Card 2: Continue Practice (Cols 9-12, Row 1) ──────────── */}
          <div className="lg:col-span-4 lg:row-span-1 bg-brand-coralSoft border border-brand-coral/30 rounded-3xl p-6 shadow-card-lift flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-coral px-3 py-1 rounded-full bg-white/80 border border-brand-coral/20">
                  {activePractice.type === 'clinician-assigned' ? 'Clinician-Assigned' : 'Active Practice'}
                </span>
                {activePractice.practitionerName && (
                  <span className="text-[10px] font-semibold text-brand-teal">Dr. Mehra</span>
                )}
              </div>

              <div>
                <h3 className="font-editorial text-xl text-brand-ink font-medium leading-snug mb-1">
                  {activePractice.title}
                </h3>
                <p className="text-xs text-brand-ink/70 line-clamp-2 leading-relaxed">
                  {activePractice.instructions}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-brand-coral/20 flex items-center justify-between text-xs font-mono text-brand-ink/80">
                <span className="font-sans text-[11px] text-brand-ink/60">Target:</span>
                <span className="font-sans font-semibold text-brand-coral">Delay or Resist</span>
              </div>
            </div>

            <div className="pt-3 mt-2">
              <button
                onClick={() => {
                  setSelectedPlanForModal(activePractice);
                  setShowPracticeModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-brand-ink hover:bg-brand-coral text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Begin Exposure</span>
              </button>
            </div>
          </div>

          {/* ── Bento Card 3: Secondary AI & Weekly Synthesis (Cols 9-12, Row 2) */}
          <div className="lg:col-span-4 lg:row-span-1 bg-brand-paper border border-brand-border/60 rounded-3xl p-6 shadow-card-lift flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-brand-teal">auto_awesome</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">Weekly Synthesis</span>
                </div>
                <span className="text-[10px] font-mono text-brand-ink/50">Pattern Review</span>
              </div>

              {aiSummary?.summary ? (
                <div className="p-3.5 rounded-2xl bg-brand-canvas/70 border border-brand-border/60 text-xs text-brand-ink/80 leading-relaxed">
                  {aiSummary.summary}
                </div>
              ) : stats ? (
                <div className="p-3.5 rounded-2xl bg-brand-canvas/70 border border-brand-border/60 text-xs text-brand-ink/80 leading-relaxed">
                  You logged <span className="font-mono font-semibold text-brand-ink">{stats.checkinCountThisWeek ?? 0}</span> check-ins this week. Avg pre-distress was <span className="font-mono font-semibold text-brand-ink">{stats.avgSudsThisWeek ? Number(stats.avgSudsThisWeek).toFixed(1) : '—'}</span>/10. Primary strategy: <span className="font-semibold text-brand-teal">{stats.primaryPattern || 'delay'}</span>.
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-brand-canvas/70 border border-brand-border/60 text-xs text-brand-ink/50 italic">
                  Log a check-in and practice session to view your weekly behavioral summary.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-brand-ink/50">
              <span className="italic">Synthesized from logs — not medical advice.</span>
              <Link to="/app/practice" className="font-medium text-brand-teal hover:underline">
                History →
              </Link>
            </div>
          </div>

          {/* ── Bento Card 4: Quick Tools Sanctuary (Cols 1-7, Rows 3-4) ────── */}
          <div className="lg:col-span-7 lg:row-span-2 bg-brand-paper border border-brand-border/60 rounded-3xl p-6 sm:p-8 shadow-card-lift flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-2xl text-brand-ink font-medium">Quick Calm Tools</h3>
                  <p className="text-xs text-brand-ink/60 mt-0.5">Gentle regulation aids — not rituals to sanitize obsessions.</p>
                </div>
                <Link to="/app/toolkit" className="text-xs font-medium text-brand-teal hover:underline flex items-center gap-0.5">
                  <span>View All</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </Link>
              </div>

              {/* Inline Pause & Choose Tool Interactive Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-brand-lavenderSoft border border-brand-lavender/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-lavender"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                      Pause & Choose
                    </span>
                  </div>
                  <span className="text-[11px] text-brand-ink/50 font-medium">4-Step Hesitation</span>
                </div>

                {inlinePauseStep === 'idle' && (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-brand-ink/75">
                      Feeling the urge to check, replay, or seek reassurance right now?
                    </p>
                    <button
                      onClick={() => setInlinePauseStep('notice')}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-lavender text-white text-xs font-medium hover:bg-brand-lavender/90 transition-colors shrink-0 shadow-xs"
                    >
                      Pause 30s
                    </button>
                  </div>
                )}

                {inlinePauseStep === 'notice' && (
                  <div className="space-y-2 animate-fade-in">
                    <p className="text-xs font-medium text-brand-ink">
                      1. Notice: "I notice an intrusive thought and an urge to ritualize."
                    </p>
                    <p className="text-[11px] text-brand-ink/70">
                      Acknowledge the urge without agreeing with the thought or arguing against it.
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setInlinePauseStep('idle')}
                        className="px-2.5 py-1 text-xs text-brand-ink/60 hover:text-brand-ink"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setInlinePauseStep('choose')}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-lavender text-white text-xs font-medium"
                      >
                        Next: Choose Action →
                      </button>
                    </div>
                  </div>
                )}

                {inlinePauseStep === 'choose' && (
                  <div className="space-y-2.5 animate-fade-in">
                    <p className="text-xs font-medium text-brand-ink">
                      2. Choose: How will you respond to this urge?
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                      <button
                        onClick={() => handleInlinePauseChoice('delay')}
                        className="p-2.5 rounded-xl border border-brand-amber/40 bg-white hover:bg-brand-amberSoft text-brand-ink text-center transition-colors shadow-2xs"
                      >
                        <span className="font-semibold block text-[11px] text-brand-amber">Delay</span>
                        <span className="text-[10px] text-brand-ink/60">Wait 15m</span>
                      </button>
                      <button
                        onClick={() => handleInlinePauseChoice('resist')}
                        className="p-2.5 rounded-xl border border-brand-teal/40 bg-white hover:bg-brand-softerTeal text-brand-ink text-center transition-colors shadow-2xs"
                      >
                        <span className="font-semibold block text-[11px] text-brand-teal">Resist</span>
                        <span className="text-[10px] text-brand-ink/60">No Ritual</span>
                      </button>
                      <button
                        onClick={() => handleInlinePauseChoice('return')}
                        className="p-2.5 rounded-xl border border-brand-lavender/40 bg-white hover:bg-brand-lavenderSoft text-brand-ink text-center transition-colors shadow-2xs"
                      >
                        <span className="font-semibold block text-[11px] text-brand-lavender">Return</span>
                        <span className="text-[10px] text-brand-ink/60">To Activity</span>
                      </button>
                      <button
                        onClick={() => handleInlinePauseChoice('compulsion')}
                        className="p-2.5 rounded-xl border border-brand-coral/40 bg-white hover:bg-brand-coralSoft text-brand-ink text-center transition-colors shadow-2xs"
                      >
                        <span className="font-semibold block text-[11px] text-brand-coral">Gave In</span>
                        <span className="text-[10px] text-brand-ink/60">Honest Log</span>
                      </button>
                    </div>
                  </div>
                )}

                {inlinePauseStep === 'committed' && (
                  <div className="p-3 rounded-xl bg-white text-center text-xs font-medium text-brand-teal animate-fade-in shadow-xs">
                    ✓ Response choice recorded. Returning to your sanctuary...
                  </div>
                )}
              </div>

              {/* Quick Tool Shortcut Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <Link
                  to="/app/toolkit?tool=grounding"
                  className="p-3.5 rounded-2xl border border-brand-border/70 bg-brand-softerTeal/30 hover:bg-brand-softerTeal transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1 text-brand-teal">
                    <span className="material-symbols-outlined text-[18px]">spa</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Grounding</span>
                  </div>
                  <p className="text-[11px] text-brand-ink/70">5-4-3-2-1 sensory anchor back to reality.</p>
                </Link>

                <Link
                  to="/app/toolkit?tool=breathing"
                  className="p-3.5 rounded-2xl border border-brand-border/70 bg-brand-amberSoft/30 hover:bg-brand-amberSoft transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1 text-brand-amber">
                    <span className="material-symbols-outlined text-[18px]">air</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Paced Breath</span>
                  </div>
                  <p className="text-[11px] text-brand-ink/70">Unhurried pacing to steady the body.</p>
                </Link>

                <Link
                  to="/app/toolkit?tool=reassurance"
                  className="p-3.5 rounded-2xl border border-brand-border/70 bg-brand-coralSoft/30 hover:bg-brand-coralSoft transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1 text-brand-coral">
                    <span className="material-symbols-outlined text-[18px]">help_center</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Interrupter</span>
                  </div>
                  <p className="text-[11px] text-brand-ink/70">Catch digital & cognitive checking traps.</p>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Bento Card 5: Life Outside OCD (Cols 8-12, Rows 3-4) ────────── */}
          <div className="lg:col-span-5 lg:row-span-2 bg-brand-paper border border-brand-border/60 rounded-3xl p-6 sm:p-8 shadow-card-lift flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-teal px-3 py-1 rounded-full bg-brand-softerTeal border border-brand-teal/20">
                  Life Outside OCD
                </span>
                <span className="text-xs font-mono text-brand-ink/50">Values Actions</span>
              </div>
              <h3 className="font-editorial text-2xl text-brand-ink font-medium">Daily Value Steps</h3>
              <p className="text-xs text-brand-ink/60 mb-4">
                Recovery is not just reducing OCD; it is expanding what you care about.
              </p>

              <div className="space-y-2.5">
                {(valuesData.suggestedActions || []).slice(0, 3).map((act) => {
                  const isDone = completedActions.includes(act.title);
                  return (
                    <div
                      key={act.id || act.title}
                      onClick={() => handleToggleAction(act)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isDone
                          ? 'bg-brand-softSuccess/40 border-brand-teal/30 opacity-85'
                          : 'bg-brand-canvas/60 border-brand-border/80 hover:border-brand-teal/40 hover:bg-brand-softerTeal/20'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                          isDone ? 'text-brand-teal' : 'text-brand-ink/30'
                        }`}
                      >
                        {isDone ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-medium ${isDone ? 'line-through text-brand-ink/60' : 'text-brand-ink'}`}>
                            {act.title}
                          </span>
                          <span className="text-[10px] font-mono text-brand-ink/40 shrink-0">
                            {act.minutes}m
                          </span>
                        </div>
                        <span className="text-[10px] text-brand-teal font-medium uppercase tracking-wider block mt-0.5">
                          {act.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border/40 text-[11px] text-brand-ink/60 flex items-center justify-between">
              <span>{completedActions.length} value actions completed</span>
              <span className="text-brand-teal font-medium">One step is enough</span>
            </div>
          </div>

          {/* ── Bento Card 6: Gentle Plan for Today (Full Width Col 1-12) ──── */}
          <div className="lg:col-span-12 bg-[#E8F3EE] border border-brand-border/60 rounded-3xl p-6 sm:p-8 shadow-card-lift flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-clinical-success px-3 py-1 rounded-full bg-white/90 border border-clinical-success/20">
                  Gentle Rhythm
                </span>
                <span className="text-xs font-mono text-brand-ink/50">Anti-Gamified</span>
              </div>

              <h3 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">
                Today's Balanced Plan
              </h3>

              <p className="text-xs sm:text-sm text-brand-ink/75 leading-relaxed">
                You do not need to do everything every day. A balanced recovery day consists of three simple anchors — no streaks, no scoreboards, simply gentle consistency.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-brand-border/50 text-center min-w-[85px] shadow-xs">
                <span className="font-mono text-xl font-bold text-brand-coral block">1</span>
                <span className="text-xs font-semibold text-brand-ink">Practice</span>
                <span className="text-[10px] text-brand-ink/50 block">Exposure trial</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-brand-border/50 text-center min-w-[85px] shadow-xs">
                <span className="font-mono text-xl font-bold text-brand-teal block">1</span>
                <span className="text-xs font-semibold text-brand-ink">Life Action</span>
                <span className="text-[10px] text-brand-ink/50 block">Value step</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-brand-border/50 text-center min-w-[85px] shadow-xs">
                <span className="font-mono text-xl font-bold text-brand-lavender block">1</span>
                <span className="text-xs font-semibold text-brand-ink">Calm Tool</span>
                <span className="text-[10px] text-brand-ink/50 block">Pause/ground</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
