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

  const handleFinish = async () => {
    try {
      completeOnboarding();
      navigate("/app");
    } catch (err) {
      console.error("Failed to complete onboarding", err);
    }
  };

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
          Step {step} of 4
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-2xl mx-auto w-full text-center">
        
        {step === 1 && (
          <div className="space-y-8 opacity-0 animate-fade-up">
            <span className="material-symbols-outlined text-[48px] text-brand-teal font-light">spa</span>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-ink font-normal leading-tight">
              Welcome to your <br/><span className="italic text-brand-teal">private sanctuary.</span>
            </h1>
            <p className="text-sm text-brand-ink/60 max-w-md mx-auto leading-relaxed font-medium">
              A quiet space to track patterns, delay urges, and build neuroplastic safety between therapy sessions. Zero shame. Zero pressure.
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
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">What would you like to work on?</h2>
              <p className="text-xs text-brand-ink/50 uppercase tracking-widest font-bold">Select all that apply</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
              {['Checking', 'Contamination', 'Intrusive thoughts', 'Reassurance seeking', 'Avoidance', 'Uncertainty', 'Perfectionism'].map(topic => {
                const isSelected = selections.focus.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleFocus(topic)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-brand-teal text-white shadow-md scale-105' 
                        : 'bg-white text-brand-ink/70 hover:bg-brand-softerTeal border border-brand-border/40'
                    }`}
                  >
                    {topic}
                  </button>
                )
              })}
            </div>

            <div className="pt-6">
              <button 
                onClick={() => setStep(3)}
                disabled={selections.focus.length === 0}
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
              <span className="material-symbols-outlined text-[32px] text-brand-lavender font-light">lock</span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal">Privacy is paramount.</h2>
              <p className="text-sm text-brand-ink/60 max-w-sm mx-auto leading-relaxed">
                You control what gets recorded. Your data is encrypted and stored strictly on-device by default.
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
                  <div className="text-sm font-bold text-brand-ink">My behavioral logs</div>
                  <div className="text-xs text-brand-ink/60 mt-1">Keep a private journal of triggers and responses.</div>
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
                  <div className="text-sm font-bold text-brand-ink">My progress trends</div>
                  <div className="text-xs text-brand-ink/60 mt-1">Track habituation velocity and urge decay over time.</div>
                </div>
              </label>
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
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
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

            <div className="pt-8">
              <button 
                onClick={handleFinish}
                className="group px-8 py-4 rounded-full bg-brand-ink text-white font-bold text-sm shadow-sanctuary hover:bg-brand-teal transition-all flex items-center gap-3 mx-auto"
              >
                <span>Enter Dashboard</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
