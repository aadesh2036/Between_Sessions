import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  
  // Pause & Choose State
  const [pauseStep, setPauseStep] = useState('idle'); // idle, pause, allow, choose
  const [selectedResponse, setSelectedResponse] = useState(null);

  const handlePauseFlow = (step) => {
    setPauseStep(step);
    if (step === 'idle') setSelectedResponse(null);
  };

  const handleResponse = async (response) => {
    setSelectedResponse(response);
    
    try {
      const bsUserStr = localStorage.getItem('bs_user');
      let token = bsUserStr;
      if (bsUserStr) {
        try {
          const parsed = JSON.parse(bsUserStr);
          token = parsed.token || bsUserStr;
        } catch (e) {
          // not JSON
        }
      }

      await fetch('http://localhost:3000/api/v1/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user?.id,
          responseType: response
        })
      });
    } catch (error) {
      console.error('Failed to log response:', error);
    }

    setTimeout(() => {
      setPauseStep('idle');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col md:flex-row overflow-x-hidden selection:bg-brand-teal/20">
      
      {/* STICKY SIDEBAR (Interlocking Left Panel) */}
      <aside className="w-full md:w-[260px] lg:w-[280px] bg-white border-r border-brand-border/40 shrink-0 flex flex-col md:sticky md:top-0 md:h-screen z-20">
        <div className="p-6 md:p-8 shrink-0">
          <Logo />
        </div>

        <div className="flex-1 px-4 md:px-6 overflow-y-auto custom-scrollbar pb-6 space-y-8">
          
          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Sanctuary</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-brand-softerTeal text-brand-teal font-bold shadow-sm transition-all" to="/app">
                <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                </div>
                <span className="text-[14px]">Home</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
              </Link>
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm" to="/app">
                <div className="w-8 h-8 rounded-full bg-brand-coralSoft flex items-center justify-center text-brand-coral">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <span className="text-[14px] font-medium">Pause & Choose</span>
              </Link>
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm" to="/app">
                <div className="w-8 h-8 rounded-full bg-brand-amberSoft flex items-center justify-center text-brand-amber">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                </div>
                <span className="text-[14px] font-medium">Practice History</span>
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Care Continuity</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm group" to="/app">
                <div className="w-8 h-8 rounded-full bg-brand-canvas flex items-center justify-center text-brand-ink/60 group-hover:text-brand-ink transition-colors">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                </div>
                <span className="text-[14px] font-medium">Clinician Connect</span>
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-4 md:p-6 shrink-0 mt-auto border-t border-brand-border/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-ink text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold text-brand-ink truncate">{user?.email || 'Individual'}</div>
              <div className="text-[10px] text-brand-ink/60 font-mono mt-0.5 truncate">ID: {user?.id}</div>
            </div>
            <button onClick={logout} className="p-2 text-brand-ink/40 hover:text-brand-coral transition-colors" title="Sign out">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="flex-1 min-w-0 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjMsIDEwNywgMTAzLCAwLjA1KSIvPjwvc3ZnPg==')] opacity-60 z-0"></div>
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-teal/5 blur-[140px] rounded-full pointer-events-none z-0"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-brand-teal font-bold text-xs uppercase tracking-widest mb-2">Welcome Back</p>
              <h1 className="font-editorial text-4xl sm:text-5xl text-brand-ink font-normal leading-tight">
                Make more room <br className="hidden sm:block"/>
                <span className="italic text-brand-teal">for life outside the loop.</span>
              </h1>
            </div>
            <button className="self-start sm:self-end px-5 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold shadow-sm hover:bg-brand-teal transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Log Practice</span>
            </button>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            
            {/* TODAY & PAUSE MODAL (Left Column) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* TODAY */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sanctuary border border-brand-border/30">
                <div className="flex items-center gap-2 text-brand-teal mb-4">
                  <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Today</span>
                </div>
                <h2 className="font-editorial text-3xl text-brand-ink mb-2">Return to what matters.</h2>
                <p className="text-brand-ink/60 text-sm mb-6 max-w-md">
                  You don't have to resolve every doubt today. Choose an action that moves you toward your values.
                </p>
                <button className="px-6 py-3 rounded-full bg-brand-softerTeal text-brand-teal font-bold text-sm hover:bg-brand-teal hover:text-white transition-all shadow-sm">
                  Choose today's practice
                </button>
              </section>

              {/* PAUSE & CHOOSE TOOL */}
              <section className={`rounded-3xl p-6 sm:p-8 shadow-sanctuary transition-colors duration-500 border border-brand-border/30 ${
                pauseStep === 'idle' ? 'bg-brand-ink text-white' :
                pauseStep === 'pause' ? 'bg-brand-amber text-white' :
                pauseStep === 'allow' ? 'bg-brand-lavender text-white' : 'bg-brand-teal text-white'
              }`}>
                {pauseStep === 'idle' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h2 className="font-editorial text-3xl mb-2">Pause & Choose</h2>
                      <p className="text-white/70 text-sm">A brief intervention when an urge hits. You don't need to make the urge disappear.</p>
                    </div>
                    <button 
                      onClick={() => handlePauseFlow('pause')}
                      className="shrink-0 w-16 h-16 rounded-full bg-white text-brand-ink flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                    </button>
                  </div>
                )}

                {pauseStep === 'pause' && (
                  <div className="text-center py-6 animate-fade-in">
                    <h2 className="font-editorial text-4xl mb-4">An urge is here.</h2>
                    <p className="text-white/80 text-sm mb-8">Notice it. It is just a temporary neurochemical event.</p>
                    <button 
                      onClick={() => handlePauseFlow('allow')}
                      className="px-8 py-3 rounded-full bg-white text-brand-amber font-bold text-sm shadow-md hover:scale-105 transition-transform"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {pauseStep === 'allow' && (
                  <div className="text-center py-6 animate-fade-in">
                    <h2 className="font-editorial text-4xl mb-4">I allow this feeling.</h2>
                    <p className="text-white/80 text-sm mb-8">I don't need to fix it. I don't need to make it disappear.</p>
                    <button 
                      onClick={() => handlePauseFlow('choose')}
                      className="px-8 py-3 rounded-full bg-white text-brand-lavender font-bold text-sm shadow-md hover:scale-105 transition-transform"
                    >
                      Make a choice
                    </button>
                  </div>
                )}

                {pauseStep === 'choose' && !selectedResponse && (
                  <div className="animate-fade-in">
                    <h2 className="font-editorial text-3xl mb-6 text-center">What response fits the direction I want to move in?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={() => handleResponse('delay')} className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-left">
                        <div className="font-bold text-sm mb-1">Delay compulsion</div>
                        <div className="text-xs text-white/70">I will wait 10 minutes.</div>
                      </button>
                      <button onClick={() => handleResponse('resist')} className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-left">
                        <div className="font-bold text-sm mb-1">Resist entirely</div>
                        <div className="text-xs text-white/70">I will not perform the ritual.</div>
                      </button>
                      <button onClick={() => handleResponse('return')} className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-left">
                        <div className="font-bold text-sm mb-1">Return to activity</div>
                        <div className="text-xs text-white/70">I am going back to what I was doing.</div>
                      </button>
                      <button onClick={() => handleResponse('continue')} className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-left">
                        <div className="font-bold text-sm mb-1">Continue exposure</div>
                        <div className="text-xs text-white/70">I will stay in this situation.</div>
                      </button>
                    </div>
                  </div>
                )}

                {pauseStep === 'choose' && selectedResponse && (
                  <div className="text-center py-6 animate-fade-up">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center text-brand-teal shadow-lg mb-4">
                      <span className="material-symbols-outlined text-[32px]">check</span>
                    </div>
                    <h2 className="font-editorial text-3xl mb-2">Response logged.</h2>
                    <p className="text-white/80 text-sm">You are building new neuroplastic pathways.</p>
                  </div>
                )}
              </section>
            </div>

            {/* MY PATTERNS & VALUES (Right Column) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* PRACTICE HISTORY */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sanctuary border border-brand-border/30">
                <div className="flex items-center gap-2 text-brand-teal mb-4">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Recent Practice</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-canvas">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                        <span className="material-symbols-outlined text-[20px]">shield</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-ink">Response Prevention</div>
                        <div className="text-xs text-brand-ink/60 mt-0.5">Attempts this week</div>
                      </div>
                    </div>
                    <div className="font-mono text-xl font-medium text-brand-ink">4</div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-canvas">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-coralSoft flex items-center justify-center text-brand-coral">
                        <span className="material-symbols-outlined text-[20px]">pattern</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-ink">Checking Pattern</div>
                        <div className="text-xs text-brand-ink/60 mt-0.5">Most frequent context</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-brand-coral uppercase">Active</div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-canvas">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-amberSoft flex items-center justify-center text-brand-amber">
                        <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-ink">Reassurance Seeking</div>
                        <div className="text-xs text-brand-ink/60 mt-0.5">Identified urge</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-brand-amber uppercase">Active</div>
                  </div>
                </div>
              </section>

              {/* LIFE OUTSIDE OCD (Values) */}
              <section className="bg-brand-canvas rounded-3xl p-6 sm:p-8 border border-brand-border/40 shadow-sm">
                <div className="flex items-center gap-2 text-brand-lavender mb-4">
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Life Outside OCD</span>
                </div>
                <h2 className="font-editorial text-2xl text-brand-ink mb-1">More room for:</h2>
                <p className="text-brand-ink/50 text-xs mb-5">Your chosen values acting as your compass.</p>
                
                <div className="flex flex-wrap gap-2">
                  {['Career', 'Friends', 'Gym', 'Photography'].map(val => (
                    <span key={val} className="px-4 py-2 rounded-full bg-white text-brand-ink text-sm font-medium shadow-sm border border-brand-border/30">
                      {val}
                    </span>
                  ))}
                  <button className="px-4 py-2 rounded-full border border-dashed border-brand-ink/30 text-brand-ink/50 hover:text-brand-teal hover:border-brand-teal transition-colors text-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add
                  </button>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
