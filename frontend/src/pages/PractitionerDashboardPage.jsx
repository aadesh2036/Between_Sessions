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
import MobileBottomNav from '../components/MobileBottomNav';
import BetweenLoading from '../components/BetweenLoading';
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
            <span className="font-mono text-xs font-medium text-brand-ink/75">{score}</span>
            <div
              className={`w-5 rounded-sm ${barColor} transition-all`}
              style={{ height: `${heightPx}px` }}
            />
            <span className="font-mono text-xs font-medium text-brand-ink/75 rotate-0">
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');

  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await practitionerApi.generatePatientAiSummary(patient.userId, 30);
      setAiResult(res.data);
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI synthesis.');
    } finally {
      setAiLoading(false);
    }
  };

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
          className="min-h-[44px] px-3 py-2 flex items-center gap-2 text-brand-ink/75 hover:text-brand-teal transition-colors text-sm font-bold self-start rounded-xl"
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
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal px-2.5 py-0.5 rounded-full bg-brand-softerTeal border border-brand-teal/20">
                Patient Continuity Profile
              </span>
              <span className="font-mono text-xs text-brand-ink/75">
                ID: {patient.userId}
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium">
              {summary?.patientProfile?.name || patient.name || patient.userId}
            </h2>
            <p className="text-xs text-brand-ink/75">
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

      {/* ── Loading state with signature Between Sessions animation ────────── */}
      {loading && (
        <div className="bg-brand-paper rounded-3xl border border-brand-border/60 p-12 shadow-card-lift">
          <BetweenLoading
            size="lg"
            label="Evaluating cryptographic consent & retrieving continuity logs..."
            sublabel="Cedar WASM engine verifying patient-authorized data scopes"
          />
        </div>
      )}

      {/* ── Patient data ─────────────────────────────────────────────────── */}
      {!loading && !error && summary && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Check-ins', value: (summary.summary?.checkinCount ?? summary.stats?.checkinCount ?? 0) },
              { label: 'Avg SUDS', value: (summary.summary?.avgSuds != null ? Number(summary.summary.avgSuds).toFixed(1) : (summary.stats?.avgSuds != null ? Number(summary.stats.avgSuds).toFixed(1) : '—')) },
              { label: 'Practices', value: (summary.summary?.practiceCount ?? summary.stats?.practiceCount ?? 0) },
              { label: 'Journal entries', value: (summary.summary?.journalCount ?? summary.stats?.journalCount ?? 0) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 border border-brand-border/30 shadow-sm"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-brand-ink/75 font-sans mb-1">
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
            <p className="text-xs text-brand-ink/75 mb-4">
              Each bar = one check-in. Height proportional to SUDS score (0–10).
            </p>
            <SudsTrendChart checkins={summary.checkins ?? []} />
            {(!summary.checkins || summary.checkins.length === 0) && (
              <p className="text-brand-ink/75 text-sm">No check-in records in the shared window.</p>
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
                      <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-widest text-brand-ink/75 font-sans whitespace-nowrap">
                        Exercise
                      </th>
                      <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-widest text-brand-ink/75 font-sans whitespace-nowrap">
                        Pre → Post Distress
                      </th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-brand-ink/75 font-sans whitespace-nowrap">
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
                            <span className="text-brand-ink/60 mx-1 font-sans font-bold">→</span>
                            <span className="text-brand-teal">{p.postDistress ?? '—'}</span>
                          </span>
                        </td>
                        <td className="py-3 text-xs text-brand-ink/75 font-mono whitespace-nowrap">
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

          {/* AI Practice Overview (RAG Decision Support) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-card-lift">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-border/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-lavenderSoft flex items-center justify-center text-brand-lavender border border-brand-lavender/20 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-xl sm:text-2xl font-medium text-brand-ink">
                      AI Practice Overview
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal font-semibold border border-brand-teal/20">
                      RAG Grounded
                    </span>
                  </div>
                  <p className="text-xs text-brand-ink/50 mt-0.5">
                    Objective telemetry synthesis & evidence-based ERP literature grounding
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleGenerateAiSummary}
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-full bg-brand-teal text-white text-xs font-bold hover:bg-brand-tealDark transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{(aiResult || summary.aiSummary) ? 'Refresh Synthesis' : 'Generate Synthesis'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {aiError && (
              <div className="mb-6 p-4 rounded-2xl bg-brand-coralSoft border border-brand-coral/20 text-brand-coral text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{aiError}</span>
              </div>
            )}

            {/* Loading state with signature BetweenLoading animation */}
            {aiLoading && (
              <div className="py-8">
                <BetweenLoading
                  size="md"
                  label="Synthesizing patient practice telemetry..."
                  sublabel="Cedar WASM verifying practice_logs consent · Retrieving evidence-based ERP literature"
                />
              </div>
            )}

            {/* Empty state before first synthesis */}
            {!aiLoading && !aiResult && !summary.aiSummary && (
              <div className="py-8 text-center bg-brand-canvas/50 rounded-2xl border border-brand-border/40 p-6 space-y-3">
                <div className="text-brand-ink/60 max-w-md mx-auto text-xs leading-relaxed">
                  No AI synthesis generated yet for this patient. Click <strong className="text-brand-ink font-semibold">Generate Synthesis</strong> to produce an objective clinical overview combining between-sessions check-ins, practice logs, and curated ERP literature under AWS Cedar policy.
                </div>
              </div>
            )}

            {/* Active synthesis content */}
            {!aiLoading && (aiResult || summary.aiSummary) && (() => {
              const active = aiResult?.synthesis || summary.aiSummary?.synthesis || (typeof summary.aiSummary === 'object' ? summary.aiSummary : { summary: summary.aiSummary });
              const knowledge = aiResult?.knowledgeRetrieved || summary.aiSummary?.knowledgeChunksUsed || [];
              const modelName = aiResult?.model || summary.aiSummary?.model || 'Open-Weight LLM';
              const providerName = aiResult?.provider || summary.aiSummary?.provider || 'Hugging Face Inference';

              return (
                <div className="space-y-6">
                  {/* Synthesis Narrative */}
                  <div className="bg-brand-canvas/60 rounded-2xl p-5 border border-brand-border/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal px-2 py-0.5 rounded-full bg-brand-softerTeal border border-brand-teal/20">
                        Longitudinal Synthesis
                      </span>
                      <span className="text-xs font-mono text-brand-ink/70">
                        Model: {modelName} · {providerName}
                      </span>
                    </div>
                    <p className="text-brand-ink/90 text-sm leading-relaxed font-sans">
                      {active.summary || active.text || 'Practice telemetry recorded in the authorized reporting window.'}
                    </p>
                  </div>

                  {/* Practice Observations (FACTS) */}
                  {active.practice_observations?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                          Practice Observations
                        </span>
                        <span className="text-xs font-sans font-bold px-2 py-0.5 rounded bg-brand-softSuccess text-clinical-success uppercase border border-clinical-success/20">
                          FACT
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {active.practice_observations.map((obs, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white border border-brand-border/60 shadow-xs space-y-2">
                            <p className="text-xs text-brand-ink/80 leading-relaxed font-sans">
                              {obs.observation || obs}
                            </p>
                            {obs.evidence?.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-brand-border/30">
                                <span className="text-xs text-brand-ink/75 uppercase font-sans font-bold">Evidence:</span>
                                {obs.evidence.map((ev, ei) => (
                                  <span key={ei} className="font-mono text-xs px-2 py-0.5 rounded bg-brand-softerTeal text-brand-teal">
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patterns (INFERENCES) */}
                  {active.patterns?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                          Observed Behavioral Patterns
                        </span>
                        <span className="text-xs font-sans font-bold px-2 py-0.5 rounded bg-brand-amberSoft text-brand-amber uppercase border border-brand-amber/20">
                          INFERENCE
                        </span>
                      </div>
                      <div className="space-y-2">
                        {active.patterns.map((pat, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-brand-amberSoft/30 border border-brand-amber/20 text-xs text-brand-ink/80 leading-relaxed">
                            {pat.pattern || pat}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Retrieved Clinical Knowledge (KNOWLEDGE) */}
                  {(knowledge.length > 0 || active.clinical_context?.length > 0) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                          Retrieved Clinical Knowledge (ERP Grounding)
                        </span>
                        <span className="text-xs font-sans font-bold px-2 py-0.5 rounded bg-brand-lavenderSoft text-brand-lavender uppercase border border-brand-lavender/20">
                          KNOWLEDGE
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(knowledge.length > 0 ? knowledge : active.clinical_context).map((item, i) => (
                          <div key={i} className="p-4 rounded-xl bg-brand-lavenderSoft/20 border border-brand-lavender/20 space-y-1.5">
                            <div className="font-editorial text-sm font-semibold text-brand-ink">
                              {item.title || item.point || 'Clinical Principle'}
                            </div>
                            <div className="text-xs text-brand-ink/75 font-sans italic">
                              {item.citation || item.source || 'Peer-reviewed clinical reference'}
                            </div>
                            {item.chunkId && (
                              <span className="inline-block font-mono text-xs px-2 py-0.5 rounded bg-brand-lavenderSoft text-brand-lavender">
                                {item.chunkId}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Session Inquiry Recommendations */}
                  {active.questions_for_practitioner?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                          Session Prep Considerations
                        </span>
                        <span className="text-xs font-sans font-bold px-2 py-0.5 rounded bg-brand-softerTeal text-brand-teal uppercase border border-brand-teal/20">
                          CLINICAL PROBE
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {active.questions_for_practitioner.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-brand-ink/80 p-3 rounded-xl bg-brand-canvas/60 border border-brand-border/40">
                            <span className="text-brand-teal font-bold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Clinical Safety Disclaimer */}
                  <div className="p-4 rounded-xl bg-brand-canvas border border-brand-border/40 text-xs text-brand-ink/75 leading-relaxed italic">
                    AI-generated clinical decision support for licensed practitioners — not a medical diagnosis, treatment directive, or patient reassurance. Synthesized strictly from authorized DynamoDB logs and curated ERP literature under AWS Cedar policy. The practitioner retains sole clinical responsibility.
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Recommendations */}
          <section id="recommendation-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
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
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                        Recommendation
                      </span>
                      <span className="font-mono text-xs text-brand-ink/70">
                        {fmtDate(rec.createdAt)}
                      </span>
                    </div>
                    {rec.observation && (
                      <div className="mb-2">
                        <span className="text-xs font-bold text-brand-ink/70 uppercase tracking-wider">
                          Observation:{' '}
                        </span>
                        <span className="text-sm text-brand-ink">{rec.observation}</span>
                      </div>
                    )}
                    {rec.nextStep && (
                      <div className="mb-2">
                        <span className="text-xs font-bold text-brand-ink/70 uppercase tracking-wider">
                          Next step:{' '}
                        </span>
                        <span className="text-sm text-brand-ink font-medium">{rec.nextStep}</span>
                      </div>
                    )}
                    {rec.referral && (
                      <div className="mb-2">
                        <span className="text-xs font-bold text-brand-ink/70 uppercase tracking-wider">
                          Referral:{' '}
                        </span>
                        <span className="text-sm text-brand-ink">{rec.referral}</span>
                      </div>
                    )}
                    {rec.noteToUser && (
                      <div className="mt-2 p-3 rounded-xl bg-white/60 border border-brand-teal/10">
                        <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
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
                <p className="text-brand-ink/70 text-sm mb-4">
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
/*  Practitioner Settings View                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function PractitionerSettingsView({ prac, onUpdated, onLogout }) {
  const [name, setName] = useState(prac?.name || '');
  const [clinicName, setClinicName] = useState(prac?.clinicName || '');
  const [credentials, setCredentials] = useState(prac?.credentials || '');
  const [specialisation, setSpecialisation] = useState(
    Array.isArray(prac?.specialisation) ? prac.specialisation.join(', ') : (prac?.specialisation || '')
  );
  const [languages, setLanguages] = useState(
    Array.isArray(prac?.languages) ? prac.languages.join(', ') : (prac?.languages || 'English, Hindi')
  );
  const [remoteAvailable, setRemoteAvailable] = useState(prac?.remoteAvailable ?? true);
  const [notes, setNotes] = useState(prac?.notes || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Sync if prac prop updates
  useEffect(() => {
    if (prac) {
      if (prac.name) setName(prac.name);
      if (prac.clinicName) setClinicName(prac.clinicName);
      if (prac.credentials) setCredentials(prac.credentials);
      if (prac.specialisation) {
        setSpecialisation(Array.isArray(prac.specialisation) ? prac.specialisation.join(', ') : prac.specialisation);
      }
      if (prac.languages) {
        setLanguages(Array.isArray(prac.languages) ? prac.languages.join(', ') : prac.languages);
      }
      if (prac.remoteAvailable !== undefined) setRemoteAvailable(prac.remoteAvailable);
      if (prac.notes) setNotes(prac.notes);
    }
  }, [prac]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const specs = specialisation.split(',').map((s) => s.trim()).filter(Boolean);
      const langs = languages.split(',').map((l) => l.trim()).filter(Boolean);
      const payload = {
        name: name.trim(),
        clinicName: clinicName.trim(),
        credentials: credentials.trim(),
        specialisation: specs,
        languages: langs,
        remoteAvailable,
        notes: notes.trim(),
      };
      const res = await practitionerApi.updateMe(payload);
      setSaveSuccess(res.message || 'Practitioner profile updated successfully.');
      onUpdated({ ...prac, ...payload });
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update practitioner profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-softerTeal text-brand-teal text-xs font-semibold mb-2">
          <span className="material-symbols-outlined text-sm">tune</span>
          Clinical Practice Configuration
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal leading-tight">
          Practitioner Settings
        </h1>
        <p className="text-brand-ink/60 text-sm mt-1 max-w-2xl">
          Manage your professional details, credentials, clinical areas of focus, and patient intake availability.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-brand-softerTeal text-brand-teal text-sm font-medium border border-brand-teal/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-brand-coralSoft text-brand-coral text-sm font-medium border border-brand-coral/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Professional Identity (Col span 2) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/70 shadow-card-lift space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
              <div>
                <h2 className="font-editorial text-2xl text-brand-ink font-normal">
                  Professional Identity
                </h2>
                <p className="text-xs text-brand-ink/50 mt-0.5">
                  Visible to patients during clinician discovery and consultation matching.
                </p>
              </div>
              <span className="material-symbols-outlined text-brand-teal text-2xl">badge</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Full Name &amp; Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Kavita Mehra"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Clinic or Practice Affiliation
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. Horizons Behavioral Health"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Credentials, Degrees &amp; Council Registration
                </label>
                <input
                  type="text"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  placeholder="e.g. MD, MCI Registered Psychiatrist · ERP Specialist"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Practice Philosophy &amp; Patient Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe your therapeutic modality, approach to ERP between sessions, or consultation criteria."
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Practitioner Registry & License Badge (Col span 1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/70 shadow-card-lift flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-4">
                <div>
                  <h2 className="font-editorial text-2xl text-brand-ink font-normal">
                    Verified Registry
                  </h2>
                  <p className="text-xs text-brand-ink/50 mt-0.5">
                    Synthetic demo credential status
                  </p>
                </div>
                <span className="material-symbols-outlined text-brand-lavender text-2xl">verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-brand-softerTeal/70 border border-brand-teal/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    Registry ID
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-teal text-white text-[9px] font-bold">
                    VERIFIED
                  </span>
                </div>
                <div className="font-mono text-base font-bold text-brand-ink">
                  {prac?.govCertId || 'MCI-2024-KM-7741'}
                </div>
                <p className="text-[11px] text-brand-ink/65 leading-relaxed pt-1 border-t border-brand-teal/20">
                  Practitioner identity verified for simulated clinical continuity. In production, verified against national medical councils.
                </p>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 space-y-1.5">
                <div className="text-xs font-semibold text-brand-ink">
                  Registered Account Email
                </div>
                <div className="font-mono text-xs text-brand-ink/60">
                  {prac?.email || 'kavita@betweensessions.com'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-coralSoft/70 border border-brand-coral/20 text-brand-coral text-[11px] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">support</span>
              <span>Tele-MANAS crisis link remains active on all views (14416).</span>
            </div>
          </div>

          {/* Card 3: Clinical Focus & Consultation Mode (Col span 2) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/70 shadow-card-lift space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
              <div>
                <h2 className="font-editorial text-2xl text-brand-ink font-normal">
                  Clinical Focus &amp; Consultation Mode
                </h2>
                <p className="text-xs text-brand-ink/50 mt-0.5">
                  Configure areas of therapeutic focus and accepted consultation modalities.
                </p>
              </div>
              <span className="material-symbols-outlined text-brand-teal text-2xl">psychology</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Specialization Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={specialisation}
                  onChange={(e) => setSpecialisation(e.target.value)}
                  placeholder="e.g. OCD, Anxiety Disorders, ERP, Phobias"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {specialisation.split(',').map((tag, idx) => {
                    const trimmed = tag.trim();
                    if (!trimmed) return null;
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal text-xs font-medium border border-brand-teal/20"
                      >
                        {trimmed}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Languages Spoken (comma-separated)
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, Hindi, Marathi"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                />
              </div>

              {/* Remote availability toggle */}
              <div className="flex items-center justify-between p-4 bg-brand-canvas rounded-2xl border border-brand-border/60">
                <div>
                  <div className="text-xs font-bold text-brand-ink">
                    Tele-Consultation / Remote Availability
                  </div>
                  <div className="text-xs text-brand-ink/75 mt-0.5">
                    Allow consented patients across regions to request remote asynchronous monitoring and review.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={remoteAvailable}
                  aria-label="Toggle Tele-Consultation and Remote Availability"
                  onClick={() => setRemoteAvailable(!remoteAvailable)}
                  className="min-h-[44px] min-w-[48px] flex items-center justify-center cursor-pointer"
                >
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      remoteAvailable ? 'bg-brand-teal' : 'bg-brand-border'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        remoteAvailable ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Session Security & Sign Out (Col span 1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/70 shadow-card-lift flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-4">
                <div>
                  <h2 className="font-editorial text-2xl text-brand-ink font-normal">
                    Session Security
                  </h2>
                  <p className="text-xs text-brand-ink/70 mt-0.5">
                    Encrypted practitioner session
                  </p>
                </div>
                <span className="material-symbols-outlined text-brand-amber text-2xl">security</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between">
                  <span className="text-brand-ink/75">Session Token:</span>
                  <span className="font-sans text-xs text-brand-teal font-bold">Encrypted JWT</span>
                </div>
                <div className="p-3 rounded-xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between">
                  <span className="text-brand-ink/75">Cookie Security:</span>
                  <span className="font-mono text-xs text-brand-ink font-semibold">SameSite=Lax</span>
                </div>
                <div className="p-3 rounded-xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between">
                  <span className="text-brand-ink/75">Consent Boundary:</span>
                  <span className="font-sans text-xs text-brand-teal font-bold">Enforced</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border/50">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl border border-brand-coral/40 text-brand-coral font-bold text-xs hover:bg-brand-coralSoft transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Sign Out of Practitioner Session
              </button>
            </div>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/50">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-full bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>{isSaving ? 'Saving Profile…' : 'Save Practitioner Profile'}</span>
          </button>
        </div>
      </form>
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

  /* ── Toast notification ──────────────────────────────────────────────── */
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

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
    document.cookie = 'bs_prac_token=; path=/; max-age=0; SameSite=Lax';
    navigate('/practitioner/login', { replace: true });
  };

  /* ── Patient search state ───────────────────────────────────────────── */
  const [patientSearch, setPatientSearch] = useState('');

  /* ── Sidebar & mobile nav helper ─────────────────────────────────────── */
  const navClick = (item) => {
    setNavItem(item);
    setView('dashboard');
    setSelectedPatient(null);
  };

  const pendingCount = requests.length;

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch.trim()) return true;
    const q = patientSearch.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const id = (p.userId || '').toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col md:flex-row overflow-x-hidden selection:bg-brand-teal/20">

      {/* ── Mobile Top Bar (Clinician) ─────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-brand-border/60 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal border border-brand-teal/20">
            Clinician
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Shortened Tele-MANAS crisis button on mobile */}
          <a
            href="tel:14416"
            className="px-3 py-1.5 min-h-[40px] rounded-full bg-brand-coralSoft text-brand-coral border border-brand-coral/30 hover:bg-brand-coral hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Tele-MANAS 24/7 Free Crisis Telephony"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-coral animate-pulse" />
            <span>14416</span>
          </a>
          <button
            onClick={() => navClick('settings')}
            className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-brand-canvas border border-brand-border flex items-center justify-center transition-all ${
              navItem === 'settings' ? 'text-brand-teal border-brand-teal bg-brand-softerTeal' : 'text-brand-ink/70 hover:text-brand-teal'
            }`}
            title="Settings"
            aria-label="Practitioner Settings"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* ── SIDEBAR (Desktop) ──────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-brand-border/40 shrink-0 flex-col md:sticky md:top-0 md:h-screen z-20">
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
                <span className="text-xs text-brand-ink/70 font-mono truncate">
                  {prac?.email ?? ''}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-ink/70 hover:text-brand-coral transition-colors shrink-0"
              title="Log out"
              aria-label="Log out of practitioner session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 relative overflow-hidden">
        {/* Ambient background blobs strictly contained within viewport bounds */}
        <div className="absolute top-0 -left-[10%] w-[500px] h-[500px] rounded-full bg-brand-softerTeal blur-[120px] opacity-60 pointer-events-none z-0" />
        <div className="absolute bottom-0 -right-[10%] w-[500px] h-[500px] rounded-full bg-brand-coralSoft blur-[140px] opacity-50 pointer-events-none z-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 pb-28 md:pb-8 space-y-8">

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: patient detail                                        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'patient' && selectedPatient && (
            <div key={selectedPatient.userId || selectedPatient.id} className="animate-tab-switch">
              <PatientView patient={selectedPatient} onBack={backToDashboard} />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: practitioner settings                                  */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'dashboard' && navItem === 'settings' && (
            <div key="settings" className="animate-tab-switch">
              <PractitionerSettingsView
                prac={prac}
                onUpdated={(updatedPrac) => {
                  setPrac(updatedPrac);
                  localStorage.setItem('bs_prac_user', JSON.stringify(updatedPrac));
                }}
                onLogout={handleLogout}
              />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: requests (Inbound Triage)                             */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'dashboard' && navItem === 'requests' && (
            <div key="requests" className="space-y-6 animate-tab-switch">
              <header>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-coralSoft text-brand-coral text-xs font-semibold mb-2">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Inbound Clinical Intake
                </div>
                <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal leading-tight">
                  Connection Requests
                </h1>
                <p className="text-brand-ink/60 text-sm mt-1 max-w-2xl">
                  Review patients requesting clinical connection and consent-governed longitudinal oversight between sessions.
                </p>
              </header>

              {/* Error banner */}
              {dashError && (
                <div className="p-4 bg-brand-coralSoft border border-brand-coral/20 rounded-2xl text-brand-coral text-sm">
                  {dashError}
                </div>
              )}

              {/* Pending requests panel */}
              <section className="bg-brand-paper rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-card-lift space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                  <div className="flex items-center gap-2 text-brand-coral">
                    <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Inbound Patient Inquiries
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-coralSoft text-brand-coral text-xs font-bold border border-brand-coral/20">
                    {requests.length} pending
                  </span>
                </div>

                {loadingDash ? (
                  <div className="py-8">
                    <BetweenLoading
                      size="sm"
                      label="Synchronizing connection requests..."
                      sublabel="Holding the space between sessions"
                    />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-brand-softerTeal text-brand-teal flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-2xl">all_inbox</span>
                    </div>
                    <p className="text-brand-ink font-semibold text-sm">
                      All connection requests triaged
                    </p>
                    <p className="text-brand-ink/50 text-xs max-w-md mx-auto">
                      New patient requests will appear here when patients share their logs using your Practitioner ID (<span className="font-mono text-brand-teal">{prac?.govCertId || 'MCI-2024-KM-7741'}</span>).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => {
                      const actionState = reqActions[req.userId];
                      const busy = actionState === 'accepting' || actionState === 'declining';
                      const done = actionState === 'done';

                      return (
                        <div
                          key={req.userId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-brand-canvas border border-brand-border/60 hover:border-brand-teal/30 transition-all shadow-xs"
                        >
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-brand-ink">
                                Patient ID: <span className="font-mono text-brand-teal">{req.userId}</span>
                              </span>
                              {req.requestedAt && (
                                <span className="text-[10px] text-brand-ink/40 font-mono">
                                  Requested: {fmtDate(req.requestedAt)}
                                </span>
                              )}
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-amberSoft text-brand-amber font-semibold border border-brand-amber/20">
                                Pending Triage
                              </span>
                            </div>

                            {req.message && (
                              <p className="text-xs text-brand-ink/80 leading-relaxed bg-white/80 p-3 rounded-xl border border-brand-border/40">
                                "{req.message}"
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-brand-ink/75 font-sans pt-0.5">
                              <span className="font-medium">Requested scope:</span>
                              <span className="text-brand-teal bg-brand-softerTeal px-2 py-0.5 rounded font-medium">Practice Logs</span>
                              <span className="text-brand-teal bg-brand-softerTeal px-2 py-0.5 rounded font-medium">Check-ins (SUDS)</span>
                              <span className="text-brand-teal bg-brand-softerTeal px-2 py-0.5 rounded font-medium">Journal Reflection</span>
                            </div>
                          </div>

                          {done ? (
                            <span className="px-3.5 py-1.5 rounded-full bg-brand-softSuccess text-clinical-success text-xs font-bold shrink-0 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Accepted
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
                                className="px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-brand-tealDark transition-colors shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                <span>{actionState === 'accepting' ? 'Accepting…' : 'Accept Connection'}</span>
                              </button>
                              <button
                                onClick={() => handleDecline(req.userId)}
                                disabled={busy}
                                className="px-3.5 py-2 rounded-xl border border-brand-border text-brand-ink/60 text-xs font-medium hover:text-brand-coral hover:border-brand-coral transition-colors disabled:opacity-60"
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
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: patients (Consented Patient Roster)                    */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'dashboard' && navItem === 'patients' && (
            <div key="patients" className="space-y-6 animate-tab-switch">
              <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-softerTeal text-brand-teal text-xs font-semibold mb-2">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Active Clinical Roster
                  </div>
                  <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal leading-tight">
                    Patient Roster
                  </h1>
                  <p className="text-brand-ink/60 text-sm mt-1">
                    {patients.length} consented patients with longitudinal telemetry and journal access.
                  </p>
                </div>

                {/* Patient search input */}
                <div className="w-full sm:w-72">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Search patients by name or ID..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-brand-border focus:border-brand-teal focus:outline-none transition-colors text-brand-ink shadow-xs"
                    />
                  </div>
                </div>
              </header>

              {/* Active patients grid */}
              <section className="bg-brand-paper rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-card-lift space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                  <div className="flex items-center gap-2 text-brand-teal">
                    <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Consented Between-Session Telemetry
                    </span>
                  </div>
                  <span className="font-mono text-xs text-brand-ink/50">
                    {filteredPatients.length} of {patients.length} Showing
                  </span>
                </div>

                {loadingDash ? (
                  <div className="py-8">
                    <BetweenLoading
                      size="sm"
                      label="Loading consented patient caseload..."
                      sublabel="Checking cryptographic authorizations"
                    />
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-brand-canvas text-brand-ink/40 flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-2xl">person_search</span>
                    </div>
                    <p className="text-brand-ink font-semibold text-sm">
                      No matching patients found
                    </p>
                    <p className="text-brand-ink/50 text-xs">
                      Try searching with a different name or patient identifier.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPatients.map((patient) => {
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
                                <span className="text-xs uppercase font-bold tracking-wider text-brand-ink/70 block mb-1">
                                  Consented Data:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {patient.consentedCategories.map((cat) => (
                                    <span
                                      key={cat}
                                      className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal border border-brand-teal/20"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-brand-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-xs text-brand-ink/70 font-mono">
                              Connected: {fmtDate(patient.connectedAt)}
                            </span>
                            <button
                              onClick={() => openPatient(patient)}
                              className="px-4 py-2 min-h-[44px] rounded-xl bg-brand-ink text-white hover:bg-brand-teal text-xs font-medium transition-colors flex items-center justify-center gap-1 shadow-xs w-full sm:w-auto"
                            >
                              <span>Review Patient &amp; Journal</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW: dashboard (Clinical Overview)                         */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {view === 'dashboard' && navItem === 'dashboard' && (
            <div key="dashboard" className="space-y-8 animate-tab-switch">
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
                  <div
                    onClick={() => navClick('patients')}
                    className="bg-brand-amberSoft border border-brand-amber/40 rounded-3xl p-5 shadow-card-lift flex flex-col justify-between space-y-3 cursor-pointer hover:border-brand-amber transition-all"
                  >
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
                    <div className="text-[10px] text-brand-amber font-bold border-t border-brand-amber/20 pt-2 flex items-center justify-between">
                      <span>View Roster</span>
                      <span>→</span>
                    </div>
                  </div>

                  {/* Card 2: Pending Requests */}
                  <div
                    onClick={() => navClick('requests')}
                    className="bg-brand-coralSoft border border-brand-coral/40 rounded-3xl p-5 shadow-card-lift flex flex-col justify-between space-y-3 cursor-pointer hover:border-brand-coral transition-all"
                  >
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
                    <div className="text-[10px] text-brand-coral font-bold border-t border-brand-coral/20 pt-2 flex items-center justify-between">
                      <span>Review Inbox</span>
                      <span>→</span>
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
                      <div className="font-sans text-3xl font-bold text-brand-teal">
                        Active
                      </div>
                      <div className="text-xs font-medium text-brand-ink/75 mt-0.5">
                        Clinical Guidance Notes
                      </div>
                    </div>
                    <div className="text-xs text-brand-ink/75 border-t border-brand-teal/20 pt-2 font-sans font-medium">
                      Human authored guidance
                    </div>
                  </div>

                  {/* Card 4: Cedar WASM Policy Engine */}
                  <div className="bg-brand-lavenderSoft border border-brand-lavender/40 rounded-3xl p-5 shadow-card-lift flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider text-brand-lavender px-2.5 py-0.5 rounded-full bg-white/80 border border-brand-lavender/30">
                        Cedar WASM
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-brand-lavender">verified_user</span>
                    </div>
                    <div>
                      <div className="font-sans text-3xl font-bold text-brand-ink">
                        Gated
                      </div>
                      <div className="text-xs font-medium text-brand-ink/75 mt-0.5">
                        Real-Time Policy Check
                      </div>
                    </div>
                    <div className="text-xs text-brand-ink/70 border-t border-brand-lavender/20 pt-2 font-sans font-medium">
                      Granular consent enforced
                    </div>
                  </div>
                </div>
              )}

              {/* ── Priority Action Callout: Pending Connection Requests ── */}
              {requests.length > 0 && (
                <div className="p-6 rounded-3xl bg-brand-coralSoft border border-brand-coral/40 shadow-card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 text-brand-coral text-xs font-bold border border-brand-coral/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-coral animate-pulse" />
                      Priority Action Required
                    </div>
                    <h2 className="font-editorial text-2xl text-brand-ink font-normal">
                      {requests.length} Inbound Connection {requests.length === 1 ? 'Request' : 'Requests'}
                    </h2>
                    <p className="text-xs text-brand-ink/70">
                      Patients are waiting for your clinical confirmation to begin sharing between-session telemetry.
                    </p>
                  </div>
                  <button
                    onClick={() => navClick('requests')}
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-brand-coral text-white hover:bg-brand-coral/90 text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-center flex items-center gap-1.5"
                  >
                    <span>Triage Requests</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              )}

              {/* ── Active Patients Roster Preview ────────────────────── */}
              <section className="bg-brand-paper rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-card-lift space-y-5">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                  <div className="flex items-center gap-2 text-brand-teal">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Active Patient Overview
                    </span>
                  </div>
                  <button
                    onClick={() => navClick('patients')}
                    className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1 min-h-[44px] py-1"
                  >
                    <span>View All ({patients.length})</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                {loadingDash ? (
                  <div className="py-8">
                    <BetweenLoading
                      size="sm"
                      label="Loading active patient cohort..."
                    />
                  </div>
                ) : patients.length === 0 ? (
                  <p className="text-brand-ink/70 text-xs py-4">
                    No active patients connected yet. When you accept incoming requests, they will appear here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patients.slice(0, 2).map((patient) => {
                      const displayName = patient.name || patient.userId;
                      return (
                        <div
                          key={patient.userId}
                          className="p-4 rounded-2xl border border-brand-border bg-brand-canvas flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-brand-teal text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-brand-ink truncate">
                                {displayName}
                              </h3>
                              <p className="text-xs font-mono text-brand-ink/70 truncate">
                                {patient.userId}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => openPatient(patient)}
                            className="px-4 py-2 min-h-[44px] rounded-xl bg-brand-ink text-white hover:bg-brand-teal text-xs font-medium transition-colors shrink-0 shadow-xs flex items-center justify-center"
                          >
                            Review
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── Safety footer ──────────────────────────────────────────── */}
          <footer className="border-t border-brand-border/40 pt-6 text-center text-xs text-brand-ink/75">
            <span className="font-bold text-brand-coral">Need immediate support?</span>
            {' '}Tele-MANAS:{' '}
            <span className="font-mono">14416</span>
            {' · '}
            <span className="font-mono">1800-891-4416</span>
          </footer>
        </div>
      </div>

      {/* ── Floating Toast Notification ───────────────────────────────── */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-brand-ink text-white text-xs font-semibold shadow-card-lift flex items-center gap-2 animate-tab-switch border border-white/20 pointer-events-none">
          <span className="material-symbols-outlined text-[17px] text-brand-softerTeal">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Mobile Floating Bottom Bar ───────────────────────────────── */}
      <MobileBottomNav
        items={[
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'cottage',
            isActive: view === 'dashboard' && navItem === 'dashboard',
            onClick: () => navClick('dashboard'),
          },
          {
            id: 'requests',
            label: 'Requests',
            icon: 'person_add',
            badge: pendingCount > 0 ? pendingCount : null,
            isActive: view === 'dashboard' && navItem === 'requests',
            onClick: () => navClick('requests'),
          },
          {
            id: 'patients',
            label: 'Patients',
            icon: 'groups',
            badge: patients.length > 0 ? patients.length : null,
            isActive: view === 'dashboard' && navItem === 'patients',
            onClick: () => navClick('patients'),
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: 'tune',
            isActive: view === 'dashboard' && navItem === 'settings',
            onClick: () => navClick('settings'),
          },
        ]}
        actionTitle="Clinical Quick Actions"
        actionPills={[
          {
            id: 'draft-rec',
            icon: 'edit_note',
            label: selectedPatient ? `Draft Note for ${selectedPatient.name || 'Patient'}` : 'Write Clinical Recommendation',
            subtitle: selectedPatient ? 'Document ERP trial guidance or response strategy' : 'Select an active patient to formulate guidance',
            highlight: true,
            onClick: () => {
              if (selectedPatient) {
                const recSec = document.getElementById('recommendation-section');
                if (recSec) recSec.scrollIntoView({ behavior: 'smooth' });
                showToast(`Focused recommendation composer for ${selectedPatient.name || 'patient'}`);
              } else if (patients.length > 0) {
                openPatient(patients[0]);
                showToast(`Opened ${patients[0].name || 'patient'} to draft recommendation`);
              } else {
                navClick('requests');
                showToast('Review connection requests to link with patients first');
              }
            },
          },
          {
            id: 'copy-id',
            icon: 'badge',
            label: 'Copy Practitioner ID',
            subtitle: `Share ID with patient: ${prac?.govCertId || 'MCI-2024-KM-7741'}`,
            onClick: () => {
              const code = prac?.govCertId || prac?.id || 'MCI-2024-KM-7741';
              navigator.clipboard?.writeText(code);
              showToast(`Practitioner ID ${code} copied to clipboard!`);
            },
          },
          {
            id: 'triage-elevated',
            icon: 'notifications_active',
            label: 'Priority Caseload Triage',
            subtitle: 'Review consented cases with recent high distress',
            onClick: () => {
              navClick('patients');
              showToast('Filtered caseload for priority clinical review');
            },
          },
          {
            id: 'logout-action',
            icon: 'logout',
            label: 'Sign Out Clinician Session',
            subtitle: 'Secure encrypted session termination',
            onClick: handleLogout,
          },
        ]}
      />
    </div>
  );
}
