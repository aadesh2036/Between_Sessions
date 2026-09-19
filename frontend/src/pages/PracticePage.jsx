import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import LogPracticeModal from '../components/LogPracticeModal';
import BetweenLoading from '../components/BetweenLoading';
import { practiceApi } from '../services/api';

const RESPONSE_TYPE_META = {
  delay:       { label: 'Delay',        icon: 'pause_circle',       color: 'text-brand-amber',    bg: 'bg-brand-amberSoft',   border: 'border-brand-amber/30' },
  resist:      { label: 'Resist',       icon: 'shield',              color: 'text-brand-teal',     bg: 'bg-brand-softerTeal',  border: 'border-brand-teal/30' },
  return:      { label: 'Return',       icon: 'undo',                color: 'text-brand-lavender', bg: 'bg-brand-lavenderSoft',border: 'border-brand-lavender/30' },
  continue:    { label: 'Continue',     icon: 'arrow_forward',       color: 'text-brand-teal',     bg: 'bg-brand-softerTeal',  border: 'border-brand-teal/30' },
  compulsion:  { label: 'Compulsion',   icon: 'repeat',              color: 'text-brand-coral',    bg: 'bg-brand-coralSoft',   border: 'border-brand-coral/30' },
  avoidance:   { label: 'Avoidance',    icon: 'block',               color: 'text-brand-coral',    bg: 'bg-brand-coralSoft',   border: 'border-brand-coral/30' },
  reassurance: { label: 'Reassurance',  icon: 'chat_bubble',         color: 'text-brand-lavender', bg: 'bg-brand-lavenderSoft',border: 'border-brand-lavender/30' },
  no_response: { label: 'No Response',  icon: 'circle',              color: 'text-brand-ink',     bg: 'bg-brand-canvas',      border: 'border-brand-border' },
};

