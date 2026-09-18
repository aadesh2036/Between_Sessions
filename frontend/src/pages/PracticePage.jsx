import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import LogPracticeModal from '../components/LogPracticeModal';
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
          onClose={() => {
            setShowLogModal(false);
            setSelectedPlan(null);
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

          <button
            onClick={() => {
              setSelectedPlan(null);
              setShowLogModal(true);
            }}
            className="self-start sm:self-auto px-4 py-2.5 rounded bg-brand-ink hover:bg-brand-coral text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add_task</span>
            <span>Record Exposure</span>
          </button>
        </header>

        {/* ── Longitudinal Summary Banner (Anti-Gamified) ──────────────────── */}
        <div className="p-4 sm:p-5 rounded bg-brand-softerTeal border border-brand-teal/20 shadow-card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-teal px-2 py-0.5 rounded-full bg-white/80 border border-brand-teal/20">
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
            <div className="text-center px-3 py-1.5 rounded bg-white border border-brand-teal/20">
              <span className="block text-[10px] text-brand-ink/50 uppercase font-sans">Pre Avg</span>
              <span className="font-bold text-brand-coral">{avgPre}</span>
            </div>
            <span className="text-brand-ink/30 font-sans">→</span>
            <div className="text-center px-3 py-1.5 rounded bg-white border border-brand-teal/20">
              <span className="block text-[10px] text-brand-ink/50 uppercase font-sans">Post Avg</span>
              <span className="font-bold text-brand-teal">{avgPost}</span>
            </div>
          </div>
        </div>

        {/* ── Active Practice Plans Grid ───────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl text-brand-ink font-medium">Curated Practice Plans</h2>
            <span className="text-xs text-brand-ink/50 font-mono">{allPlans.length} Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlans.map((plan) => {
              const isClinician = plan.type === 'clinician-assigned';
              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded border flex flex-col justify-between transition-all shadow-card-lift ${
                    isClinician
                      ? 'bg-brand-coralSoft/50 border-brand-coral/30'
                      : 'bg-brand-paper border-brand-border'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                          isClinician
                            ? 'bg-brand-coral text-white border-brand-coral'
                            : 'bg-brand-softerTeal text-brand-teal border-brand-teal/20'
                        }`}
                      >
                        {isClinician ? 'Clinician-Assigned' : plan.category || 'Self-Guided'}
                      </span>
                      {plan.practitionerName && (
                        <span className="text-[10px] font-medium text-brand-teal">
                          {plan.practitionerName}
                        </span>
                      )}
                    </div>

                    <h3 className="font-editorial text-lg text-brand-ink font-medium leading-snug">
                      {plan.title}
                    </h3>

                    <p className="text-xs text-brand-ink/70 leading-relaxed">
                      {plan.instructions}
                    </p>

                    {plan.targetObsession && (
                      <div className="p-2 rounded bg-brand-canvas/60 border border-brand-border/40 text-[11px] text-brand-ink/70">
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
                      className="w-full py-2 px-3 rounded bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-xs"
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
            <div className="flex gap-1.5 p-1 rounded bg-brand-canvas border border-brand-border text-xs">
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
                  className={`px-3 py-1 rounded transition-colors text-[11px] font-medium ${
                    filter === t.id
                      ? 'bg-white text-brand-ink shadow-xs font-semibold'
                      : 'text-brand-ink/60 hover:text-brand-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-10 rounded border border-brand-border/80 bg-brand-paper text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-brand-ink/30">inventory_2</span>
              <p className="text-xs text-brand-ink/60">No practice sessions found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => {
                const meta = RESPONSE_TYPE_META[log.responseType] || RESPONSE_TYPE_META.no_response;
                const d = new Date(log.createdAt || log.completedAt);
                return (
                  <div
                    key={log.SK || log.eventId || log.practiceId}
                    className="p-4 rounded border border-brand-border bg-brand-paper shadow-card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`p-2 rounded border ${meta.bg} ${meta.border} ${meta.color} shrink-0 mt-0.5`}>
                        <span className="material-symbols-outlined text-[18px] block">{meta.icon}</span>
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="font-semibold text-brand-ink truncate">
                            {log.targetObsession || log.exerciseId || 'Exposure Practice'}
                          </span>
                          {log.context && (
                            <span className="text-[10px] text-brand-ink/50 bg-brand-canvas px-1.5 py-0.5 rounded border border-brand-border/40">
                              {log.context}
                            </span>
                          )}
                        </div>

                        {log.notes && (
                          <p className="text-brand-ink/70 italic text-[11px] leading-relaxed">
                            "{log.notes}"
                          </p>
                        )}

                        <div className="text-[10px] text-brand-ink/40 font-mono">
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                          {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {log.durationSeconds && ` • ${Math.round(log.durationSeconds / 60)} min duration`}
                        </div>
                      </div>
                    </div>

                    {/* SUDS Shift Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="px-2 py-1 rounded bg-brand-coralSoft text-brand-coral font-bold">
                          {log.preDistress ?? '—'}
                        </span>
                        <span className="text-brand-ink/30">→</span>
                        <span className="px-2 py-1 rounded bg-brand-softerTeal text-brand-teal font-bold">
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

      </div>
    </DashboardShell>
  );
}
