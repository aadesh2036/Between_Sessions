import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // 1. SUDS CONTINUUM STATE
  const [sudsLevel, setSudsLevel] = useState(4);
  const sudsData = {
    1: { title: "Clear Equanimity", desc: "No noticeable mental loop. Breathing is easy and effortless.", icon: "sentiment_very_satisfied" },
    2: { title: "Fleeting Faint Thought", desc: "A soft thought surfaced, quickly acknowledged and passing by.", icon: "sentiment_satisfied" },
    3: { title: "Subtle Cognitive Ripple", desc: "Aware of the theme; easily deferred without mental checking.", icon: "sentiment_neutral" },
    4: { title: "Mild Cognitive Whisper", desc: "Noticeable loop detected; you have space to observe and defer compulsions.", icon: "sentiment_neutral" },
    5: { title: "Moderate Somatic Friction", desc: "Slight physical chest tightness or urge to reassure; mindful anchor recommended.", icon: "sentiment_dissatisfied" },
    6: { title: "Pronounced Obsessional Hook", desc: "Urge feels pressing; adrenaline signaling an artificial threat urgency.", icon: "sentiment_dissatisfied" },
    7: { title: "Acute Visceral Spike", desc: "Strong compulsion impulse. Ride the 90-second neurochemical wave.", icon: "sentiment_very_dissatisfied" },
    8: { title: "High Resistance Peak", desc: "Spike is demanding immediate rituals. Hold onto spacious awareness.", icon: "warning" },
    9: { title: "Severe Autonomic Surge", desc: "High panic or dread. Initiate 4-7-8 somatic pause; let sensations crash.", icon: "emergency" },
    10: { title: "Maximum SUDS Storm", desc: "Peak flood. Remember: adrenaline cannot physically sustain this peak beyond 90-180s.", icon: "shield" }
  };

  const currentSuds = sudsData[sudsLevel];

  const [selectedTags, setSelectedTags] = useState(['Checking locks/doors']);
  const tags = [
    'Checking locks/doors',
    'Moral or existential doubt',
    'Contamination residue',
    'Symmetry & Just Right',
    'Pure-O mental replay'
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const [isLogged, setIsLogged] = useState(false);
  const handleLogSuds = () => {
    setIsLogged(true);
    setTimeout(() => setIsLogged(false), 2200);
  };

  // 2. 90-SECOND WAVE STATE
  const [timeLeft, setTimeLeft] = useState(74); // Starts at 1:14
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `0${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // 3. TACTILE PACER STATE (4-7-8)
  const phaseSeconds = [4, 7, 8];
  const phaseTexts = ['Inhale', 'Hold', 'Exhale'];
  const [pacerPhase, setPacerPhase] = useState(0);
  const [pacerCount, setPacerCount] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setPacerCount(prev => {
        if (prev > 1) return prev - 1;
        setPacerPhase(oldPhase => {
          const newPhase = (oldPhase + 1) % 3;
          setPacerCount(phaseSeconds[newPhase]);
          return newPhase;
        });
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen antialiased selection:bg-brand-primary-soft selection:text-brand-primary overflow-x-hidden text-text-primary bg-[#F7F8F6]">
      
      <style>{`
        .blur-orb {
          filter: blur(75px);
          transform: translate3d(0, 0, 0);
        }
        .pebble-card {
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
        }
        .pebble-card:hover {
          transform: translateY(-2px);
        }
        .font-headline {
          font-family: 'Newsreader', serif;
        }
        /* Custom scrollbar for sidebar */
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(23, 107, 103, 0.1);
          border-radius: 4px;
        }
      `}</style>

      {/* BOTANICAL & MELLOW AMBIENT MESH GRADIENT GLOWS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-12 w-[520px] h-[520px] rounded-full bg-[#E0F0EB]/70 blur-orb"></div>
        <div className="absolute top-48 -right-24 w-[600px] h-[600px] rounded-full bg-[#FFF0E6]/65 blur-orb"></div>
        <div className="absolute top-[800px] left-1/4 w-[480px] h-[480px] rounded-full bg-[#ECE7FA]/50 blur-orb"></div>
        <div className="absolute -bottom-24 right-10 w-[550px] h-[550px] rounded-full bg-[#E6F3F7]/70 blur-orb"></div>
      </div>

      <div className="flex min-h-screen p-4 lg:p-6 gap-6 max-w-[1680px] mx-auto relative z-10 items-start">
        
        {/* FLOATING SANCTUARY SIDEBAR DOCK (Sticky) */}
        <aside className="hidden lg:flex flex-col justify-between w-72 shrink-0 bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-sanctuary border border-white/50 sticky top-6 h-[calc(100vh-48px)] sidebar-scroll overflow-y-auto">
          <div className="flex flex-col gap-6">
            
            <Logo />

            {/* Companion Pip Micro-Pod */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-accent-amber-soft via-[#FFFBF4] to-brand-primary-softer flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-[#FFE7C7] flex items-center justify-center text-accent-amber shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[22px]">pets</span>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-bold text-brand-ink">Pip is nestled here</span>
                <span className="block text-[11px] text-text-secondary">Gentle presence • No demands</span>
              </div>
            </div>

            <div className="px-3 pt-1">
              <span className="text-[11px] font-bold text-text-secondary/70 uppercase tracking-widest">Somatic & Exposure Tools</span>
            </div>

            {/* Organic Nav Items */}
            <nav className="flex flex-col gap-1.5">
              <a className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-brand-primary-softer text-brand-primary font-bold shadow-sm transition-all" href="#">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </div>
                <span className="text-[14px]">Daily Check-In</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
              </a>
              <a className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-text-secondary hover:bg-surface-warm/80 hover:text-brand-ink transition-all" href="#">
                <div className="w-8 h-8 rounded-full bg-info-soft flex items-center justify-center text-info">
                  <span className="material-symbols-outlined text-[18px]">waves</span>
                </div>
                <span className="text-[14px] font-medium">Urge Surfer 90s</span>
              </a>
              <a className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-text-secondary hover:bg-surface-warm/80 hover:text-brand-ink transition-all" href="#">
                <div className="w-8 h-8 rounded-full bg-accent-lavender-soft flex items-center justify-center text-accent-lavender">
                  <span className="material-symbols-outlined text-[18px]">air</span>
                </div>
                <span className="text-[14px] font-medium">Tactile Pacer 4-7-8</span>
              </a>
              <a className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-text-secondary hover:bg-surface-warm/80 hover:text-brand-ink transition-all" href="#">
                <div className="w-8 h-8 rounded-full bg-accent-amber-soft flex items-center justify-center text-accent-amber">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <span className="text-[14px] font-medium">Thought Log</span>
              </a>
              <a className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-text-secondary hover:bg-surface-warm/80 hover:text-brand-ink transition-all" href="#">
                <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center text-success">
                  <span className="material-symbols-outlined text-[18px]">stairs</span>
                </div>
                <span className="text-[14px] font-medium">ERP Hierarchy Ladder</span>
              </a>
              <a className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-text-secondary hover:bg-surface-warm/80 hover:text-brand-ink transition-all" href="#">
                <div className="w-8 h-8 rounded-full bg-brand-primary-softer flex items-center justify-center text-brand-primary">
                  <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                </div>
                <span className="text-[14px] font-medium">Clinician Connect</span>
              </a>
            </nav>
          </div>

          <div className="flex flex-col gap-3 pt-6 mt-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-coral-soft to-rose-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-accent-coral shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-brand-ink">Crisis Anchor</span>
                  <span className="block text-[11px] text-text-secondary">Text or Call 988</span>
                </div>
              </div>
              <a className="px-3 py-1.5 rounded-full bg-white text-accent-coral text-xs font-bold shadow-sm hover:bg-accent-coral hover:text-white transition-all" href="tel:988">Connect</a>
            </div>
            <a className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-text-secondary hover:bg-white/70 hover:text-brand-ink transition-all text-xs font-semibold" href="#">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Sanctuary Settings</span>
            </a>
          </div>
        </aside>

        {/* MAIN FLUID SANCTUARY CANVAS */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* FLOATING HEADER PILL BAR */}
          <header className="h-16 rounded-3xl bg-white/70 backdrop-blur-xl px-6 flex items-center justify-between shadow-sanctuary border border-white/50 mb-6 shrink-0 sticky top-6 z-20">
            <div className="flex items-center gap-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>HRV Regulated • Apple Health Synced</span>
              </div>
              <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-warm text-text-secondary text-xs font-medium">
                <span className="material-symbols-outlined text-[15px] text-brand-primary">lock</span>
                <span>Zero Clinical Tracking</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-lavender-soft/80 text-accent-lavender hover:bg-accent-lavender hover:text-white transition-all text-xs font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[16px]">self_improvement</span>
                <span>Somatic Pause</span>
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-coral-soft text-accent-coral hover:bg-accent-coral hover:text-white transition-all text-xs font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                <span>Quick Refuge</span>
              </button>
              <div className="h-6 w-px bg-border-subtle mx-1"></div>
              <div className="flex items-center gap-2.5 pl-1">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold text-brand-ink">Alex</span>
                  <span className="block text-[11px] text-text-secondary">Private Sanctuary</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-teal-400 p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-brand-primary font-bold text-xs">A</div>
                </div>
              </div>
            </div>
          </header>

          <main className="space-y-8 pb-16 flex-1">
            
            {/* HERO & WELCOME */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-[#FAFCFB]/80 to-brand-primary-softer/70 p-8 lg:p-12 shadow-sanctuary">
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#E5F4F0]/60 blur-3xl pointer-events-none"></div>
              <div className="absolute right-1/3 -bottom-10 w-64 h-64 rounded-full bg-[#FFF3E8]/70 blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                      Calibrated to Pure-O & Checking
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-warm text-text-secondary text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-brand-primary">schedule</span>
                      Pacing: Zero-Pressure Sanctuary
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-amber-soft text-accent-amber text-xs font-semibold">
                      <span className="material-symbols-outlined text-[15px]">cruelty_free</span>
                      Pip is resting nearby
                    </span>
                  </div>

                  <h1 className="font-headline text-[38px] lg:text-[46px] text-brand-ink leading-[1.18] font-normal">
                    Welcome home to your sanctuary, <span className="italic text-brand-primary font-serif font-normal">Alex.</span>
                  </h1>
                  
                  <div className="relative pl-6 py-1">
                    <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-brand-primary to-accent-coral/60"></div>
                    <p className="font-headline text-[22px] lg:text-[25px] italic text-text-secondary leading-relaxed font-normal">
                      “Thoughts are just visitors in the room; you are the spacious sky.”
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0 w-full xl:w-auto">
                  <button className="group flex items-center justify-between gap-5 px-6 py-4 rounded-2xl bg-brand-primary hover:bg-brand-primary-strong text-white shadow-pebble transition-all hover:shadow-lg">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">self_improvement</span>
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold tracking-tight">Somatic Pause</span>
                        <span className="block text-xs text-white/80">4-7-8 Vagus Reset • 90s</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                  <div className="px-4 py-2.5 rounded-full bg-white/70 backdrop-blur-sm flex items-center gap-2 text-xs text-text-secondary">
                    <span className="material-symbols-outlined text-[15px] text-brand-primary">verified_user</span>
                    <span>End-to-end encrypted sanctuary</span>
                  </div>
                </div>
              </div>
            </section>

            {/* MAIN SPLIT BENTO */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* LEFT 7 COLS: SUDS CONTINUUM & GENTLE LADDER */}
              <div className="xl:col-span-7 space-y-8">
                
                {/* 10-Point SUDS Continuum Card */}
                <div className="pebble-card bg-white/85 backdrop-blur-xl rounded-3xl p-8 shadow-sanctuary space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Non-Stigmatizing Baseline</span>
                        <span className="w-1 h-1 rounded-full bg-text-secondary/40"></span>
                        <span className="text-xs text-text-secondary font-medium">SUDS Scale</span>
                      </div>
                      <h2 className="font-headline text-[26px] text-brand-ink mt-1 font-normal">Where is your nervous system resting?</h2>
                      <p className="text-xs text-text-secondary mt-0.5">Check in without judgment. Every feeling has room to exist here.</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-accent-lavender-soft flex items-center justify-center text-accent-lavender shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[22px]">psychology</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-warm via-white to-brand-primary-softer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-headline text-2xl font-bold shadow-pebble">
                        {sudsLevel}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-brand-ink">{currentSuds.title}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white text-brand-primary shadow-sm">Autonomous</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 max-w-md">{currentSuds.desc}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[32px] text-brand-primary shrink-0">
                      {currentSuds.icon}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-text-secondary text-xs px-2 font-medium">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> 0 • Grounded Stillness</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> 5 • Moderate Friction</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-coral"></span> 10 • Peak Spike</span>
                    </div>
                    <div className="grid grid-cols-10 gap-2 p-2 rounded-2xl bg-surface-warm/80">
                      {[1,2,3,4,5,6,7,8,9,10].map(lvl => (
                        <button 
                          key={lvl}
                          onClick={() => setSudsLevel(lvl)}
                          className={`py-3 rounded-xl text-sm font-semibold transition-all ${sudsLevel === lvl ? 'bg-white text-brand-primary shadow-sm font-bold text-base ring-2 ring-brand-primary/20' : 'text-text-secondary hover:bg-white'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Theme / Somatic Echo in Play (Optional):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button 
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${isSelected ? 'bg-brand-primary text-white shadow-sm' : 'bg-white hover:bg-surface-warm text-text-secondary border border-border-subtle'}`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-subtle/70">
                    <div className="flex items-center gap-2 text-text-secondary text-xs">
                      <span className="material-symbols-outlined text-[17px] text-success">verified</span>
                      <span>Zero-shame logging • Processed safely in RAM</span>
                    </div>
                    <button onClick={handleLogSuds} className="w-full sm:w-auto px-6 py-3 rounded-full bg-brand-primary text-white hover:bg-brand-primary-strong transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-pebble min-w-[180px]">
                      {isLogged ? (
                        <>
                          <span className="material-symbols-outlined text-[17px] text-white">check_circle</span>
                          <span>Logged Mindfully</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[17px]">draw</span>
                          <span>Log Mindful Reflection</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ERP HIERARCHY LADDER Pod */}
                <div className="pebble-card bg-gradient-to-br from-[#F5FAF8] via-white to-[#F0F8F5] rounded-3xl p-8 shadow-sanctuary space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-success-soft text-success flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">stairs</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-success uppercase tracking-wider">ERP Active Hierarchy</span>
                        <h3 className="font-headline text-[22px] text-brand-ink leading-tight">Step 1 of 5 Gentle Rungs</h3>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-success-soft text-success text-xs font-bold">
                      In Habituation Phase
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold text-brand-ink">Leaving faucet handle unchecked for 2 minutes</h4>
                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">Target: Withstand the urge to return to the bathroom sink. Notice the discomfort cresting without taking physical action.</p>
                      </div>
                      <div className="text-right shrink-0 bg-accent-amber-soft px-3.5 py-2 rounded-xl">
                        <span className="text-[11px] font-semibold text-accent-amber block">Expected SUDS</span>
                        <div className="font-headline text-lg text-accent-amber font-bold">3.5 → 1.2</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs text-text-secondary font-medium">
                        <span>Ladder Habituation</span>
                        <span className="font-bold text-brand-primary">40% mastered</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-surface-warm overflow-hidden p-0.5">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-teal-400 transition-all duration-700 w-[40%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-text-secondary">Last practiced: Yesterday at 4:15 PM • No rituals recorded</span>
                    <button className="px-5 py-2.5 rounded-full bg-brand-primary-softer hover:bg-brand-primary hover:text-white text-brand-primary transition-all text-xs font-bold flex items-center gap-2">
                      <span>Step into gentle exposure</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT 5 COLS: 90s URGE SURFER & 4-7-8 PACER */}
              <div className="xl:col-span-5 space-y-8">
                
                {/* URGE SURFER 90s WAVE */}
                <div className="pebble-card bg-gradient-to-b from-[#FFF9F7] via-white to-white rounded-3xl p-8 shadow-sanctuary space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-coral-soft text-accent-coral text-[11px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[15px]">waves</span>
                        <span>Neurochemical Window</span>
                      </div>
                      <h2 className="font-headline text-[26px] text-brand-ink mt-2 font-normal">Riding the 90-Second Wave</h2>
                    </div>
                    <div className="text-right bg-accent-coral-soft px-4 py-2 rounded-2xl">
                      <div className="text-[26px] font-headline font-bold text-accent-coral leading-none">{formatTime(timeLeft)}</div>
                      <span className="text-[10px] font-bold text-accent-coral/80 uppercase">of 01:30 wave</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Compulsions are chemical adrenaline spikes. Neurologically, the acute biological flood peaks and metabolizes within 90 seconds if deferred.
                  </p>

                  <div className="relative w-full h-40 bg-gradient-to-b from-accent-coral-soft/50 via-surface-warm/40 to-white rounded-2xl p-4 overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[11px] font-semibold text-text-secondary">
                      <span>0s Adrenaline Influx</span>
                      <span className="text-accent-coral font-bold">45s Cresting Peak</span>
                      <span>90s Drop</span>
                    </div>
                    <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                      <defs>
                        <linearGradient id="wavePebbleGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#E8856C" stopOpacity="0.35"></stop>
                          <stop offset="100%" stopColor="#E8856C" stopOpacity="0.0"></stop>
                        </linearGradient>
                      </defs>
                      <path d="M 0 85 Q 90 85, 140 30 T 230 18 Q 300 35, 400 85 L 400 100 L 0 100 Z" fill="url(#wavePebbleGradient)"></path>
                      <path d="M 0 85 Q 90 85, 140 30 T 230 18 Q 300 35, 400 85" fill="none" stroke="#D8DFDE" strokeDasharray="4 4" strokeWidth="2"></path>
                      <path d="M 0 85 Q 90 85, 140 30 T 190 22" fill="none" stroke="#E8856C" strokeLinecap="round" strokeWidth="3.5"></path>
                      <circle className="animate-ping" cx="190" cy="22" fill="#E8856C" opacity="0.6" r="7"></circle>
                      <circle cx="190" cy="22" fill="#E8856C" r="5"></circle>
                    </svg>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-accent-coral animate-pulse"></span>
                        You are here: Wave is settling
                      </span>
                      <span className="italic font-serif text-brand-primary font-medium">Spike is losing its grip</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button className="px-5 py-3 rounded-full bg-accent-coral hover:bg-[#de765b] text-white transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined text-[17px]">air</span>
                      <span>I am Breathing Through It</span>
                    </button>
                    <button className="px-5 py-3 rounded-full bg-surface-warm hover:bg-[#e4ece9] text-text-primary transition-all text-xs font-bold flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[17px]">timelapse</span>
                      <span>Delay Ritual +15m</span>
                    </button>
                  </div>
                </div>

                {/* TACTILE VAGUS PACER */}
                <div className="pebble-card bg-gradient-to-b from-[#F7F5FC] via-white to-white rounded-3xl p-8 shadow-sanctuary space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-lavender"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-accent-lavender">Tactile Somatic Reset</span>
                      </div>
                      <h3 className="font-headline text-[22px] text-brand-ink mt-1">4-7-8 Parasympathetic Pebble</h3>
                    </div>
                    <button className="w-9 h-9 rounded-full bg-white text-text-secondary hover:text-brand-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                    </button>
                  </div>

                  <div className="relative h-60 flex flex-col items-center justify-center">
                    <div className="absolute w-56 h-56 rounded-full bg-accent-lavender-soft/40 transition-all duration-1000 animate-pulse"></div>
                    <div className="absolute w-44 h-44 rounded-full bg-accent-lavender-soft/75 transition-all duration-700"></div>
                    <div 
                      className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-white via-brand-primary-softer to-accent-lavender-soft shadow-pebble flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-1000 ease-in-out border-2 border-white/80"
                      style={{ transform: pacerPhase === 0 || pacerPhase === 1 ? 'scale(1.15)' : 'scale(0.92)' }}
                    >
                      <span className="material-symbols-outlined text-brand-primary text-[26px]">filter_vintage</span>
                      <span className="text-xs font-bold text-brand-ink uppercase tracking-wider mt-1">{phaseTexts[pacerPhase]}</span>
                      <span className="font-headline text-2xl text-brand-primary font-bold">{pacerCount}s</span>
                    </div>
                    <div className="absolute bottom-1 flex items-center gap-4 text-text-secondary text-[11px] font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-accent-lavender">touch_app</span>
                        Haptics Active
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-success">vital_signs</span>
                        HRV Calibrated
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-warm/80 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[18px] text-brand-primary shrink-0 mt-0.5">spa</span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Prolonging the exhale to 8 seconds signals the vagus nerve to down-regulate heart rate, clearing false alarm signals.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* CLINICIAN COLLABORATION BANNER */}
            <section className="pebble-card relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F2FAF7] via-white to-[#FAF6F0] p-8 lg:p-10 shadow-sanctuary mt-8">
              <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-teal-100/50 blur-2xl pointer-events-none"></div>
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative z-10">
                <div className="space-y-4 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary-softer text-brand-primary text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">medical_services</span>
                    <span>Independent Sanctuary Mode • Optional Care Team Link</span>
                  </div>
                  <h2 className="font-headline text-[32px] lg:text-[36px] text-brand-ink tracking-tight font-normal leading-tight">
                    Bring the 167 hours between sessions into clear, steady focus.
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                    You are currently practicing independently. Linking your sanctuary with a licensed ERP therapist or clinical team eliminates session recollection amnesia, syncs habituation curves in real time, and unlocks tailored micro-exposures.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-brand-primary">lock_reset</span>
                      <span>Zero Raw Thought Leakage • 100% On-Device</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-success">verified_user</span>
                      <span>HIPAA Tier-4 • DPDP Act Compliant</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-accent-lavender">monitoring</span>
                      <span>Only Aggregated Velocity Shared</span>
                    </div>
                  </div>
                </div>

                <div className="w-full xl:w-96 bg-white p-7 rounded-3xl shadow-sm space-y-4 shrink-0">
                  <div>
                    <span className="block font-headline text-xl text-brand-ink">Connect with Clinician</span>
                    <span className="block text-xs text-text-secondary mt-0.5">Enter private sanctuary invite code</span>
                  </div>
                  <div className="space-y-2.5">
                    <input className="w-full px-4 py-3 rounded-full bg-surface-warm text-text-primary text-xs tracking-wider placeholder:text-text-secondary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-mono uppercase text-center" placeholder="e.g. ERP-7829-SANC" type="text" />
                    <button className="w-full py-3 rounded-full bg-brand-primary text-white hover:bg-brand-primary-strong transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-pebble">
                      <span>Connect Sanctuary</span>
                      <span className="material-symbols-outlined text-[16px]">link</span>
                    </button>
                  </div>
                  <div className="relative flex items-center justify-center pt-2">
                    <div className="w-full border-t border-border-subtle"></div>
                    <span className="absolute bg-white px-3 text-[11px] text-text-secondary font-semibold">or find care</span>
                  </div>
                  <button className="w-full py-2.5 rounded-full bg-surface-warm hover:bg-brand-primary-softer text-brand-primary transition-all text-xs font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    <span>Browse Certified OCD Specialists</span>
                  </button>
                </div>
              </div>
            </section>

            {/* RECOVERY MOMENTUM Pods */}
            <section className="space-y-4 mt-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Recovery Momentum</span>
                  <h3 className="font-headline text-[26px] text-brand-ink">Weekly Habituation Velocity</h3>
                </div>
                <span className="text-xs text-text-secondary font-medium">Updated 12 mins ago • Baseline synced</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="pebble-card bg-[#EDF7F5] rounded-3xl p-6 shadow-sanctuary flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Gentle Practices</span>
                    <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-brand-primary shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-headline text-[38px] font-normal text-brand-ink leading-tight">
                      7 <span className="text-xs font-body font-semibold text-text-secondary">sessions</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">100% daily check-in cadence since onboarding.</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden">
                    <div className="h-full bg-brand-primary rounded-full w-[100%]"></div>
                  </div>
                </div>

                <div className="pebble-card bg-[#FFF1ED] rounded-3xl p-6 shadow-sanctuary flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent-coral uppercase tracking-wider">Urges Surfed</span>
                    <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-accent-coral shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">surfing</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-headline text-[38px] font-normal text-brand-ink leading-tight">
                      14 <span className="text-xs font-body font-semibold text-text-secondary">delayed</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">92% allowed full 90-second adrenaline window.</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden">
                    <div className="h-full bg-accent-coral rounded-full w-[92%]"></div>
                  </div>
                </div>

                <div className="pebble-card bg-[#F2EFFF] rounded-3xl p-6 shadow-sanctuary flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent-lavender uppercase tracking-wider">SUDS Delta</span>
                    <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-accent-lavender shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">trending_down</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-headline text-[38px] font-normal text-brand-ink leading-tight">
                      6.4 <span className="text-accent-coral text-2xl font-serif">→</span> 2.8
                    </div>
                    <p className="text-xs text-text-secondary mt-1">-3.6 drop within 15 min post-somatic pause.</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden">
                    <div className="h-full bg-accent-lavender rounded-full w-[68%]"></div>
                  </div>
                </div>

                <div className="pebble-card bg-[#FFF7EB] rounded-3xl p-6 shadow-sanctuary flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent-amber uppercase tracking-wider">Crest Velocity</span>
                    <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-accent-amber shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">speed</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-headline text-[38px] font-normal text-brand-ink leading-tight">
                      -2.4 <span className="text-xs font-body font-semibold text-text-secondary">min faster</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Autonomic spikes drop back to baseline faster.</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden">
                    <div className="h-full bg-accent-amber rounded-full w-[78%]"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* PIP'S SANCTUARY WHISPER */}
            <div className="pebble-card flex items-center justify-between p-5 rounded-3xl bg-white/90 backdrop-blur-md shadow-sanctuary mt-8">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FFE7C7] to-[#FFF4E0] flex items-center justify-center text-accent-amber shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">cruelty_free</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-brand-ink">Pip's Sanctuary Whispers</span>
                  <span className="block font-headline text-base text-text-secondary italic">
                    “Uncertainty is not an emergency. It's just the sound of your brain building new neuroplastic safety.”
                  </span>
                </div>
              </div>
              <span className="text-xs text-text-secondary/80 hidden md:inline px-3 py-1.5 rounded-full bg-surface-warm font-medium">
                No action required • Rest easy
              </span>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
