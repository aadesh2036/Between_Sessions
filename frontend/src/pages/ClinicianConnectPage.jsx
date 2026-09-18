import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectionsApi, consentsApi } from '../services/api';
import Logo from '../components/Logo';

/* ── Status badges ──────────────────────────────────────────────────────── */
const STATUS_META = {
  pending:  { label: 'Pending',  color: 'text-brand-amber',    bg: 'bg-brand-amberSoft',   icon: 'schedule' },
  PENDING:  { label: 'Pending',  color: 'text-brand-amber',    bg: 'bg-brand-amberSoft',   icon: 'schedule' },
  active:   { label: 'Active',   color: 'text-clinical-success', bg: 'bg-brand-softSuccess', icon: 'check_circle' },
  ACTIVE:   { label: 'Active',   color: 'text-clinical-success', bg: 'bg-brand-softSuccess', icon: 'check_circle' },
  rejected: { label: 'Declined', color: 'text-brand-coral',    bg: 'bg-brand-coralSoft',   icon: 'cancel' },
  revoked:  { label: 'Revoked',  color: 'text-brand-ink/40',   bg: 'bg-brand-canvas',       icon: 'block' },
};

const DATA_CATEGORIES = [
  { id: 'checkins',          label: 'Check-ins',      desc: 'Daily SUDS & urge scores' },
  { id: 'journal_structured',label: 'Behavioral log', desc: 'Response types and tags (no free text)' },
  { id: 'practice_logs',    label: 'Practice logs',  desc: 'Exercise attempts and completion' },
  { id: 'ai_summary',       label: 'AI summaries',   desc: 'Weekly metric-grounded insights' },
];

/* ── Connect Request Modal ───────────────────────────────────────────────── */
function ConnectModal({ onClose, onSent }) {
  const [practitionerId, setPractitionerId] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!practitionerId.trim()) { setError('Practitioner ID is required.'); return; }
    setSending(true);
    setError('');
    try {
      await connectionsApi.create(practitionerId.trim(), message || undefined);
      onSent();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-dashboard w-full max-w-md mx-4 p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-ink/30 hover:text-brand-ink transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-2 text-brand-teal mb-4">
          <span className="material-symbols-outlined text-[20px]">medical_services</span>
          <span className="text-xs font-bold uppercase tracking-widest">New Connection</span>
        </div>
        <h2 className="font-editorial text-3xl text-brand-ink mb-5">Connect with a clinician</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Practitioner ID</label>
            <input
              type="text"
              value={practitionerId}
              onChange={e => setPractitionerId(e.target.value)}
              placeholder="e.g. prac_demo_001"
              className="w-full px-4 py-2 bg-brand-canvas border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal"
            />
            <p className="text-[10px] text-brand-ink/40 mt-1">Your clinician will share their ID with you directly.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-ink mb-1 uppercase tracking-wider">Optional note</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              placeholder="Briefly describe what you are looking for (optional)"
              className="w-full px-4 py-2 bg-brand-canvas border border-brand-border rounded-xl text-sm text-brand-ink outline-none focus:border-brand-teal resize-none"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-brand-amberSoft rounded-xl text-[11px] text-brand-ink/70 flex gap-2">
          <span className="material-symbols-outlined text-brand-amber text-[16px] shrink-0">info</span>
          <span>You control what data your clinician can see. No data is shared until you explicitly grant consent below.</span>
        </div>

        {error && <p className="mt-2 text-brand-coral text-xs">{error}</p>}

        <button
          onClick={handleSend}
          disabled={sending}
          className="mt-5 w-full py-3 rounded-full bg-brand-ink text-white text-sm font-bold hover:bg-brand-teal transition-colors shadow-sm disabled:opacity-60"
        >
          {sending ? 'Sending...' : 'Send Request'}
        </button>
      </div>
    </div>
  );
}

