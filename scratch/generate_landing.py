import re

with open('LANDING_PAGE_&_DESIGN_SYS/code.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Body content from FloatingNavbar to before </body>
start_idx = html.find('<!-- BEGIN: FloatingNavbar -->')
end_idx = html.find('</body>')
body_content = html[start_idx:end_idx]

# Remove embedded style block in mascot
body_content = re.sub(r'<style>.*?</style>', '', body_content, flags=re.DOTALL)

# Copy replacements for truthful MVP
replacements = [
    (
        "The continuous bio-behavioral bridge for Exposure and Response Prevention (ERP). Track compulsions without shame, surf visceral urge spikes, and sync live somatic biomarkers directly to Dr. Olivia’s EHR dashboard.",
        "Structured behavioral continuity for Exposure and Response Prevention (ERP). Track compulsions without shame, surf visceral urge spikes, and share consent-based longitudinal patterns with your practitioner."
    ),
    ("HIPAA Tier-4 Compliant", "Privacy-First Architecture"),
    ("Sub-second EHR Webhook", "Consent-Based Insights"),
    ("Zero Shame Cognitive Anchoring", "Structured Continuity"),
    ("Intelly™ Clinician Cockpit", "Clinician Overview Cockpit"),
    ("Intelly™ Clinician Terminal", "Clinician Continuity Terminal"),
    ("Intelly™", "Clinician Terminal"),
    ("Dr. Olivia’s live desk: surge timeline, 08:12 live sync nodes, & case notes.", "Clinician review desk: surge timeline, consented sync nodes, and session notes."),
    ("Directly recreating Dr. Olivia's real-time morning command center: continuous EHR webhooks, patient cohort surge maps, 12:00 urge spline curves, and multi-clinician daily scheduling.", "Consented review command center: patient cohort distribution, 12:00 urge spline curves, and longitudinal behavioral tracking."),
    ("Good morning, Dr. Olivia", "Good morning, Dr. Sharma"),
    ("Intelly wishes you a good and productive day. 45 individuals are actively logging loops in your cohort today. You also have one live team event in your schedule.", "45 individuals are actively logging in your cohort. Review consented between-session progress ahead of today's consultations."),
    ("Request Clinician Sandbox (Intelly™)", "Explore Clinician Dashboard"),
    ("Dr. Olivia's Intelly terminal", "the clinician continuity terminal"),
    ("Dr. Olivia’s terminal", "your clinician’s terminal"),
    ("In Sync with Dr. Olivia", "In Sync with Practitioner"),
    ("Prescribed Micro-Exposures", "Curated Structured Practice"),
    ("14 Days Ritual-Free Streak", "14 Days Consistent Practice"),
    ("View full EHR telemetry history →", "View full consented history →"),
    ("Sub-second EHR telemetry cockpit", "consent-governed behavioral terminal"),
    ("continuous bio-behavioral telemetry", "structured behavioral continuity"),
    ("100% private • No clinical jargon", "100% user-controlled • Granular consent"),
    ("BAA signed in 1-click", "Verified practitioner access"),
    ("SOC-2 Type II • HIPAA BAA Signed Onboarding", "Granular consent • Client-side privacy controls"),
    ("NOCD Clinical Network", "Exposure & Response Prevention (ERP)"),
    ("McLean OCD Institute", "Cognitive Behavioral Framework"),
    ("Stanford Neuro-Psychiatry", "Subjective Units of Distress (SUDS)"),
    ("Mayo Clinic Behavioral Health", "Habit Reversal & Response Delay"),
    ("NHS Foundation Trust", "Acceptance & Commitment (ACT)"),
    ("IOCDF Scientific Advisory", "Behavioral Activation Protocols"),
    ("Aligned with protocols from leading obsessive-compulsive research consortia", "Aligned with evidence-based behavioral healthcare frameworks"),
]

for old, new in replacements:
    body_content = body_content.replace(old, new)

# Convert HTML attributes to JSX
body_content = re.sub(r'\bclass="([^"]*)"', r'className="\1"', body_content)
body_content = body_content.replace('style="display:block;"', "style={{ display: 'block' }}")
body_content = body_content.replace('style="transform-origin: 90px 180px;"', "style={{ transformOrigin: '90px 180px' }}")
body_content = body_content.replace('style="transform-origin: 360px 170px;"', "style={{ transformOrigin: '360px 170px' }}")

svg_attrs = [
    ('stroke-width', 'strokeWidth'),
    ('stroke-linecap', 'strokeLinecap'),
    ('stroke-linejoin', 'strokeLinejoin'),
    ('stroke-dasharray', 'strokeDasharray'),
    ('flood-color', 'floodColor'),
    ('flood-opacity', 'floodOpacity'),
    ('stop-color', 'stopColor'),
    ('stop-opacity', 'stopOpacity'),
    ('fill-rule', 'fillRule'),
    ('clip-rule', 'clipRule'),
    ('clip-path', 'clipPath'),
]
for old_attr, new_attr in svg_attrs:
    body_content = re.sub(rf'\b{old_attr}=', f'{new_attr}=', body_content)

# Self-close void tags
body_content = re.sub(r'<br\s*>', '<br />', body_content)
body_content = re.sub(r'<hr\s*>', '<hr />', body_content)
body_content = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1 />', body_content)
body_content = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1 />', body_content)

void_tags = ['line', 'circle', 'rect', 'path', 'ellipse', 'polygon', 'polyline', 'stop', 'feDropShadow']
for tag in void_tags:
    body_content = re.sub(rf'<{tag}([^>]*?)(?<!/)>(\s*)</{tag}>', rf'<{tag}\1 />', body_content)

# Replace HTML comments
body_content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', body_content, flags=re.DOTALL)

# REPLACE MASCOT WITH UPGRADED MODERN SHAPES (Unified Arms + Modern Squircle Head)
old_mascot_target = '''{/* Left Arm pointing up to thoughts */}
<g className="anim-arm-left">
<path d="M 115 425 C 75 390 60 310 92 255 C 106 230 140 228 162 244 C 168 248 167 259 158 264 C 140 273 118 285 112 312 C 102 346 122 392 146 418 Z" fill="url(#bodyBase)" />
{/* Left Hand Thumb & Index gestures */}
<path d="M 148 238 C 166 236 182 245 186 250" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="4.5" />
<path d="M 142 249 C 156 251 165 260 167 267" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="4" />
</g>
{/* Right Arm pointing up to thoughts */}
<g className="anim-arm-right">
<path d="M 335 425 C 375 390 390 310 358 255 C 344 230 310 228 288 244 C 282 248 283 259 292 264 C 310 273 332 285 338 312 C 348 346 328 392 304 418 Z" fill="url(#bodyBase)" />
{/* Right Hand Thumb & Index gestures */}
<path d="M 302 238 C 284 236 268 245 264 250" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="4.5" />
<path d="M 308 249 C 294 251 285 260 283 267" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="4" />
</g>
{/* CIRCULAR HEAD & FACIAL EXPRESSIONS */}
<g className="anim-head-group">
{/* Perfectly Circular Face */}
<circle cx="225" cy="315" fill="url(#bodyBase)" filter="url(#mascotGlow)" r="82" />
{/* Cheek Blush (reacts to emotion) */}
<ellipse cx="180" cy="326" fill="#E8856C" opacity="0.35" rx="10" ry="6" />
<ellipse cx="270" cy="326" fill="#E8856C" opacity="0.35" rx="10" ry="6" />'''

new_mascot_replacement = '''{/* Left Arm and Hand: Complete unified shape pointing to thoughts */}
<g className="anim-arm-left">
<path d="M 115 435 C 72 395 55 318 85 256 C 96 234 118 218 144 220 C 158 222 172 230 178 244 C 182 254 178 266 168 272 C 158 278 148 274 142 268 C 136 262 130 268 128 276 C 120 308 116 360 142 422 C 134 430 124 435 115 435 Z" fill="url(#bodyBase)" filter="url(#mascotGlow)" />
</g>
{/* Right Arm and Hand: Complete unified shape pointing to thoughts */}
<g className="anim-arm-right">
<path d="M 335 435 C 378 395 395 318 365 256 C 354 234 332 218 306 220 C 292 222 278 230 272 244 C 268 254 272 266 282 272 C 292 278 302 274 308 268 C 314 262 320 268 322 276 C 330 308 334 360 308 422 C 316 430 326 435 335 435 Z" fill="url(#bodyBase)" filter="url(#mascotGlow)" />
</g>
{/* MODERN SQUIRCLE HEAD & FACIAL EXPRESSIONS */}
<g className="anim-head-group">
{/* Modern Character Head (Organic squircle with soft chubby cheeks, not a rigid circle) */}
<path d="M 225 232 C 278 232, 317 266, 320 310 C 324 352, 296 400, 252 402 C 238 403, 212 403, 198 402 C 154 400, 126 352, 130 310 C 133 266, 172 232, 225 232 Z" fill="url(#bodyBase)" filter="url(#mascotGlow)" />
{/* Cheek Blush (aligned with modern cheek curves) */}
<ellipse cx="176" cy="328" fill="#E8856C" opacity="0.35" rx="12" ry="7" />
<ellipse cx="274" cy="328" fill="#E8856C" opacity="0.35" rx="12" ry="7" />'''

if old_mascot_target in body_content:
    body_content = body_content.replace(old_mascot_target, new_mascot_replacement)

# ADD SUBTLE ANIMATIONS TO DASHBOARD 1 & 2
# 1) Wave animation in personal dashboard:
body_content = body_content.replace(
    '<circle cx="120" cy="10" fill="#E8856C" r="4" />',
    '<circle cx="120" cy="10" fill="#E8856C" r="4" className="anim-wave-surf" /><circle cx="120" cy="10" fill="#E8856C" opacity="0.25" r="8" className="anim-wave-surf" />'
)

# 2) Digital worry stone in personal dashboard:
body_content = body_content.replace(
    'rounded-full bg-white flex items-center justify-center soft-card cursor-pointer hover:scale-105 transition-transform text-brand-lavender',
    'rounded-full bg-white flex items-center justify-center soft-card cursor-pointer hover:scale-105 transition-transform text-brand-lavender anim-vagus-breathe'
)

# 3) Clinician 12:00 wave peak animation in dashboard 2:
body_content = body_content.replace(
    '<circle cx="115" cy="12" fill="#17323A" r="3" />',
    '<circle cx="115" cy="12" fill="#DE5A46" r="3.5" className="anim-spline-pulse" /><circle cx="115" cy="12" fill="#E8856C" opacity="0.3" r="8" className="anim-spline-pulse" />'
)

# 4) Timeline 08:12 Node Sync in clinician dashboard:
body_content = body_content.replace(
    '<span className="absolute -top-1 left-4 w-2 h-2 rounded-full bg-brand-coral pulse-indicator" />',
    '<span className="absolute -top-1 left-4 w-2.5 h-2.5 rounded-full bg-brand-coral" /><span className="absolute -top-2 left-3 w-4.5 h-4.5 rounded-full bg-brand-coral/40 anim-radar-ping" />'
)

# 3D PERSPECTIVE CARD SCROLL SECTION (Features & Services Carousel)
card_scroll_section = '''
{/* BEGIN: 3D Perspective Card Scroll Showcase (Features & Services Carousel) */}
<section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
  <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-coralSoft text-brand-coral text-xs font-mono font-bold uppercase tracking-wider">
      Between-Session Architecture
    </div>
    <h2 className="font-editorial text-2xl sm:text-4xl text-brand-ink font-normal tracking-tight">
      Engineered for the 167 hours between appointments
    </h2>
    <p className="text-xs sm:text-sm text-brand-ink/75">
      Slide through continuous micro-tools designed to surf urge crests, log ritual friction, and share consented trends.
    </p>
  </div>

  {/* 3D Perspective Arched Container */}
  <div className="perspective-ribbon-wrap relative">
    <div className="perspective-ribbon-content bg-gradient-to-r from-[#DE5A46] via-[#E8856C] to-[#D4943A] rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(232,133,108,0.35)] overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute -top-10 left-1/3 w-80 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
      
      {/* Horizontal Scrolling Track with Hover Pause */}
      <div className="relative overflow-hidden w-full flex">
        <div className="animate-card-scroll flex items-center gap-6 py-2">
          {/* Card 1: Clinical Testimonial */}
          <div className="w-[320px] sm:w-[360px] bg-white rounded-2xl p-5 soft-card flex flex-col justify-between space-y-4 shrink-0 border border-white/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-brand-sand px-2.5 py-1 rounded-full text-brand-ink">
                CLINICIAN PERSPECTIVE
              </span>
              <span className="text-xs text-brand-coral font-bold tracking-widest">★★★★★</span>
            </div>
            <p className="text-xs text-brand-ink/85 leading-relaxed font-editorial italic text-sm">
              "Between Sessions eliminated the 167-hour retrospective recall gap. My patients log urges in real-time and arrive with objective behavioral trajectories."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-brand-ink/5">
              <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ML
              </div>
              <div>
                <p className="text-xs font-bold text-brand-ink">Dr. Maya Lin, Psy.D.</p>
                <p className="text-[10px] text-brand-ink/60 font-mono">ERP &amp; OCD Specialist</p>
              </div>
            </div>
          </div>

          {/* Card 2: 90-Second Urge Surfer */}
          <div className="w-[300px] sm:w-[340px] bg-[#17323A] text-white rounded-2xl p-5 soft-card flex flex-col justify-between space-y-4 shrink-0 shadow-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-white/10 text-brand-coral px-2.5 py-1 rounded-full uppercase tracking-wider">
                ACTIVE URGE SURFER
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-coral pulse-indicator" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-gray-300">Intrusive Spike Wave</p>
              <h4 className="text-base font-bold text-white mt-0.5">Surfing the Crest</h4>
              <div className="h-12 w-full my-2">
                <svg className="w-full h-full" viewBox="0 0 200 45" fill="none">
                  <path d="M 0 35 Q 25 35 50 25 T 100 8 T 150 28 T 200 35" stroke="#E8856C" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="8" r="4" fill="#E8856C" className="anim-wave-surf" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-mono">
              <span className="text-brand-coral font-bold">01:14 Crest</span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-gray-300">Tactile Haptics</span>
            </div>
          </div>

          {/* Card 3: Digital Worry Stone & Pacing */}
          <div className="w-[290px] sm:w-[320px] bg-[#F0EDFB] text-brand-ink rounded-2xl p-5 soft-card flex flex-col justify-between space-y-3 shrink-0 border border-[#D8DFDE]/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-full text-brand-lavender uppercase tracking-wider">
                VAGUS RESET
              </span>
              <span className="text-[10px] font-mono text-brand-lavender font-bold">4-7-8 Breathing</span>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center anim-vagus-breathe text-brand-lavender shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-brand-ink/80 mt-2">Hold thumb to synchronize</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-brand-ink/60 border-t border-brand-lavender/20 pt-2">
              <span>Sympathetic De-escalation</span>
              <span className="font-bold text-brand-lavender">92% Restored</span>
            </div>
          </div>

          {/* Card 4: Grounded AI Weekly Pattern Summary */}
          <div className="w-[300px] sm:w-[340px] bg-white rounded-2xl p-5 soft-card flex flex-col justify-between space-y-3 shrink-0 border border-white/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-brand-softerTeal text-brand-teal px-2.5 py-1 rounded-full">
                AUDITABLE AI INSIGHT
              </span>
              <span className="text-[9px] font-mono text-brand-ink/50">WEEK 24</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-brand-ink/70 uppercase font-mono tracking-wider">Synthesized from logs</p>
              <p className="text-xs text-brand-ink/90 font-medium leading-relaxed">
                "Response delay increased from 2m to 14m across 4 contamination triggers this week."
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[9px] font-mono bg-brand-sand px-2 py-0.5 rounded text-brand-ink font-semibold">4 Logs</span>
                <span className="text-[9px] font-mono bg-brand-coralSoft px-2 py-0.5 rounded text-brand-coral font-bold">Pre: 7.2</span>
                <span className="text-[9px] font-mono bg-brand-softerTeal px-2 py-0.5 rounded text-brand-teal font-bold">Post: 3.8</span>
              </div>
            </div>
            <p className="text-[9px] text-brand-ink/50 font-mono border-t border-brand-ink/5 pt-1.5">
              Not medical advice • Direct metric references
            </p>
          </div>

          {/* Card 5: Consent-Governed Sharing */}
          <div className="w-[300px] sm:w-[330px] bg-[#FAF8F3] rounded-2xl p-5 soft-card flex flex-col justify-between space-y-3 shrink-0 border border-[#D8DFDE]/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-brand-amberSoft text-brand-amber px-2.5 py-1 rounded-full uppercase tracking-wider">
                CONSENT MATRIX
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Active</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-brand-border">
                <span className="text-brand-ink font-medium text-[11px]">SUDS Check-in Logs</span>
                <span className="text-brand-teal font-mono font-bold text-[10px]">SHARED ✓</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-brand-border">
                <span className="text-brand-ink font-medium text-[11px]">Curated ERP Practice</span>
                <span className="text-brand-teal font-mono font-bold text-[10px]">SHARED ✓</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/60 border border-dashed border-brand-border">
                <span className="text-brand-ink/60 font-medium text-[11px]">Private Journal Notes</span>
                <span className="text-brand-ink/40 font-mono text-[10px]">LOCKED 🔒</span>
              </div>
            </div>
            <p className="text-[9px] text-brand-ink/50 font-mono border-t border-brand-ink/5 pt-1">
              Revocable at any second by patient
            </p>
          </div>

          {/* DUPLICATE SET FOR INFINITE SEAMLESS MARQUEE */}
          {/* Card 1 Duplicate */}
          <div className="w-[320px] sm:w-[360px] bg-white rounded-2xl p-5 soft-card flex flex-col justify-between space-y-4 shrink-0 border border-white/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-brand-sand px-2.5 py-1 rounded-full text-brand-ink">
                CLINICIAN PERSPECTIVE
              </span>
              <span className="text-xs text-brand-coral font-bold tracking-widest">★★★★★</span>
            </div>
            <p className="text-xs text-brand-ink/85 leading-relaxed font-editorial italic text-sm">
              "Between Sessions eliminated the 167-hour retrospective recall gap. My patients log urges in real-time and arrive with objective behavioral trajectories."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-brand-ink/5">
              <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ML
              </div>
              <div>
                <p className="text-xs font-bold text-brand-ink">Dr. Maya Lin, Psy.D.</p>
                <p className="text-[10px] text-brand-ink/60 font-mono">ERP &amp; OCD Specialist</p>
              </div>
            </div>
          </div>

          {/* Card 2 Duplicate */}
          <div className="w-[300px] sm:w-[340px] bg-[#17323A] text-white rounded-2xl p-5 soft-card flex flex-col justify-between space-y-4 shrink-0 shadow-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-white/10 text-brand-coral px-2.5 py-1 rounded-full uppercase tracking-wider">
                ACTIVE URGE SURFER
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-coral pulse-indicator" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-gray-300">Intrusive Spike Wave</p>
              <h4 className="text-base font-bold text-white mt-0.5">Surfing the Crest</h4>
              <div className="h-12 w-full my-2">
                <svg className="w-full h-full" viewBox="0 0 200 45" fill="none">
                  <path d="M 0 35 Q 25 35 50 25 T 100 8 T 150 28 T 200 35" stroke="#E8856C" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="8" r="4" fill="#E8856C" className="anim-wave-surf" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-mono">
              <span className="text-brand-coral font-bold">01:14 Crest</span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-gray-300">Tactile Haptics</span>
            </div>
          </div>

          {/* Card 3 Duplicate */}
          <div className="w-[290px] sm:w-[320px] bg-[#F0EDFB] text-brand-ink rounded-2xl p-5 soft-card flex flex-col justify-between space-y-3 shrink-0 border border-[#D8DFDE]/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-full text-brand-lavender uppercase tracking-wider">
                VAGUS RESET
              </span>
              <span className="text-[10px] font-mono text-brand-lavender font-bold">4-7-8 Breathing</span>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center anim-vagus-breathe text-brand-lavender shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-brand-ink/80 mt-2">Hold thumb to synchronize</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-brand-ink/60 border-t border-brand-lavender/20 pt-2">
              <span>Sympathetic De-escalation</span>
              <span className="font-bold text-brand-lavender">92% Restored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
{/* END: 3D Perspective Card Scroll Showcase */}
'''

# Insert card scroll right after MarqueePartners
marquee_end = '{/* END: MarqueePartners */}'
if marquee_end in body_content:
    body_content = body_content.replace(marquee_end, marquee_end + '\n' + card_scroll_section)

# Add Safety Section before footer
safety_section = '''
      {/* BEGIN: Safety & Clinical Boundaries Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="safety-boundary">
        <div className="bg-white rounded-[34px] p-8 sm:p-10 soft-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-coralSoft text-brand-coral flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium">Explicit Clinical Boundaries</h3>
              <p className="text-xs text-brand-ink/60">Software assists self-observation; qualified humans decide clinical care.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-brand-ink/80">
            <div className="p-4 bg-brand-canvas rounded-2xl border border-brand-border space-y-1.5">
              <p className="font-bold text-brand-ink">What Between Sessions IS:</p>
              <p className="leading-relaxed">A structured continuity companion for tracking behaviors, surfing urge crests, practicing therapist-guided exercises, and organizing longitudinal reflections for clinical review.</p>
            </div>
            <div className="p-4 bg-brand-canvas rounded-2xl border border-brand-border space-y-1.5">
              <p className="font-bold text-brand-ink">What Between Sessions is NOT:</p>
              <p className="leading-relaxed">Not a diagnostic medical device, not an autonomous emergency response service, and not a replacement for certified psychiatrists, clinical psychologists, or hospital care.</p>
            </div>
          </div>
          <div className="p-5 bg-brand-amberSoft rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-brand-ink">Persistent Emergency Mental Health Support</p>
              <p className="text-[11px] text-brand-ink/75 mt-0.5">Tele-MANAS National Tele Mental Health Programme: Call <span className="font-mono font-bold text-brand-ink">14416</span> or <span className="font-mono font-bold text-brand-ink">1800-891-4416</span> (toll-free, 24/7 in 20+ languages).</p>
            </div>
            <a className="px-5 py-2.5 bg-brand-ink text-white rounded-full text-xs font-semibold whitespace-nowrap hover:bg-brand-teal transition-colors shadow-sm" href="tel:14416">
              Call 14416
            </a>
          </div>
        </div>
      </section>
      {/* END: Safety & Clinical Boundaries Section */}
'''

footer_marker = '{/* BEGIN: Footer */}'
if footer_marker in body_content:
    body_content = body_content.replace(footer_marker, safety_section + '\n      ' + footer_marker)

jsx = f'''import React, {{ useState }} from 'react';

export default function LandingPage() {{
  const [activeSuds, setActiveSuds] = useState(6);

  return (
    <div className="min-h-screen bg-[#F7F8F7] text-[#17323A] font-sans selection:bg-brand-coral selection:text-white">
{body_content}
    </div>
  );
}}
'''

with open('frontend/src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)

print('Successfully regenerated LandingPage.jsx with 3D card scroll and subtle dashboard animations!')
