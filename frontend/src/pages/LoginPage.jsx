import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { practitionerApi, authApi } from '../services/api';
import Logo from '../components/Logo';
import BetweenLoading from '../components/BetweenLoading';

export default function LoginPage({ practitionerMode = false }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isPracRegister, setIsPracRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [govCertId, setGovCertId] = useState('');
  const [credentials, setCredentials] = useState('MD, Psychiatry');
  const [specialty, setSpecialty] = useState('Psychiatry & ERP Specialist');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);

  // Forgot password & Reset password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const { user, login, register, verifyEmail, resendEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  useEffect(() => {
    // Check if token exists in query string
    const params = new URLSearchParams(location.search);
    const urlResetToken = params.get('reset');
    if (urlResetToken) {
      setResetToken(urlResetToken);
    }

    // If already logged in, redirect away from login
    if (practitionerMode && (localStorage.getItem('bs_prac_token') || document.cookie.includes('bs_prac_token='))) {
      navigate('/practitioner', { replace: true });
      return;
    }
    if (!practitionerMode && (user || localStorage.getItem('bs_token') || document.cookie.includes('bs_token='))) {
      navigate('/app', { replace: true });
      return;
    }

    setShowEntryAnimation(true);
    const token = params.get('verify');
    if (token) {
      verifyEmail(token)
        .then(() => {
          setSuccessMsg('Email verified! You may now sign in.');
          setIsRegister(false);
        })
        .catch((err) => {
          setError(err.message || 'Verification failed or token expired.');
        });
    }
  }, [location.search, practitionerMode, user, navigate, verifyEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setNeedsVerification(false);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (practitionerMode && !govCertId.trim()) {
      setError('Please enter your Practitioner ID (e.g. MCI-2024-KM-7741).');
      return;
    }

    setIsLoading(true);
    try {
      if (practitionerMode) {
        const data = await practitionerApi.login(email, password, govCertId);
        localStorage.setItem('bs_prac_token', data.token);
        localStorage.setItem('bs_prac_user', JSON.stringify(data.practitioner));
        document.cookie = `bs_prac_token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        setTimeout(() => navigate('/practitioner', { replace: true }), 100);
      } else {
        await login(email, password);
        setTimeout(() => navigate(from, { replace: true }), 100);
      }
    } catch (err) {
      if (err.message && err.message.includes('Email not verified')) {
        setNeedsVerification(true);
      }
      setError(err.message || 'Sign in failed. Please check your credentials and try again.');
      setIsLoading(false);
    }
  };

  const handlePractitionerRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !email || !password || !govCertId) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    const regex = /^MCI-(202[4-6])-[A-Z]{2}-\d{4}$/;
    if (!regex.test(govCertId.trim())) {
      setError('Practitioner ID must match demo synthetic format: MCI-YYYY-XX-NNNN (e.g. MCI-2025-RP-3312).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await practitionerApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        govCertId: govCertId.trim(),
        credentials: credentials.trim() || 'MD, Psychiatry',
        specialty: specialty.trim() || 'Psychiatry & ERP Specialist',
      });

      if (res.token && res.practitioner) {
        localStorage.setItem('bs_prac_token', res.token);
        localStorage.setItem('bs_prac_user', JSON.stringify(res.practitioner));
        document.cookie = `bs_prac_token=${res.token}; path=/; max-age=2592000; SameSite=Lax`;
        navigate('/practitioner', { replace: true });
      } else {
        setSuccessMsg(res.message || 'Practitioner account registered successfully. You may now sign in.');
        setIsPracRegister(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to register practitioner account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

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
      const res = await register(email, password, name);
      setSuccessMsg(res.message || 'Account created successfully. Please verify your email.');
      setIsRegister(false);
    } catch (err) {
      setError(err.message || 'Error creating account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendEmail(email);
      setSuccessMsg('Verification email resent. Check your inbox.');
      setNeedsVerification(false);
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── Forgot Password Request Handler ─────────────────────────────────── */
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    const targetEmail = (forgotEmail || email).trim();
    if (!targetEmail) {
      setForgotError('Please provide your account email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword(targetEmail);
      setForgotMessage(res.message || 'If that email address is registered, a password reset link has been dispatched.');
    } catch (err) {
      setForgotError(err.message || 'Could not send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Reset Password Submission Handler ───────────────────────────────── */
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!newPassword || !confirmPassword) {
      setResetError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await authApi.resetPassword(resetToken, newPassword);
      setResetSuccess(res.message || 'Password reset successfully. You may now sign in.');
      setTimeout(() => {
        setResetToken('');
        navigate(practitionerMode ? '/practitioner/login' : '/login', { replace: true });
      }, 2000);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-brand-canvas text-brand-ink selection:bg-brand-teal selection:text-white flex flex-col justify-between font-sans transition-all duration-700 ease-out transform ${
        showEntryAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <style>{`
        /* ── Slider Card Animation ── */
        .auth-container {
          position: relative;
          width: 1000px;
          max-width: 100%;
          min-height: 640px;
          background: #FFFFFF;
          border-radius: 28px;
          border: 1px solid rgba(216, 223, 222, 0.7);
          box-shadow: 0 25px 60px -15px rgba(23, 50, 58, 0.12), 0 4px 25px rgba(23, 50, 58, 0.05);
          overflow: hidden;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
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

        .auth-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }

        .auth-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.45s;
        }

        @keyframes show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100%  { opacity: 1; z-index: 5; }
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
        }

        .auth-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          background: linear-gradient(135deg, #176B67 0%, #0F4845 50%, #17323A 100%);
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
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
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
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

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-8px) rotate(1deg); }
        }
        .animate-float {
          animation: floatSlow 5s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .sign-in-container, .sign-up-container { width: 100%; }
          .auth-container.right-panel-active .sign-in-container {
            transform: translateX(-100%);
          }
          .auth-container.right-panel-active .sign-up-container {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Logo />
          {practitionerMode && (
            <span className="text-xs font-semibold text-brand-ink/60 border-l border-brand-border pl-3 ml-1 hidden sm:inline">
              Practitioner Portal
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-softerTeal text-brand-teal text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            {practitionerMode ? 'Clinician Collaboration Suite' : 'Between Sessions works at your pace'}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <a href="tel:14416" className="text-brand-coral font-bold hover:underline hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-coral animate-pulse" />
            Tele-MANAS 14416
          </a>

          {/* Segmented Pill Switcher (Individual vs Clinician) */}
          <div className="flex items-center p-1 rounded-full bg-brand-canvas border border-brand-border shadow-xs">
            <button
              type="button"
              onClick={() => practitionerMode && navigate('/login')}
              className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
                !practitionerMode
                  ? 'bg-white text-brand-ink shadow-xs'
                  : 'text-brand-ink/55 hover:text-brand-ink'
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => !practitionerMode && navigate('/practitioner/login')}
              className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
                practitionerMode
                  ? 'bg-white text-brand-ink shadow-xs'
                  : 'text-brand-ink/55 hover:text-brand-ink'
              }`}
            >
              Clinician
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {/* ── A. RESET PASSWORD VIEW (WHEN ?reset=<token> IS IN URL) ── */}
        {resetToken ? (
          <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border/70 shadow-card-lift p-8 sm:p-10 space-y-6 animate-fade-in">
            <div className="space-y-1 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-softerTeal text-brand-teal mx-auto mb-2">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>
              <h2 className="font-editorial text-3xl text-brand-ink font-normal leading-snug">
                Set New Password
              </h2>
              <p className="text-xs text-brand-ink/65 max-w-xs mx-auto">
                Enter your new password below. It must contain at least 8 characters.
              </p>
            </div>

            {resetSuccess && (
              <div className="p-4 rounded-xl bg-brand-softerTeal text-brand-teal text-xs font-medium border border-brand-teal/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-4 rounded-xl bg-brand-coralSoft text-brand-coral text-xs font-medium border border-brand-coral/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{resetError}</span>
              </div>
            )}

            {!resetSuccess && (
              <form className="space-y-4" onSubmit={handleResetPasswordSubmit} noValidate>
                <div>
                  <label className="block text-xs font-semibold text-brand-ink mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                    required
                    autoComplete="new-password"
                  />
                  {/* Strength bar */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1 flex-1 rounded-full bg-brand-teal" />
                    <div className="h-1 flex-1 rounded-full bg-brand-teal" />
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-brand-teal' : 'bg-brand-teal/30'}`} />
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 12 ? 'bg-brand-teal' : 'bg-brand-teal/20'}`} />
                    <span className="text-[10px] text-brand-ink/60 ml-1">
                      {newPassword.length >= 12 ? 'Strong' : newPassword.length >= 8 ? 'Good' : 'Min 8 chars'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-ink mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {resetLoading ? 'Updating Password…' : 'Update Password'}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetToken('');
                  navigate(practitionerMode ? '/practitioner/login' : '/login', { replace: true });
                }}
                className="text-xs text-brand-ink/60 hover:text-brand-ink font-medium underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : practitionerMode ? (
          /* ── B. PRACTITIONER SLIDING DUAL-PANEL ── */
          <div key="clinician-auth-panel" className={`auth-container animate-tab-switch ${isPracRegister ? 'right-panel-active' : ''}`}>
            {/* 1. Practitioner Sign In Form (Left) */}
            <div className="form-container sign-in-container flex flex-col justify-center px-8 sm:px-14 py-10 bg-white">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal text-[11px] font-semibold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                    Clinician Portal
                  </div>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal leading-tight">
                    Clinician Sign In
                  </h2>
                  <p className="text-xs text-brand-ink/65 mt-0.5">
                    Access your patient roster and consent-governed logs.
                  </p>
                </div>

                {/* Demo autofill helper */}
                <div className="p-3 bg-brand-softerTeal/70 border border-brand-teal/20 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-teal">Demo Clinician</span>
                    <p className="text-[11px] text-brand-ink/60">Dr. Kavita Mehra (MCI-2024-KM-7741)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('kavita@betweensessions.com');
                      setPassword('Prac1234!');
                      setGovCertId('MCI-2024-KM-7741');
                      setError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-brand-teal text-white text-[10px] font-bold hover:bg-brand-tealDark transition-colors shadow-xs"
                  >
                    Autofill
                  </button>
                </div>

                {/* Banners */}
                {successMsg && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-brand-softerTeal text-brand-teal text-xs font-medium">
                    {successMsg}
                  </div>
                )}
                {error && !isPracRegister && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-brand-coralSoft text-brand-coral text-xs font-medium">
                    {error}
                  </div>
                )}

                <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="prac-email" className="block text-xs font-semibold text-brand-ink mb-1">
                      Work Email
                    </label>
                    <input
                      id="prac-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kavita@betweensessions.com"
                      className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="prac-password" className="block text-xs font-semibold text-brand-ink">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setShowForgotModal(true);
                        }}
                        className="text-[11px] text-brand-teal hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="prac-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <label htmlFor="prac-gov-id" className="block text-xs font-semibold text-brand-ink mb-1">
                      Practitioner ID
                    </label>
                    <input
                      id="prac-gov-id"
                      type="text"
                      value={govCertId}
                      onChange={(e) => setGovCertId(e.target.value)}
                      placeholder="MCI-2024-KM-7741"
                      className="w-full px-4 py-2 text-xs font-mono rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <p className="mt-1 text-[10px] text-brand-ink/50">
                      Synthetic demo format: <span className="font-mono">MCI-YYYY-XX-NNNN</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-full bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <BetweenLoading size="xs" inline />
                        <span>Verifying Credentials…</span>
                      </span>
                    ) : (
                      <>
                        <span>Sign in as Practitioner</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* Mobile switch */}
                <div className="text-center pt-1 md:hidden">
                  <p className="text-xs text-brand-ink/70">
                    New clinician?{' '}
                    <button
                      type="button"
                      onClick={() => setIsPracRegister(true)}
                      className="font-bold text-brand-teal hover:underline"
                    >
                      Register practitioner
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Practitioner Register Form (Right) */}
            <div className="form-container sign-up-container flex flex-col justify-center px-8 sm:px-14 py-8 bg-white overflow-y-auto">
              <div className="w-full max-w-md mx-auto space-y-3.5 my-auto">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-amberSoft text-brand-amber text-[11px] font-semibold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
                    New Clinician
                  </div>
                  <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-normal leading-tight">
                    Register Practitioner
                  </h2>
                  <p className="text-xs text-brand-ink/65">
                    Connect with patients through consent-governed longitudinal care.
                  </p>
                </div>

                {error && isPracRegister && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-brand-coralSoft text-brand-coral text-xs font-medium">
                    {error}
                  </div>
                )}

                <form className="space-y-2.5" onSubmit={handlePractitionerRegisterSubmit} noValidate>
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink mb-0.5">
                      Full Name &amp; Title
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Rajiv Patel"
                      className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-brand-ink mb-0.5">
                        Work Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rajiv@clinic.com"
                        className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-ink mb-0.5">
                        Password (min 8)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-xs font-semibold text-brand-ink">
                        Practitioner ID
                      </label>
                      <button
                        type="button"
                        onClick={() => setGovCertId('MCI-2025-RP-3312')}
                        className="text-[10px] text-brand-teal hover:underline font-mono"
                      >
                        Autofill: MCI-2025-RP-3312
                      </button>
                    </div>
                    <input
                      type="text"
                      value={govCertId}
                      onChange={(e) => setGovCertId(e.target.value)}
                      placeholder="MCI-2025-RP-3312"
                      className="w-full px-3.5 py-1.5 text-xs font-mono rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-brand-ink mb-0.5">
                        Credentials
                      </label>
                      <input
                        type="text"
                        value={credentials}
                        onChange={(e) => setCredentials(e.target.value)}
                        placeholder="MD, Psychiatry"
                        className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-ink mb-0.5">
                        Specialty
                      </label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="ERP & OCD Specialist"
                        className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-full bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <BetweenLoading size="xs" inline />
                        <span>Registering Practitioner…</span>
                      </span>
                    ) : (
                      <span>Register Practitioner Account</span>
                    )}
                  </button>
                </form>

                <div className="text-center pt-1 md:hidden">
                  <p className="text-xs text-brand-ink/70">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setIsPracRegister(false)}
                      className="font-bold text-brand-teal hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Practitioner Overlay Panels (Sliding) */}
            <div className="overlay-container hidden md:block pointer-events-none">
              <div className="overlay">
                {/* OVERLAY LEFT — shown when register is active, invites back to sign in */}
                <div className="overlay-panel overlay-left pointer-events-auto">
                  <div className="w-24 h-24 mb-3 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 animate-float">
                    <span className="material-symbols-outlined text-4xl text-white">clinical_notes</span>
                  </div>
                  <h3 className="font-editorial text-3xl font-normal tracking-tight text-white mb-2">
                    Welcome Back, Clinician.
                  </h3>
                  <p className="text-xs text-white/80 max-w-xs leading-relaxed mb-6">
                    Already verified with Between Sessions? Sign in to review your active patient roster.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPracRegister(false)}
                    className="px-8 py-3 rounded-full border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-brand-teal transition-all shadow-md"
                  >
                    Clinician Sign In
                  </button>
                </div>

                {/* OVERLAY RIGHT — shown when sign in is active, invites to register */}
                <div className="overlay-panel overlay-right pointer-events-auto">
                  <div className="w-24 h-24 mb-3 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 animate-float">
                    <span className="material-symbols-outlined text-4xl text-white">stethoscope</span>
                  </div>
                  <h3 className="font-editorial text-3xl font-normal tracking-tight text-white mb-2">
                    Join Clinical Network.
                  </h3>
                  <p className="text-xs text-white/80 max-w-xs leading-relaxed mb-6">
                    Support patients between therapy appointments with structured, consent-managed logs and objective SUDS trends.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPracRegister(true)}
                    className="px-8 py-3 rounded-full border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-brand-teal transition-all shadow-md"
                  >
                    Register Practitioner
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── C. INDIVIDUAL SLIDING DUAL-PANEL ── */
          <div key="individual-auth-panel" className={`auth-container animate-tab-switch ${isRegister ? 'right-panel-active' : ''}`}>
            {/* 1. Individual Sign In Form (Left) */}
            <div className="form-container sign-in-container flex flex-col justify-center px-8 sm:px-14 py-10 bg-white">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal text-[11px] font-semibold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                    Your account
                  </div>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal leading-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs text-brand-ink/65 mt-0.5">
                    Sign in to your Between Sessions account
                  </p>
                </div>

                {/* Quick Autofill Buttons for Demo Users */}
                <div className="p-2.5 bg-brand-softerTeal/70 border border-brand-teal/20 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-teal">Demo Accounts:</span>
                    <p className="text-[11px] text-brand-ink/60">Priya (Connected) or Alex (New)</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('priya@betweensessions.com');
                        setPassword('Demo1234!');
                        setError('');
                      }}
                      className="px-2 py-1 rounded-lg bg-brand-teal text-white text-[10px] font-bold hover:bg-brand-tealDark transition-colors shadow-xs"
                    >
                      Priya
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('alex@betweensessions.com');
                        setPassword('Demo1234!');
                        setError('');
                      }}
                      className="px-2 py-1 rounded-lg bg-white border border-brand-teal text-brand-teal text-[10px] font-bold hover:bg-brand-softerTeal transition-colors shadow-xs"
                    >
                      Alex
                    </button>
                  </div>
                </div>

                {successMsg && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-brand-softerTeal text-brand-teal text-xs font-medium">
                    {successMsg}
                  </div>
                )}
                {needsVerification && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-brand-amberSoft text-brand-amber text-xs font-medium flex items-center justify-between">
                    <span>Your email isn't verified yet.</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      className="ml-3 underline font-semibold hover:no-underline"
                    >
                      Resend link
                    </button>
                  </div>
                )}

                <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="user-email" className="block text-xs font-semibold text-brand-ink mb-1">
                      Email address
                    </label>
                    <input
                      id="user-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="user-password" className="block text-xs font-semibold text-brand-ink">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setShowForgotModal(true);
                        }}
                        className="text-[11px] text-brand-teal hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="user-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  {error && !isRegister && (
                    <p className="text-xs text-brand-coral font-semibold">{error}</p>
                  )}

                  <div className="flex items-center gap-2 text-[11px] pt-0.5">
                    <input
                      type="checkbox"
                      id="remember"
                      defaultChecked
                      className="w-3.5 h-3.5 rounded text-brand-teal focus:ring-brand-teal border-brand-border"
                    />
                    <label htmlFor="remember" className="text-brand-ink/75 cursor-pointer select-none">
                      Keep me signed in on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-full bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <BetweenLoading size="xs" inline />
                        <span>Signing in…</span>
                      </span>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="p-2.5 rounded-xl bg-brand-amberSoft text-brand-ink text-[10.5px] flex items-start gap-2">
                  <span className="text-brand-amber font-bold text-xs mt-0.5">●</span>
                  <span>Between Sessions works at your pace. No time pressure, no streak penalties.</span>
                </div>

                <div className="text-center pt-1 md:hidden">
                  <p className="text-xs text-brand-ink/70">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegister(true)}
                      className="font-bold text-brand-teal hover:underline"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Individual Register Form (Right) */}
            <div className="form-container sign-up-container flex flex-col justify-center px-8 sm:px-14 py-10 bg-white">
              <div className="w-full max-w-md mx-auto space-y-3.5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-coralSoft text-brand-coral text-[11px] font-semibold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-coral" />
                    New account
                  </div>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-normal leading-tight">
                    Create your account
                  </h2>
                  <p className="text-xs text-brand-ink/65 mt-0.5">
                    Anonymous alias welcomed. No clinical labels or pressure to perform.
                  </p>
                </div>

                <form className="space-y-3" onSubmit={handleRegisterSubmit} noValidate>
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-semibold text-brand-ink mb-1">
                      Preferred name or alias
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex or SkySeeker"
                      className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="name"
                    />
                    <p className="text-[10px] text-brand-ink/50 mt-0.5">Legal name is never required.</p>
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-semibold text-brand-ink mb-1">
                      Email address
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-semibold text-brand-ink mb-1">
                      Password
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-2 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                      required
                      autoComplete="new-password"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="h-1 flex-1 rounded-full bg-brand-teal" />
                      <div className="h-1 flex-1 rounded-full bg-brand-teal" />
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-brand-teal' : 'bg-brand-teal/30'}`} />
                      <div className={`h-1 flex-1 rounded-full ${password.length >= 12 ? 'bg-brand-teal' : 'bg-brand-teal/20'}`} />
                      <span className="text-[10px] text-brand-ink/60 ml-1">
                        {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Min 8'}
                      </span>
                    </div>
                  </div>

                  {error && isRegister && (
                    <p className="text-xs text-brand-coral font-semibold">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-full bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <BetweenLoading size="xs" inline />
                        <span>Creating account…</span>
                      </span>
                    ) : (
                      <>
                        <span>Create account</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-1 md:hidden">
                  <p className="text-xs text-brand-ink/70">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegister(false)}
                      className="font-bold text-brand-teal hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Individual Overlay Panels (Sliding) */}
            <div className="overlay-container hidden md:block pointer-events-none">
              <div className="overlay">
                {/* OVERLAY LEFT */}
                <div className="overlay-panel overlay-left pointer-events-auto">
                  <div className="w-28 h-28 mb-3 animate-float">
                    <svg height="100%" viewBox="0 0 460 480" width="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="overlayMascotL" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#9ADBE8" />
                          <stop offset="100%" stopColor="#6DC4D6" />
                        </linearGradient>
                      </defs>
                      <circle cx="230" cy="240" fill="url(#overlayMascotL)" r="120" />
                      <path d="M180 230 C190 215 205 215 215 230" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="7" />
                      <path d="M245 230 C255 215 270 215 280 230" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="7" />
                      <path d="M205 265 Q230 290 255 265" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="7" />
                      <ellipse cx="170" cy="255" fill="#E8856C" opacity="0.5" rx="14" ry="9" />
                      <ellipse cx="290" cy="255" fill="#E8856C" opacity="0.5" rx="14" ry="9" />
                    </svg>
                  </div>

                  <h3 className="font-editorial text-3xl font-normal tracking-tight text-white mb-2">
                    Welcome back.
                  </h3>
                  <p className="text-xs text-white/80 max-w-xs leading-relaxed mb-6">
                    Already have an account? Sign in to continue where you left off.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="px-8 py-3 rounded-full border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-brand-teal transition-all shadow-md"
                  >
                    Sign In
                  </button>
                </div>

                {/* OVERLAY RIGHT */}
                <div className="overlay-panel overlay-right pointer-events-auto">
                  <div className="w-32 h-32 mb-2 animate-float">
                    <svg height="100%" viewBox="0 0 460 480" width="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="overlayMascotR" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#9ADBE8" />
                          <stop offset="100%" stopColor="#6DC4D6" />
                        </linearGradient>
                      </defs>
                      <rect x="150" y="50" width="60" height="50" rx="8" fill="#1E3A4B" />
                      <rect x="230" y="50" width="60" height="50" rx="8" fill="#8DBFA4" />
                      <rect x="150" y="115" width="60" height="50" rx="8" fill="#F7DC78" />
                      <rect x="230" y="115" width="60" height="50" rx="8" fill="#E8856C" />
                      <circle cx="220" cy="270" fill="url(#overlayMascotR)" r="100" />
                      <path d="M180 265 Q195 275 210 265" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="6" />
                      <path d="M230 265 Q245 275 260 265" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="6" />
                      <path d="M210 295 Q220 300 230 295" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="5" />
                      <ellipse cx="170" cy="280" fill="#E8856C" opacity="0.4" rx="12" ry="7" />
                      <ellipse cx="270" cy="280" fill="#E8856C" opacity="0.4" rx="12" ry="7" />
                    </svg>
                  </div>

                  <h3 className="font-editorial text-3xl font-normal tracking-tight text-white mb-2">
                    Hello, welcome.
                  </h3>
                  <p className="text-xs text-white/80 max-w-xs leading-relaxed mb-6">
                    Track patterns, practice structured exercises, share with your practitioner — at your pace.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="px-8 py-3 rounded-full border-2 border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-brand-ink transition-all shadow-md"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal text-[11px] font-semibold">
                <span className="material-symbols-outlined text-sm">mail</span>
                Password Recovery
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotError('');
                  setForgotMessage('');
                }}
                className="w-7 h-7 rounded-full bg-brand-canvas hover:bg-brand-border/50 flex items-center justify-center text-brand-ink/60 hover:text-brand-ink transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-editorial text-2xl text-brand-ink font-normal leading-snug">
                Reset your password
              </h3>
              <p className="text-xs text-brand-ink/65 mt-1">
                Enter your registered email address. We'll send a secure password reset link to your email inbox.
              </p>
            </div>

            {forgotMessage && (
              <div className="p-3.5 rounded-xl bg-brand-softerTeal text-brand-teal text-xs font-medium border border-brand-teal/20 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                  <span>{forgotMessage}</span>
                </div>
              </div>
            )}

            {forgotError && (
              <div className="p-3 rounded-xl bg-brand-coralSoft text-brand-coral text-xs font-medium border border-brand-coral/20">
                {forgotError}
              </div>
            )}

            {!forgotMessage && (
              <form className="space-y-4" onSubmit={handleForgotPasswordSubmit} noValidate>
                <div>
                  <label htmlFor="forgot-email-input" className="block text-xs font-semibold text-brand-ink mb-1">
                    Account Email Address
                  </label>
                  <input
                    id="forgot-email-input"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-canvas border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none transition-colors text-brand-ink"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-brand-ink/70 hover:text-brand-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-full bg-brand-teal text-white font-bold text-xs hover:bg-brand-tealDark shadow-sm transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="w-full px-6 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-ink/60">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-[9px]">
            BS
          </div>
          <span>Between Sessions Health Inc. • Zero Behavioral Ad Profiling</span>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <a href="tel:14416" className="text-brand-coral font-semibold hover:underline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-coral" />
            Tele-MANAS 14416
          </a>
          <a href="tel:18008914416" className="text-brand-coral hover:underline">
            1800-891-4416
          </a>
          <span className="text-brand-ink/40">24/7 Free Crisis Telephony</span>
        </div>
      </footer>
    </div>
  );
}
