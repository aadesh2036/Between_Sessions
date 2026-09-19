import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StackedFeatureCards from '../components/StackedFeatureCards';
import Logo from '../components/Logo';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8F7] text-[#17323A] font-sans selection:bg-brand-coral selection:text-white">
{/* BEGIN: FloatingNavbar */}
<header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex flex-col items-center px-3 sm:px-4">
  <nav className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/90 backdrop-blur-xl shadow-card-lift max-w-5xl w-full border border-white/60">
    {/* Logo Mark */}
    <Logo className="sm:gap-2.5" />

    {/* Desktop Navigation Links */}
    <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-brand-ink/80 tracking-normal">
      <a className="hover:text-brand-teal transition-colors" href="#pillars">5 Pillars</a>
      <a className="hover:text-brand-teal transition-colors" href="#architecture">Continuity Layers</a>
      <a className="hover:text-brand-teal transition-colors" href="#safety-boundary">Clinical Safety</a>
      <Link className="hover:text-brand-teal transition-colors" to="/practitioner/login">For Clinicians</Link>
    </div>

    {/* Action Buttons & Mobile Hamburger */}
    <div className="flex items-center gap-2 sm:gap-2.5">
      <Link className="text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-brand-ink hover:bg-brand-canvas transition-all hidden md:inline-block" to="/login">
        Login
      </Link>
      <Link className="text-xs font-semibold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand-teal text-white hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center gap-1.5" to="/login">
        <span className="hidden sm:inline">Get Started</span>
        <span className="sm:hidden">Access</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>

      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-ink rounded-full hover:bg-brand-canvas transition-colors cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>
  </nav>

  {/* Mobile Menu Dropdown Card */}
  {mobileMenuOpen && (
    <div className="lg:hidden mt-2 w-full max-w-5xl bg-white/95 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-brand-border space-y-3 animate-tab-switch">
      <div className="flex flex-col space-y-1">
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-canvas transition-colors" 
          href="#pillars"
        >
          Platform Pillars (5 Core Areas)
        </a>
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-canvas transition-colors" 
          href="#architecture"
        >
          Continuity Layers (3D Architecture)
        </a>
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-canvas transition-colors" 
          href="#safety-boundary"
        >
          Clinical Safety &amp; Boundaries
        </a>
        <Link className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-canvas transition-colors" to="/login" onClick={() => setMobileMenuOpen(false)}>
          Individual Portal
        </Link>
        <Link className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-canvas transition-colors" to="/practitioner/login" onClick={() => setMobileMenuOpen(false)}>
          Clinician Portal
        </Link>
        <Link className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-canvas transition-colors" to="/terms" onClick={() => setMobileMenuOpen(false)}>
          Terms &amp; Clinical Governance
        </Link>
      </div>
      <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-3">
        <Link className="text-xs font-semibold px-4 py-2.5 min-h-[44px] rounded-full text-brand-ink bg-brand-canvas flex-1 text-center border border-brand-border flex items-center justify-center" to="/login" onClick={() => setMobileMenuOpen(false)}>
          Enter App
        </Link>
        <a className="text-xs font-semibold px-4 py-2.5 min-h-[44px] rounded-full bg-brand-coral text-white flex-1 text-center flex items-center justify-center" href="tel:14416" onClick={() => setMobileMenuOpen(false)}>
          Tele-MANAS: 14416
        </a>
      </div>
    </div>
  )}
</header>
{/* END: FloatingNavbar */}
{/* BEGIN: Open Canvas HeroSection (Free canvas, no box frame wrapper) */}
<section className="pt-24 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
{/* Hero Copy on Pure Open Canvas */}
<div className="lg:col-span-7 space-y-6">
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0EC] text-brand-coral text-xs font-semibold uppercase tracking-wider">
<span className="w-2 h-2 rounded-full bg-brand-coral animate-ping"></span>
        Non-Stigmatizing ERP Companion
      </div>
<h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-brand-ink leading-[1.15] sm:leading-[1.12]">
        Tame the loops.<br />
<span className="italic font-light text-brand-teal">Master the moments</span><br />
        between sessions.
      </h1>