export default function PracticePage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState({ clinicianPlans: [], selfGuidedPlans: [] });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [initialModalStep, setInitialModalStep] = useState(1);
  const [initialModalResponseType, setInitialModalResponseType] = useState('delay');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, logsRes] = await Promise.allSettled([
        practiceApi.getPlans(),
        practiceApi.list(),
      ]);

      if (plansRes.status === 'fulfilled') {
        setPlans(plansRes.value.data || { clinicianPlans: [], selfGuidedPlans: [] });
      }
      if (logsRes.status === 'fulfilled') {
        setLogs(logsRes.value.data || []);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allPlans = [...(plans.clinicianPlans || []), ...(plans.selfGuidedPlans || [])];

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'prevented') return log.responsePrevented || ['delay', 'resist', 'return'].includes(log.responseType);
    if (filter === 'compulsion') return log.responseType === 'compulsion' || !log.responsePrevented;
    return log.responseType === filter;
  });

  // Calculate objective longitudinal summary
  const completedCount = logs.length;
  const avgPre = logs.length
    ? (logs.reduce((acc, l) => acc + (Number(l.preDistress) || 0), 0) / logs.length).toFixed(1)
    : '—';
  const avgPost = logs.length
    ? (logs.reduce((acc, l) => acc + (Number(l.postDistress) || 0), 0) / logs.length).toFixed(1)
    : '—';

  return (
    <DashboardShell onDataRefresh={loadData}>
      {showLogModal && (
        <LogPracticeModal
          userId={user?.id}
          initialPlan={selectedPlan}
          initialStep={initialModalStep}
          initialResponseType={initialModalResponseType}
          onClose={() => {
            setShowLogModal(false);
            setSelectedPlan(null);
            setInitialModalStep(1);
            setInitialModalResponseType('delay');
          }}
          onSaved={() => loadData()}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-coral text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-coral"></span>
              <span>Exposure & Response Prevention (ERP)</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium leading-tight">
              Structured Practice & <span className="italic text-brand-coral">Discomfort Tolerance</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-ink/70 mt-1 max-w-2xl leading-relaxed">
              ERP is not about eliminating anxiety. It is learning through direct experience that discomfort is tolerable, and catastrophic predictions rarely occur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => {
                setSelectedPlan({
                  title: 'Delayed Ritual / Urge Delay Session',
                  targetObsession: 'Acute Compulsive Urge',
                  type: 'self-guided',
                });
                setInitialModalStep(2);
                setInitialModalResponseType('delay');
                setShowLogModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-brand-amberSoft text-brand-amber hover:bg-brand-amber hover:text-white border border-brand-amber/30 text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[17px]">timer</span>
              <span>Delayed Ritual Timer</span>
            </button>

            <button
              onClick={() => {
                setSelectedPlan(null);
                setInitialModalStep(1);
                setInitialModalResponseType('delay');
                setShowLogModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-coral text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              <span>Record Exposure</span>
            </button>
          </div>
        </header>

        {/* ── Longitudinal Summary Banner (Anti-Gamified) ──────────────────── */}
        {loading ? (
          <div className="py-24 flex items-center justify-center bg-brand-paper rounded-3xl border border-brand-border/60 shadow-card-lift">
            <BetweenLoading
              size="lg"
              label="Loading ERP exposure practices & longitudinal trials..."
              sublabel="Holding space for response prevention between sessions"
            />
          </div>
        ) : (
          <>
            <div className="p-6 rounded-3xl bg-brand-softerTeal border border-brand-teal/20 shadow-card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-teal px-3 py-1 rounded-full bg-white/80 border border-brand-teal/20">
              Longitudinal Observation
            </span>
            <p className="text-xs sm:text-sm font-medium text-brand-ink">
              {completedCount > 0 ? (
                <>
                  <span className="font-mono font-bold text-brand-teal">{completedCount}</span> exposures recorded.{' '}
                  Pre-exposure distress averaged <span className="font-mono font-bold text-brand-coral">{avgPre}</span>/10,{' '}
                  settling to <span className="font-mono font-bold text-brand-teal">{avgPost}</span>/10.
                </>
              ) : (
                'No exposures recorded yet. Choose a practice plan below to begin your first trial.'
              )}
            </p>
            <p className="text-[11px] text-brand-ink/60">
              Measured by willingness to tolerate doubt, not zero anxiety.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-brand-ink/80 shrink-0">
            <div className="text-center px-4 py-2 rounded-2xl bg-white border border-brand-teal/20 shadow-xs">
              <span className="block text-[10px] text-brand-ink/50 uppercase font-sans">Pre Avg</span>
              <span className="font-bold text-brand-coral text-sm">{avgPre}</span>
            </div>
            <span className="text-brand-ink/30 font-sans">→</span>
            <div className="text-center px-4 py-2 rounded-2xl bg-white border border-brand-teal/20 shadow-xs">
              <span className="block text-[10px] text-brand-ink/50 uppercase font-sans">Post Avg</span>
              <span className="font-bold text-brand-teal text-sm">{avgPost}</span>
            </div>
          </div>
        </div>

        {/* ── Acute Urge Delay Protocol Card ──────────────────────────────── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-brand-amberSoft/70 border border-brand-amber/40 shadow-card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-amber text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">timer</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-editorial text-lg sm:text-xl text-brand-ink font-medium">
                  Acute Urge Delay Protocol
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-amber text-white">
                  Response Prevention
                </span>
              </div>
              <p className="text-xs text-brand-ink/75 max-w-2xl leading-relaxed">
                Experiencing an intrusive spike or ritual urge right now? Don't fight the thought. Postpone ritual execution by 5 to 15 minutes and let your brain learn that discomfort crests and fades naturally.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedPlan({
                title: 'Delayed Ritual / Urge Delay Session',
                targetObsession: 'Acute Intrusive Urge',
                type: 'self-guided',
              });
              setInitialModalStep(2);
              setInitialModalResponseType('delay');
              setShowLogModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-brand-amber hover:bg-amber-600 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>Launch Delay Timer</span>
          </button>
        </div>

        {/* ── Active Practice Plans Grid ───────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl text-brand-ink font-medium">Curated Practice Plans</h2>
            <span className="text-xs text-brand-ink/50 font-mono">{allPlans.length} Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allPlans.map((plan) => {
              const isClinician = plan.type === 'clinician-assigned';
              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between transition-all shadow-card-lift ${
                    isClinician
                      ? 'bg-brand-coralSoft/50 border-brand-coral/30'
                      : 'bg-brand-paper border-brand-border/70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                          isClinician
                            ? 'bg-brand-coral text-white border-brand-coral'
                            : 'bg-brand-softerTeal text-brand-teal border-brand-teal/20'
                        }`}
                      >
                        {isClinician ? 'Clinician-Assigned' : plan.category || 'Self-Guided'}
                      </span>
                      {plan.practitionerName && (
                        <span className="text-[10px] font-semibold text-brand-teal">
                          {plan.practitionerName}
                        </span>
                      )}
                    </div>

                    <h3 className="font-editorial text-xl text-brand-ink font-medium leading-snug">
                      {plan.title}
                    </h3>

                    <p className="text-xs text-brand-ink/70 leading-relaxed">
                      {plan.instructions}
                    </p>

                    {plan.targetObsession && (
                      <div className="p-3 rounded-2xl bg-brand-canvas/70 border border-brand-border/60 text-[11px] text-brand-ink/70">
                        <span className="font-semibold text-brand-ink">Target:</span> {plan.targetObsession}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-brand-border/50">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowLogModal(true);
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                      <span>Begin Exposure</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Longitudinal Practice Log ───────────────────────────────────── */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-editorial text-2xl text-brand-ink font-medium">Practice Timeline</h2>
              <p className="text-xs text-brand-ink/60">Objective chronological record of exposure trials and responses.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 rounded-full bg-brand-canvas border border-brand-border/80 text-xs shadow-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'prevented', label: 'Prevented' },
                { id: 'delay', label: 'Delay' },
                { id: 'resist', label: 'Resist' },
                { id: 'compulsion', label: 'Compulsion' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-3.5 py-1.5 rounded-full transition-all text-[11px] ${
                    filter === t.id
                      ? 'bg-white text-brand-ink shadow-xs font-semibold'
                      : 'text-brand-ink/55 hover:text-brand-ink font-medium'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div key={`empty-${filter}`} className="p-12 rounded-3xl border border-brand-border/80 bg-brand-paper text-center space-y-2 animate-tab-switch">
              <span className="material-symbols-outlined text-[36px] text-brand-ink/30">inventory_2</span>
              <p className="text-xs text-brand-ink/60">No practice sessions found for this filter.</p>
            </div>
          ) : (
            <div key={`list-${filter}`} className="space-y-3 animate-tab-switch">
              {filteredLogs.map((log) => {
                const meta = RESPONSE_TYPE_META[log.responseType] || RESPONSE_TYPE_META.no_response;
                const d = new Date(log.createdAt || log.completedAt);
                return (
                  <div
                    key={log.SK || log.eventId || log.practiceId}
                    className="p-5 rounded-2xl border border-brand-border/70 bg-brand-paper shadow-card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl border ${meta.bg} ${meta.border} ${meta.color} shrink-0 mt-0.5`}>
                        <span className="material-symbols-outlined text-[19px] block">{meta.icon}</span>
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="font-semibold text-brand-ink truncate">
                            {log.targetObsession || log.exerciseId || 'Exposure Practice'}
                          </span>
                          {log.context && (
                            <span className="text-[10px] text-brand-ink/60 bg-brand-canvas px-2 py-0.5 rounded-full border border-brand-border/60 font-medium">
                              {log.context}
                            </span>
                          )}
                        </div>

                        {log.notes && (
                          <p className="text-brand-ink/75 italic text-[11px] leading-relaxed">
                            "{log.notes}"
                          </p>
                        )}

                        <div className="text-[10px] text-brand-ink/45 font-mono">
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                          {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {log.durationSeconds && ` • ${Math.round(log.durationSeconds / 60)} min duration`}
                        </div>
                      </div>
                    </div>

                    {/* SUDS Shift Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-xl bg-brand-coralSoft text-brand-coral font-bold shadow-2xs">
                          {log.preDistress ?? '—'}
                        </span>
                        <span className="text-brand-ink/30 font-sans">→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-brand-softerTeal text-brand-teal font-bold shadow-2xs">
                          {log.postDistress ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>
      )}

      </div>
    </DashboardShell>
  );
}
