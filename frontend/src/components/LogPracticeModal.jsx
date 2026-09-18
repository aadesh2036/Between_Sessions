import React, { useState } from 'react';
import { practiceApi } from '../services/api';

const SUDS_LABELS = {
  0: 'None', 1: 'Minimal', 2: 'Mild', 3: 'Mild+', 4: 'Moderate',
  5: 'Moderate', 6: 'High', 7: 'Significant', 8: 'Severe', 9: 'Extreme', 10: 'Peak',
};

const RESPONSE_OPTIONS = [
  { id: 'delay', label: 'Delay Compulsion', desc: 'Postponed ritual by 15–30+ minutes', color: 'border-brand-amber text-brand-amber bg-brand-amberSoft' },
  { id: 'resist', label: 'Resist Entirely', desc: 'Did not perform the ritual at all', color: 'border-brand-teal text-brand-teal bg-brand-softerTeal' },
  { id: 'return', label: 'Return to Values', desc: 'Pivoted back to meaningful activity', color: 'border-brand-lavender text-brand-lavender bg-brand-lavenderSoft' },
  { id: 'compulsion', label: 'Gave in to Ritual', desc: 'Honest log — part of the learning journey', color: 'border-brand-coral text-brand-coral bg-brand-coralSoft' },
];

export default function LogPracticeModal({ userId, initialPlan, onClose, onSaved }) {
  const [step, setStep] = useState(1); // 1: Setup & Pre-SUDS, 2: Response Prevention & Post-SUDS
  const [targetObsession, setTargetObsession] = useState(initialPlan?.targetObsession || initialPlan?.title || '');
  const [context, setContext] = useState('Home');
  const [preDistress, setPreDistress] = useState(7);
  const [responseType, setResponseType] = useState('delay');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [postDistress, setPostDistress] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await practiceApi.create({
        userId,
        exerciseId: initialPlan?.id || 'erp-exposure-session',
        practicePlanId: initialPlan?.id || null,
        targetObsession: targetObsession.trim() || 'Unspecified Trigger',
        context,
        responseType,
        preDistress,
        postDistress,
        durationSeconds: durationMinutes * 60,
        notes: notes.trim() || undefined,
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record practice session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in p-4 overflow-y-auto">
      <div className="bg-brand-paper border border-brand-border/70 rounded-3xl shadow-card-lift w-full max-w-lg p-6 sm:p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-brand-ink/40 hover:text-brand-ink transition-colors p-1"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2 text-brand-coral mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-coral"></span>
          <span className="text-xs font-bold uppercase tracking-widest">ERP Practice & Exposure</span>
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium mb-1">
          {step === 1 ? 'Prepare Exposure Session' : 'Record Outcome & Response'}
        </h2>
        <p className="text-brand-ink/60 text-xs mb-6 leading-relaxed">
          {step === 1
            ? 'Anchor in the trigger, acknowledge the intrusive doubt, and observe pre-exposure distress.'
            : 'Observe how distress settled and record your response prevention choice.'}
        </p>

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-brand-coralSoft border border-brand-coral/30 text-brand-coral text-xs">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {initialPlan && (
              <div className="p-3.5 rounded-2xl bg-brand-softerTeal/60 border border-brand-teal/20 text-xs">
                <span className="font-bold text-brand-teal uppercase tracking-wider text-[10px] block mb-0.5">
                  {initialPlan.type === 'clinician-assigned' ? 'Clinician-Assigned Guideline' : 'Practice Plan'}
                </span>
                <p className="font-medium text-brand-ink">{initialPlan.title}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
                Trigger or Target Obsession
              </label>
              <input
                type="text"
                value={targetObsession}
                onChange={(e) => setTargetObsession(e.target.value)}
                placeholder="e.g. Touching kitchen doorknob, sending email without triple-checking"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas/60 text-brand-ink focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
                Environment / Context
              </label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Social', 'Transit'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContext(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs transition-colors ${
                      context === c
                        ? 'bg-brand-ink text-white font-medium shadow-xs'
                        : 'bg-brand-canvas text-brand-ink/70 border border-brand-border hover:border-brand-ink/30'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-brand-ink uppercase tracking-wider">
                  Initial Distress (Pre-Exposure SUDS)
                </label>
                <span className="font-mono text-xl font-medium text-brand-coral">
                  {preDistress} <span className="text-xs text-brand-ink/50 font-sans ml-1">({SUDS_LABELS[preDistress]})</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={preDistress}
                onChange={(e) => setPreDistress(Number(e.target.value))}
                className="w-full h-2 bg-brand-canvas rounded-full appearance-none cursor-pointer accent-brand-coral"
              />
              <div className="flex justify-between text-[10px] text-brand-ink/40 font-mono mt-1">
                <span>0 (Calm)</span>
                <span>5 (Moderate)</span>
                <span>10 (Peak)</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-brand-ink/60 hover:text-brand-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-sm"
              >
                Continue to Response Prevention →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
                Response Prevention Choice
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {RESPONSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setResponseType(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      responseType === opt.id
                        ? `${opt.color} ring-1 ring-current font-medium shadow-xs`
                        : 'border-brand-border/70 bg-brand-paper hover:bg-brand-canvas text-brand-ink/70'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[11px] opacity-75 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas/60 text-brand-ink focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-brand-ink uppercase tracking-wider">
                    Post-Exposure SUDS
                  </label>
                  <span className="font-mono text-xl font-medium text-brand-teal">
                    {postDistress} <span className="text-xs text-brand-ink/50 font-sans ml-1">({SUDS_LABELS[postDistress]})</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={postDistress}
                  onChange={(e) => setPostDistress(Number(e.target.value))}
                  className="w-full h-2 bg-brand-canvas rounded-full appearance-none cursor-pointer accent-brand-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
                Qualitative Reflection <span className="text-brand-ink/40 font-normal lowercase">(What did you notice about your tolerance?)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Anxiety peaked for about 7 minutes, then settled. Discovered I could tolerate the doubt without checking."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas/60 text-brand-ink focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={saving}
                className="px-3.5 py-2 text-xs font-medium text-brand-ink/60 hover:text-brand-ink transition-colors"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-brand-ink/60 hover:text-brand-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Logging...' : 'Save Exposure Practice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
