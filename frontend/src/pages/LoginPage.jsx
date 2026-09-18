import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  
  const { login, register, verifyEmail, resendEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  useEffect(() => {
    setShowEntryAnimation(true);
    const params = new URLSearchParams(location.search);
    const token = params.get('verify');
    if (token) {
      verifyEmail(token).then(() => {
        setSuccessMsg("Email verified! You may now sign in.");
        setIsRegister(false);
      }).catch(err => {
        setError(err.message || "Verification failed or token expired.");
      });
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setNeedsVerification(false);
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      setTimeout(() => navigate(from, { replace: true }), 100);
    } catch (err) {
      if (err.message.includes('Email not verified')) setNeedsVerification(true);
      setError(err.message || 'Error connecting to sanctuary. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    
    if (!email || !password || !name) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(email, password, name); // pass name if backend updated
      setSuccessMsg(res.message);
      setIsRegister(false); // flip back to sign in
    } catch (err) {
      setError(err.message || 'Error creating account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendEmail(email);
      setSuccessMsg("Verification email resent. Check your inbox.");
      setNeedsVerification(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const triggerBreathingPacer = () => {
    alert("Breathe in for 4 seconds... Hold gently for 7... Exhale slowly for 8. Notice: Thoughts are just visitors; there is no urgency right now.");
  };

  return (
    <div className={`min-h-screen bg-brand-canvas text-brand-ink selection:bg-brand-coral selection:text-white flex flex-col justify-between font-sans transition-all duration-700 ease-out transform ${showEntryAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      <style>{`
        /* Slider Card Animation Logic */
        .auth-container {
          position: relative;
          width: 1000px;
          max-width: 100%;
          min-height: 640px;
          background: #FFFFFF;
          border-radius: 36px;
          box-shadow: 0 25px 60px -15px rgba(23, 50, 58, 0.12), 0 4px 25px rgba(23, 50, 58, 0.05);
          overflow: hidden;
        }

        /* Form containers */
        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.65s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
        }

        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        /* When Register Active */
        .auth-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }

        .auth-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.65s;
        }

        @keyframes show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }

        /* Overlay sliding container */
        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
          z-index: 100;
        }

        .auth-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        /* Overlay inner gradient background */
        .overlay {
          background: linear-gradient(135deg, #176B67 0%, #0F4845 50%, #17323A 100%);
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
          color: #FFFFFF;
        }

        .auth-container.right-panel-active .overlay {
          transform: translateX(50%);
        }

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 44px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .overlay-left {
          transform: translateX(-20%);
        }

        .auth-container.right-panel-active .overlay-left {
          transform: translateX(0);
        }

        .overlay-right {
          right: 0;
          transform: translateX(0);
        }

        .auth-container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }

        /* Mascot subtle breathing & pulse */
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        .animate-float {
          animation: floatSlow 5s ease-in-out infinite;
        }
        
        @media (max-width: 768px) {
          .sign-in-container, .sign-up-container {
            width: 100%;
          }
          .auth-container.right-panel-active .sign-in-container {
            transform: translateX(-100%);
          }
          .auth-container.right-panel-active .sign-up-container {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* TOP CONTEXT NAVBAR */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Logo />

        {/* Calming Somatic Emergency / Grounding Bar */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-softerTeal text-brand-teal text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse"></span>
            <span>Sanctuary Rhythm: No timeouts, no rush</span>
          </div>
          <button onClick={triggerBreathingPacer} className="px-3.5 py-1.5 rounded-full bg-white border border-brand-border text-brand-ink text-xs font-medium hover:bg-brand-sand transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-teal" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9" strokeLinecap="round"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            <span>4–7–8 Somatic Pause</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-brand-ink/60 hidden md:inline">Need care?</span>
          <a href="tel:988" className="text-brand-coral font-bold hover:underline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-coral"></span>
            Crisis Lifeline (988)
          </a>
        </div>
      </header>

      {/* MAIN ANIMATED SLIDING SANCTUARY CONTAINER */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className={`auth-container ${isRegister ? 'right-panel-active' : ''}`} id="authContainer">
          
          {/* ================= 1. SIGN IN FORM CONTAINER ================= */}
          <div className="form-container sign-in-container flex flex-col justify-center px-8 sm:px-14 py-10 bg-white">
            <div className="w-full max-w-md mx-auto space-y-5">
              
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal text-[11px] font-semibold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
                  Zero-Pressure Threshold
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal leading-tight">
                  Welcome back to <span className="italic text-brand-teal">quiet</span>.
                </h2>
                <p className="text-xs text-brand-ink/65 mt-1">
                  Access your private urge log, grounding pace, and exposure ladder.
                </p>
              </div>

              {/* Form Elements */}
              <form className="space-y-3.5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-brand-ink mb-1">Sanctuary Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. confidential@email.com" 
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-brand-ink">Sanctuary Passphrase (Mocked)</label>
                    <button type="button" className="text-[11px] text-brand-teal hover:underline font-medium">Forgot key?</button>
                  </div>
                  <div className="relative">
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••" 
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                    />
                  </div>
                </div>

                {error && !isRegister && (
                  <p className="text-xs text-brand-coral font-bold">{error}</p>
                )}

                {/* OCD-friendly reassurance check */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-brand-teal focus:ring-brand-teal border-gray-300" />
                    <span className="text-brand-ink/75">Keep me grounded on this trusted device</span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                >
                  <span>{isLoading ? 'Verifying...' : 'Enter Your Sanctuary'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </form>

              {/* Calming micro note */}
              <div className="p-2.5 rounded-xl bg-brand-amberSoft text-brand-ink text-[10.5px] flex items-start gap-2">
                <span className="text-brand-amber font-bold text-xs mt-0.5">●</span>
                <span><strong>Zero Urgency Protocol:</strong> If doubts arise about typing errors or verification, your space remains safe and locked without locks or strikes.</span>
              </div>

              {/* Switch trigger for mobile */}
              <div className="text-center pt-2 md:hidden">
                <p className="text-xs text-brand-ink/70">
                  Don't have a sanctuary yet?
                  <button type="button" onClick={() => setIsRegister(true)} className="font-bold text-brand-teal hover:underline ml-1">Begin here</button>
                </p>
              </div>

            </div>
          </div>


          {/* ================= 2. REGISTER / CREATE ACCOUNT FORM CONTAINER ================= */}
          <div className="form-container sign-up-container flex flex-col justify-center px-8 sm:px-14 py-10 bg-white">
            <div className="w-full max-w-md mx-auto space-y-4">
              
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-coralSoft text-brand-coral text-[11px] font-semibold mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-coral"></span>
                  Non-Judgmental Onboarding
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal leading-tight">
                  Create your <span className="italic text-brand-coral">safe space</span>.
                </h2>
                <p className="text-xs text-brand-ink/65 mt-0.5">
                  Anonymous alias welcomed. No clinical labels or pressure to perform.
                </p>
              </div>

              {/* Form Elements */}
              <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                {/* Pseudonym / Sanctuary Alias */}
                <div>
                  <label className="block text-xs font-semibold text-brand-ink mb-1">Preferred Alias or Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex, SkySeeker, or QuietHaven" className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink" required />
                  <p className="text-[10px] text-brand-ink/50 mt-0.5">Legal name is never required. Privacy is guaranteed.</p>
                </div>

                {/* Email or Vault Handle */}
                <div>
                  <label className="block text-xs font-semibold text-brand-ink mb-1">Email or Offline Vault Handle</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@peacefulmail.com" 
                    className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                    required
                  />
                </div>

                {/* Passphrase with gentle strength guide */}
                <div>
                  <label className="block text-xs font-semibold text-brand-ink mb-1">Sanctuary Passphrase</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a comforting, secure phrase (min 8 chars)" className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink" required />
                  
                  {/* Gentle non-punitive meter */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="h-1 flex-1 rounded-full bg-brand-teal"></div>
                    <div className="h-1 flex-1 rounded-full bg-brand-teal"></div>
                    <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-brand-teal' : 'bg-brand-teal/30'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${password.length >= 12 ? 'bg-brand-teal' : 'bg-brand-teal/20'}`}></div>
                    <span className="text-[10px] font-mono text-brand-ink/60 ml-1">Calm & Resilient</span>
                  </div>
                </div>

                {error && isRegister && (
                  <p className="text-xs text-brand-coral font-bold">{error}</p>
                )}

                {/* Submit CTA */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-brand-coral text-white font-bold text-xs hover:opacity-90 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70"
                >
                  <span>{isLoading ? 'Creating...' : 'Begin Your Sanctuary'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </form>

              <p className="text-[10.5px] text-center text-brand-ink/50 font-mono">
                By continuing, you are wrapped in HIPAA Tier-4 client-side salted hashing.
              </p>

              {/* Switch trigger for mobile */}
              <div className="text-center pt-1 md:hidden">
                <p className="text-xs text-brand-ink/70">
                  Already have an account?
                  <button type="button" onClick={() => setIsRegister(false)} className="font-bold text-brand-teal hover:underline ml-1">Sign in</button>
                </p>
              </div>

            </div>
          </div>


          {/* ================= 3. ANIMATED SLIDING OVERLAY ================= */}
          <div className="overlay-container hidden md:block pointer-events-none">
            <div className="overlay">
              
              {/* OVERLAY LEFT: Visible when Register Panel is active -> Invites to Sign In */}
              <div className="overlay-panel overlay-left pointer-events-auto">
                <div className="w-28 h-28 mb-3 animate-float">
                  <svg height="100%" viewBox="0 0 460 480" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="overlayMascot" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#9ADBE8"></stop>
                        <stop offset="100%" stopColor="#6DC4D6"></stop>
                      </linearGradient>
                    </defs>
                    <circle cx="230" cy="240" fill="url(#overlayMascot)" r="120"></circle>
                    <path d="M 180 230 C 190 215 205 215 215 230" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="7"></path>
                    <path d="M 245 230 C 255 215 270 215 280 230" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="7"></path>
                    <path d="M 205 265 Q 230 290 255 265" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="7"></path>
                    <ellipse cx="170" cy="255" fill="#E8856C" opacity="0.5" rx="14" ry="9"></ellipse>
                    <ellipse cx="290" cy="255" fill="#E8856C" opacity="0.5" rx="14" ry="9"></ellipse>
                    <path d="M 230 120 C 230 90 205 80 190 85 C 185 105 215 113 230 120 Z" fill="#8DBFA4"></path>
                    <path d="M 230 120 C 230 85 255 75 270 83 C 272 103 245 113 230 120 Z" fill="#F7C142"></path>
                  </svg>
                </div>

                <h3 className="font-editorial text-3xl font-normal tracking-tight text-white mb-2">
                  Welcome Home to <span className="italic text-[#F7DC78]">quiet</span>
                </h3>
                <p className="text-xs text-white/80 max-w-xs leading-relaxed mb-6">
                  Already have an active sanctuary key or biometric session? Sign in to continue your gentle daily rhythm.
                </p>
                <button type="button" onClick={() => setIsRegister(false)} className="px-8 py-3 rounded-full border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-brand-teal transition-all shadow-md">
                  Sign In
                </button>
              </div>

              {/* OVERLAY RIGHT: Visible when Sign In is active -> Invites to Register */}
              <div className="overlay-panel overlay-right pointer-events-auto">
                <div className="w-32 h-32 mb-2 animate-float">
                  <svg height="100%" viewBox="0 0 460 480" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="overlayMascot2" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#9ADBE8"></stop>
                        <stop offset="100%" stopColor="#6DC4D6"></stop>
                      </linearGradient>
                    </defs>
                    <rect x="150" y="50" width="60" height="50" rx="8" fill="#1E3A4B"></rect>
                    <rect x="230" y="50" width="60" height="50" rx="8" fill="#8DBFA4"></rect>
                    <rect x="150" y="115" width="60" height="50" rx="8" fill="#F7DC78"></rect>
                    <rect x="230" y="115" width="60" height="50" rx="8" fill="#E8856C"></rect>
                    <circle cx="220" cy="270" fill="url(#overlayMascot2)" r="100"></circle>
                    <path d="M 180 265 Q 195 275 210 265" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="6"></path>
                    <path d="M 230 265 Q 245 275 260 265" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="6"></path>
                    <path d="M 210 295 Q 220 300 230 295" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="5"></path>
                    <ellipse cx="170" cy="280" fill="#E8856C" opacity="0.4" rx="12" ry="7"></ellipse>
                    <ellipse cx="270" cy="280" fill="#E8856C" opacity="0.4" rx="12" ry="7"></ellipse>
                  </svg>
                </div>

                <h3 className="font-editorial text-3xl font-normal tracking-tight text-white mb-2">
                  Hello <span className="italic text-[#F7DC78]">World</span>.
                </h3>
                <p className="text-xs text-white/80 max-w-xs leading-relaxed mb-6">
                  Sign up now and begin your sanctuary. Safe, dignified micro-tools to tame the loops without shame.
                </p>
                <button type="button" onClick={() => setIsRegister(true)} className="px-8 py-3 rounded-full border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-brand-ink transition-all shadow-md">
                  Sign Up
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* BOTTOM SUPPORT & CLINICAL TRUST FOOTER */}
      <footer className="w-full px-6 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-ink/60">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-[9px]">BS</div>
          <span>Between Sessions Health Inc. • Zero Behavioral Ad Profiling</span>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <Link to="/login" className="hover:text-brand-teal transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-brand-teal" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>SOC2 Type-II & HIPAA Encrypted</span>
          </Link>
          <Link to="/login" className="hover:text-brand-teal transition-colors font-medium">Clinician Terminal Portal →</Link>
        </div>
      </footer>
    </div>
  );
}
