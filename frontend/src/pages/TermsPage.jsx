import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function TermsPage({ defaultTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans flex flex-col justify-between">
      {/* ── HEADER ── */}
      <header className="w-full px-6 py-4 border-b border-brand-border/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-4 text-xs">
            <a href="tel:14416" className="text-brand-coral font-bold hover:underline hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-coral animate-pulse" />
              Tele-MANAS 14416
            </a>
            <Link
              to="/"
              className="px-4 py-1.5 rounded-full bg-brand-canvas hover:bg-brand-border/40 text-brand-ink font-semibold border border-brand-border transition-colors text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        
        {/* Title & Badge */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-softerTeal text-brand-teal text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
            Governance &amp; Clinical Safety Standards
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl text-brand-ink font-medium leading-tight">
            Terms of Service &amp; <span className="italic text-brand-teal">Clinical Privacy Policy</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-ink/70 max-w-2xl leading-relaxed">
            Effective Date: September 2026 • Version 2.4 • Applicable to all Individuals, Clinicians, and Institutional Partners.
          </p>
        </div>

        {/* Tab Switcher (Terms vs Privacy) */}
        <div className="flex p-1 rounded-full bg-brand-canvas border border-brand-border/80 shadow-xs max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-1.5 rounded-full transition-all text-xs font-semibold ${
              activeTab === 'terms'
                ? 'bg-white text-brand-ink shadow-xs'
                : 'text-brand-ink/55 hover:text-brand-ink'
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-1.5 rounded-full transition-all text-xs font-semibold ${
              activeTab === 'privacy'
                ? 'bg-white text-brand-ink shadow-xs'
                : 'text-brand-ink/55 hover:text-brand-ink'
            }`}
          >
            Privacy &amp; Cedar WASM
          </button>
        </div>

        {/* Emergency Callout */}
        <div className="p-5 rounded-2xl bg-brand-amberSoft border border-brand-amber/40 shadow-xs flex items-start gap-4">
          <span className="material-symbols-outlined text-brand-amber text-[24px] shrink-0 mt-0.5">
            emergency
          </span>
          <div className="space-y-1 text-xs text-brand-ink/80">
            <span className="font-bold text-brand-ink block text-sm">
              Critical Emergency &amp; Crisis Boundary
            </span>
            <p className="leading-relaxed">
              Between Sessions is <strong>NOT</strong> an emergency intervention platform, suicide hotline, or real-time diagnostic service. If you are experiencing acute psychological distress, self-harm urges, or medical emergencies, contact emergency authorities immediately or call <strong>Tele-MANAS</strong> toll-free at <span className="font-mono font-bold text-brand-ink">14416</span> / <span className="font-mono font-bold text-brand-ink">1800-891-4416</span> (available 24/7 across India in 20+ languages).
            </p>
          </div>
        </div>

        {/* ── TAB 1: TERMS OF SERVICE ── */}
        {activeTab === 'terms' && (
          <div className="bg-white rounded-3xl border border-brand-border/70 p-6 sm:p-10 shadow-card-lift space-y-8 animate-tab-switch text-xs leading-relaxed text-brand-ink/80">
            
            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">01.</span>
                Therapeutic Continuity Scope
              </h2>
              <p>
                Between Sessions ("the Platform") provides digital behavioral self-observation and Exposure and Response Prevention (ERP) continuity tools between clinical consultations. The Platform assists individuals in recording exposure trials, noting Subjective Units of Distress (SUDS), tracking response delay windows, and structuring observations for review with qualified mental healthcare professionals.
              </p>
              <p>
                The Platform does <strong>not</strong> practice medicine, psychiatry, or clinical psychology. Access to the Platform does not establish a doctor-patient relationship with Between Sessions or its creators.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">02.</span>
                Anti-Reassurance &amp; Non-Ritual Boundary
              </h2>
              <p>
                Users acknowledge that the core mechanism of Exposure and Response Prevention (ERP) requires learning to tolerate uncertainty and doubt without engaging in neutralizing rituals or compulsive reassurance-seeking.
              </p>
              <p>
                The Platform's grounding instruments (such as sensory anchors, paced breathing, and the reassurance interrupter) are designed solely to foster physiological regulation and refocus attention on meaningful valued action. Users agree not to utilize Platform features as compulsive checking rituals to "sanitize" or "neutralize" intrusive thoughts.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">03.</span>
                Secondary AI Posture &amp; Non-Hallucination Standard
              </h2>
              <p>
                All artificial intelligence capabilities integrated into Between Sessions operate strictly under a <strong>Secondary AI Posture</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>AI models do not generate medical diagnoses, prognoses, or autonomous treatment plans.</li>
                <li>AI observations are strictly grounded in user-provided logs and check-ins, accompanied by auditable source citations (e.g., <em>"Source: Check-in #14, Practice Log #6"</em>).</li>
                <li>AI summaries are clearly labeled: <em>"Synthesized from your logs — not medical advice"</em>.</li>
                <li>The platform strictly rejects gamification mechanics, score inflation, streaks, levels, or algorithmic cheerleading.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">04.</span>
                Practitioner Verification &amp; Clinical Responsibility
              </h2>
              <p>
                Healthcare providers registering for the Clinician Collaboration Portal warrant that they hold active, unencumbered professional licenses or council registrations (e.g., MCI, RCI, NMC, or equivalent national medical/psychological licensing authorities) to provide mental health services in their respective jurisdictions.
              </p>
              <p>
                Clinicians maintain full and sole professional responsibility for evaluating telemetry data, formulating exposure hierarchies, authoring clinical recommendations, and conducting in-session clinical assessments.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">05.</span>
                Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Between Sessions and its affiliates, contributors, and licensors disclaim all warranties, express or implied, regarding system availability, therapeutic efficacy, or fitness for a particular clinical purpose. In no event shall Between Sessions be liable for indirect, incidental, punitive, or consequential damages arising out of the use of or inability to access the Platform.
              </p>
            </section>

          </div>
        )}

        {/* ── TAB 2: PRIVACY & CEDAR WASM ── */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-3xl border border-brand-border/70 p-6 sm:p-10 shadow-card-lift space-y-8 animate-tab-switch text-xs leading-relaxed text-brand-ink/80">
            
            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">01.</span>
                Data Sovereignty &amp; Zero Monetization
              </h2>
              <p>
                Between Sessions treats your behavioral and psychological logs with clinical confidentiality. We do <strong>not</strong> sell, monetize, broker, or license personal health logs, exposure entries, check-in distress scores, or private journal reflections to third-party data aggregators, advertisers, or insurers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">02.</span>
                Cryptographic Policy Enforcement (Cedar WASM)
              </h2>
              <p>
                Data sharing between individuals and verified practitioners is governed by a client-side and server-side <strong>Cedar Policy Engine</strong> compiled to WebAssembly (WASM).
              </p>
              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border space-y-2 font-mono text-[11px]">
                <p className="font-bold text-brand-ink font-sans text-xs">Cedar Policy Rule Formulation:</p>
                <p className="text-brand-teal">
                  permit (principal == Practitioner::"...", action == Action::"read_telemetry", resource == Patient::"...")
                </p>
                <p className="text-brand-ink/70">
                  when &#123; context.consentedCategories.contains("practice_logs") &amp;&amp; resource.activeConnection == true &#125;;
                </p>
              </div>
              <p>
                If an individual toggles off consent for any category (such as raw journal entries or daily check-ins), the Cedar engine evaluates the request as <code className="px-1.5 py-0.5 rounded bg-brand-coralSoft text-brand-coral font-mono">DENY</code>, returning a cryptographic <code className="px-1.5 py-0.5 rounded bg-brand-canvas font-mono">403 CONSENT_REQUIRED</code> before any record payload is unencrypted or transmitted.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">03.</span>
                Instant Revocation of Access
              </h2>
              <p>
                You may disconnect from any practitioner or modify your consent permissions at any time with immediate effect via the <strong>Care Pillar</strong> settings. Disconnection immediately cuts all telemetry streams and renders past logs inaccessible to the practitioner's cockpit.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">04.</span>
                Authentication, Passwords &amp; Cryptographic Storage
              </h2>
              <p>
                User passwords are protected using industry-standard irreversible bcrypt hashing with salted work factors. Sessions are governed by cryptographically signed tokens containing strictly necessary authorization claims. Sensitive access tokens are maintained in secure browser state with Lax cookie protection.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-editorial text-xl text-brand-ink font-semibold flex items-center gap-2">
                <span className="font-mono text-sm text-brand-teal">05.</span>
                Account Deletion &amp; Data Erasure
              </h2>
              <p>
                You have the absolute right to request complete erasure of your account and associated database records. Initiating an account deletion permanently purges all exposure histories, SUDS ratings, values selections, and clinician links from the persistent data store.
              </p>
            </section>

          </div>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-brand-border/60 bg-white text-xs text-brand-ink/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-ink">Between Sessions Health</span>
            <span>•</span>
            <span>Clinical Continuity Platform © 2026</span>
          </div>
          <div className="flex items-center gap-6 font-medium text-brand-ink/80">
            <Link to="/" className="hover:text-brand-teal transition-colors">Home</Link>
            <Link to="/login" className="hover:text-brand-teal transition-colors">Individual Portal</Link>
            <Link to="/practitioner/login" className="hover:text-brand-teal transition-colors">Clinician Portal</Link>
            <a href="tel:14416" className="text-brand-coral hover:underline font-bold">Tele-MANAS (14416)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