/* ── Consent Manager for a Connection ───────────────────────────────────── */
function ConsentManager({ practitionerId, consents, onUpdate }) {
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');

  const getConsent = () =>
    consents.find(c => c.recipientId === practitionerId && c.purpose === 'professional_review');

  const currentConsent = getConsent();
  const grantedCategories = new Set(currentConsent?.dataCategories || []);
  const isActive = currentConsent?.status === 'active';

  const toggleCategory = async (categoryId) => {
    setSaving(categoryId);
    setError('');
    const newCategories = isActive
      ? grantedCategories.has(categoryId)
        ? [...grantedCategories].filter(c => c !== categoryId)
        : [...grantedCategories, categoryId]
      : [categoryId];

    try {
      await consentsApi.upsert(
        currentConsent?.consentId,
        {
          purpose: 'professional_review',
          recipientId: practitionerId,
          dataCategories: newCategories,
          status: newCategories.length > 0 ? 'active' : 'revoked',
        }
      );
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update consent.');
    } finally {
      setSaving(null);
    }
  };

  const revokeAll = async () => {
    setSaving('all');
    setError('');
    try {
      if (currentConsent?.consentId) {
        await consentsApi.revoke(currentConsent.consentId, {
          purpose: 'professional_review',
          recipientId: practitionerId,
          dataCategories: [],
        });
      }
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to revoke consent.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mt-4 border-t border-brand-border/30 pt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-brand-ink uppercase tracking-wider">Data Access</span>
        {isActive && (
          <button
            onClick={revokeAll}
            disabled={saving === 'all'}
            className="text-[10px] text-brand-coral hover:underline font-bold disabled:opacity-60"
          >
            Revoke all
          </button>
        )}
      </div>
      <div className="space-y-2">
        {DATA_CATEGORIES.map(cat => {
          const granted = isActive && grantedCategories.has(cat.id);
          return (
            <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              granted ? 'bg-brand-softSuccess border-clinical-success/30' : 'bg-brand-canvas border-brand-border'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-brand-ink">{cat.label}</div>
                <div className="text-[10px] text-brand-ink/50">{cat.desc}</div>
              </div>
              <button
                onClick={() => toggleCategory(cat.id)}
                disabled={saving === cat.id}
                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                  granted ? 'bg-clinical-success' : 'bg-brand-border'
                } disabled:opacity-60`}
                title={granted ? 'Revoke this category' : 'Grant this category'}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  granted ? 'translate-x-4' : 'translate-x-0.5'
                }`}></span>
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-brand-coral text-xs">{error}</p>}
      <p className="text-[10px] text-brand-ink/40 mt-3 italic">
        Only toggled categories are visible to your clinician. Revoke at any time.
      </p>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function ClinicianConnectPage() {
  const { user, logout } = useAuth();

  const [connections, setConnections] = useState([]);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [practitioners, setPractitioners] = useState([]);

  // Cedar demo
  const [cedarResult, setCedarResult] = useState(null);
  const [cedarLoading, setCedarLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [connRes, consentRes] = await Promise.all([
        connectionsApi.list(),
        consentsApi.list(),
      ]);
      setConnections(connRes.data || []);
      setConsents(consentRes.data || []);
    } catch (err) {
      setError(err.message || 'Could not load connections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRevoke = async (practitionerId) => {
    setRevoking(practitionerId);
    try {
      await connectionsApi.remove(practitionerId);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not revoke connection.');
    } finally {
      setRevoking(null);
    }
  };

  const handleCedarDemo = async () => {
    setCedarLoading(true);
    setCedarResult(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/practitioner/patients/usr_demo_001/summary');
      const data = await res.json();
      setCedarResult({ ok: res.ok, data });
    } catch (err) {
      setCedarResult({ ok: false, data: { error: err.message } });
    } finally {
      setCedarLoading(false);
    }
  };

  const activeConnections = connections.filter(c => ['active', 'ACTIVE'].includes(c.status));
  const pendingConnections = connections.filter(c => ['pending', 'PENDING'].includes(c.status));
  const otherConnections = connections.filter(c => !['active', 'ACTIVE', 'pending', 'PENDING'].includes(c.status));

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col md:flex-row overflow-x-hidden">

      {showConnectModal && (
        <ConnectModal
          onClose={() => setShowConnectModal(false)}
          onSent={loadData}
        />
      )}

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
              <Link className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-brand-softerTeal text-brand-teal font-bold shadow-sm" to="/app/clinician">
                <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                </div>
                <span className="text-[14px]">Clinician Connect</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
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
            </div>
            <Link to="/app/settings" className="p-2 text-brand-ink/40 hover:text-brand-teal transition-colors">
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </Link>
            <button onClick={logout} className="p-2 text-brand-ink/40 hover:text-brand-coral transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
            <div>
              <Link to="/app" className="inline-flex items-center gap-1 text-brand-ink/40 hover:text-brand-teal text-xs font-bold mb-3 transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Dashboard
              </Link>
              <h1 className="font-editorial text-4xl text-brand-ink">Clinician Connect</h1>
              <p className="text-brand-ink/50 text-sm mt-1">You own and control every data-sharing decision.</p>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="self-start sm:self-end px-5 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold shadow-sm hover:bg-brand-teal transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Connect Clinician
            </button>
          </header>

          {error && (
            <div className="p-4 bg-brand-coralSoft border border-brand-coral/20 rounded-2xl text-brand-coral text-sm">{error}</div>
          )}

          {/* Privacy notice */}
          <div className="p-4 bg-brand-amberSoft border border-brand-amber/20 rounded-2xl flex gap-3 text-sm text-brand-ink/70">
            <span className="material-symbols-outlined text-brand-amber text-[20px] shrink-0">lock</span>
            <div>
              <span className="font-bold text-brand-ink">Your privacy is protected.</span> No data is visible to any clinician until you explicitly grant access by category. Revoke at any time — revocation takes effect immediately.
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              {[...Array(2)].map((_, i) => <div key={i} className="h-28 bg-white rounded-3xl border border-brand-border/30"></div>)}
            </div>
          )}

          {!loading && connections.length === 0 && (
            <div className="bg-white rounded-3xl p-10 border border-brand-border/30 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-brand-softerTeal flex items-center justify-center text-brand-teal mb-4">
                <span className="material-symbols-outlined text-[32px]">medical_services</span>
              </div>
              <h3 className="font-editorial text-2xl text-brand-ink mb-2">No connections yet.</h3>
              <p className="text-brand-ink/50 text-sm max-w-sm mx-auto mb-5">
                When you connect with a verified clinician, they appear here. You choose what they can see.
              </p>
              <button onClick={() => setShowConnectModal(true)} className="px-6 py-2.5 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-teal transition-colors">
                Send a connection request
              </button>
            </div>
          )}

          {/* Active connections */}
          {activeConnections.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-ink/40">Active</h2>
              {activeConnections.map(conn => {
                const statusMeta = STATUS_META[conn.status] || STATUS_META.active;
                const isExpanded = expandedId === conn.practitionerId;
                return (
                  <div key={conn.SK || conn.practitionerId} className="bg-white rounded-3xl border border-brand-border/30 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-softerTeal flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px] text-brand-teal">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-brand-ink">Clinician</span>
                            <span className="font-mono text-[10px] text-brand-ink/40">{conn.practitionerId}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusMeta.bg} ${statusMeta.color}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {(conn.consentedCategories || []).slice(0, 3).map(cat => (
                              <span key={cat} className="px-2.5 py-0.5 rounded-full bg-brand-softSuccess border border-clinical-success/20 text-[9px] font-bold text-clinical-success uppercase">{cat.replace('_', ' ')}</span>
                            ))}
                            {(conn.consentedCategories || []).length === 0 && (
                              <span className="text-[10px] text-brand-ink/40 italic">No data shared yet</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : conn.practitionerId)}
                            className="px-4 py-1.5 rounded-full border border-brand-border text-[10px] font-bold text-brand-ink/60 hover:text-brand-teal hover:border-brand-teal transition-colors"
                          >
                            {isExpanded ? 'Hide' : 'Manage Data'}
                          </button>
                          <button
                            onClick={() => handleRevoke(conn.practitionerId)}
                            disabled={revoking === conn.practitionerId}
                            className="px-4 py-1.5 rounded-full border border-brand-coral/30 text-[10px] font-bold text-brand-coral hover:bg-brand-coralSoft transition-colors disabled:opacity-60"
                          >
                            {revoking === conn.practitionerId ? 'Revoking...' : 'Disconnect'}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <ConsentManager
                          practitionerId={conn.practitionerId}
                          consents={consents}
                          onUpdate={loadData}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending connections */}
          {pendingConnections.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-ink/40">Pending</h2>
              {pendingConnections.map(conn => {
                const statusMeta = STATUS_META[conn.status] || STATUS_META.pending;
                return (
                  <div key={conn.SK || conn.practitionerId} className="bg-white rounded-3xl border border-brand-border/30 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-amberSoft flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-brand-amber">person</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-brand-ink">Clinician</span>
                          <span className="font-mono text-[10px] text-brand-ink/40">{conn.practitionerId}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusMeta.bg} ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-ink/50 mt-1">Waiting for the clinician to accept your request.</p>
                      </div>
                      <button
                        onClick={() => handleRevoke(conn.practitionerId)}
                        disabled={revoking === conn.practitionerId}
                        className="px-4 py-1.5 rounded-full border border-brand-border text-[10px] font-bold text-brand-ink/50 hover:text-brand-coral hover:border-brand-coral transition-colors disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other (revoked/rejected) */}
          {otherConnections.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-ink/40">Previous</h2>
              {otherConnections.map(conn => {
                const statusMeta = STATUS_META[conn.status] || STATUS_META.revoked;
                return (
                  <div key={conn.SK || conn.practitionerId} className="bg-brand-canvas rounded-2xl border border-brand-border/30 p-4 flex items-center gap-4 opacity-60">
                    <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-brand-ink/40">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-brand-ink/40">{conn.practitionerId}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusMeta.bg} ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cedar Auth Demo ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/30 shadow-sm">
            <div className="flex items-center gap-2 text-brand-lavender mb-4">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <span className="text-xs font-bold uppercase tracking-widest">Cedar Auth Demo</span>
            </div>
            <h3 className="font-editorial text-2xl text-brand-ink mb-2">AWS Cedar policy enforcement</h3>
            <p className="text-brand-ink/60 text-sm mb-5 max-w-lg">
              Simulate a practitioner API read. Cedar verifies connection status and consent categories before allowing access. The policy requires an <span className="font-bold">ACTIVE</span> connection and <span className="font-bold">PRACTICE_HISTORY</span> consent.
            </p>
            <button
              onClick={handleCedarDemo}
              disabled={cedarLoading}
              className="px-6 py-2.5 rounded-full bg-brand-teal text-white text-xs font-bold hover:bg-brand-tealDark transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {cedarLoading
                ? <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Evaluating policy...</>
                : <><span className="material-symbols-outlined text-[14px]">policy</span> Simulate Practitioner Request</>
              }
            </button>

            {cedarResult && (
              <div className={`mt-4 p-5 rounded-2xl border ${cedarResult.ok ? 'bg-brand-softSuccess border-clinical-success/30' : 'bg-brand-coralSoft border-brand-coral/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined text-[18px] ${cedarResult.ok ? 'text-clinical-success' : 'text-brand-coral'}`}>
                    {cedarResult.ok ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${cedarResult.ok ? 'text-clinical-success' : 'text-brand-coral'}`}>
                    {cedarResult.ok ? 'Access Granted (Cedar)' : 'Access Denied (Cedar)'}
                  </span>
                </div>
                <pre className="text-xs font-mono text-brand-ink/70 whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(cedarResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

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
