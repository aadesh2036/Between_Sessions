import React, { useState, useEffect, useRef } from 'react';
import { practiceApi } from '../services/api';

const SUDS_LABELS = {
  0: 'None', 1: 'Minimal', 2: 'Mild', 3: 'Mild+', 4: 'Moderate',
  5: 'Moderate', 6: 'High', 7: 'Significant', 8: 'Severe', 9: 'Extreme', 10: 'Peak',
};

const RESPONSE_OPTIONS = [
  { id: 'delay', label: 'Delay Compulsion', desc: 'Postponed ritual by 15–30+ minutes (Habit Extinction)', color: 'border-brand-amber text-brand-amber bg-brand-amberSoft' },
  { id: 'resist', label: 'Resist Entirely', desc: 'Did not perform the ritual at all', color: 'border-brand-teal text-brand-teal bg-brand-softerTeal' },
  { id: 'return', label: 'Return to Values', desc: 'Pivoted back to meaningful activity', color: 'border-brand-lavender text-brand-lavender bg-brand-lavenderSoft' },
  { id: 'compulsion', label: 'Gave in to Ritual', desc: 'Honest log — part of the learning journey', color: 'border-brand-coral text-brand-coral bg-brand-coralSoft' },
];

function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Soothing fundamental tone (528 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.8);

    // Harmonic bell overtone (660 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.08);
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 2.2);
  } catch {
    // Silent graceful degrade if browser restricts audio context
  }
}

