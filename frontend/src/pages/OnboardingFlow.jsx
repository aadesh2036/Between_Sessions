import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.onboardingComplete) {
      navigate('/app', { replace: true });
    }
  }, [user?.onboardingComplete, navigate]);

  const [selections, setSelections] = useState({
    supportStatus: '',
    values: [],
    focus: [],
    privacyLogs: true,
    privacyEvents: true,
    privacyTrends: true,
    privacySharing: false,
  });

  const supportStatusOptions = [
    { id: 'working_with_pro', label: 'Currently working with a professional', desc: 'I have an existing therapist or psychiatrist' },
    { id: 'worked_before', label: 'Worked with one before', desc: 'Looking for between-session continuity and maintenance' },
    { id: 'considering', label: 'Considering professional support', desc: 'Preparing notes and tracking patterns first' },
    { id: 'learning', label: 'Learning about OCD & ERP', desc: 'Understanding loops and evidence-based strategies' },
    { id: 'unsure', label: 'Unsure / exploring', desc: 'Taking it one day at a time' },
  ];

  const valuesOptions = [
    'Study / academics', 'Career', 'Family', 'Friendships',
    'Relationships', 'Hobbies', 'Travel', 'Health',
    'Creativity', 'Faith / spirituality', 'Everyday independence', 'Personal growth'
  ];

  const focusOptions = [
    'Checking', 'Contamination / washing', 'Reassurance seeking', 'Mental review',
    'Rumination', 'Avoidance', 'Counting / symmetry', 'Intrusive harm thoughts',
    'Relationship doubt', 'Health-related uncertainty', 'Moral / religious uncertainty',
    'Perfectionism', 'Responsibility', 'Other'
  ];

  const toggleFocus = (topic) => {
    setSelections(prev => ({
      ...prev,
      focus: prev.focus.includes(topic)
        ? prev.focus.filter(t => t !== topic)
        : [...prev.focus, topic]
    }));
  };

  const toggleValue = (val) => {
    setSelections(prev => ({
      ...prev,
      values: prev.values.includes(val)
        ? prev.values.filter(v => v !== val)
        : [...prev.values, val]
    }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        values: selections.values,
        focusPatterns: selections.focus,
        supportStatus: selections.supportStatus,
        preferences: {
          privacyLogs: selections.privacyLogs,
          privacyEvents: selections.privacyEvents,
          privacyTrends: selections.privacyTrends,
          privacySharing: selections.privacySharing,
        },
      });
      navigate('/app', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding', err);
      navigate('/app', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink flex flex-col relative overflow-hidden font-sans">
      {/* Subtle Free Canvas Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-softerTeal/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-brand-coralSoft/40 blur-[100px]" />
      </div>

      <header className="p-6 relative z-10 flex justify-between items-center max-w-6xl mx-auto w-full animate-fade-in">
        <Logo />
        <span className="text-xs font-bold tracking-widest text-brand-teal uppercase">
          Step {step} of 6
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-4xl mx-auto w-full text-center">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-up">
            <div className="w-14 h-14 mx-auto rounded-full bg-brand-softerTeal flex items-center justify-center text-brand-teal shadow-sm">
              <span className="material-symbols-outlined text-[32px] font-light">spa</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-ink font-normal leading-tight">
              Make more room <br />
              <span className="italic text-brand-teal">for life outside the OCD loop.</span>
            </h1>
            <p className="text-sm text-brand-ink/70 max-w-md mx-auto leading-relaxed font-normal">
              Between Sessions helps you notice patterns, practice structured behavioral strategies, and keep objective records for professional care. Not medical advice or emergency response.
            </p>
            <div className="pt-6">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors"
              >
                Begin Setup
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Support Status */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-up w-full max-w-xl">
            <div className="space-y-2">
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">Where are you in your care journey?</h2>
              <p className="text-xs text-brand-ink/50 uppercase tracking-widest font-bold">Select the option that best matches right now</p>
            </div>

            <div className="space-y-3 text-left">
              {supportStatusOptions.map(opt => {
                const isSelected = selections.supportStatus === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelections(prev => ({ ...prev, supportStatus: opt.id }))}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-brand-softerTeal border-brand-teal shadow-sm'
                        : 'bg-white border-brand-border/60 hover:border-brand-teal/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-brand-teal bg-brand-teal text-white' : 'border-brand-border'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-brand-ink">{opt.label}</div>
                      <div className="text-xs text-brand-ink/60 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full text-brand-ink/60 font-bold text-sm hover:bg-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selections.supportStatus}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Values */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-up w-full">
            <div className="space-y-2">
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">What would you like more room for?</h2>
              <p className="text-xs text-brand-ink/50 uppercase tracking-widest font-bold">Select your values as your compass</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
              {valuesOptions.map(val => {
                const isSelected = selections.values.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleValue(val)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-brand-lavender text-white shadow-sm scale-105 border border-brand-lavender'
                        : 'bg-white text-brand-ink/70 hover:bg-brand-lavenderSoft border border-brand-border/60'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full text-brand-ink/60 font-bold text-sm hover:bg-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={selections.values.length === 0}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Behavioral Patterns */}
        {step === 4 && (
          <div className="space-y-8 animate-fade-up w-full">
            <div className="space-y-2">
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">Common behavioral patterns</h2>
              <p className="text-xs text-brand-ink/50 uppercase tracking-widest font-bold">These are behavioral categories, not diagnoses</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {focusOptions.map(topic => {
                const isSelected = selections.focus.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleFocus(topic)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-brand-teal text-white shadow-sm scale-105 border border-brand-teal'
                        : 'bg-white text-brand-ink/70 hover:bg-brand-softerTeal border border-brand-border/60'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-full text-brand-ink/60 font-bold text-sm hover:bg-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={selections.focus.length === 0}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Privacy Controls */}
        {step === 5 && (
          <div className="space-y-8 animate-fade-up w-full max-w-xl">
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-brand-lavenderSoft flex items-center justify-center text-brand-lavender">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">Granular privacy controls</h2>
              <p className="text-sm text-brand-ink/60 leading-relaxed max-w-md mx-auto">
                You control what gets recorded and shared. Separate permissions for each category.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <label className="flex items-start gap-4 p-4 rounded-xl bg-white border border-brand-border/60 shadow-sm cursor-pointer hover:border-brand-teal transition-colors">
                <input
                  type="checkbox"
                  checked={selections.privacyLogs}
                  onChange={e => setSelections(prev => ({ ...prev, privacyLogs: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-brand-border"
                />
                <div>
                  <div className="text-sm font-semibold text-brand-ink">Practice history</div>
                  <div className="text-xs text-brand-ink/60 mt-0.5">Keep a structured log of response prevention exercises and delay attempts.</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-xl bg-white border border-brand-border/60 shadow-sm cursor-pointer hover:border-brand-teal transition-colors">
                <input
                  type="checkbox"
                  checked={selections.privacyEvents}
                  onChange={e => setSelections(prev => ({ ...prev, privacyEvents: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-brand-border"
                />
                <div>
                  <div className="text-sm font-semibold text-brand-ink">Behavioral event logging</div>
                  <div className="text-xs text-brand-ink/60 mt-0.5">Quickly log triggers, urge levels, and the response you chose.</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-xl bg-white border border-brand-border/60 shadow-sm cursor-pointer hover:border-brand-teal transition-colors">
                <input
                  type="checkbox"
                  checked={selections.privacyTrends}
                  onChange={e => setSelections(prev => ({ ...prev, privacyTrends: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-brand-border"
                />
                <div>
                  <div className="text-sm font-semibold text-brand-ink">Functional impact & trends</div>
                  <div className="text-xs text-brand-ink/60 mt-0.5">Observe patterns across days and see time restored for values.</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-xl bg-white border border-brand-border/60 shadow-sm cursor-pointer hover:border-brand-teal transition-colors">
                <input
                  type="checkbox"
                  checked={selections.privacySharing}
                  onChange={e => setSelections(prev => ({ ...prev, privacySharing: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-brand-border"
                />
                <div>
                  <div className="text-sm font-semibold text-brand-ink">Practitioner sharing readiness</div>
                  <div className="text-xs text-brand-ink/60 mt-0.5">Enable consent-based sharing with verified clinicians when you connect.</div>
                </div>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-full text-brand-ink/60 font-bold text-sm hover:bg-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors"
              >
                Confirm Preferences
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Sanctuary Ready */}
        {step === 6 && (
          <div className="space-y-8 animate-fade-up max-w-md">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-brand-softerTeal animate-ping opacity-40" style={{ animationDuration: '3s' }} />
              <div className="relative w-14 h-14 rounded-full bg-brand-teal flex items-center justify-center text-white shadow-sanctuary">
                <span className="material-symbols-outlined text-[28px]">check</span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal">
                Your sanctuary is ready.
              </h1>
              <p className="text-sm text-brand-ink/60 leading-relaxed">
                No rush, no streaks, no judgment. Practice responding differently and return to what matters.
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-3">
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="group px-8 py-3.5 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-all flex items-center gap-3 mx-auto disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Entering Sanctuary…' : 'Enter Dashboard'}</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <div className="text-[11px] text-brand-ink/40 max-w-xs leading-relaxed">
                Between Sessions is a self-guided practice and continuity tool. In an emergency or acute distress, contact Tele-MANAS at <span className="font-mono font-semibold text-brand-coral">14416</span> (India).
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
