import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [selections, setSelections] = useState({
    focus: [],
    values: [],
    privacyLogs: true,
    privacyTrends: true
  });

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
    try {
      completeOnboarding();
      navigate("/app");
    } catch (err) {
      console.error("Failed to complete onboarding", err);
    }
  };

  const valuesOptions = [
    'Study / academics', 'Career', 'Family', 'Friendships', 
    'Relationships', 'Hobbies', 'Travel', 'Health', 
    'Creativity', 'Faith / spirituality', 'Everyday independence', 'Other'
  ];

  const focusOptions = [
    'Checking', 'Contamination', 'Reassurance seeking', 'Mental review',
    'Rumination', 'Avoidance', 'Counting / symmetry', 'Intrusive harm thoughts',
    'Relationship doubt', 'Health-related uncertainty', 'Moral / religious uncertainty',
    'Perfectionism', 'Responsibility', 'Other'
  ];

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink flex flex-col relative overflow-hidden font-sans">
      
      {/* Subtle Free Canvas Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-softerTeal/40 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-brand-coralSoft/40 blur-[100px]"></div>
      </div>

      <header className="p-6 relative z-10 flex justify-between items-center max-w-6xl mx-auto w-full opacity-0 animate-fade-in">
        <Logo />
        <span className="text-xs font-bold tracking-widest text-brand-teal uppercase">
          Step {step} of 5
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-4xl mx-auto w-full text-center">
        
        {step === 1 && (
          <div className="space-y-8 opacity-0 animate-fade-up">
            <span className="material-symbols-outlined text-[48px] text-brand-teal font-light">spa</span>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-ink font-normal leading-tight">
              Make more room <br/><span className="italic text-brand-teal">for life outside the OCD loop.</span>
            </h1>
            <p className="text-sm text-brand-ink/60 max-w-md mx-auto leading-relaxed font-medium">
              Between Sessions helps you understand patterns, practice evidence-informed behavioral strategies, and keep useful records for professional care. Not a diagnosis tool.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => setStep(2)}
                className="px-8 py-4 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors"
              >
                Begin Setup
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 opacity-0 animate-fade-up w-full">
            <div className="space-y-3">
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">What would you like more room for?</h2>
              <p className="text-xs text-brand-ink/50 uppercase tracking-widest font-bold">Select your values (choose as many as you like)</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {valuesOptions.map(val => {
                const isSelected = selections.values.includes(val);
                return (
                  <button
                    key={val}
                    onClick={() => toggleValue(val)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-brand-lavender text-white shadow-md scale-105 border border-brand-lavender' 
                        : 'bg-white text-brand-ink/70 hover:bg-brand-lavenderSoft border border-brand-border/40'
                    }`}
                  >
                    {val}
                  </button>
                )
              })}
            </div>

            <div className="pt-6">
              <button 
                onClick={() => setStep(3)}
                disabled={selections.values.length === 0}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 opacity-0 animate-fade-up w-full">
            <div className="space-y-3">
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">Common patterns</h2>
              <p className="text-xs text-brand-ink/50 uppercase tracking-widest font-bold">Select the patterns that catch you in a loop</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {focusOptions.map(topic => {
                const isSelected = selections.focus.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleFocus(topic)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-brand-teal text-white shadow-md scale-105 border border-brand-teal' 
                        : 'bg-white text-brand-ink/70 hover:bg-brand-softerTeal border border-brand-border/40'
                    }`}
                  >
                    {topic}
                  </button>
                )
              })}
            </div>

            <div className="pt-6 flex items-center justify-center gap-4">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-full text-brand-ink/60 font-bold text-sm hover:bg-white transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                disabled={selections.focus.length === 0}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 opacity-0 animate-fade-up w-full">
            <div className="space-y-3">
              <span className="material-symbols-outlined text-[32px] text-brand-lavender font-light">lock</span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">Privacy is paramount.</h2>
              <p className="text-sm text-brand-ink/60 max-w-sm mx-auto leading-relaxed">
                You control what gets shared. Your data is strictly permission-based.
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto text-left">
              <label className="flex items-start gap-4 p-5 rounded-3xl bg-white border border-brand-border/40 shadow-sm cursor-pointer hover:border-brand-teal transition-colors">
                <input 
                  type="checkbox" 
                  checked={selections.privacyLogs}
                  onChange={e => setSelections(prev => ({...prev, privacyLogs: e.target.checked}))}
                  className="mt-1 w-5 h-5 rounded text-brand-teal focus:ring-brand-teal border-brand-border" 
                />
                <div>
                  <div className="text-sm font-bold text-brand-ink">Behavioral practice history</div>
                  <div className="text-xs text-brand-ink/60 mt-1">Keep a private journal of triggers and ERP responses.</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-5 rounded-3xl bg-white border border-brand-border/40 shadow-sm cursor-pointer hover:border-brand-teal transition-colors">
                <input 
                  type="checkbox" 
                  checked={selections.privacyTrends}
                  onChange={e => setSelections(prev => ({...prev, privacyTrends: e.target.checked}))}
                  className="mt-1 w-5 h-5 rounded text-brand-teal focus:ring-brand-teal border-brand-border" 
                />
                <div>
                  <div className="text-sm font-bold text-brand-ink">Progress & Functional info</div>
                  <div className="text-xs text-brand-ink/60 mt-1">Track functional impact and how values are restored.</div>
                </div>
              </label>
            </div>

            <div className="pt-6 flex items-center justify-center gap-4">
              <button 
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-full text-brand-ink/60 font-bold text-sm hover:bg-white transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(5)}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 opacity-0 animate-fade-up">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-brand-softerTeal animate-ping opacity-50" style={{ animationDuration: '3s' }}></div>
              <div className="relative w-16 h-16 rounded-full bg-brand-teal flex items-center justify-center text-white shadow-sanctuary animate-pulse" style={{ animationDuration: '2s' }}>
                <span className="material-symbols-outlined text-[32px]">check</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal">
                Your sanctuary is ready.
              </h1>
              <p className="text-sm text-brand-ink/60 max-w-sm mx-auto">
                No rush, no streaks, no judgment.
              </p>
            </div>

            <div className="pt-8 flex flex-col items-center gap-3">
              <button 
                onClick={handleFinish}
                className="group px-8 py-4 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-all flex items-center gap-3 mx-auto"
              >
                <span>Enter Dashboard</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <div className="text-[10px] text-brand-ink/40 max-w-xs leading-relaxed">
                This is a self-management and care-continuity tool. It is not a diagnosis service or emergency service. In India, contact Tele-MANAS at 14416.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