<p className="text-lg text-brand-ink/75 max-w-xl font-normal leading-relaxed">
        Structured behavioral continuity for Exposure and Response Prevention (ERP). Track compulsions without shame, pause and choose your response, and share consent-based longitudinal patterns with your practitioner.
      </p>
{/* Pathway selector buttons */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
<Link className="px-6 py-3.5 rounded-full bg-brand-ink text-white font-semibold text-sm hover:bg-brand-teal transition-all shadow-md hover:shadow-lg flex items-center gap-2" to="/login">
            <span>Enter Your Sanctuary</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          
          <Link className="px-6 py-3.5 rounded-full bg-white text-brand-ink font-semibold text-sm hover:bg-[#F0F5F4] transition-all shadow-sm flex items-center gap-2" to="/practitioner/login">
            <span>Clinician Access</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
          </Link>
</div>
{/* Trust Badges with refined SVG iconography */}
<div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-brand-ink/70">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-lg bg-brand-softerTeal flex items-center justify-center text-brand-teal">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" /></svg>
</div>
<span>Privacy-First Architecture</span>
</div>
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-lg bg-brand-amberSoft flex items-center justify-center text-brand-amber">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" /></svg>
</div>
<span>Consent-Based Insights</span>
</div>
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-lg bg-brand-coralSoft flex items-center justify-center text-brand-coral">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>
</div>
<span>Structured Continuity</span>
</div>
</div>
</div>
{/* Right: Open Canvas Mascot SVG (Strictly without outer container box or scribbles) */}
<div className="lg:col-span-5 flex flex-col items-center justify-center">
{/* STITCH_SVG_START:ANIMATION_15 className="w-[340px] h-[360px] mx-auto" */}<div className="w-full max-w-[280px] sm:max-w-[340px] h-auto aspect-[340/360] mx-auto" id="animated-svg-ANIMATION_15" style={{ display: 'block' }}><svg height="100%" viewBox="0 0 460 480" width="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
{/* Calming, tactile drop shadows */}
<filter height="140%" id="mascotGlow" width="140%" x="-20%" y="-20%">
<feDropShadow dx="0" dy="12" floodColor="#17323A" floodOpacity="0.12" stdDeviation="16" />
</filter>
<filter height="140%" id="puzzleShadow" width="140%" x="-20%" y="-20%">
<feDropShadow dx="0" dy="6" floodColor="#17323A" floodOpacity="0.15" stdDeviation="8" />
</filter>
{/* Mascot Gradient Colors */}
<linearGradient id="bodyBase" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#9ADBE8" />
<stop offset="100%" stopColor="#6DC4D6" />
</linearGradient>
{/* 4 Mind Puzzle Colors (matching the user's reference image exactly: Dark Slate, Sage, Warm Yellow, Somatic Coral) */}
<linearGradient id="puzDark" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#1E3A4B" />
<stop offset="100%" stopColor="#142732" />
</linearGradient>
<linearGradient id="puzSage" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#8DBFA4" />
<stop offset="100%" stopColor="#6EA98D" />
</linearGradient>
<linearGradient id="puzYellow" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#F6BC36" />
<stop offset="100%" stopColor="#EAA620" />
</linearGradient>
<linearGradient id="puzCoral" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#F0715D" />
<stop offset="100%" stopColor="#DE5A46" />
</linearGradient>
</defs>

{/* 4 THOUGHT PUZZLE PIECES FLOATING ABOVE (From Reference) */}
{/* Piece 1: Dark Slate (Top-Left) */}
<g className="anim-puzzle-1" filter="url(#puzzleShadow)">
<path d="M 140 50 L 195 50 A 15 15 0 0 1 214 64 A 15 15 0 0 1 202 82 L 202 100 A 10 10 0 0 1 192 110 L 140 110 A 12 12 0 0 1 128 98 L 128 62 A 12 12 0 0 1 140 50 Z" fill="url(#puzDark)" />
</g>
{/* Piece 2: Sage / Mint (Top-Right) */}
<g className="anim-puzzle-2" filter="url(#puzzleShadow)">
<path d="M 245 50 L 305 50 A 12 12 0 0 1 317 62 L 317 105 A 12 12 0 0 1 305 117 L 285 117 A 14 14 0 0 1 271 103 A 14 14 0 0 1 283 87 L 283 72 A 8 8 0 0 0 275 64 L 245 64 A 8 8 0 0 1 237 56 A 8 8 0 0 1 245 50 Z" fill="url(#puzSage)" />
</g>
{/* Piece 3: Warm Mustard / Amber (Bottom-Left) */}
<g className="anim-puzzle-3" filter="url(#puzzleShadow)">
<path d="M 145 135 L 172 135 A 14 14 0 0 1 186 149 A 14 14 0 0 1 174 165 L 200 165 A 8 8 0 0 1 208 173 L 208 208 A 14 14 0 0 1 194 222 L 145 222 A 12 12 0 0 1 133 210 L 133 147 A 12 12 0 0 1 145 135 Z" fill="url(#puzYellow)" />
</g>
{/* Piece 4: Somatic Terracotta / Coral (Bottom-Right) */}
<g className="anim-puzzle-4" filter="url(#puzzleShadow)">
<path d="M 250 130 L 305 130 A 12 12 0 0 1 317 142 L 317 202 A 12 12 0 0 1 305 214 L 255 214 A 12 12 0 0 1 243 202 L 243 184 A 14 14 0 0 1 229 170 A 14 14 0 0 1 243 156 L 243 142 A 12 12 0 0 1 250 130 Z" fill="url(#puzCoral)" />
</g>
{/* CELEBRATION SPARKLES (Radiates during happy breakthrough state) */}
<g className="sparkle-joy" style={{ transformOrigin: '90px 180px' }}>
<path d="M 90 165 Q 90 180 105 180 Q 90 180 90 195 Q 90 180 75 180 Q 90 180 90 165 Z" fill="#D4943A" />
</g>
<g className="sparkle-joy" style={{ transformOrigin: '360px 170px' }}>
<path d="M 360 155 Q 360 170 375 170 Q 360 170 360 185 Q 360 170 345 170 Q 360 170 360 155 Z" fill="#E8856C" />
</g>
{/* MASCOT HEAD & BODY (Strictly circular face as requested) */}
{/* Torso Base / Grounded Body */}
<path d="M 100 460 C 100 380 150 330 225 330 C 300 330 350 380 350 460 C 350 480 100 480 100 460 Z" fill="url(#bodyBase)" filter="url(#mascotGlow)" />
{/* Left Arm and Hand: Complete unified shape pointing to thoughts */}
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
<ellipse cx="274" cy="328" fill="#E8856C" opacity="0.35" rx="12" ry="7" />
{/* ================= STATE A: STRUGGLING WITH INTRUSIVE THOUGHTS ================= */}
<g className="face-struggle">
{/* Squeezed, Overwhelmed Eyes / Focused inward effort */}
{/* Left tight brow/eye */}
<path d="M 186 298 Q 198 308 210 299" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="4.5" />
<line stroke="#17323A" strokeLinecap="round" strokeWidth="3" x1="184" x2="204" y1="290" y2="295" />
{/* Right tight brow/eye */}
<path d="M 240 299 Q 252 308 264 298" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="4.5" />
<line stroke="#17323A" strokeLinecap="round" strokeWidth="3" x1="266" x2="246" y1="290" y2="295" />
{/* Struggling / Tight, slightly wavy mouth holding tension */}
<path d="M 213 336 Q 220 332 225 336 Q 230 340 237 335" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="4.5" />
{/* Somatic Sweat Drop on brow */}
<path className="sweat-tear" d="M 268 270 C 268 264 274 256 274 256 C 274 256 280 264 280 270 C 280 274 277 277 274 277 C 271 277 268 274 268 270 Z" fill="#6EA98D" />
</g>
{/* ================= STATE B: HAPPY, GROUNDED & RELIEVED IN BETWEEN ================= */}
<g className="face-happy">
{/* Cheerful Inverted Arc Eyes (Smiling happily) */}
<path d="M 186 304 C 192 294 206 294 212 304" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="5" />
<path d="M 238 304 C 244 294 258 294 264 304" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="5" />
{/* Wide, Happy, Reassuring Warm Smile */}
<path d="M 210 330 Q 225 348 240 330" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="5" />
{/* Soft open mouth depth */}
<path d="M 213 332 Q 225 345 237 332 Z" fill="#E8856C" opacity="0.6" />
{/* Joyful eyebrow lifts */}
<path d="M 188 288 Q 199 282 210 288" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="3" />
<path d="M 240 288 Q 251 282 262 288" fill="none" stroke="#17323A" strokeLinecap="round" strokeWidth="3" />
</g>
</g>
</svg></div>{/* STITCH_SVG_END:ANIMATION_15 */}
</div>
</div>
</section>
{/* END: HeroSection */}
{/* BEGIN: MarqueePartners */}
<section className="py-6 bg-white/60 overflow-hidden">
<div className="max-w-7xl mx-auto px-4 mb-2">
<p className="text-xs font-sans font-bold tracking-widest text-center text-brand-ink/70 uppercase">Aligned with evidence-based behavioral healthcare frameworks</p>
</div>
<div className="relative overflow-hidden w-full flex">
<div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-brand-ink/75 font-semibold text-sm">
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-teal"></span>Exposure & Response Prevention (ERP)</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-coral"></span>Cognitive Behavioral Framework</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-lavender"></span>Subjective Units of Distress (SUDS)</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-amber"></span>Habit Reversal & Response Delay</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-teal"></span>Acceptance & Commitment (ACT)</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-coral"></span>Behavioral Activation Protocols</span>
{/* Duplicate for infinite loop */}
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-teal"></span>Exposure & Response Prevention (ERP)</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-coral"></span>Cognitive Behavioral Framework</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-lavender"></span>Subjective Units of Distress (SUDS)</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-amber"></span>Habit Reversal & Response Delay</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-teal"></span>Acceptance & Commitment (ACT)</span>
<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-coral"></span>Behavioral Activation Protocols</span>
</div>
</div>
</section>
{/* END: MarqueePartners */}

      {/* BEGIN: 5 Pillars of Care Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="pillars">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-softerTeal text-brand-teal text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
            Five Continuity Pillars
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-ink tracking-tight mt-4">
            Clinically engineered for the moments between appointments
          </h2>
          <p className="text-sm sm:text-base text-brand-ink/75 mt-3 leading-relaxed">
            Between Sessions transforms evidence-based clinical protocols into five cohesive, shame-free operational pillars — keeping you grounded in daily life and connected to your clinician.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1: Sanctuary (Home) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-border soft-card flex flex-col justify-between hover:border-brand-teal/40 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-softerTeal text-brand-teal flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-sans uppercase tracking-wider text-brand-teal font-bold block">Pillar 01 • Daily Orientation</span>
              <h3 className="font-editorial text-2xl text-brand-ink">Sanctuary &amp; Grounding</h3>
              <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
                A calm, non-judgmental space to orient your mindset. Features real-time 0–10 calibrated SUDS check-ins and organic kinetic shapes that soothe somatic hyperarousal upon launch.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-brand-border flex flex-wrap gap-1.5">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-softerTeal text-brand-teal font-medium">0–10 SUDS</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Kinetic Pacing</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Anti-Shame</span>
            </div>
          </div>

          {/* Pillar 2: Practice (ERP) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-border soft-card flex flex-col justify-between hover:border-brand-coral/40 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-coralSoft text-brand-coral flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-sans uppercase tracking-wider text-brand-coral font-bold block">Pillar 02 • ERP Protocols</span>
              <h3 className="font-editorial text-2xl text-brand-ink">Structured Practice</h3>
              <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
                Step-by-step Exposure and Response Prevention (ERP) trials. Real-time Habit Reversal Delay timers help you decouple compulsive rituals from obsessive alarm spikes without self-blame.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-brand-border flex flex-wrap gap-1.5">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-coralSoft text-brand-coral font-medium">Habit Delay</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Trial Logs</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Response Prevention</span>
            </div>
          </div>

          {/* Pillar 3: Toolkit (Somatic) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-border soft-card flex flex-col justify-between hover:border-brand-lavender/40 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-lavenderSoft text-brand-lavender flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-sans uppercase tracking-wider text-brand-lavender font-bold block">Pillar 03 • Somatic Calming</span>
              <h3 className="font-editorial text-2xl text-brand-ink">Somatic Toolkit</h3>
              <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
                Tactile biofeedback regulators for acute distress peaks. Includes the 90-second Urge Surfing wave, physiological vagus sigh pacing, and box breathing down-regulators.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-brand-border flex flex-wrap gap-1.5">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-lavenderSoft text-brand-lavender font-medium">90s Urge Surf</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Vagus Sigh</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Sensory Lock</span>
            </div>
          </div>

          {/* Pillar 4: Learn (Psychoeducation) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-border soft-card flex flex-col justify-between hover:border-brand-amber/40 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-amberSoft text-brand-amber flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-sans uppercase tracking-wider text-brand-amber font-bold block">Pillar 04 • Psychoeducation</span>
              <h3 className="font-editorial text-2xl text-brand-ink">Evidence &amp; Defusion</h3>
              <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
                Deconstruct obsessive loops with Acceptance &amp; Commitment (ACT) frameworks. Master the dynamics of the Reassurance Trap and understand how safety behaviors perpetuate anxiety.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-brand-border flex flex-wrap gap-1.5">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-amberSoft text-brand-amber font-medium">Reassurance Trap</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">ACT Defusion</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Values Anchor</span>
            </div>
          </div>

          {/* Pillar 5: Care (Consent & Clinician Bridge) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-border soft-card flex flex-col justify-between md:col-span-2 lg:col-span-2 hover:border-brand-teal/40 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-softerTeal text-brand-teal flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-sans uppercase tracking-wider text-brand-teal font-bold block">Pillar 05 • Clinical Governance</span>
              <h3 className="font-editorial text-2xl text-brand-ink">Consent-Governed Clinical Bridge</h3>
              <p className="text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
                Connect directly with your verified therapist via Cedar WASM cryptographic consent policies. Share calibrated SUDS diurnal splines and exposure trial durations while retaining absolute rights to revoke access at any second.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-brand-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-softerTeal text-brand-teal font-medium">Cedar WASM Engine</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Instant Revocation</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-canvas text-brand-ink/70 font-medium">Zero Recall Bias</span>
              </div>
              <Link to="/practitioner/login" className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1">
                <span>Practitioner Access</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* END: 5 Pillars of Care Section */}

      {/* BEGIN: 3D Stacked Feature Cards (Vertical Peel-Off on Scroll) */}
      <StackedFeatureCards />
      {/* END: 3D Stacked Feature Cards */}

      {/* BEGIN: Dual Callout Banners (Solid Cards, Diffuse Drop Shadows) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="trial">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Callout Card */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 flex flex-col justify-between space-y-6 soft-card">
            <div className="space-y-4">
              <span className="text-xs font-sans tracking-wider text-brand-coral uppercase font-bold">For You As A Person</span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-brand-ink">Take control of your quiet hours.</h3>
              <p className="text-xs sm:text-sm text-brand-ink/75 leading-relaxed">
                No clinical pressure, no rigid checklists. Just you, Pip, and micro-tools engineered to dissolve repetitive thinking loops step by step.
              </p>
            </div>
            <div>
              <Link className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-teal transition-colors shadow-sm" to="/login">
                <span>Enter Individual Sanctuary</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <p className="text-xs text-center text-brand-ink/70 font-sans mt-2">Available for iOS, Android &amp; Web</p>
            </div>
          </div>
          {/* Practitioner Callout Card */}
          <div id="practitioners" className="bg-brand-ink text-white rounded-[32px] p-8 sm:p-10 flex flex-col justify-between space-y-6 soft-card">
            <div className="space-y-4">
              <span className="text-xs font-sans tracking-wider text-brand-coral uppercase font-bold">For Medical Practitioners</span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-white">Bring the 167 hours into your clinic.</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Sync your practice on Between Sessions. Eliminate appointment recollection amnesia with the clinician continuity terminal.
              </p>
            </div>
            <div className="space-y-3">
              <Link to="/practitioner/login" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] rounded-full bg-brand-teal text-white text-xs font-bold hover:bg-white hover:text-brand-ink transition-all shadow-md">
                <span>Access Clinician Portal</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <p className="text-xs text-gray-300 font-sans text-center">Granular consent • Client-side privacy controls • Cedar WASM evaluated</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: Dual Callout Banners */}

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
              <p className="leading-relaxed">A structured continuity companion for tracking behaviors, practicing the pause, practicing therapist-guided exercises, and organizing longitudinal reflections for clinical review.</p>
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

      {/* BEGIN: Comprehensive 4-Column Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-brand-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
            
            {/* Col 1 & 2: Brand & Clinical Manifesto */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
                  BS
                </div>
                <span className="font-editorial text-xl font-bold text-brand-ink">Between Sessions</span>
              </div>
              <p className="text-xs text-brand-ink/70 leading-relaxed max-w-sm">
                The evidence-based continuity companion bridging the 167 hours between therapeutic appointments. Designed for ERP, habit reversal, somatic down-regulation, and patient-sovereign cryptographic consent.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-brand-ink/60">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-canvas border border-brand-border text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Cedar WASM Verified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-canvas border border-brand-border text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
                  Anti-Gamification
                </span>
              </div>
            </div>

            {/* Col 3: Continuity Architecture */}
            <div className="space-y-3">
              <p className="text-xs font-sans uppercase tracking-wider text-brand-ink/70 font-bold">5 Pillars</p>
              <ul className="space-y-2 text-xs text-brand-ink/75 font-medium">
                <li><a href="#pillars" className="hover:text-brand-teal transition-colors">Sanctuary (Home)</a></li>
                <li><a href="#pillars" className="hover:text-brand-teal transition-colors">ERP Practice &amp; Trials</a></li>
                <li><a href="#pillars" className="hover:text-brand-teal transition-colors">Somatic Calming Toolkit</a></li>
                <li><a href="#pillars" className="hover:text-brand-teal transition-colors">Psychoeducation &amp; ACT</a></li>
                <li><a href="#pillars" className="hover:text-brand-teal transition-colors">Clinical Continuity</a></li>
              </ul>
            </div>

            {/* Col 4: Portals & Governance */}
            <div className="space-y-3">
              <p className="text-xs font-sans uppercase tracking-wider text-brand-ink/70 font-bold">Portals &amp; Privacy</p>
              <ul className="space-y-2 text-xs text-brand-ink/75 font-medium">
                <li><Link to="/login" className="hover:text-brand-teal transition-colors">Individual Sanctuary</Link></li>
                <li><Link to="/practitioner/login" className="hover:text-brand-teal transition-colors">Clinician Terminal</Link></li>
                <li><Link to="/terms" className="hover:text-brand-teal transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-brand-teal transition-colors">Clinical Privacy &amp; Consent</Link></li>
                <li><a href="#safety-boundary" className="hover:text-brand-teal transition-colors">Clinical Boundaries</a></li>
              </ul>
            </div>

            {/* Col 5: 24/7 Immediate Crisis Helplines */}
            <div className="space-y-3">
              <p className="text-xs font-sans uppercase tracking-wider text-brand-coral font-bold">24/7 Crisis Access</p>
              <div className="p-3.5 bg-brand-coralSoft rounded-2xl border border-brand-coral/20 space-y-2">
                <p className="text-xs font-bold text-brand-ink">Tele-MANAS Helpline</p>
                <p className="text-xs text-brand-ink/70 leading-snug">National tele-mental health support, available in 20+ languages.</p>
                <div className="pt-1">
                  <a href="tel:14416" className="w-full inline-flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-full bg-brand-coral text-white font-bold text-xs hover:bg-brand-coral/90 transition-colors shadow-sm">
                    <span>Call 14416</span>
                  </a>
                </div>
              </div>
              <p className="text-xs text-brand-ink/70 leading-tight">
                Alternate toll-free: <span className="font-mono font-bold text-brand-ink/70">1800-891-4416</span>
              </p>
            </div>

          </div>

          {/* Bottom Hairline & Legal Copyright */}
          <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-ink/60">
            <p>© 2026 Between Sessions Health Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-brand-teal transition-colors">Terms of Service</Link>
              <span className="text-brand-border">•</span>
              <Link to="/privacy" className="hover:text-brand-teal transition-colors">Clinical Privacy</Link>
              <span className="text-brand-border">•</span>
              <a href="#safety-boundary" className="hover:text-brand-teal transition-colors">Clinical Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Comprehensive 4-Column Footer */}

    </div>
  );
}