export default function LogPracticeModal({
  userId,
  initialPlan,
  onClose,
  onSaved,
  initialStep = 1,
  initialResponseType = 'delay',
}) {
  const [step, setStep] = useState(initialStep); // 1: Setup & Pre-SUDS, 2: Response Prevention & Post-SUDS
  const [targetObsession, setTargetObsession] = useState(initialPlan?.targetObsession || initialPlan?.title || '');
  const [context, setContext] = useState('Home');
  const [preDistress, setPreDistress] = useState(7);
  const [responseType, setResponseType] = useState(initialResponseType || 'delay');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [postDistress, setPostDistress] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Delayed Ritual Active Countdown Timer State ─────────────────────────────
  const [timerMode, setTimerMode] = useState('live'); // 'live' | 'manual'
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(15 * 60);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const timerIntervalRef = useRef(null);

  const handleSelectDelayPreset = (mins) => {
    setDurationMinutes(mins);
    const secs = mins * 60;
    setTimerSecondsLeft(secs);
    setTimerTotalSeconds(secs);
    setIsTimerRunning(false);
    setTimerFinished(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            setTimerFinished(true);
            playCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    if (timerFinished) {
      const secs = durationMinutes * 60;
      setTimerSecondsLeft(secs);
      setTimerTotalSeconds(secs);
      setTimerFinished(false);
      setIsTimerRunning(true);
      return;
    }
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerFinished(false);
    const secs = durationMinutes * 60;
    setTimerSecondsLeft(secs);
    setTimerTotalSeconds(secs);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const addOneMinute = () => {
    setTimerSecondsLeft((prev) => prev + 60);
    setTimerTotalSeconds((prev) => prev + 60);
    setDurationMinutes((prev) => prev + 1);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent =
    timerTotalSeconds > 0
      ? Math.min(100, Math.max(0, ((timerTotalSeconds - timerSecondsLeft) / timerTotalSeconds) * 100))
      : 0;

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
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="practice-modal-title">
      <div className="bg-brand-paper border border-brand-border/70 rounded-3xl shadow-card-lift w-full max-w-lg p-6 sm:p-8 relative my-auto sm:my-8 animate-liquid-pop">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-brand-ink/70 hover:text-brand-ink hover:bg-brand-canvas transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2 text-brand-coral mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-coral"></span>
          <span className="text-xs font-bold uppercase tracking-widest">ERP Practice & Exposure</span>
        </div>

        <h2 id="practice-modal-title" className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium mb-1">
          {step === 1 ? 'Prepare Exposure Session' : 'Record Outcome & Response'}
        </h2>
        <p className="text-brand-ink/75 text-xs mb-6 leading-relaxed">
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
                <span className="font-bold text-brand-teal uppercase tracking-wider text-xs block mb-0.5">
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
              <div className="flex flex-wrap gap-2">
                {['Home', 'Work', 'Social', 'Transit'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContext(c)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center ${
                      context === c
                        ? 'bg-brand-ink text-white font-medium shadow-xs'
                        : 'bg-brand-canvas text-brand-ink/75 border border-brand-border hover:border-brand-ink/30'
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
                  {preDistress} <span className="text-xs text-brand-ink/75 font-sans ml-1">({SUDS_LABELS[preDistress]})</span>
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
              <div className="flex justify-between text-xs text-brand-ink/75 font-sans mt-1">
                <span><span className="font-mono font-semibold">0</span> (Calm)</span>
                <span><span className="font-mono font-semibold">5</span> (Moderate)</span>
                <span><span className="font-mono font-semibold">10</span> (Peak)</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap justify-end items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-brand-ink/75 hover:text-brand-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-sm flex items-center"
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

            {responseType === 'delay' ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-brand-amberSoft/70 border border-brand-amber/40 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-brand-amber text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[19px]">timer</span>
                    </span>
                    <div>
                      <span className="text-xs font-bold text-brand-ink uppercase tracking-wider block">
                        Delayed Ritual Timer
                      </span>
                      <span className="text-[11px] text-brand-ink/65 block">
                        Ride out the urge curve — tolerate discomfort without reassurance
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex rounded-lg bg-white/90 p-0.5 border border-brand-amber/30 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTimerMode('live')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        timerMode === 'live'
                          ? 'bg-brand-ink text-white font-medium shadow-xs'
                          : 'text-brand-ink/70 hover:text-brand-ink'
                      }`}
                    >
                      Live Timer
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerMode('manual')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        timerMode === 'manual'
                          ? 'bg-brand-ink text-white font-medium shadow-xs'
                          : 'text-brand-ink/70 hover:text-brand-ink'
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {timerMode === 'live' ? (
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-brand-ink/60 uppercase tracking-widest block mb-1.5">
                        Delay Interval Presets
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 30].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => handleSelectDelayPreset(mins)}
                            className={`px-3 py-1.5 rounded-xl text-xs transition-all font-mono ${
                              durationMinutes === mins
                                ? 'bg-brand-amber text-white font-bold shadow-xs'
                                : 'bg-white text-brand-ink/80 border border-brand-amber/30 hover:border-brand-amber'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-2xl bg-white border transition-all ${
                        isTimerRunning
                          ? 'border-brand-amber shadow-sm ring-2 ring-brand-amber/20'
                          : 'border-brand-amber/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              timerFinished
                                ? 'bg-clinical-success'
                                : isTimerRunning
                                ? 'bg-brand-amber animate-ping'
                                : 'bg-brand-ink/30'
                            }`}
                          ></span>
                          <span className="text-[11px] font-medium text-brand-ink/80">
                            {timerFinished
                              ? 'Delay Interval Complete — Observe settled distress'
                              : isTimerRunning
                              ? 'Delay in progress — breathe gently through the urge'
                              : 'Ready to start ritual postponement'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-brand-ink/60">
                          {Math.round(progressPercent)}% elapsed
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-brand-amberSoft rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-brand-amber transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink">
                          {formatTime(timerSecondsLeft)}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={toggleTimer}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                              timerFinished
                                ? 'bg-clinical-success hover:bg-emerald-700 text-white'
                                : isTimerRunning
                                ? 'bg-brand-amber text-white hover:bg-amber-600'
                                : 'bg-brand-ink hover:bg-brand-teal text-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {timerFinished ? 'replay' : isTimerRunning ? 'pause' : 'play_arrow'}
                            </span>
                            <span>
                              {timerFinished ? 'Repeat Delay' : isTimerRunning ? 'Pause' : 'Start Delay'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={resetTimer}
                            className="p-2 rounded-xl border border-brand-border bg-brand-canvas/70 text-brand-ink/60 hover:text-brand-ink hover:bg-white transition-colors"
                            title="Reset Timer"
                          >
                            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                          </button>

                          <button
                            type="button"
                            onClick={addOneMinute}
                            className="px-2.5 py-2 rounded-xl border border-brand-amber/40 bg-brand-amberSoft text-brand-amber text-xs font-mono font-medium hover:bg-brand-amber hover:text-white transition-colors"
                            title="Add 1 more minute of tolerance"
                          >
                            +1m
                          </button>
                        </div>
                      </div>

                      {timerFinished && (
                        <div className="mt-3 p-3 rounded-xl bg-brand-softSuccess border border-clinical-success/30 text-xs text-clinical-success flex items-center gap-2 animate-fade-in">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span>
                            <strong>Delay interval achieved!</strong> The urge reached its crest and began to soften. Notice that anxiety moves in waves without needing ritual action.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1.5">
                      Delayed Ritual Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="240"
                      value={durationMinutes}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        setDurationMinutes(val);
                        setTimerSecondsLeft(val * 60);
                        setTimerTotalSeconds(val * 60);
                      }}
                      className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas/60 text-brand-ink focus:outline-none focus:border-brand-teal"
                    />
                    <p className="text-[11px] text-brand-ink/50 mt-1">
                      Enter how many minutes you successfully postponed performing the compulsion.
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-brand-ink uppercase tracking-wider">
                      Post-Delay Distress (SUDS)
                    </label>
                    <span className="font-mono text-xl font-medium text-brand-teal">
                      {postDistress}{' '}
                      <span className="text-xs text-brand-ink/50 font-sans ml-1">
                        ({SUDS_LABELS[postDistress]})
                      </span>
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
            ) : (
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
                      {postDistress}{' '}
                      <span className="text-xs text-brand-ink/75 font-sans ml-1">
                        ({SUDS_LABELS[postDistress]})
                      </span>
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
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
                Qualitative Reflection <span className="text-brand-ink/75 font-normal lowercase">(What did you notice about your tolerance?)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Anxiety peaked for about 7 minutes, then settled. Discovered I could tolerate the doubt without checking."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas/60 text-brand-ink focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div className="pt-2 flex flex-wrap gap-2 justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={saving}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-brand-ink/75 hover:text-brand-ink transition-colors flex items-center"
              >
                ← Back
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-brand-ink/75 hover:text-brand-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center"
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
