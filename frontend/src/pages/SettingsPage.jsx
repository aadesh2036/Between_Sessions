import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { authApi } from '../services/api';

/* ── Section wrapper ─────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm space-y-5">
      <h2 className="font-editorial text-2xl text-brand-ink">{title}</h2>
      {children}
    </div>
  );
}

/* ── Inline feedback message ─────────────────────────────────────────────── */
function Feedback({ type, msg }) {
  if (!msg) return null;
  const styles = type === 'success'
    ? 'bg-brand-softSuccess text-clinical-success border-clinical-success/20'
    : 'bg-brand-coralSoft text-brand-coral border-brand-coral/20';
  return (
    <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${styles}`}>
      <span className="material-symbols-outlined text-[16px]">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {msg}
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [searchParams] = useSearchParams();

  /* ── Profile form ─────────────────────────────────────────────────────── */
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', msg: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', msg: '' });
    try {
      await updateUser({ name: name.trim() || undefined });
      setProfileMsg({ type: 'success', msg: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', msg: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Password change ──────────────────────────────────────────────────── */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', msg: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', msg: 'Password must be at least 8 characters.' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg({ type: '', msg: '' });
    try {
      // updateUser with password uses the authenticated PUT /user/update endpoint
      await updateUser({ password: newPassword });
      setPasswordMsg({ type: 'success', msg: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', msg: err.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  /* ── Forgot-password request ─────────────────────────────────────────── */
  const [forgotEmail, setForgotEmail] = useState(user?.email || '');
  const [forgotMsg, setForgotMsg] = useState({ type: '', msg: '' });
  const [sendingReset, setSendingReset] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setForgotMsg({ type: 'error', msg: 'Email is required.' }); return; }
    setSendingReset(true);
    setForgotMsg({ type: '', msg: '' });
    try {
      await authApi.forgotPassword(forgotEmail.trim());
      setForgotMsg({ type: 'success', msg: 'If that address is registered, a reset link has been sent.' });
    } catch (err) {
      setForgotMsg({ type: 'error', msg: err.message || 'Failed to send reset email.' });
    } finally {
      setSendingReset(false);
    }
  };

  /* ── Password reset via token (from URL ?reset=<token>) ─────────────── */
  const resetToken = searchParams.get('reset');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetMsg, setResetMsg] = useState({ type: '', msg: '' });
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetNewPassword !== resetConfirmPassword) {
      setResetMsg({ type: 'error', msg: 'Passwords do not match.' });
      return;
    }
    setResettingPassword(true);
    setResetMsg({ type: '', msg: '' });
    try {
      await authApi.resetPassword(resetToken, resetNewPassword);
      setResetMsg({ type: 'success', msg: 'Password reset successfully. You can now log in with your new password.' });
    } catch (err) {
      setResetMsg({ type: 'error', msg: err.message || 'Failed to reset password. The link may have expired.' });
    } finally {
      setResettingPassword(false);
    }
  };

  /* ── Email verification resend ──────────────────────────────────────── */
  const [resendMsg, setResendMsg] = useState({ type: '', msg: '' });
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    setResendMsg({ type: '', msg: '' });
    try {
      await authApi.resendVerification(user.email);
      setResendMsg({ type: 'success', msg: 'Verification email sent. Please check your inbox.' });
    } catch (err) {
      setResendMsg({ type: 'error', msg: err.message || 'Failed to resend.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col md:flex-row overflow-x-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-[260px] lg:w-[280px] bg-white border-r border-brand-border/40 shrink-0 flex flex-col md:sticky md:top-0 md:h-screen z-20">
        <div className="p-6 md:p-8 shrink-0"><Logo /></div>
        <div className="flex-1 px-4 md:px-6 overflow-y-auto pb-6 space-y-8">
          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Sanctuary</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm" to="/app">
                <div className="w-8 h-8 rounded-full bg-brand-softerTeal flex items-center justify-center text-brand-teal">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                </div>
                <span className="text-[14px] font-medium">Home</span>
              </Link>
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm" to="/app/practice">
                <div className="w-8 h-8 rounded-full bg-brand-coralSoft flex items-center justify-center text-brand-coral">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                </div>
                <span className="text-[14px] font-medium">Practice History</span>
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Care Continuity</span>
            <nav className="flex flex-col gap-1.5">
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-brand-ink/60 hover:bg-white hover:text-brand-ink transition-all shadow-sm" to="/app/clinician">
                <div className="w-8 h-8 rounded-full bg-brand-canvas flex items-center justify-center text-brand-ink/60">
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
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold text-brand-ink truncate">{user?.name || user?.email}</div>
              <div className="text-[9px] text-brand-ink/40 font-mono mt-0.5 truncate">ID: {user?.id}</div>
            </div>
            <button onClick={logout} className="p-2 text-brand-ink/40 hover:text-brand-coral transition-colors" title="Sign out">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">

          {/* Header */}
          <header className="animate-fade-in">
            <Link to="/app" className="inline-flex items-center gap-1 text-brand-ink/40 hover:text-brand-teal text-xs font-bold mb-3 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Dashboard
            </Link>
            <h1 className="font-editorial text-4xl text-brand-ink">Settings</h1>
          </header>

          {/* Password reset form — shown when ?reset= token is in URL */}
          {resetToken && (
            <Section title="Set new password">
              <p className="text-brand-ink/60 text-sm">Enter your new password below.</p>
              <Feedback type={resetMsg.type} msg={resetMsg.msg} />
              {resetMsg.type !== 'success' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">New Password</label>
                    <input type="password" value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2.5 bg-brand-canvas border border-brand-border focus:border-brand-teal rounded-xl text-sm text-brand-ink outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Confirm Password</label>
                    <input type="password" value={resetConfirmPassword} onChange={e => setResetConfirmPassword(e.target.value)} required className="w-full px-4 py-2.5 bg-brand-canvas border border-brand-border focus:border-brand-teal rounded-xl text-sm text-brand-ink outline-none" />
                  </div>
                  <button type="submit" disabled={resettingPassword} className="px-6 py-2.5 bg-brand-ink text-white text-xs font-bold rounded-full hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60">
                    {resettingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </Section>
          )}

          {/* Email verification banner */}
          {user && !user.isVerified && (
            <div className="p-4 bg-brand-amberSoft border border-brand-amber/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-brand-amber shrink-0">mark_email_unread</span>
                <div>
                  <div className="text-xs font-bold text-brand-ink">Email not verified</div>
                  <div className="text-[11px] text-brand-ink/60 mt-0.5">Verify your email to secure your account and enable all features.</div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Feedback type={resendMsg.type} msg={resendMsg.msg} />
                <button onClick={handleResendVerification} disabled={resending} className="px-4 py-1.5 bg-white border border-brand-border rounded-full text-[10px] font-bold text-brand-teal hover:bg-brand-softerTeal transition-colors disabled:opacity-60 whitespace-nowrap">
                  {resending ? 'Sending...' : 'Resend Email'}
                </button>
              </div>
            </div>
          )}

          {/* Profile form */}
          <Section title="Profile">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Email address</label>
                <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 bg-brand-canvas text-brand-ink/40 text-sm rounded-xl cursor-not-allowed" />
                <p className="text-[10px] text-brand-ink/30 mt-1">Email cannot be changed after registration.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Display name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 bg-brand-canvas border border-brand-border focus:border-brand-teal text-brand-ink text-sm rounded-xl outline-none transition-colors"
                />
              </div>
              <Feedback type={profileMsg.type} msg={profileMsg.msg} />
              <button type="submit" disabled={savingProfile} className="px-6 py-2.5 bg-brand-ink text-white text-xs font-bold rounded-full hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60">
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </Section>

          {/* Change password */}
          <Section title="Change Password">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  className="w-full px-4 py-2.5 bg-brand-canvas border border-brand-border focus:border-brand-teal text-brand-ink text-sm rounded-xl outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 bg-brand-canvas border border-brand-border focus:border-brand-teal text-brand-ink text-sm rounded-xl outline-none transition-colors"
                />
              </div>
              <Feedback type={passwordMsg.type} msg={passwordMsg.msg} />
              <button type="submit" disabled={savingPassword} className="px-6 py-2.5 bg-brand-ink text-white text-xs font-bold rounded-full hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </Section>

          {/* Forgot password */}
          <Section title="Forgot Password">
            <p className="text-brand-ink/60 text-sm">Not logged in or forgot your password? Enter your email to receive a reset link.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-brand-canvas border border-brand-border focus:border-brand-teal text-brand-ink text-sm rounded-xl outline-none transition-colors"
                />
              </div>
              <Feedback type={forgotMsg.type} msg={forgotMsg.msg} />
              {forgotMsg.type !== 'success' && (
                <button type="submit" disabled={sendingReset} className="px-6 py-2.5 bg-brand-canvas border border-brand-border text-brand-ink text-xs font-bold rounded-full hover:bg-brand-softerTeal hover:text-brand-teal hover:border-brand-teal transition-colors shadow-sm disabled:opacity-60">
                  {sendingReset ? 'Sending...' : 'Send Reset Link'}
                </button>
              )}
            </form>
          </Section>

          {/* Danger zone */}
          <Section title="Account">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-coralSoft border border-brand-coral/20">
              <div>
                <div className="text-sm font-bold text-brand-ink">Sign out everywhere</div>
                <div className="text-[11px] text-brand-ink/60 mt-0.5">Ends your current session.</div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full bg-brand-coral text-white text-xs font-bold hover:bg-brand-ink transition-colors shadow-sm"
              >
                Sign out
              </button>
            </div>
          </Section>

          {/* Safety Footer */}
          <footer className="border-t border-brand-border/40 pt-6 text-center text-[11px] text-brand-ink/40">
            <span className="font-bold text-brand-coral">Need immediate support?</span>
            {' '}Tele-MANAS: <span className="font-mono">14416</span> · <span className="font-mono">1800-891-4416</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
