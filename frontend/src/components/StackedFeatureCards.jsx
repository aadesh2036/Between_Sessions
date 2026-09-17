import React, { useState, useEffect, useRef } from 'react';

export default function StackedFeatureCards() {
  const [activeCard, setActiveCard] = useState(0);
  const [sudsRating, setSudsRating] = useState(6);
  const [consentStates, setConsentStates] = useState({
    checkins: true,
    practice: true,
    journal: false
  });
  const containerRef = useRef(null);
  const stickyRef = useRef(null);

  // Scroll listener to smoothly peel off cards one by one
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const stickyRect = stickyRef.current.getBoundingClientRect();
      
      // Calculate how far the parent section has scrolled past the pinning point
      const scrolled = Math.max(0, stickyRect.top - rect.top);
      const scrollableDist = rect.height - stickyRect.height;
      
      if (scrollableDist <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

      // Balanced thresholds with generous reading zones
      if (progress < 0.20) {
        if (activeCard !== 0) setActiveCard(0);
      } else if (progress < 0.60) {
        if (activeCard !== 1) setActiveCard(1);
      } else {
        if (activeCard !== 2) setActiveCard(2);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCard]);

  const sudsDescriptions = {
    1: "Minimal awareness. Calm and baseline stability.",
    2: "Slight awareness of intrusive thoughts; easily dismissed.",
    3: "Mild discomfort. Able to redirect attention with ease.",
    4: "Noticeable urge. Starting response prevention delay protocol.",
    5: "Moderate friction. Practicing slow vagus exhalations.",
    6: "Moderate distress. Intrusive urge present; delaying compulsion by 5 minutes.",
    7: "Elevated discomfort. Urge surfing wave in progress; tactile stone active.",
    8: "High distress. Strong visceral compulsion pull; resisting ritual engagement.",
    9: "Severe anxiety spike. Somatic grounding lock active; safe space breathing.",
    10: "Peak panic. Immediate vagus pacing active. Tele-MANAS support accessible."
  };

  const handleConsentToggle = (key) => {
    setConsentStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCardClick = (idx) => {
    if (idx === 0 && activeCard === 0) setActiveCard(1);
    else if (idx === 1 && activeCard === 1) setActiveCard(2);
    else if (idx === 2 && activeCard === 2) setActiveCard(0);
    else setActiveCard(idx);
  };

  return (
    <section ref={containerRef} id="architecture" className="relative min-h-[380vh] sm:min-h-[420vh] py-10 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 1. Section Header: Sits naturally in document flow so it introduces the section and scrolls away */}
      <div className="w-full max-w-6xl mx-auto mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coralSoft text-brand-coral text-xs font-sans font-bold uppercase tracking-widest mb-3">
          Between-Session Continuity Architecture
        </div>
        <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-brand-ink font-normal tracking-tight">
          One continuous bridge. Three dedicated layers.
        </h2>
        <p className="text-sm sm:text-base text-brand-ink/75 mt-3 max-w-2xl leading-relaxed">
          Scroll down to peel off each structural layer of the platform, or use the interactive tabs to jump between views.
        </p>
      </div>

      {/* 2. Sticky Stage: Pins neatly below the floating navbar with zero overlap */}
      <div 
        ref={stickyRef} 
        className="sticky top-[68px] sm:top-[84px] w-full max-w-6xl mx-auto z-10"
      >
        {/* Compact Stepper & Layer Controller Bar (Fully Responsive) */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 bg-white/95 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-brand-border shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-sans font-bold text-brand-ink truncate">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse shrink-0"></span>
            <span className="text-brand-ink/60 font-normal hidden md:inline">Active:</span>
            <span className="text-brand-teal truncate">
              {activeCard === 0 && "01 • Personal"}
              {activeCard === 1 && "02 • Clinician"}
              {activeCard === 2 && "03 • Consent & AI"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {[
              { id: '01', label: 'Personal' },
              { id: '02', label: 'Clinician' },
              { id: '03', label: 'Consent & AI' }
            ].map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveCard(idx)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-sans font-bold transition-all ${
                  activeCard === idx
                    ? 'bg-brand-ink text-white shadow-sm'
                    : 'text-brand-ink/60 hover:text-brand-ink hover:bg-brand-sand'
                }`}
              >
                <span className="font-mono">({tab.id})</span> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Stack Stage (Calibrated to 580px height to guarantee 100% visibility on all laptop viewports) */}
        <div className="card-stack-stage relative w-full h-[560px] sm:h-[580px] lg:h-[600px]">
          
          {/* ================= CARD 01: PERSONAL SANCTUARY ================= */}
          <article
            onClick={() => handleCardClick(0)}
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl flex flex-col justify-between overflow-y-auto lg:overflow-hidden custom-scrollbar cursor-pointer bg-brand-ink ${
              activeCard === 0
                ? 'card-peel-active'
                : activeCard > 0
                ? 'card-peel-up'
                : 'card-peel-next-1'
            }`}
            style={{
              boxShadow: '0 25px 60px -15px rgba(23, 50, 58, 0.4)'
            }}
          >
            {/* Top Row: Title & Badge */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 sm:pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-sans font-bold bg-brand-coral/10 text-brand-coral px-3 py-0.5 rounded-full uppercase tracking-widest">
                    LAYER 01 • FOR INDIVIDUALS
                  </span>
                  <span className="text-xs text-white/60 font-sans font-medium tracking-wide hidden sm:inline">
                    Zero Shame • Non-Stigmatizing
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl lg:text-[32px] text-white font-normal leading-snug">
                  Tame the loops with gentle daily micro-practices
                </h3>
              </div>
              <span className="font-mono text-2xl sm:text-3xl font-bold opacity-80 shrink-0 text-brand-teal/70">(01)</span>
            </div>

            {/* Middle: Integrated Personal Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch my-2 sm:my-3 flex-grow min-h-0">
              {/* Left Column: Context & Testimonial */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-3 bg-white/5 rounded-lg p-4 sm:p-5 border border-white/10">
                <div>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
                    Living with intrusive thoughts isn't a lack of willpower — it's an overprotective alarm loop. Between Sessions gives you structured, tactile tools to observe without judgment.
                  </p>
                  <div className="mt-3 p-3 bg-white/5 rounded-md border border-white/5 text-xs italic font-editorial text-white/90 leading-relaxed">
                    "The 90-second urge wave gave me something tangible to focus on when my compulsions peaked at work."
                    <div className="flex items-center gap-2 mt-2 not-italic font-sans text-[11px] text-white/70">
                      <div className="w-5 h-5 rounded-full bg-brand-coral text-white flex items-center justify-center font-bold text-[9px]">AK</div>
                      <span>Alex K. • Navigating OCD</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans font-bold tracking-wide text-emerald-300 bg-emerald-950/40 px-3 py-2 rounded border border-emerald-500/30">
                  <span>Practice Consistency</span>
                  <span>14 Days Active ✓</span>
                </div>
              </div>

              {/* Right Column: 4 Interactive Modules */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* 1. 90-Second Urge Surfer */}
                <div className="bg-black/20 rounded-lg p-3.5 sm:p-4 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-brand-coral uppercase tracking-widest">
                      90-SECOND URGE SURFER
                    </span>
                    <span className="w-2 h-2 rounded-full bg-brand-coral pulse-indicator" />
                  </div>
                  <div className="py-1.5">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-white/70 font-sans font-medium">Visceral Urge Crest</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-brand-coral">01:14 remaining</span>
                    </div>
                    <div className="h-11 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 45" fill="none">
                        <path d="M 0 35 Q 30 35 60 25 T 110 8 T 160 30 T 200 35" stroke="#E8856C" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="110" cy="8" r="3.5" fill="#E8856C" className="anim-wave-surf" />
                        <circle cx="110" cy="8" r="8" fill="#E8856C" opacity="0.3" className="anim-wave-surf" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-medium text-white/60 pt-2 border-t border-white/10">
                    <span>Tactile haptics active</span>
                    <button className="bg-brand-coral/20 text-brand-coral px-2.5 py-0.5 rounded-full hover:bg-brand-coral hover:text-white transition-colors text-[10px]">
                      Pause Spike
                    </button>
                  </div>
                </div>

                {/* 2. Digital Worry Stone */}
                <div className="bg-black/20 rounded-lg p-3.5 sm:p-4 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-brand-teal uppercase tracking-widest">
                      DIGITAL WORRY STONE
                    </span>
                    <span className="text-[10px] font-sans font-semibold text-white/60 uppercase tracking-widest">4-7-8 Rhythm</span>
                  </div>
                  <div className="flex items-center gap-3.5 py-1.5">
                    <div className="w-12 h-12 rounded-full bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-brand-teal/40 anim-vagus-breathe"></div>
                      <span className="absolute text-[8px] font-sans text-white font-bold tracking-widest">EXHALE</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-semibold text-white">Parasympathetic Reset</p>
                      <p className="text-[11px] text-white/70 leading-snug">
                        Tactile thumb contact paces autonomic arousal down.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-medium text-brand-teal pt-2 border-t border-white/10">
                    <span>Tactile Frequency</span>
                    <span className="font-bold">0.1 Hz Pacing</span>
                  </div>
                </div>

                {/* 3. Calibrated SUDS Distress Scale */}
                <div className="bg-black/20 rounded-lg p-3.5 sm:p-4 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-sans font-bold text-brand-amber uppercase tracking-widest">
                      CALIBRATED CHECK-IN
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-amber bg-brand-amber/20 px-2.5 py-0.5 rounded-full">
                      SUDS {sudsRating} / 10
                    </span>
                  </div>
                  <div className="py-1">
                    <p className="text-[11px] text-white/80 font-sans mb-2 h-6 truncate">
                      {sudsDescriptions[sudsRating]}
                    </p>
                    <div className="grid grid-cols-10 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <button
                          key={num}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSudsRating(num);
                          }}
                          className={`h-6 rounded text-[10px] font-sans font-bold transition-all ${
                            sudsRating === num
                              ? 'bg-brand-amber text-brand-ink scale-105'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-semibold text-white/60 uppercase tracking-widest pt-2 border-t border-white/10">
                    <span>0 = Tranquil</span>
                    <span>10 = Severe Panic</span>
                  </div>
                </div>

                {/* 4. Habit Reversal Delay */}
                <div className="bg-black/20 rounded-lg p-3.5 sm:p-4 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-brand-lavender uppercase tracking-widest">
                      HABIT EXTINCTION DELAY
                    </span>
                    <span className="text-[10px] font-sans font-bold text-brand-lavender bg-brand-lavender/20 px-2 py-0.5 rounded-full">
                      Active Delay
                    </span>
                  </div>
                  <div className="py-1.5">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-white/70">Response Delay Window</span>
                      <span className="text-sm font-mono font-bold text-white">08m 42s</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-lavender h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <p className="text-[11px] text-white/60 mt-2 leading-snug truncate">
                      Ritual urge peak surpassed without performing compulsion.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-bold text-brand-lavender pt-2 border-t border-white/10">
                    <span>Response Prevention</span>
                    <span className="font-bold text-emerald-400">Engaged ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs font-sans font-medium text-white/70">
              <span>Evidence-based ERP Framework • Private Encrypted Storage • Zero Behavioral Scoring</span>
              <span className="text-brand-coral font-bold hover:underline">Click card or scroll to reveal Clinician Layer →</span>
            </div>
          </article>

          {/* ================= CARD 02: CLINICIAN CONTINUITY TERMINAL ================= */}
          <article
            onClick={() => handleCardClick(1)}
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl flex flex-col justify-between overflow-y-auto lg:overflow-hidden custom-scrollbar cursor-pointer bg-brand-teal ${
              activeCard === 1
                ? 'card-peel-active'
                : activeCard > 1
                ? 'card-peel-up'
                : 'card-peel-next-1'
            }`}
            style={{
              boxShadow: '0 25px 60px -15px rgba(23, 107, 103, 0.4)'
            }}
          >
            {/* Top Row: Title & Badge */}
            <div className="flex items-start justify-between gap-4 border-b border-white/20 pb-3 sm:pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-sans font-bold bg-white/20 text-white px-3 py-0.5 rounded-full uppercase tracking-widest">
                    LAYER 02 • FOR PRACTITIONERS & CLINICIANS
                  </span>
                  <span className="text-xs text-teal-100 font-sans font-medium tracking-wide hidden sm:inline">
                    Zero Recall Bias • Consented Telemetry
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl lg:text-[32px] text-white font-normal leading-snug">
                  Objective longitudinal visibility between clinical sessions
                </h3>
              </div>
              <span className="font-mono text-2xl sm:text-3xl font-bold opacity-80 shrink-0 text-white/50">(02)</span>
            </div>

            {/* Middle: Clinician Cockpit Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch my-2 sm:my-3 flex-grow min-h-0">
              {/* Left Column: Practitioner Note */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-3 bg-black/10 rounded-lg p-4 sm:p-5 border border-white/20">
                <div>
                  <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-sans">
                    Therapy happens in a 50-minute appointment; compulsions peak during the remaining 167 hours. Eliminate retrospective memory amnesia with consented behavioral timeline curves.
                  </p>
                  <div className="mt-3 p-3 bg-white/10 rounded-md border border-white/10 text-xs italic font-editorial text-white leading-relaxed">
                    "Seeing the exact 12:00 diurnal urge spike allowed us to adjust the client's midday ERP homework with clinical accuracy."
                    <div className="flex items-center gap-2 mt-2 not-italic font-sans text-[11px] text-white/80">
                      <div className="w-5 h-5 rounded-full bg-brand-ink text-white flex items-center justify-center font-bold text-[9px]">DC</div>
                      <span>Dr. Chen, PsyD • Certified ERP Specialist</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans font-medium text-white bg-white/10 px-3 py-2 rounded border border-white/20">
                  <span>Clinical Action</span>
                  <span className="font-bold">3 Patients Ready for Review</span>
                </div>
              </div>

              {/* Right Column: 4 Clinician Telemetry Modules */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* 1. Diurnal Urge Surge */}
                <div className="bg-black/10 rounded-lg p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-teal-100 uppercase tracking-widest">
                      DIURNAL URGE SURGE
                    </span>
                    <span className="text-[10px] font-sans font-bold text-brand-ink bg-brand-amber px-2 py-0.5 rounded-full">
                      12:00 Surge Apex
                    </span>
                  </div>
                  <div className="py-1.5">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-white/80 font-sans font-medium">Telemetry Spline</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-white">Peak: 8.4 SUDS</span>
                    </div>
                    <div className="h-11 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 45" fill="none">
                        <path d="M 0 38 Q 25 36 50 32 T 100 10 T 150 25 T 200 38" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="100" y1="10" x2="100" y2="42" stroke="#D4943A" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx="100" cy="10" r="3.5" fill="#D4943A" className="anim-spline-pulse" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-medium text-teal-100 pt-2 border-t border-white/20">
                    <span>06:00 Morning</span>
                    <span>12:00 Peak Urge</span>
                    <span>22:00 Night</span>
                  </div>
                </div>

                {/* 2. Consented Patient Radar */}
                <div className="bg-black/10 rounded-lg p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-teal-100 uppercase tracking-widest">
                      CONSENTED TELEMETRY
                    </span>
                    <span className="text-[10px] font-sans font-bold text-emerald-900 bg-emerald-400 px-2 py-0.5 rounded-full">
                      08:12 Sync
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5 py-1.5">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/30 flex items-center justify-center relative shrink-0">
                      <div className="w-9 h-9 rounded-full border border-white/50 anim-radar-ping absolute"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-semibold text-white">Consented Node Sync</p>
                      <p className="text-[11px] text-white/80 leading-snug">
                        Client authorized distress aggregates & practice durations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-medium text-teal-100 pt-2 border-t border-white/20">
                    <span>Node State</span>
                    <span className="font-bold text-emerald-300">Consented Active</span>
                  </div>
                </div>

                {/* 3. Cohort Triage */}
                <div className="bg-black/10 rounded-lg p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-sans font-bold text-teal-100 uppercase tracking-widest">
                      COHORT STABILITY TRIAGE
                    </span>
                    <span className="text-xs font-sans font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
                      18 Clients
                    </span>
                  </div>
                  <div className="space-y-1.5 py-1">
                    <div>
                      <div className="flex justify-between text-[10px] font-sans font-medium text-white/90 mb-0.5">
                        <span>Low (SUDS 1-3)</span>
                        <span className="font-bold text-emerald-300">11 (61%)</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '61%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-sans font-medium text-white/90 mb-0.5">
                        <span>Moderate (SUDS 4-7)</span>
                        <span className="font-bold text-brand-amber">5 (28%)</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand-amber h-full rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-sans font-medium text-white/90 mb-0.5">
                        <span>Elevated (SUDS 8-10)</span>
                        <span className="font-bold text-brand-coral">2 (11%)</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand-coral h-full rounded-full" style={{ width: '11%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-medium text-teal-100 pt-2 border-t border-white/20">
                    <span>Auto-Flagging</span>
                    <span className="font-bold text-white">Recall Bias Eliminated</span>
                  </div>
                </div>

                {/* 4. Clinical Recommendation */}
                <div className="bg-black/10 rounded-lg p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-teal-100 uppercase tracking-widest">
                      PRACTITIONER GUIDANCE
                    </span>
                    <span className="text-[10px] font-sans font-semibold text-white/70 uppercase tracking-widest">Session Prep</span>
                  </div>
                  <div className="py-1">
                    <p className="text-xs sm:text-sm font-semibold text-white">Recommended Agenda</p>
                    <p className="text-[11px] text-white/90 mt-1 leading-relaxed line-clamp-2">
                      Focus on lunch-hour contamination trigger; practice tactile response delay before hand washing ritual.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-sans font-medium text-teal-100 pt-2 border-t border-white/20">
                    <span>Clinical Direction</span>
                    <span className="font-bold text-white">Human-Authored Note</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs font-sans font-medium text-white/80">
              <span>Client-Side Consent Protected • Human-Authored Clinical Direction • No Algorithmic Diagnosis</span>
              <span className="text-white font-bold hover:underline">Click card or scroll to reveal Consent & AI Governance →</span>
            </div>
          </article>

          {/* ================= CARD 03: CONSENT & AI GOVERNANCE ================= */}
          <article
            onClick={() => handleCardClick(2)}
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-brand-ink shadow-2xl flex flex-col justify-between overflow-y-auto lg:overflow-hidden custom-scrollbar cursor-pointer bg-[#FFF9EE] border border-brand-ink/5 ${
              activeCard === 2
                ? 'card-peel-active'
                : activeCard > 2
                ? 'card-peel-up'
                : 'card-peel-next-2'
            }`}
            style={{
              boxShadow: '0 25px 60px -15px rgba(23, 50, 58, 0.25)'
            }}
          >
            {/* Top Row: Title & Badge */}
            <div className="flex items-start justify-between gap-4 border-b border-brand-ink/10 pb-3 sm:pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-sans font-bold bg-brand-coralSoft text-brand-coral px-3 py-0.5 rounded-full uppercase tracking-widest">
                    LAYER 03 • PRIVACY & AI GOVERNANCE
                  </span>
                  <span className="text-xs text-brand-ink/60 font-sans font-medium tracking-wide hidden sm:inline">
                    Granular Access • Transparent Machine Learning
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl lg:text-[32px] text-brand-ink font-normal leading-snug">
                  Your data stays strictly under your control. Always.
                </h3>
              </div>
              <span className="font-mono text-2xl sm:text-3xl font-bold opacity-30 shrink-0 text-brand-ink">(03)</span>
            </div>

            {/* Middle: Consent & Auditable AI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch my-2 sm:my-3 flex-grow min-h-0">
              {/* Left Column: Interactive Granular Consent Toggles */}
              <div className="lg:col-span-5 bg-white rounded-lg p-4 sm:p-5 border border-brand-border flex flex-col justify-between space-y-3 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-sans font-bold text-brand-coral uppercase tracking-widest">
                      GRANULAR CONSENT CONTROLS
                    </span>
                    <span className="text-[10px] font-sans font-bold text-brand-teal bg-brand-softerTeal px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Client-Controlled
                    </span>
                  </div>
                  <p className="text-xs text-brand-ink/80 font-sans mb-3 leading-relaxed">
                    Toggle exactly what your clinician can see in their terminal. Revoke access at any moment.
                  </p>
                  
                  {/* Toggles List */}
                  <div className="space-y-2">
                    {[
                      { id: 'checkins', title: 'Daily Check-in & SUDS Ratings', desc: 'Share distress numbers on 1-10 calibrated scale' },
                      { id: 'practice', title: 'Curated ERP Practice Logs', desc: 'Share urge durations and response delay times' },
                      { id: 'journal', title: 'Raw Private Journal Entries', desc: 'Personal uncensored writing (Locked by default)' }
                    ].map(({ id, title, desc }) => (
                      <div key={id} className="flex items-center justify-between p-2.5 px-3 rounded-md bg-[#F7F8F7] border border-brand-border/50">
                        <div className="pr-2 min-w-0">
                          <p className="text-xs font-semibold text-brand-ink truncate">{title}</p>
                          <p className="text-[11px] text-brand-ink/60 truncate">{desc}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConsentToggle(id);
                          }}
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                            consentStates[id] ? 'bg-brand-teal' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                            consentStates[id] ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-sans font-medium text-brand-ink/70 pt-2.5 border-t border-brand-border">
                  <span className="font-bold text-brand-teal text-[11px]">
                    {Object.values(consentStates).filter(Boolean).length} of 3 categories authorized
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConsentStates({ checkins: false, practice: false, journal: false });
                    }}
                    className="text-[10px] text-brand-coral hover:underline font-sans uppercase tracking-widest font-bold"
                  >
                    Revoke All
                  </button>
                </div>
              </div>

              {/* Right Column: Auditable AI Posture & Safety */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3 bg-white rounded-lg p-4 sm:p-5 border border-brand-border shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-sans font-bold text-brand-teal uppercase tracking-widest">
                      SECONDARY AI POSTURE (GROUNDED & AUDITABLE)
                    </span>
                    <span className="text-[10px] font-sans font-bold bg-brand-ink text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      NON-DIAGNOSTIC
                    </span>
                  </div>
                  
                  {/* Auditable Pattern Card */}
                  <div className="p-3.5 bg-[#F7F8F7] rounded-md border border-brand-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-coral"></span>
                        Observed Weekly Habit Trend
                      </span>
                      <span className="text-[11px] font-mono font-bold text-brand-teal bg-brand-softerTeal px-2.5 py-0.5 rounded-full">
                        Pre: 7.2 → Post: 3.8 SUDS
                      </span>
                    </div>
                    <p className="text-xs text-brand-ink/80 font-sans leading-relaxed">
                      "Over the last 7 days, delaying the checking ritual by 8+ minutes correlated with an average 47% reduction in self-reported distress."
                    </p>
                    <div className="flex items-center justify-between pt-2 text-[11px] font-sans font-medium text-brand-ink/50 border-t border-brand-border">
                      <span>Source: Check-ins #42, #47, Practice #18</span>
                      <span className="text-brand-teal font-bold">Auditable Citation ✓</span>
                    </div>
                  </div>

                  {/* Clear Non-Medical Stance Badge */}
                  <div className="mt-2.5 p-2.5 px-3 rounded-md bg-brand-amberSoft border border-brand-amber/30 flex items-start gap-2">
                    <div className="w-4 h-4 text-brand-amber shrink-0 mt-0.5">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <p className="text-[11px] text-brand-ink/80 font-sans leading-snug">
                      <strong className="text-brand-ink">Secondary AI Rule:</strong> Grounded in your own logs. Never offers diagnostic closure or prescription.
                    </p>
                  </div>
                </div>

                {/* Tele-MANAS Safety Banner */}
                <div className="p-2.5 px-3 bg-brand-coralSoft rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs border border-brand-coral/20">
                  <div>
                    <p className="font-bold text-brand-coral text-xs mb-0.5">Tele-MANAS Crisis Support</p>
                    <p className="text-[10px] text-brand-ink/70">Toll-free 24/7 national mental health helpline in 20+ languages.</p>
                  </div>
                  <a href="tel:14416" onClick={(e) => e.stopPropagation()} className="px-3.5 py-1.5 rounded-full bg-brand-coral text-white font-bold text-[11px] whitespace-nowrap hover:bg-white hover:text-brand-coral transition-colors shadow-sm text-center w-full sm:w-auto">
                    Call 14416
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-brand-ink/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs font-sans font-medium text-brand-ink/60">
              <span>Auditable Grounded AI • Zero Data Monetization • Persistent 24/7 Crisis Access</span>
              <span className="text-brand-coral font-bold hover:underline">Click card or scroll up to return to Personal Layer ↺</span>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
