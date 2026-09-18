import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import { authApi, checkinsApi, practiceApi } from '../services/api';

/* ── Inline feedback message ─────────────────────────────────────────────── */
function Feedback({ type, msg }) {
  if (!msg) return null;
  const styles = type === 'success'
    ? 'bg-brand-softSuccess text-clinical-success border-clinical-success/30'
    : 'bg-brand-coralSoft text-brand-coral border-brand-coral/30';
  return (
    <div className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2.5 animate-fade-in ${styles}`}>
      <span className="material-symbols-outlined text-[18px]">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <span>{msg}</span>
    </div>
  );
}

const DEFAULT_VALUE_SUGGESTIONS = [
  'Creative Expression',
  'Family & Friends',
  'Mindful Movement',
  'Music & Art',
  'Nature & Walks',
  'Cooking & Food',
  'Lifelong Learning',
  'Career & Craft',
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [searchParams] = useSearchParams();

  /* ── Profile state ─────────────────────────────────────────────────────── */
  const [name, setName] = useState(user?.name || '');
  const [userValues, setUserValues] = useState(user?.values || ['Creative Writing', 'Morning Coffee Ritual', 'Guitar']);
  const [customValueInput, setCustomValueInput] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', msg: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  /* ── Password change state ────────────────────────────────────────────── */
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', msg: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  /* ── Password reset via URL token ─────────────────────────────────────── */
  const resetToken = searchParams.get('reset');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetMsg, setResetMsg] = useState({ type: '', msg: '' });
  const [resettingPassword, setResettingPassword] = useState(false);

  /* ── Email verification resend ────────────────────────────────────────── */
  const [resendMsg, setResendMsg] = useState({ type: '', msg: '' });
  const [resending, setResending] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', msg: '' });
    try {
      await updateUser({
        name: name.trim() || undefined,
        values: userValues,
      });
      setProfileMsg({ type: 'success', msg: 'Profile and core values updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', msg: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddValue = (val) => {
    const trimmed = val.trim();
    if (!trimmed || userValues.includes(trimmed)) return;
    setUserValues([...userValues, trimmed]);
    setCustomValueInput('');
  };

  const handleRemoveValue = (valToRemove) => {
    setUserValues(userValues.filter((v) => v !== valToRemove));
  };

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
      await updateUser({ password: newPassword });
      setPasswordMsg({ type: 'success', msg: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', msg: err.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

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
      setResetMsg({
        type: 'success',
        msg: 'Password reset successfully. You can now log in with your new password.',
      });
    } catch (err) {
      setResetMsg({ type: 'error', msg: err.message || 'Failed to reset password. The link may have expired.' });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMsg({ type: '', msg: '' });
    try {
      await authApi.resendVerification(user.email);
      setResendMsg({ type: 'success', msg: 'Verification email sent. Please check your inbox.' });
    } catch (err) {
      setResendMsg({ type: 'error', msg: err.message || 'Failed to resend verification email.' });
    } finally {
      setResending(false);
    }
  };

  const initialLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

        {/* ── Top Header Navigation & Title ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 text-xs text-brand-ink/50 hover:text-brand-teal transition-colors font-medium mb-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Return to Dashboard</span>
            </Link>
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium leading-tight">
              Sanctuary Settings & <span className="italic text-brand-teal">Preferences</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-ink/65 mt-0.5">
              Personal credentials, life outside OCD values, and Cedar-verified data boundaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-softerTeal text-brand-teal border border-brand-teal/20">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              Secure Session Active
            </span>
          </div>
        </div>

        {/* ── Profile Summary Banner (Full Width) ─────────────────────────── */}
        <div className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-card-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-softerTeal text-brand-teal flex items-center justify-center font-editorial text-2xl font-bold border border-brand-teal/30 shadow-xs shrink-0">
                {initialLetter}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-editorial text-2xl text-brand-ink font-medium">
                    {user?.name || 'Practicing Member'}
                  </h2>
                  {user?.isVerified ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-softSuccess text-clinical-success text-[10px] font-bold border border-clinical-success/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-amberSoft text-brand-amber text-[10px] font-bold border border-brand-amber/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">mail</span>
                      Verification Pending
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-brand-ink/60">
                  <span className="font-mono">{user?.email}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-brand-ink/40">ID: {user?.id || 'usr_current'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-brand-coralSoft text-brand-coral hover:bg-brand-coral hover:text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Password Reset Banner (If reset param exists in URL) ─────────── */}
        {resetToken && (
          <div className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-teal/40 shadow-card-lift space-y-4">
            <div>
              <h2 className="font-editorial text-2xl text-brand-ink font-medium">Reset Your Account Password</h2>
              <p className="text-xs text-brand-ink/60 mt-0.5">Enter a replacement password for your account.</p>
            </div>
            <Feedback {...resetMsg} />
            <form onSubmit={handleResetPassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={resettingPassword}
                className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
              >
                {resettingPassword ? 'Resetting...' : 'Set New Password'}
              </button>
            </form>
          </div>
        )}

        {/* ── Bento Grid: Profile & Values (Col 1) and Security (Col 2) ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Box 1: Profile & Life Outside OCD (Cols 1-7) ─────────────────── */}
          <div className="lg:col-span-7 bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-card-lift space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-teal mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand-teal" />
                  <span className="text-xs font-bold uppercase tracking-widest">Personal Sanctuary</span>
                </div>
                <h2 className="font-editorial text-2xl text-brand-ink font-medium">
                  Profile & Life Outside OCD
                </h2>
              </div>
              <span className="text-[11px] text-brand-ink/40 font-mono">
                Identity & Values
              </span>
            </div>

            <Feedback {...profileMsg} />

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border/60 bg-brand-canvas/70 text-brand-ink/50 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Core Values Section */}
              <div className="space-y-2 pt-2 border-t border-brand-border/40">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider">
                    Core Values ("Life Outside OCD")
                  </label>
                  <span className="text-[10px] text-brand-ink/40">
                    Anchors for values-based exposure
                  </span>
                </div>
                <p className="text-xs text-brand-ink/65 leading-relaxed">
                  These anchor your daily practice so exposure serves what truly matters to you, rather than just OCD fighting OCD.
                </p>

                {/* Active value tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {userValues.map((val) => (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-brand-amberSoft text-brand-amber font-medium border border-brand-amber/30 shadow-xs"
                    >
                      <span>{val}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(val)}
                        className="hover:text-brand-coral transition-colors"
                        title={`Remove ${val}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  {userValues.length === 0 && (
                    <span className="text-xs text-brand-ink/40 italic py-1">
                      No core values set yet. Choose suggestions below or add custom anchors.
                    </span>
                  )}
                </div>

                {/* Add custom value input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customValueInput}
                    onChange={(e) => setCustomValueInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddValue(customValueInput);
                      }
                    }}
                    placeholder="Add a new anchor (e.g. Gardening, Painting)..."
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddValue(customValueInput)}
                    className="px-3.5 py-2 rounded-xl bg-brand-paper hover:bg-brand-canvas border border-brand-border text-xs font-semibold text-brand-ink transition-colors"
                  >
                    + Add
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-ink/45 block mb-1.5">
                    Recommended Anchors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_VALUE_SUGGESTIONS.filter((s) => !userValues.includes(s)).slice(0, 5).map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => handleAddValue(sugg)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-brand-canvas hover:bg-brand-softerTeal border border-brand-border/60 text-brand-ink/70 hover:text-brand-teal transition-colors"
                      >
                        + {sugg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{savingProfile ? 'Saving Changes...' : 'Save Sanctuary Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* ── Box 2: Security & Password Sanctuary (Cols 8-12) ─────────────── */}
          <div className="lg:col-span-5 bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-card-lift space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-brand-lavender mb-1">
                    <span className="w-2 h-2 rounded-full bg-brand-lavender" />
                    <span className="text-xs font-bold uppercase tracking-widest">Access & Privacy</span>
                  </div>
                  <h2 className="font-editorial text-2xl text-brand-ink font-medium">
                    Security Credentials
                  </h2>
                </div>
                <span className="material-symbols-outlined text-brand-lavender text-[22px]">lock</span>
              </div>

              <Feedback {...passwordMsg} />

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full py-2.5 rounded-xl bg-brand-ink hover:bg-brand-teal text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>

            {/* Email Verification Box */}
            <div className="pt-4 border-t border-brand-border/40 space-y-3">
              <Feedback {...resendMsg} />
              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 flex items-start gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                    user?.isVerified ? 'text-clinical-success' : 'text-brand-amber'
                  }`}
                >
                  {user?.isVerified ? 'verified_user' : 'mark_email_unread'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-brand-ink">
                    {user?.isVerified ? 'Email is Verified' : 'Email Verification Pending'}
                  </div>
                  <p className="text-[11px] text-brand-ink/60 mt-0.5">
                    {user?.isVerified
                      ? 'Account recovery and clinical consent notices are fully enabled.'
                      : 'Please verify your address to safeguard account recovery.'}
                  </p>
                  {!user?.isVerified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="mt-2 text-xs text-brand-teal font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <span>{resending ? 'Sending link...' : 'Resend Verification Email'}</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Box 3: Cedar WASM Policy & Data Boundaries (Cols 1-7) ───────── */}
          <div className="lg:col-span-7 bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-card-lift space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-teal mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand-teal" />
                  <span className="text-xs font-bold uppercase tracking-widest">Deterministic Safety</span>
                </div>
                <h2 className="font-editorial text-2xl text-brand-ink font-medium">
                  Cedar Policy Engine & Privacy Consent
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand-softerTeal text-brand-teal text-[10px] font-bold border border-brand-teal/20">
                WASM Gated
              </span>
            </div>

            <p className="text-xs text-brand-ink/70 leading-relaxed">
              Between Sessions does not sell your data, run behavioral advertisements, or perform automated diagnosis. Connected clinicians can only view records authorized under your Cedar WASM consent contracts.
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-brand-ink flex items-center gap-2">
                    <span>Exposure Practice Sessions</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-softSuccess text-clinical-success font-semibold">Consented</span>
                  </div>
                  <p className="text-[11px] text-brand-ink/60">Pre/post SUDS, triggers, and response prevention choices.</p>
                </div>
                <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-brand-ink flex items-center gap-2">
                    <span>Daily Check-ins & Urge Curves</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-softSuccess text-clinical-success font-semibold">Consented</span>
                  </div>
                  <p className="text-[11px] text-brand-ink/60">Longitudinal urge curves without intrusive journaling.</p>
                </div>
                <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-brand-ink flex items-center gap-2">
                    <span>AI Synthesis & Summaries</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-softSuccess text-clinical-success font-semibold">Consented</span>
                  </div>
                  <p className="text-[11px] text-brand-ink/60">Strictly grounded in your logs; never provides diagnostic closure.</p>
                </div>
                <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-brand-ink flex items-center gap-2">
                    <span>Private Reflections & Somatics</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-paper text-brand-ink/60 border border-brand-border/80 font-semibold">Private Gated</span>
                  </div>
                  <p className="text-[11px] text-brand-ink/60">Kept in your encrypted local sanctuary unless explicitly released.</p>
                </div>
                <span className="material-symbols-outlined text-brand-ink/40 text-[20px]">lock</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/app/care"
                className="inline-flex items-center gap-1.5 text-xs text-brand-teal font-semibold hover:underline"
              >
                <span>Manage Clinician Connection & Granular Permissions in Care</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* ── Box 4: Session & Device Security (Cols 8-12) ─────────────────── */}
          <div className="lg:col-span-5 bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-card-lift space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-brand-ink/60 mb-1">
                    <span className="w-2 h-2 rounded-full bg-brand-ink/40" />
                    <span className="text-xs font-bold uppercase tracking-widest">Device & Session</span>
                  </div>
                  <h2 className="font-editorial text-2xl text-brand-ink font-medium">
                    Session Security
                  </h2>
                </div>
                <span className="material-symbols-outlined text-brand-ink/40 text-[22px]">security</span>
              </div>

              <p className="text-xs text-brand-ink/70 leading-relaxed">
                Your sanctuary is protected by strict token authentication and encrypted headers. Your records are only accessible to you and clinicians you explicitly authorize.
              </p>

              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-ink">Active Device Sync</span>
                  <span className="text-[10px] font-mono text-clinical-success font-semibold">Protected</span>
                </div>
                <p className="text-[11px] text-brand-ink/60 leading-relaxed">
                  Session token synchronized via secure HTTP-compatible storage and browser cookies (SameSite=Lax).
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-brand-ink/50 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-clinical-success" />
                  <span>Zero third-party trackers or ad beacons</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-ink block">Active Session</span>
                  <span className="text-[11px] text-brand-ink/50 font-mono">ID: {user?.id || 'usr_current'}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-brand-coralSoft text-brand-coral hover:bg-brand-coral hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Box 5: Emergency Helplines & Sanctuary Safety (Full Width) ──── */}
          <div className="lg:col-span-12 bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-border/60 shadow-card-lift space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-brand-coral">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-coral" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Persistent Safety Sanctuary
                </span>
              </div>
              <span className="text-[11px] text-brand-ink/50">
                Between Sessions is not an emergency psychiatric intervention service.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-teal">
                  Tele-MANAS (Govt of India)
                </span>
                <p className="text-xs font-semibold text-brand-ink">National Tele-Mental Health Helpline</p>
                <p className="text-[11px] text-brand-ink/60">24/7 toll-free support across 20+ languages.</p>
                <a
                  href="tel:14416"
                  className="inline-block pt-1 font-mono text-sm font-bold text-brand-teal hover:underline"
                >
                  14416 / 1800-891-4416
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-amber">
                  Kiran Mental Health
                </span>
                <p className="text-xs font-semibold text-brand-ink">Ministry of Social Justice 24/7</p>
                <p className="text-[11px] text-brand-ink/60">Psychological first-aid and distress counseling.</p>
                <a
                  href="tel:18005990019"
                  className="inline-block pt-1 font-mono text-sm font-bold text-brand-amber hover:underline"
                >
                  1800-599-0019
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-lavender">
                  Vandrevala Foundation
                </span>
                <p className="text-xs font-semibold text-brand-ink">Free & Confidential Counseling</p>
                <p className="text-[11px] text-brand-ink/60">Immediate crisis counseling via call or WhatsApp.</p>
                <a
                  href="tel:+919999666555"
                  className="inline-block pt-1 font-mono text-sm font-bold text-brand-lavender hover:underline"
                >
                  +91 9999 666 555
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
