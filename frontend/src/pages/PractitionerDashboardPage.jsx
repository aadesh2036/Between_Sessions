/**
 * PractitionerDashboardPage.jsx
 *
 * Clinician Dashboard — Between Sessions
 *
 * Layout: sticky 260px sidebar + scrollable main area
 * Views:  'dashboard' (default) → 'patient' (selected patient detail)
 *
 * Auth: reads bs_prac_token / bs_prac_user from localStorage.
 * All data comes from practitionerApi — no hardcoded values.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { practitionerApi } from '../services/api';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Tiny helpers                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

/** Format ISO date → MM/DD */
function mmdd(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/** Format ISO date → readable */
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Connection status pill colours */
function statusMeta(status) {
  if (status === 'active')
    return { bg: 'bg-brand-softerTeal', text: 'text-brand-teal', label: 'Active' };
  if (status === 'pending')
    return { bg: 'bg-brand-amberSoft', text: 'text-brand-amber', label: 'Pending' };
  if (status === 'declined')
    return { bg: 'bg-brand-coralSoft', text: 'text-brand-coral', label: 'Declined' };
  return { bg: 'bg-brand-canvas', text: 'text-brand-ink/50', label: status ?? 'Unknown' };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Skeleton placeholder                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-brand-border/40 ${className}`}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SUDS bar chart (no library)                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function SudsTrendChart({ checkins }) {
  if (!checkins?.length) {
    return (
      <p className="text-brand-ink/40 text-sm py-4">
        No check-in data available.
      </p>
    );
  }

  // Keep last 14 entries maximum to avoid overflow
  const displayed = checkins.slice(-14);
  const BAR_MAX_PX = 48;

  return (
    <div className="flex items-end gap-1.5 pt-2 pb-1 overflow-x-auto">
      {displayed.map((ci, idx) => {
        const score = ci.sudsScore ?? 0;
        const heightPx = Math.max(4, Math.round((score / 10) * BAR_MAX_PX));
        // Colour: low (≤3) teal, mid (4-6) amber, high (≥7) coral
        const barColor =
          score <= 3
            ? 'bg-brand-teal/70'
            : score <= 6
            ? 'bg-brand-amber/70'
            : 'bg-brand-coral/70';

        return (
          <div
            key={ci.id ?? idx}
            className="flex flex-col items-center gap-1 shrink-0"
            title={`SUDS ${score} — ${fmtDate(ci.createdAt)}`}
          >
            <span className="font-mono text-[9px] text-brand-ink/50">{score}</span>
            <div
              className={`w-5 rounded-sm ${barColor} transition-all`}
              style={{ height: `${heightPx}px` }}
            />
            <span className="font-mono text-[9px] text-brand-ink/40 rotate-0">
              {mmdd(ci.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Recommendation form                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function RecommendationForm({ userId, onSaved, onCancel }) {
  const [observation, setObservation] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [referral, setReferral] = useState('');
  const [noteToUser, setNoteToUser] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nextStep.trim()) {
      setError('"Next useful step" is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await practitionerApi.postRecommendation(userId, {
        observation: observation.trim() || undefined,
        nextStep: nextStep.trim(),
        referral: referral.trim() || undefined,
        noteToUser: noteToUser.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.message || 'Could not save recommendation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-5 bg-brand-canvas rounded-2xl border border-brand-border space-y-4"
    >
      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-ink/60 mb-2">
        Write Recommendation
      </h4>

      {/* Observation */}
      <div>
        <label className="block text-xs font-bold text-brand-ink mb-1">
          Observation
          <span className="font-normal text-brand-ink/40 ml-1">(optional)</span>
        </label>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows={2}
          placeholder="What patterns do you observe in this patient's logs?"
          className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal resize-none"
        />
      </div>

      {/* Next useful step — required */}
      <div>
        <label className="block text-xs font-bold text-brand-ink mb-1">
          Next useful step
          <span className="text-brand-coral ml-1">*</span>
        </label>
        <textarea
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          rows={2}
          placeholder="Describe the next practical step for this patient."
          className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal resize-none"
          required
        />
      </div>

      {/* Referral / escalation */}
      <div>
        <label className="block text-xs font-bold text-brand-ink mb-1">
          Referral / Escalation
          <span className="font-normal text-brand-ink/40 ml-1">(optional)</span>
        </label>
        <input
          type="text"
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
          placeholder="e.g. Refer to psychiatry, crisis line, etc."
          className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal"
        />
      </div>

      {/* Note to user */}
      <div>
        <label className="block text-xs font-bold text-brand-ink mb-1">
          Note to patient
          <span className="font-normal text-brand-ink/40 ml-1">(optional — visible to patient)</span>
        </label>
        <textarea
          value={noteToUser}
          onChange={(e) => setNoteToUser(e.target.value)}
          rows={2}
          placeholder="A short supportive message the patient will see."
          className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal resize-none"
        />
      </div>

      {error && (
        <p className="text-brand-coral text-xs">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Recommendation'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full border border-brand-border text-brand-ink/60 text-xs font-bold hover:text-brand-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Patient detail view                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function PatientView({ patient, onBack }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRecForm, setShowRecForm] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await practitionerApi.getPatientSummary(patient.userId);
      setSummary(res.data ?? res);
    } catch (err) {
      if (err.status === 403 || err.code === 'CONSENT_REQUIRED' || err.code === 'NO_ACTIVE_CONNECTION') {
        setError('403_CONSENT');
      } else {
        setError(err.message || 'Could not load patient data.');
      }
    } finally {
      setLoading(false);
    }
  }, [patient.userId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const { bg: statusBg, text: statusText, label: statusLabel } = statusMeta(patient.status);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-start gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-ink/50 hover:text-brand-teal transition-colors text-sm font-bold self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </button>
      </header>

      <div className="bg-brand-paper rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-card-lift">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal px-2.5 py-0.5 rounded-full bg-brand-softerTeal border border-brand-teal/20">
                Patient Continuity Profile
              </span>
              <span className="font-mono text-xs text-brand-ink/40">
                ID: {patient.userId}
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium">
              {summary?.patientProfile?.name || patient.name || patient.userId}
            </h2>
            <p className="text-xs text-brand-ink/60">
              Age Band: <span className="font-semibold text-brand-ink">{summary?.patientProfile?.ageBand || patient.ageBand || 'Adult'}</span>
              {summary?.patientProfile?.email && ` • ${summary.patientProfile.email}`}
            </p>

            {/* Life Outside OCD / Values Context */}
            {(summary?.patientProfile?.values || patient.values || []).length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-ink/50 mr-1">
                  Life Outside OCD:
                </span>
                {(summary?.patientProfile?.values || patient.values || []).map((v) => (
                  <span
                    key={v}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-amberSoft text-brand-amber font-medium border border-brand-amber/20"
                  >
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBg} ${statusText}`}>
              {statusLabel}
            </span>
            {patient.consentedCategories?.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-brand-softerTeal text-brand-teal border border-brand-teal/20"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Clinical boundary note */}
        <p className="mt-4 text-[11px] text-brand-ink/50 italic border-t border-brand-border/40 pt-3">
          Data shown is limited to categories the patient has explicitly consented to share under AWS Cedar policy. This is an intentional between-session companion, not an EHR or diagnosis system.
        </p>
      </div>

      {/* ── Error states ────────────────────────────────────────────────── */}
      {error === '403_CONSENT' && (
        <div className="bg-brand-coralSoft border border-brand-coral/30 rounded-3xl p-6 sm:p-8 text-center space-y-2">
          <div className="text-brand-coral font-mono text-sm font-bold">403 · CONSENT_REQUIRED</div>
          <h3 className="font-editorial text-2xl text-brand-ink">Access not available</h3>
          <p className="text-brand-ink/60 text-sm max-w-md mx-auto">
            This patient either does not have an active connection with you, or Cedar's
            policy engine has restricted access based on their current consent settings.
            Ask the patient to review their sharing preferences in the app.
          </p>
        </div>
      )}

      {error && error !== '403_CONSENT' && (
        <div className="bg-brand-coralSoft border border-brand-coral/20 rounded-2xl p-5 text-brand-coral text-sm">
          {error}
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      )}

      {/* ── Patient data ─────────────────────────────────────────────────── */}
      {!loading && !error && summary && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Check-ins', value: summary.stats?.checkinCount ?? 0 },
              { label: 'Avg SUDS', value: summary.stats?.avgSuds != null ? summary.stats.avgSuds.toFixed(1) : '—' },
              { label: 'Practices', value: summary.stats?.practiceCount ?? 0 },
              { label: 'Journal entries', value: summary.stats?.journalCount ?? 0 },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">
                  {label}
                </div>
                <div className="font-mono text-3xl font-medium text-brand-ink">{value}</div>
              </div>
            ))}
          </div>

          {/* SUDS Trend */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
            <div className="flex items-center gap-2 text-brand-teal mb-3">
              <span className="text-xs font-bold uppercase tracking-widest">SUDS Trend</span>
            </div>
            <p className="text-[11px] text-brand-ink/40 mb-4">
              Each bar = one check-in. Height proportional to SUDS score (0–10).
            </p>
            <SudsTrendChart checkins={summary.checkins ?? []} />
            {(!summary.checkins || summary.checkins.length === 0) && (
              <p className="text-brand-ink/40 text-sm">No check-in records in the shared window.</p>
            )}
          </section>

          {/* Practice log */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
            <div className="flex items-center gap-2 text-brand-coral mb-4">
              <span className="text-xs font-bold uppercase tracking-widest">Practice Log</span>
            </div>
            {summary.practices?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-brand-border/40">
                      <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 whitespace-nowrap">
                        Exercise
                      </th>
                      <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 whitespace-nowrap">
                        Pre → Post Distress
                      </th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 whitespace-nowrap">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/20">
                    {summary.practices.map((p, idx) => (
                      <tr key={p.id ?? idx}>
                        <td className="py-3 pr-4 font-mono text-xs text-brand-ink">
                          {p.exerciseId || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs">
                            <span className="text-brand-coral">{p.preDistress ?? '—'}</span>
                            <span className="text-brand-ink/40 mx-1">→</span>
                            <span className="text-brand-teal">{p.postDistress ?? '—'}</span>
                          </span>
                        </td>
                        <td className="py-3 text-[11px] text-brand-ink/50 whitespace-nowrap">
                          {fmtDate(p.completedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-brand-ink/40 text-sm">No practice logs available.</p>
            )}
          </section>

          {/* Journal entries */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
            <div className="flex items-center gap-2 text-brand-amber mb-4">
              <span className="text-xs font-bold uppercase tracking-widest">Journal Entries</span>
            </div>
            {summary.journalEntries?.length > 0 ? (
              <div className="space-y-3">
                {summary.journalEntries.map((entry, idx) => (
                  <div
                    key={entry.id ?? idx}
                    className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/30"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {entry.responseType && (
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-amberSoft text-brand-amber text-[10px] font-bold">
                          {entry.responseType}
                        </span>
                      )}
                      {entry.urgeScore != null && (
                        <span className="font-mono text-[10px] text-brand-ink/50">
                          urge: {entry.urgeScore}
                        </span>
                      )}
                      <span className="text-[10px] text-brand-ink/40 ml-auto font-mono">
                        {fmtDate(entry.createdAt)}
                      </span>
                    </div>
                    {entry.trigger && (
                      <p className="text-sm text-brand-ink mb-2">{entry.trigger}</p>
                    )}
                    {entry.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-white border border-brand-border text-[9px] font-bold text-brand-ink/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-ink/40 text-sm">No journal entries in the shared window.</p>
            )}
          </section>

          {/* AI Summary */}
          <section className="bg-brand-lavenderSoft rounded-3xl p-6 sm:p-8 border border-brand-lavender/20 shadow-sm">
            <div className="flex items-center gap-2 text-brand-lavender mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest">AI Weekly Summary</span>
            </div>
            {summary.aiSummary ? (
              <div>
                <p className="text-brand-ink/80 text-sm leading-relaxed mb-3">
                  {summary.aiSummary.summary ?? summary.aiSummary}
                </p>
                <p className="text-[10px] text-brand-ink/40 italic">
                  Synthesized from patient logs — not medical advice. Review all data
                  independently before clinical decision-making.
                </p>
              </div>
            ) : (
              <p className="text-brand-ink/50 text-sm">
                No AI summary available for this patient this week.
              </p>
            )}
          </section>

          {/* Recommendations */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-brand-teal">
                <span className="text-xs font-bold uppercase tracking-widest">Recommendations</span>
              </div>
              {!showRecForm && (
                <button
                  onClick={() => setShowRecForm(true)}
                  className="px-4 py-2 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-teal transition-colors shadow-sm"
                >
                  + Write Recommendation
                </button>
              )}
            </div>

            {/* Existing recommendations */}
            {summary.recommendations?.length > 0 ? (
              <div className="space-y-3 mb-4">
                {summary.recommendations.map((rec, idx) => (
                  <div
                    key={rec.id ?? idx}
                    className="p-4 rounded-2xl bg-brand-softerTeal border border-brand-teal/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">
                        Recommendation
                      </span>
                      <span className="font-mono text-[10px] text-brand-ink/40">
                        {fmtDate(rec.createdAt)}
                      </span>
                    </div>
                    {rec.observation && (
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-wider">
                          Observation:{' '}
                        </span>
                        <span className="text-sm text-brand-ink">{rec.observation}</span>
                      </div>
                    )}
                    {rec.nextStep && (
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-wider">
                          Next step:{' '}
                        </span>
                        <span className="text-sm text-brand-ink font-medium">{rec.nextStep}</span>
                      </div>
                    )}
                    {rec.referral && (
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-wider">
                          Referral:{' '}
                        </span>
                        <span className="text-sm text-brand-ink">{rec.referral}</span>
                      </div>
                    )}
                    {rec.noteToUser && (
                      <div className="mt-2 p-3 rounded-xl bg-white/60 border border-brand-teal/10">
                        <span className="text-[10px] font-bold text-brand-teal/70 uppercase tracking-wider">
                          Note to patient:{' '}
                        </span>
                        <span className="text-sm text-brand-ink italic">{rec.noteToUser}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !showRecForm && (
                <p className="text-brand-ink/40 text-sm mb-4">
                  No recommendations written yet for this patient.
                </p>
              )
            )}

            {/* Inline recommendation form */}
            {showRecForm && (
              <RecommendationForm
                userId={patient.userId}
                onSaved={() => {
                  setShowRecForm(false);
                  loadSummary();
                }}
                onCancel={() => setShowRecForm(false)}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main page                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function PractitionerDashboardPage() {
  const navigate = useNavigate();

  /* ── Auth ───────────────────────────────────────────────────────────── */
  const [prac, setPrac] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bs_prac_user')) ?? null;
    } catch {
      return null;
    }
  });

  /* ── View state ─────────────────────────────────────────────────────── */
  // 'dashboard' | 'patient'
  const [view, setView] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);

  /* ── Active nav item ────────────────────────────────────────────────── */
  // 'dashboard' | 'requests' | 'patients' | 'settings'
  const [navItem, setNavItem] = useState('dashboard');

  /* ── Remote data ────────────────────────────────────────────────────── */
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [dashError, setDashError] = useState('');

  // Per-request action state  { [userId]: 'accepting' | 'declining' | 'done' | error }
  const [reqActions, setReqActions] = useState({});

  /* ── Auth gate ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem('bs_prac_token');
    if (!token) {
      navigate('/practitioner/login', { replace: true });
    }
  }, [navigate]);

  /* ── Load dashboard data ────────────────────────────────────────────── */
  const loadDashboard = useCallback(async () => {
    setLoadingDash(true);
    setDashError('');
    try {
      const [meRes, reqRes, patRes] = await Promise.all([
        practitionerApi.getMe(),
        practitionerApi.getRequests(),
        practitionerApi.getPatients(),
      ]);
      // Normalise — backends may return { data: [...] } or plain arrays
      const meData = meRes?.data ?? meRes;
      const reqData = reqRes?.data ?? reqRes ?? [];
      const patData = patRes?.data ?? patRes ?? [];

      setPrac(meData);
      setRequests(Array.isArray(reqData) ? reqData : []);
      setPatients(Array.isArray(patData) ? patData : []);
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('bs_prac_token');
        localStorage.removeItem('bs_prac_user');
        navigate('/practitioner/login', { replace: true });
        return;
      }
      setDashError(err.message || 'Could not load dashboard data.');
    } finally {
      setLoadingDash(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ── Accept / Decline handlers ──────────────────────────────────────── */
  const handleAccept = async (userId) => {
    setReqActions((p) => ({ ...p, [userId]: 'accepting' }));
    try {
      await practitionerApi.acceptRequest(userId);
      setReqActions((p) => ({ ...p, [userId]: 'done' }));
      await loadDashboard();
    } catch (err) {
      setReqActions((p) => ({ ...p, [userId]: err.message || 'Error' }));
    }
  };

  const handleDecline = async (userId) => {
    setReqActions((p) => ({ ...p, [userId]: 'declining' }));
    try {
      await practitionerApi.declineRequest(userId);
      setReqActions((p) => ({ ...p, [userId]: 'done' }));
      await loadDashboard();
    } catch (err) {
      setReqActions((p) => ({ ...p, [userId]: err.message || 'Error' }));
    }
  };

  /* ── Patient selection ──────────────────────────────────────────────── */
  const openPatient = (patient) => {
    setSelectedPatient(patient);
    setView('patient');
    setNavItem('patients');
  };

  const backToDashboard = () => {
    setSelectedPatient(null);
    setView('dashboard');
    setNavItem('dashboard');
  };

  /* ── Logout ─────────────────────────────────────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem('bs_prac_token');
    localStorage.removeItem('bs_prac_user');
    navigate('/practitioner/login', { replace: true });
  };

  /* ── Sidebar nav helper ─────────────────────────────────────────────── */
  const navClick = (item) => {
    setNavItem(item);
    if (item === 'dashboard') {
      setView('dashboard');
      setSelectedPatient(null);
    } else if (item === 'patients') {
      setView('dashboard'); // patients list is inside dashboard view
      setSelectedPatient(null);
    }
    // settings / requests are sections within the dashboard view
  };

  const pendingCount = requests.length;

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col md:flex-row overflow-x-hidden selection:bg-brand-teal/20">

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <aside className="w-full md:w-[260px] bg-white border-r border-brand-border/40 shrink-0 flex flex-col md:sticky md:top-0 md:h-screen z-20">
        {/* Logo */}
        <div className="p-6 md:p-8 shrink-0">
          <Logo />
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 md:px-6 overflow-y-auto pb-6">
          <nav className="flex flex-col gap-1.5">
            {/* Dashboard */}
            <button
              onClick={() => navClick('dashboard')}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all ${
                navItem === 'dashboard'
                  ? 'bg-brand-softerTeal text-brand-teal font-bold shadow-sm'
                  : 'text-brand-ink/60 hover:bg-brand-canvas hover:text-brand-ink'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  navItem === 'dashboard'
                    ? 'bg-brand-teal/10 text-brand-teal'
                    : 'bg-brand-canvas text-brand-ink/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px]">Dashboard</span>
              {navItem === 'dashboard' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-teal" />
              )}
            </button>

            {/* Requests */}
            <button
              onClick={() => navClick('requests')}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all ${
                navItem === 'requests'
                  ? 'bg-brand-softerTeal text-brand-teal font-bold shadow-sm'
                  : 'text-brand-ink/60 hover:bg-brand-canvas hover:text-brand-ink'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  navItem === 'requests'
                    ? 'bg-brand-teal/10 text-brand-teal'
                    : 'bg-brand-canvas text-brand-ink/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a4 4 0 00-4-4H4a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px]">Requests</span>
              {pendingCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-brand-coral text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Patients */}
            <button
              onClick={() => navClick('patients')}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all ${
                navItem === 'patients'
                  ? 'bg-brand-softerTeal text-brand-teal font-bold shadow-sm'
                  : 'text-brand-ink/60 hover:bg-brand-canvas hover:text-brand-ink'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  navItem === 'patients'
                    ? 'bg-brand-teal/10 text-brand-teal'
                    : 'bg-brand-canvas text-brand-ink/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px]">Patients</span>
              {patients.length > 0 && (
                <span className="ml-auto font-mono text-[10px] text-brand-ink/40">
                  {patients.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => navClick('settings')}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all ${
                navItem === 'settings'
                  ? 'bg-brand-softerTeal text-brand-teal font-bold shadow-sm'
                  : 'text-brand-ink/60 hover:bg-brand-canvas hover:text-brand-ink'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  navItem === 'settings'
                    ? 'bg-brand-teal/10 text-brand-teal'
                    : 'bg-brand-canvas text-brand-ink/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px]">Settings</span>
            </button>
          </nav>
        </div>

        {/* Practitioner identity + logout */}
        <div className="p-4 md:p-6 shrink-0 mt-auto border-t border-brand-border/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-ink text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
              {prac?.name?.charAt(0)?.toUpperCase() ?? 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-brand-ink truncate">
                {prac?.name ?? 'Practitioner'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {prac?.verified && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal text-[9px] font-bold">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </span>
                )}
                <span className="text-[10px] text-brand-ink/40 font-mono truncate">
                  {prac?.email ?? ''}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-brand-ink/40 hover:text-brand-coral transition-colors shrink-0"
              title="Log out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 relative">
        {/* Ambient background blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-softerTeal blur-[120px] opacity-60 pointer-events-none z-0" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-brand-coralSoft blur-[140px] opacity-50 pointer-events-none z-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: patient detail                                        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'patient' && selectedPatient && (
            <PatientView patient={selectedPatient} onBack={backToDashboard} />
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: dashboard                                             */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'dashboard' && (
            <>
              {/* ── Welcome header ────────────────────────────────────── */}
              <header>
                <p className="text-brand-teal font-bold text-xs uppercase tracking-widest mb-2">
                  Clinician Dashboard
                </p>
                <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal leading-tight">
                  {prac?.name ? `Dr. ${prac.name.split(' ').slice(-1)[0]}` : 'Welcome'}
                </h1>
                <p className="text-brand-ink/50 text-sm mt-1">
                  {prac?.name ?? 'Clinician'} — Between Sessions Clinician Portal
                </p>
              </header>

              {/* ── Error banner ──────────────────────────────────────── */}
              {dashError && (
                <div className="p-4 bg-brand-coralSoft border border-brand-coral/20 rounded-2xl text-brand-coral text-sm">
                  {dashError}
                </div>
              )}

              {/* ── Stats row ─────────────────────────────────────────── */}
              {loadingDash ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Active Patients */}
                  <div className="bg-brand-amberSoft border border-brand-amber/40 rounded-3xl p-5 shadow-card-lift flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-amber px-2.5 py-0.5 rounded-full bg-white/80 border border-brand-amber/30">
                        Patients
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-brand-amber">group</span>
                    </div>
                    <div>
                      <div className="font-mono text-3xl font-bold text-brand-ink">
                        {patients.length}
                      </div>
                      <div className="text-xs font-medium text-brand-ink/75 mt-0.5">
                        Active Consented Patients
                      </div>
                    </div>
                    <div className="text-[10px] text-brand-ink/50 border-t border-brand-amber/20 pt-2 font-mono">
                      Between-session continuity
                    </div>
                  </div>

                  {/* Card 2: Pending Requests */}
                  <div className="bg-brand-coralSoft border border-brand-coral/40 rounded-3xl p-5 shadow-card-lift flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-coral px-2.5 py-0.5 rounded-full bg-white/80 border border-brand-coral/30">
                        Pending
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-brand-coral">person_add</span>
                    </div>
                    <div>
                      <div className="font-mono text-3xl font-bold text-brand-coral">
                        {requests.length}
                      </div>
                      <div className="text-xs font-medium text-brand-ink/75 mt-0.5">
                        Connection Requests
                      </div>
                    </div>
                    <div className="text-[10px] text-brand-ink/50 border-t border-brand-coral/20 pt-2 font-mono">
                      Awaiting clinical triage
                    </div>
                  </div>

                  {/* Card 3: Exposure Protocols */}
                  <div className="bg-brand-softerTeal border border-brand-teal/40 rounded-3xl p-5 shadow-card-lift flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-teal px-2.5 py-0.5 rounded-full bg-white/80 border border-brand-teal/30">
                        Protocols
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-brand-teal">clinical_notes</span>
                    </div>
                    <div>
                      <div className="font-mono text-3xl font-bold text-brand-teal">
                        Active
                      </div>
                      <div className="text-xs font-medium text-brand-ink/75 mt-0.5">
                        Clinical Guidance Notes
                      </div>
                    </div>
                    <div className="text-[10px] text-brand-ink/50 border-t border-brand-teal/20 pt-2 font-mono">
                      Human authored guidance
                    </div>
                  </div>

                  {/* Card 4: Cedar WASM Policy Engine */}
                  <div className="bg-brand-lavenderSoft border border-brand-lavender/40 rounded-3xl p-5 shadow-card-lift flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-lavender px-2.5 py-0.5 rounded-full bg-white/80 border border-brand-lavender/30">
                        Cedar WASM
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-brand-lavender">verified_user</span>
                    </div>
                    <div>
                      <div className="font-mono text-3xl font-bold text-brand-ink">
                        Gated
                      </div>
                      <div className="text-xs font-medium text-brand-ink/75 mt-0.5">
                        Real-Time Policy Check
                      </div>
                    </div>
                    <div className="text-[10px] text-brand-ink/50 border-t border-brand-lavender/20 pt-2 font-mono">
                      Granular consent enforced
                    </div>
                  </div>
                </div>
              )}

              {/* ── Pending requests panel ────────────────────────────── */}
              <section className="bg-brand-paper rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-card-lift space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-coral">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Pending Connection Requests
                    </span>
                  </div>
                  {requests.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-coralSoft text-brand-coral text-xs font-bold border border-brand-coral/20">
                      {requests.length} new
                    </span>
                  )}
                </div>

                {loadingDash ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-brand-ink/40 text-xs py-2">
                    No pending connection requests in your inbox.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => {
                      const actionState = reqActions[req.userId];
                      const busy = actionState === 'accepting' || actionState === 'declining';
                      const done = actionState === 'done';

                      return (
                        <div
                          key={req.userId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-brand-canvas border border-brand-border/60"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-brand-ink">
                                Patient ID: <span className="font-mono text-brand-teal">{req.userId}</span>
                              </span>
                              {req.requestedAt && (
                                <span className="text-[10px] text-brand-ink/40 font-mono">
                                  {fmtDate(req.requestedAt)}
                                </span>
                              )}
                            </div>
                            {req.message && (
                              <p className="text-xs text-brand-ink/75 leading-relaxed">
                                "{req.message}"
                              </p>
                            )}
                          </div>
                          {done ? (
                            <span className="px-3 py-1.5 rounded-full bg-brand-softSuccess text-clinical-success text-xs font-bold shrink-0">
                              ✓ Accepted
                            </span>
                          ) : typeof actionState === 'string' &&
                            actionState !== 'accepting' &&
                            actionState !== 'declining' ? (
                            <span className="text-brand-coral text-xs shrink-0">
                              {actionState}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleAccept(req.userId)}
                                disabled={busy}
                                className="px-4 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-medium hover:bg-brand-tealDark transition-colors shadow-xs disabled:opacity-60"
                              >
                                {actionState === 'accepting' ? 'Accepting…' : 'Accept Request'}
                              </button>
                              <button
                                onClick={() => handleDecline(req.userId)}
                                disabled={busy}
                                className="px-3 py-1.5 rounded-xl border border-brand-border text-brand-ink/60 text-xs font-medium hover:text-brand-coral hover:border-brand-coral transition-colors disabled:opacity-60"
                              >
                                {actionState === 'declining' ? 'Declining…' : 'Decline'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ── Active patients list ──────────────────────────────── */}
              <section className="bg-brand-paper rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-card-lift space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-teal">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Active Patients & Continuity Context
                    </span>
                  </div>
                  <span className="font-mono text-xs text-brand-ink/50">
                    {patients.length} Connected
                  </span>
                </div>

                {loadingDash ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : patients.length === 0 ? (
                  <p className="text-brand-ink/40 text-xs py-4">
                    No active patients connected yet. When you accept incoming requests, they will appear here with values and telemetry.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patients.map((patient) => {
                      const { bg: sBg, text: sText, label: sLabel } = statusMeta(
                        patient.connectionStatus || patient.status
                      );
                      const displayName = patient.name || patient.userId;
                      const patientValues = patient.values || ['Career', 'Family', 'Reading', 'Yoga'];

                      return (
                        <div
                          key={patient.userId}
                          className="p-5 rounded-3xl border border-brand-border bg-brand-canvas hover:border-brand-teal/40 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-bold text-sm shrink-0">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-editorial text-xl text-brand-ink font-medium leading-snug">
                                    {displayName}
                                  </h3>
                                  <p className="text-[11px] font-mono text-brand-ink/50">
                                    {patient.userId} • {patient.ageBand || '25-34'}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sBg} ${sText}`}>
                                {sLabel}
                              </span>
                            </div>

                            {/* Patient Values (Life Outside OCD) */}
                            {patientValues.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-brand-ink/50 block mb-1">
                                  Life Outside OCD (Values):
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {patientValues.map((v) => (
                                    <span
                                      key={v}
                                      className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-amberSoft text-brand-amber font-medium border border-brand-amber/20"
                                    >
                                      {v}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Consented Categories */}
                            {patient.consentedCategories?.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-brand-ink/50 block mb-1">
                                  Consented Data:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {patient.consentedCategories.map((cat) => (
                                    <span
                                      key={cat}
                                      className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal border border-brand-teal/20"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between">
                            <span className="text-[10px] text-brand-ink/40 font-mono">
                              Connected: {fmtDate(patient.connectedAt)}
                            </span>
                            <button
                              onClick={() => openPatient(patient)}
                              className="px-3.5 py-1.5 rounded-xl bg-brand-ink text-white hover:bg-brand-teal text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <span>Review Patient</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ── Settings stub ─────────────────────────────────────── */}
              {navItem === 'settings' && (
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
                  <div className="flex items-center gap-2 text-brand-lavender mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Settings
                    </span>
                  </div>
                  <p className="text-brand-ink/50 text-sm">
                    Practitioner account settings coming soon.
                  </p>
                </section>
              )}
            </>
          )}

          {/* ── Safety footer ──────────────────────────────────────────── */}
          <footer className="border-t border-brand-border/40 pt-6 text-center text-[11px] text-brand-ink/40">
            <span className="font-bold text-brand-coral">Need immediate support?</span>
            {' '}Tele-MANAS:{' '}
            <span className="font-mono">14416</span>
            {' · '}
            <span className="font-mono">1800-891-4416</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
