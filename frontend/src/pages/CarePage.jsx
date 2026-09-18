import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import { connectionsApi, consentsApi, practitionersApi, recommendationsApi } from '../services/api';

const DATA_CATEGORIES = [
  { id: 'checkins',           label: 'Check-ins',       desc: 'Daily SUDS and urge scores' },
  { id: 'practice_logs',     label: 'Practice logs',   desc: 'Exposure attempts, delay timers, and response types' },
  { id: 'ai_summary',        label: 'AI summaries',    desc: 'Weekly metric-grounded synthesis' },
  { id: 'journal_structured', label: 'Behavioral tags', desc: 'Trigger tags and response types without free-text narratives' },
];

export default function CarePage() {
  const { user } = useAuth();

  const [connections, setConnections] = useState([]);
  const [consents, setConsents] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cedar WASM live eval
  const [cedarEval, setCedarEval] = useState(null);
  const [cedarLoading, setCedarLoading] = useState(false);

  // Connect modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');
  const [connectMessage, setConnectMessage] = useState('');
  const [sendingConnect, setSendingConnect] = useState(false);
  const [connectError, setConnectError] = useState('');

  // Consent update state
  const [updatingConsent, setUpdatingConsent] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [connRes, cstRes, dirRes, recsRes] = await Promise.allSettled([
        connectionsApi.list(),
        consentsApi.list(),
        practitionersApi.list(),
        recommendationsApi.list(),
      ]);

      if (connRes.status === 'fulfilled') setConnections(connRes.value.data || []);
      if (cstRes.status === 'fulfilled') setConsents(cstRes.value.data || []);
      if (dirRes.status === 'fulfilled') setDirectory(dirRes.value.data || []);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data || []);
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCedarEval = useCallback(async (pracId) => {
    if (!pracId) return;
    setCedarLoading(true);
    try {
      const res = await connectionsApi.cedarEval(pracId);
      setCedarEval(res);
    } catch {
      setCedarEval(null);
    } finally {
      setCedarLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active connection
  const activeConnection = connections.find(
    (c) => ['ACTIVE', 'active'].includes(c.status)
  );

  useEffect(() => {
    if (activeConnection?.practitionerId) {
      loadCedarEval(activeConnection.practitionerId);
    }
  }, [activeConnection, loadCedarEval]);

  const activeConsent = consents.find((c) => c.status === 'active') || {
    dataCategories: ['checkins', 'practice_logs', 'ai_summary'],
  };

  const handleToggleConsentCategory = async (catId) => {
    if (!activeConnection) return;
    setUpdatingConsent(catId);
    const currentCats = activeConsent.dataCategories || [];
    const newCats = currentCats.includes(catId)
      ? currentCats.filter((c) => c !== catId)
      : [...currentCats, catId];

    try {
      await consentsApi.upsert(activeConsent.consentId, {
        recipientId: activeConnection.practitionerId,
        purpose: 'professional_review',
        dataCategories: newCats,
        status: 'active',
      });
      await loadData();
      await loadCedarEval(activeConnection.practitionerId);
    } catch { /* best effort */ } finally {
      setUpdatingConsent(null);
    }
  };

  const handleSendConnectRequest = async () => {
    if (!selectedPractitionerId.trim()) return;
    setSendingConnect(true);
    setConnectError('');
    try {
      await connectionsApi.create(selectedPractitionerId.trim(), connectMessage || undefined);
      setShowConnectModal(false);
      setSelectedPractitionerId('');
      setConnectMessage('');
      await loadData();
    } catch (err) {
      setConnectError(err.message || 'Failed to send connection request.');
    } finally {
      setSendingConnect(false);
    }
  };

  return (
    <DashboardShell onDataRefresh={loadData}>
      {/* ── Connect Modal ────────────────────────────────────────────────── */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-brand-paper border border-brand-border/70 rounded-3xl shadow-card-lift w-full max-w-md p-6 sm:p-8 relative">
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-5 right-5 text-brand-ink/40 hover:text-brand-ink"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 text-brand-teal mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
              <span className="text-xs font-bold uppercase tracking-wider">Clinical Connection</span>
            </div>

            <h3 className="font-editorial text-2xl text-brand-ink font-medium mb-1">
              Connect with Clinician
            </h3>
            <p className="text-xs text-brand-ink/60 mb-4">
              Enter their verified practitioner identifier or confirmation code.
            </p>

            {connectError && (
              <div className="p-3 rounded-xl bg-brand-coralSoft text-brand-coral text-xs mb-3">
                {connectError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1">
                  Practitioner ID
                </label>
                <input
                  type="text"
                  value={selectedPractitionerId}
                  onChange={(e) => setSelectedPractitionerId(e.target.value)}
                  placeholder="e.g. MCI-2024-KM-7741"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-1">
                  Introduction Note <span className="text-brand-ink/40 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. Hi Dr. Mehra, I have been using Between Sessions to log my ERP practice and would like to share my progress."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-canvas text-brand-ink focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-brand-softerTeal text-[11px] text-brand-ink/75 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[17px] text-brand-teal shrink-0 mt-0.5">lock</span>
                <span>You maintain 100% control over what data your clinician sees via AWS Cedar WASM authorization.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-xs text-brand-ink/60 hover:text-brand-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendConnectRequest}
                  disabled={sendingConnect}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium shadow-xs disabled:opacity-50"
                >
                  {sendingConnect ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-teal text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
              <span>Therapeutic Care Continuity</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium leading-tight">
              Care Team & <span className="italic text-brand-teal">Consent Controls</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-ink/70 mt-1 max-w-2xl leading-relaxed">
              Between Sessions bridges the space between therapy appointments. You decide precisely what records are shared, governed by real-time policy evaluation.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedPractitionerId('MCI-2024-KM-7741');
              setShowConnectModal(true);
            }}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Connect Clinician</span>
          </button>
        </header>

        {/* ── Connected Clinician Overview (if connected) ─────────────────── */}
        {activeConnection ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* Clinician Card & Recommendations (Col 1-7) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-brand-paper border border-brand-border/70 rounded-3xl p-6 sm:p-7 shadow-card-lift space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-brand-softSuccess text-clinical-success border border-clinical-success/30">
                    Active Clinical Connection
                  </span>
                  <span className="text-xs font-mono text-brand-ink/50">
                    ID: {activeConnection.practitionerId}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-editorial text-xl font-bold shrink-0 shadow-xs">
                    KM
                  </div>
                  <div>
                    <h2 className="font-editorial text-2xl text-brand-ink font-medium">
                      Dr. Kavita Mehra
                    </h2>
                    <p className="text-xs text-brand-ink/70">
                      MD, MCI Registered Psychiatrist · ERP Specialist
                    </p>
                    <p className="text-[11px] text-brand-ink/50 font-mono mt-0.5">
                      Credential: MCI-2024-KM-7741 • MindBridge Center
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-canvas border border-brand-border/60 text-xs text-brand-ink/75 leading-relaxed">
                  Connected since {new Date(activeConnection.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Dr. Mehra can view only the categories you explicitly grant below.
                </div>
              </div>

              {/* Clinical Recommendations from Practitioner */}
              <div className="bg-brand-paper border border-brand-border/70 rounded-3xl p-6 sm:p-7 shadow-card-lift space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-brand-teal">clinical_notes</span>
                    <h3 className="font-editorial text-xl sm:text-2xl text-brand-ink font-medium">
                      Practitioner Guidance
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-teal px-3 py-1 rounded-full bg-brand-softerTeal border border-brand-teal/20">
                    Human Authored
                  </span>
                </div>

                {recommendations.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.SK || rec.recommendationId}
                        className="p-5 rounded-2xl bg-brand-softerTeal/50 border border-brand-teal/30 space-y-2.5 text-xs"
                      >
                        {rec.observation && (
                          <div>
                            <span className="font-bold text-brand-ink block mb-0.5">Clinical Observation:</span>
                            <p className="text-brand-ink/80 leading-relaxed">{rec.observation}</p>
                          </div>
                        )}
                        {rec.nextStep && (
                          <div className="pt-1">
                            <span className="font-bold text-brand-teal block mb-0.5">Prescribed Exposure Protocol:</span>
                            <p className="text-brand-ink font-medium leading-relaxed">{rec.nextStep}</p>
                          </div>
                        )}
                        {rec.noteToUser && (
                          <p className="text-brand-ink/60 italic pt-1 text-[11px]">
                            "{rec.noteToUser}" — Dr. Kavita Mehra
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-ink/60 italic py-2">
                    No active guidance notes yet from your clinician.
                  </p>
                )}
              </div>
            </div>

            {/* Granular Consent Controls & Cedar WASM Gating (Col 8-12) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-brand-paper border border-brand-border/70 rounded-3xl p-6 sm:p-7 shadow-card-lift space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-teal px-3 py-1 rounded-full bg-brand-softerTeal border border-brand-teal/20">
                      Data Sovereignty
                    </span>
                    <span className="text-xs font-mono text-brand-ink/40">Granular Switches</span>
                  </div>
                  <h3 className="font-editorial text-2xl text-brand-ink font-medium">
                    Consent Gating
                  </h3>
                  <p className="text-xs text-brand-ink/60 mt-0.5">
                    Toggle individual data streams. Revocation is enforced instantly.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {DATA_CATEGORIES.map((cat) => {
                    const isGranted = (activeConsent.dataCategories || []).includes(cat.id);
                    const isBusy = updatingConsent === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-between ${
                          isGranted ? 'bg-brand-canvas/80 border-brand-border' : 'bg-brand-canvas/30 border-brand-border/40 opacity-70'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <span className="text-xs font-semibold text-brand-ink block">{cat.label}</span>
                          <span className="text-[10px] text-brand-ink/60 block leading-tight">{cat.desc}</span>
                        </div>

                        <button
                          onClick={() => handleToggleConsentCategory(cat.id)}
                          disabled={isBusy}
                          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                            isGranted ? 'bg-brand-teal' : 'bg-brand-border'
                          }`}
                          aria-label={`Toggle ${cat.label}`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              isGranted ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* AWS Cedar WASM live status badge */}
                <div className="pt-3 border-t border-brand-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-ink">Cedar WASM Engine:</span>
                    <span
                      className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        cedarEval?.allowed
                          ? 'bg-brand-softSuccess text-clinical-success'
                          : 'bg-brand-coralSoft text-brand-coral'
                      }`}
                    >
                      {cedarLoading ? 'EVALUATING...' : cedarEval?.allowed ? 'ALLOW' : 'DENY'}
                    </span>
                  </div>
                  <p className="text-[10px] text-brand-ink/50 leading-relaxed font-mono">
                    Policy: permit(principal == Practitioner::"{activeConnection.practitionerId}", action in [Action::"ReadSummary", Action::"ReviewPractice"], resource == Patient::"{user?.id}");
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Unconnected State: Directory Search */
          <div className="space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-brand-paper border border-brand-border/70 shadow-card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-amber px-3 py-1 rounded-full bg-brand-amberSoft border border-brand-amber/30">
                  Not Yet Connected
                </span>
                <h2 className="font-editorial text-2xl text-brand-ink font-medium">
                  Connect with a Verified Practitioner
                </h2>
                <p className="text-xs text-brand-ink/70 max-w-xl leading-relaxed">
                  Browse our public registry of certified ERP practitioners. When connected, they can author structured exposure guidelines for your between-session practice.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedPractitionerId('MCI-2024-KM-7741');
                  setShowConnectModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-medium hover:bg-brand-tealDark transition-colors shrink-0 shadow-xs"
              >
                Send Request to Dr. Mehra
              </button>
            </div>

            {/* Directory Cards */}
            <div className="space-y-3 pt-2">
              <h3 className="font-editorial text-2xl text-brand-ink font-medium">Verified Public Directory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(directory || []).map((prac) => (
                  <div
                    key={prac.id}
                    className="p-6 rounded-3xl bg-brand-paper border border-brand-border/70 shadow-card-lift flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-brand-softSuccess text-clinical-success border border-clinical-success/30">
                          Verified Practitioner
                        </span>
                        <span className="text-[11px] font-mono text-brand-ink/40">ID: {prac.id}</span>
                      </div>

                      <h4 className="font-editorial text-2xl text-brand-ink font-medium">
                        {prac.name}
                      </h4>
                      <p className="text-xs text-brand-ink/70">{prac.credentials}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(prac.specialisation || []).map((spec) => (
                          <span
                            key={spec}
                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-canvas border border-brand-border text-brand-ink/70 font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between">
                      <span className="text-[11px] text-brand-ink/50 font-mono">
                        {prac.remoteAvailable ? 'Remote / Telehealth Available' : 'In-Person'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedPractitionerId(prac.id);
                          setShowConnectModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-brand-softerTeal hover:bg-brand-teal hover:text-white text-brand-teal text-xs font-semibold transition-colors"
                      >
                        Request Connection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Persistent Crisis Resources Sanctuary ───────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-brand-paper border border-brand-border/70 shadow-card-lift space-y-3.5">
          <div className="flex items-center gap-2 text-brand-coral font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>24/7 Immediate Crisis Support</span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">
            Professional & Emergency Helplines
          </h3>
          <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed max-w-3xl">
            Between Sessions is an intentional between-session behavioral companion, not an emergency clinical or suicide intervention service. If you are in immediate distress or crisis, please contact verified emergency counselors immediately:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/80 space-y-1">
              <span className="font-bold text-brand-ink block text-sm">Tele-MANAS (Govt of India)</span>
              <span className="text-brand-ink/65 text-[11px] block">National tele-mental health helpline. Toll-free 24/7.</span>
              <a href="tel:14416" className="font-mono font-bold text-brand-teal text-sm block pt-1">14416 / 1800-891-4416</a>
            </div>

            <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/80 space-y-1">
              <span className="font-bold text-brand-ink block text-sm">Kiran Helpline</span>
              <span className="text-brand-ink/65 text-[11px] block">24/7 National mental health helpline by MSJE.</span>
              <a href="tel:18005990019" className="font-mono font-bold text-brand-teal text-sm block pt-1">1800-599-0019</a>
            </div>

            <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border/80 space-y-1">
              <span className="font-bold text-brand-ink block text-sm">Vandrevala Foundation</span>
              <span className="text-brand-ink/65 text-[11px] block">Free 24/7 crisis counseling via phone or WhatsApp.</span>
              <a href="tel:+919999666555" className="font-mono font-bold text-brand-teal text-sm block pt-1">+91 9999 666 555</a>
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
