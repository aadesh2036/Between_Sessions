import re

jsx_content = """import React, { useState, useEffect, useRef } from 'react';

export default function StackedFeatureCards() {
  const [activeCard, setActiveCard] = useState(0);
  const [sudsRating, setSudsRating] = useState(6);
  const [consentStates, setConsentStates] = useState({
    checkins: true,
    practice: true,
    journal: false
  });
  const containerRef = useRef(null);

  // Scroll listener to peel off cards one by one on scroll
  // Expanded to 400vh to slow down the animation pacing
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDist = rect.height - windowHeight;
      if (scrollableDist <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

      if (progress < 0.33) {
        if (activeCard !== 0) setActiveCard(0);
      } else if (progress < 0.67) {
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
    // If clicking the active card, peel it away to show the next one
    if (idx === 0 && activeCard === 0) setActiveCard(1);
    else if (idx === 1 && activeCard === 1) setActiveCard(2);
    else if (idx === 2 && activeCard === 2) setActiveCard(0);
    // Otherwise just go to the clicked card
    else setActiveCard(idx);
  };

  return (
    <section ref={containerRef} id="architecture" className="relative min-h-[400vh] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Sticky viewport frame that pins while user scrolls */}
      <div className="sticky top-16 min-h-[92vh] flex flex-col justify-center items-center">
        {/* Section Header with Stepper Pills */}
        <div className="w-full max-w-6xl flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coralSoft text-brand-coral text-xs font-mono font-bold uppercase tracking-wider mb-3">
              Between-Session Continuity Architecture
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-brand-ink font-normal tracking-tight">
              One continuous bridge. Three dedicated layers.
            </h2>
            <p className="text-sm text-brand-ink/75 mt-3 leading-relaxed">
              Scroll down to peel off each structural layer of the platform, or use the interactive tabs to switch views.
            </p>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full p-2 border border-brand-border shadow-sm shrink-0">
            {[
              { id: '01', label: 'Personal Sanctuary' },
              { id: '02', label: 'Clinician Terminal' },
              { id: '03', label: 'Consent & AI' }
            ].map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveCard(idx)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all ${
                  activeCard === idx
                    ? 'bg-brand-ink text-white shadow-md scale-105'
                    : 'text-brand-ink/60 hover:text-brand-ink hover:bg-brand-sand'
                }`}
              >
                ({tab.id}) {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Stack Stage (Generous Full-Screen Proportions) */}
        <div className="card-stack-stage relative w-full max-w-6xl h-[680px] sm:h-[660px] lg:h-[680px]">
          
          {/* ================= CARD 01: PERSONAL SANCTUARY DASHBOARD ================= */}
          {/* Brand Ink Background */}
          <article
            onClick={() => handleCardClick(0)}
            className={`absolute inset-0 rounded-[40px] p-8 sm:p-10 lg:p-12 text-white shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer bg-brand-ink ${
              activeCard === 0
                ? 'card-peel-active'
                : activeCard > 0
                ? 'card-peel-up'
                : 'card-peel-next-1'
            }`}
            style={{
              boxShadow: '0 30px 70px -15px rgba(23, 50, 58, 0.35), 0 10px 30px -5px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Top Row: Title & Badge */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-brand-coral/10 text-brand-coral px-3 py-1 rounded-full uppercase tracking-wider">
                    LAYER 01 • FOR INDIVIDUALS
                  </span>
                  <span className="text-xs text-white/60 font-mono">Zero Shame • Non-Stigmatizing</span>
                </div>
                <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
                  Tame the loops with gentle daily micro-practices
                </h3>
              </div>
              <span className="font-mono text-3xl sm:text-4xl font-bold opacity-80 shrink-0 text-brand-teal/70">(01)</span>
            </div>

            {/* Middle: Integrated Personal Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-4 flex-grow">
              {/* Left Column: Context & Testimonial */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-white/5 rounded-3xl p-6 border border-white/10">
                <div>
                  <p className="text-sm text-white/80 leading-relaxed font-sans">
                    Living with intrusive thoughts isn't a lack of willpower — it's an overprotective alarm loop. Between Sessions gives you structured, tactile tools to observe without judgment.
                  </p>
                  <div className="mt-5 p-4 bg-white/5 rounded-2xl border border-white/5 text-sm italic font-editorial text-white/90 leading-relaxed">
                    "The 90-second urge wave gave me something tangible to focus on when my compulsions peaked at work."
                    <div className="flex items-center gap-3 mt-4 not-italic font-sans text-xs text-white/70">
                      <div className="w-6 h-6 rounded-full bg-brand-coral text-white flex items-center justify-center font-bold text-[10px]">AK</div>
                      <span>Alex K. • Person Navigating OCD</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-emerald-300 bg-emerald-950/40 px-4 py-3 rounded-xl border border-emerald-500/30">
                  <span>Practice Consistency</span>
                  <span className="font-bold tracking-wide">14 Days Active ✓</span>
                </div>
              </div>

              {/* Right Column: Interactive Personal Dashboard Mockup */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. 90-Second Urge Surfer */}
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-brand-coral uppercase tracking-wider">
                      90-SECOND URGE SURFER
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-coral pulse-indicator" />
                  </div>
                  <div className="py-3">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-white/70 font-mono">Visceral Urge Crest</span>
                      <span className="text-sm font-mono font-bold text-brand-coral">01:14 remaining</span>
                    </div>
                    <div className="h-16 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50" fill="none">
                        <path d="M 0 40 Q 30 40 60 30 T 110 10 T 160 35 T 200 40" stroke="#E8856C" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="110" cy="10" r="4" fill="#E8856C" className="anim-wave-surf" />
                        <circle cx="110" cy="10" r="9" fill="#E8856C" opacity="0.3" className="anim-wave-surf" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/60 pt-3 border-t border-white/10">
                    <span>Tactile haptics active</span>
                    <button className="bg-brand-coral/20 text-brand-coral px-3 py-1 rounded-full hover:bg-brand-coral hover:text-white transition-colors">
                      Pause Spike
                    </button>
                  </div>
                </div>

                {/* 2. Digital Worry Stone (Vagus Reset) */}
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-brand-teal uppercase tracking-wider">
                      DIGITAL WORRY STONE
                    </span>
                    <span className="text-[10px] font-mono text-white/50">4-7-8 Rhythm</span>
                  </div>
                  <div className="flex items-center gap-5 py-3">
                    <div className="w-16 h-16 rounded-full bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-brand-teal/40 anim-vagus-breathe"></div>
                      <span className="absolute text-[9px] font-mono text-white font-bold">EXHALE</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-white">Parasympathetic Reset</p>
                      <p className="text-xs text-white/70 leading-snug">
                        Tactile thumb contact paces autonomic arousal down.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-brand-teal pt-3 border-t border-white/10">
                    <span>Tactile Frequency</span>
                    <span className="font-bold">0.1 Hz Pacing</span>
                  </div>
                </div>

                {/* 3. Calibrated SUDS Distress Scale Check-in (Interactive) */}
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-brand-amber uppercase tracking-wider">
                      CALIBRATED CHECK-IN
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-amber bg-brand-amber/20 px-3 py-1 rounded-full transition-all">
                      SUDS {sudsRating} / 10
                    </span>
                  </div>
                  <div className="py-2">
                    <p className="text-xs text-white/80 font-sans mb-3 h-8 transition-all">
                      {sudsDescriptions[sudsRating]}
                    </p>
                    <div className="grid grid-cols-10 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <button
                          key={num}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSudsRating(num);
                          }}
                          className={`h-7 rounded text-[10px] font-mono font-bold transition-all ${
                            sudsRating === num
                              ? 'bg-brand-amber text-brand-ink shadow-sm scale-105'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50 pt-3 border-t border-white/10">
                    <span>0 = Tranquil</span>
                    <span>10 = Severe Panic</span>
                  </div>
                </div>

                {/* 4. Habit Reversal & Extinction Delay */}
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-brand-lavender uppercase tracking-wider">
                      HABIT EXTINCTION DELAY
                    </span>
                    <span className="text-[10px] font-mono text-brand-lavender bg-brand-lavender/20 px-2 py-0.5 rounded-full">
                      Active Delay
                    </span>
                  </div>
                  <div className="py-2">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-white/70">Response Delay Window</span>
                      <span className="text-base font-mono font-bold text-white">08m 42s</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-brand-lavender h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <p className="text-xs text-white/60 mt-3 leading-snug">
                      Ritual urge peak surpassed without performing the checking compulsion.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-brand-lavender pt-3 border-t border-white/10">
                    <span>Response Prevention</span>
                    <span className="font-bold text-emerald-400">Engaged ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Grounded Framework Tag */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-white/70">
              <span>Evidence-based ERP Framework • Private Client-Side Encrypted Storage • Zero Behavioral Scoring</span>
              <span className="text-brand-coral font-bold hover:underline">Click card or scroll to reveal Clinician Layer →</span>
            </div>
          </article>

          {/* ================= CARD 02: CLINICIAN CONTINUITY TERMINAL ================= */}
          {/* Brand Teal Background */}
          <article
            onClick={() => handleCardClick(1)}
            className={`absolute inset-0 rounded-[40px] p-8 sm:p-10 lg:p-12 text-white shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer bg-brand-teal ${
              activeCard === 1
                ? 'card-peel-active'
                : activeCard > 1
                ? 'card-peel-up'
                : 'card-peel-next-1'
            }`}
            style={{
              boxShadow: '0 30px 70px -15px rgba(23, 107, 103, 0.4), 0 10px 30px -5px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Top Row: Title & Badge */}
            <div className="flex items-start justify-between gap-4 border-b border-white/20 pb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                    LAYER 02 • FOR PRACTITIONERS & CLINICIANS
                  </span>
                  <span className="text-xs text-teal-100 font-mono">Zero Recall Bias • Consented Telemetry</span>
                </div>
                <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
                  Objective longitudinal visibility between clinical sessions
                </h3>
              </div>
              <span className="font-mono text-3xl sm:text-4xl font-bold opacity-80 shrink-0 text-white/50">(02)</span>
            </div>

            {/* Middle: Clinician Cockpit Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-4 flex-grow">
              {/* Left Column: Practitioner Note & Rationale */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-black/10 rounded-3xl p-6 border border-white/20">
                <div>
                  <p className="text-sm text-white/95 leading-relaxed font-sans">
                    Therapy happens in a 50-minute appointment; compulsions peak during the remaining 167 hours. Eliminate retrospective memory amnesia with consented behavioral timeline curves.
                  </p>
                  <div className="mt-5 p-4 bg-white/10 rounded-2xl border border-white/10 text-sm italic font-editorial text-white leading-relaxed">
                    "Seeing the exact 12:00 diurnal urge spike allowed us to adjust the client's midday ERP homework with clinical accuracy."
                    <div className="flex items-center gap-3 mt-4 not-italic font-sans text-xs text-white/80">
                      <div className="w-6 h-6 rounded-full bg-brand-ink text-white flex items-center justify-center font-bold text-[10px]">DC</div>
                      <span>Dr. Chen, PsyD • Certified ERP Specialist</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-white bg-white/10 px-4 py-3 rounded-xl border border-white/20">
                  <span>Clinical Action</span>
                  <span className="font-bold">3 Patients Ready for Review</span>
                </div>
              </div>

              {/* Right Column: Clinician Terminal Telemetry Modules */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Diurnal Urge Surge Curve */}
                <div className="bg-black/10 rounded-3xl p-5 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-teal-100 uppercase tracking-wider">
                      DIURNAL URGE SURGE
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-ink bg-brand-amber px-2.5 py-1 rounded-full">
                      12:00 Surge Apex
                    </span>
                  </div>
                  <div className="py-3">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-white/80 font-mono">Telemetry Spline</span>
                      <span className="text-sm font-mono font-bold text-white">Peak: 8.4 SUDS</span>
                    </div>
                    <div className="h-16 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50" fill="none">
                        <path d="M 0 42 Q 25 40 50 35 T 100 12 T 150 28 T 200 42" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="100" y1="12" x2="100" y2="48" stroke="#D4943A" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx="100" cy="12" r="4" fill="#D4943A" className="anim-spline-pulse" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-teal-100 pt-3 border-t border-white/20">
                    <span>06:00 Morning</span>
                    <span>12:00 Peak Urge</span>
                    <span>22:00 Night</span>
                  </div>
                </div>

                {/* 2. Consented Patient Radar */}
                <div class="bg-black/10 rounded-3xl p-5 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-teal-100 uppercase tracking-wider">
                      CONSENTED TELEMETRY
                    </span>
                    <span className="text-[10px] font-mono text-emerald-900 font-bold bg-emerald-400 px-2.5 py-1 rounded-full">
                      08:12 Sync
                    </span>
                  </div>
                  <div className="flex items-center gap-5 py-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/30 flex items-center justify-center relative shrink-0">
                      <div className="w-12 h-12 rounded-full border border-white/50 anim-radar-ping absolute"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-white">Consented Node Sync</p>
                      <p className="text-xs text-white/80 leading-snug">
                        Client authorized weekly distress aggregates & practice durations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-teal-100 pt-3 border-t border-white/20">
                    <span>Node State</span>
                    <span className="font-bold text-emerald-300">Consented Active</span>
                  </div>
                </div>

                {/* 3. Cohort Triage Distribution */}
                <div className="bg-black/10 rounded-3xl p-5 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-teal-100 uppercase tracking-wider">
                      COHORT STABILITY TRIAGE
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-white/20 px-3 py-1 rounded-full">
                      18 Active Clients
                    </span>
                  </div>
                  <div className="space-y-2 py-1">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-white/90 mb-1">
                        <span>Low Distress (SUDS 1-3)</span>
                        <span className="font-bold text-emerald-300">11 Patients (61%)</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '61%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-white/90 mb-1">
                        <span>Moderate Wave (SUDS 4-7)</span>
                        <span className="font-bold text-brand-amber">5 Patients (28%)</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                        <div className="bg-brand-amber h-full rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-white/90 mb-1">
                        <span>Elevated Loop (SUDS 8-10)</span>
                        <span className="font-bold text-brand-coral">2 Patients (11%)</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                        <div className="bg-brand-coral h-full rounded-full" style={{ width: '11%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-teal-100 pt-3 border-t border-white/20">
                    <span>Auto-Flagging</span>
                    <span className="font-bold text-white">Recall Bias Eliminated</span>
                  </div>
                </div>

                {/* 4. Clinical Recommendation Panel */}
                <div className="bg-black/10 rounded-3xl p-5 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-teal-100 uppercase tracking-wider">
                      PRACTITIONER GUIDANCE
                    </span>
                    <span className="text-[10px] font-mono text-white/70">Session Prep</span>
                  </div>
                  <div className="py-2">
                    <p className="text-sm font-semibold text-white">Recommended Discussion Agenda</p>
                    <p className="text-xs text-white/90 mt-2 leading-relaxed">
                      Focus on lunch-hour contamination trigger; practice tactile response delay before hand washing ritual.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-teal-100 pt-3 border-t border-white/20">
                    <span>Clinical Direction</span>
                    <span className="font-bold text-white">Human-Authored Note</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Grounded Framework Tag */}
            <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-white/80">
              <span>Client-Side Consent Protected • Human-Authored Clinical Direction • No Algorithmic Diagnosis</span>
              <span className="text-white font-bold hover:underline">Click card or scroll to reveal Consent & AI Governance →</span>
            </div>
          </article>

          {/* ================= CARD 03: CONSENT & AI GOVERNANCE ================= */}
          {/* Warm Cream Background with Brand Ink Text */}
          <article
            onClick={() => handleCardClick(2)}
            className={`absolute inset-0 rounded-[40px] p-8 sm:p-10 lg:p-12 text-brand-ink shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer bg-[#FFF9EE] border border-brand-ink/5 ${
              activeCard === 2
                ? 'card-peel-active'
                : activeCard > 2
                ? 'card-peel-up'
                : 'card-peel-next-2'
            }`}
            style={{
              boxShadow: '0 30px 70px -15px rgba(23, 50, 58, 0.25), 0 10px 30px -5px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Top Row: Title & Badge */}
            <div className="flex items-start justify-between gap-4 border-b border-brand-ink/10 pb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-brand-coralSoft text-brand-coral px-3 py-1 rounded-full uppercase tracking-wider">
                    LAYER 03 • PRIVACY & AI GOVERNANCE
                  </span>
                  <span className="text-xs text-brand-ink/60 font-mono">Granular Access • Transparent Machine Learning</span>
                </div>
                <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-brand-ink font-normal leading-tight">
                  Your data stays strictly under your control. Always.
                </h3>
              </div>
              <span className="font-mono text-3xl sm:text-4xl font-bold opacity-30 shrink-0 text-brand-ink">(03)</span>
            </div>

            {/* Middle: Consent & Auditable AI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-4 flex-grow">
              {/* Left Column: Interactive Granular Consent Toggles */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-brand-border flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-brand-coral uppercase tracking-wider">
                      GRANULAR CONSENT CONTROLS
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-teal bg-brand-softerTeal px-2 py-0.5 rounded-full">
                      Client-Controlled
                    </span>
                  </div>
                  <p className="text-sm text-brand-ink/80 font-sans mb-5 leading-relaxed">
                    Toggle exactly what your clinician can see in their terminal. Revoke access at any moment.
                  </p>
                  
                  {/* Toggles List */}
                  <div className="space-y-3">
                    {[
                      { id: 'checkins', title: 'Daily Check-in & SUDS Ratings', desc: 'Share distress numbers on 1-10 calibrated scale' },
                      { id: 'practice', title: 'Curated ERP Practice Logs', desc: 'Share urge durations and response delay times' },
                      { id: 'journal', title: 'Raw Private Journal Entries', desc: 'Personal uncensored writing (Locked by default)' }
                    ].map(({ id, title, desc }) => (
                      <div key={id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F8F7] border border-brand-border/50">
                        <div className="pr-3">
                          <p className="text-sm font-semibold text-brand-ink">{title}</p>
                          <p className="text-xs text-brand-ink/60 mt-0.5">{desc}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConsentToggle(id);
                          }}
                          className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                            consentStates[id] ? 'bg-brand-teal' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                            consentStates[id] ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-brand-ink/70 pt-4 border-t border-brand-border">
                  <span className="font-bold text-brand-teal">
                    {Object.values(consentStates).filter(Boolean).length} of 3 categories authorized
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConsentStates({ checkins: false, practice: false, journal: false });
                    }}
                    className="text-[10px] text-brand-coral hover:underline font-mono uppercase tracking-wider font-bold"
                  >
                    Revoke All
                  </button>
                </div>
              </div>

              {/* Right Column: Auditable AI Posture & Boundaries */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-white rounded-3xl p-6 border border-brand-border shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold text-brand-teal uppercase tracking-wider">
                      SECONDARY AI POSTURE (GROUNDED & AUDITABLE)
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-brand-ink text-white px-3 py-1 rounded-full">
                      NON-DIAGNOSTIC
                    </span>
                  </div>
                  
                  {/* Auditable Pattern Card */}
                  <div className="p-5 bg-[#F7F8F7] rounded-2xl border border-brand-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-brand-ink flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-coral"></span>
                        Observed Weekly Habit Trend
                      </span>
                      <span className="text-xs font-mono font-bold text-brand-teal bg-brand-softerTeal px-3 py-1 rounded-full">
                        Pre: 7.2 → Post: 3.8 SUDS
                      </span>
                    </div>
                    <p className="text-sm text-brand-ink/80 font-sans leading-relaxed">
                      "Over the last 7 days, delaying the checking ritual by 8+ minutes correlated with an average 47% reduction in self-reported distress."
                    </p>
                    <div className="flex items-center justify-between pt-3 text-xs font-mono text-brand-ink/50 border-t border-brand-border">
                      <span>Grounding Source: Check-ins #42, #47, Practice #18</span>
                      <span className="text-brand-teal font-bold">Auditable Log Citation ✓</span>
                    </div>
                  </div>

                  {/* Clear Non-Medical Stance Badge */}
                  <div className="mt-4 p-4 rounded-2xl bg-brand-amberSoft border border-brand-amber/30 flex items-start gap-3">
                    <div className="w-5 h-5 text-brand-amber shrink-0 mt-0.5">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <p className="text-xs text-brand-ink/80 font-sans leading-relaxed">
                      <strong className="text-brand-ink">Secondary AI Rule:</strong> Synthesized strictly from your own logs. Never offers diagnostic closure, prescription, or clinical evaluation.
                    </p>
                  </div>
                </div>

                {/* Tele-MANAS Safety Banner */}
                <div className="p-4 bg-brand-coralSoft rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs border border-brand-coral/20">
                  <div>
                    <p className="font-bold text-brand-coral text-sm mb-1">Tele-MANAS Crisis Support</p>
                    <p className="text-[11px] text-brand-ink/70">Toll-free 24/7 national mental health helpline in 20+ languages.</p>
                  </div>
                  <a href="tel:14416" onClick={(e) => e.stopPropagation()} className="px-5 py-2.5 rounded-full bg-brand-coral text-white font-bold text-xs whitespace-nowrap hover:bg-white hover:text-brand-coral transition-colors shadow-sm text-center w-full sm:w-auto">
                    Call 14416
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Grounded Framework Tag */}
            <div className="pt-4 border-t border-brand-ink/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-brand-ink/60">
              <span>Auditable Grounded AI • Zero Data Monetization • Persistent 24/7 Crisis Access</span>
              <span className="text-brand-coral font-bold hover:underline">Click card or scroll up to return to Personal Layer ↺</span>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
"""

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx_content)

print("Updated StackedFeatureCards.jsx successfully!")
