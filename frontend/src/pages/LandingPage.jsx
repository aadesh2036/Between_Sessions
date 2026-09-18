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
    <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-brand-ink/80 tracking-normal">
      <a className="hover:text-brand-teal transition-colors" href="#architecture">Continuity Layers</a>
      <a className="hover:text-brand-teal transition-colors" href="#safety-boundary">Clinical Safety</a>
    </div>

    {/* Action Buttons & Mobile Hamburger */}
    <div className="flex items-center gap-2 sm:gap-2.5">
      <Link className="text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-brand-ink hover:bg-brand-sand transition-all hidden md:inline-block" to="/login">
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
        className="lg:hidden p-1.5 text-brand-ink rounded-full hover:bg-brand-sand transition-colors"
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
    <div className="lg:hidden mt-2 w-full max-w-5xl bg-white/95 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-brand-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col space-y-1">
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-sand transition-colors" 
          href="#architecture"
        >
          Continuity Layers
        </a>
        <Link className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-sand transition-colors" to="/login" onClick={() => setMobileMenuOpen(false)}>For Individuals</Link>
<Link className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-sand transition-colors" to="/login" onClick={() => setMobileMenuOpen(false)}>For Practitioners</Link>
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-sand transition-colors" 
          href="#safety-boundary"
        >
          Clinical Safety & Boundaries
        </a>
      </div>
      <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-3">
        <Link className="text-xs font-semibold px-4 py-2 rounded-full text-brand-ink bg-brand-sand flex-1 text-center" to="/login" onClick={() => setMobileMenuOpen(false)}>For You</Link>
        <a className="text-xs font-semibold px-4 py-2 rounded-full bg-brand-teal text-white flex-1 text-center" href="tel:14416" onClick={() => setMobileMenuOpen(false)}>Tele-MANAS: 14416</a>
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
          
          <Link className="px-6 py-3.5 rounded-full bg-white text-brand-ink font-semibold text-sm hover:bg-[#F0F5F4] transition-all shadow-sm flex items-center gap-2" to="/login">
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
<p className="text-xs text-brand-ink/65 text-center mt-3 font-medium">
        Meet <span className="font-bold text-brand-teal">Pip</span>: Your steady companion for grounding and mindful choices.
      </p>
</div>
</div>
</section>
{/* END: HeroSection */}
{/* BEGIN: MarqueePartners */}
<section className="py-6 bg-white/60 overflow-hidden">
<div className="max-w-7xl mx-auto px-4 mb-2">
<p className="text-[11px] font-mono tracking-widest text-center text-brand-ink/50 uppercase">Aligned with evidence-based behavioral healthcare frameworks</p>
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

{/* BEGIN: 3D Stacked Feature Cards (Vertical Peel-Off on Scroll) */}
<StackedFeatureCards />
{/* END: 3D Stacked Feature Cards */}

{/* BEGIN: Dual Callout Banners (Solid Cards, Diffuse Drop Shadows) */}
<section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="trial">
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
{/* Personal Callout Card */}
<div className="bg-white rounded-[32px] p-8 sm:p-10 flex flex-col justify-between space-y-6 soft-card">
<div className="space-y-4">
<span className="text-xs font-mono tracking-widest text-brand-coral uppercase font-bold">For You As A Person</span>
<h3 className="font-editorial text-2xl sm:text-3xl text-brand-ink">Take control of your quiet hours.</h3>
<p className="text-xs sm:text-sm text-brand-ink/75 leading-relaxed">
          No clinical pressure, no rigid checklists. Just you, Pip, and micro-tools engineered to dissolve repetitive thinking loops step by step.
        </p>
</div>
<div>
<Link className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand-ink text-white text-xs font-bold hover:bg-brand-teal transition-colors shadow-sm" to="/login">
                  <span>Enter Individual Sanctuary</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
<p className="text-[10px] text-center text-brand-ink/50 font-mono mt-2">Available for iOS, Android &amp; Web</p>
</div>
</div>
{/* Practitioner Callout Card */}
<div id="practitioners" className="bg-brand-ink text-white rounded-[32px] p-8 sm:p-10 flex flex-col justify-between space-y-6 soft-card">
<div className="space-y-4">
<span className="text-xs font-mono tracking-widest text-brand-coral uppercase font-bold">For Medical Practitioners</span>
<h3 className="font-editorial text-2xl sm:text-3xl text-white">Bring the 167 hours into your clinic.</h3>
<p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Sync your practice on Between Sessions. Eliminate appointment recollection amnesia with the clinician continuity terminal.
        </p>
</div>
<div className="space-y-2">
<div className="flex flex-col sm:flex-row gap-2">
<input className="px-4 py-3 rounded-full text-xs text-brand-ink bg-white w-full focus:outline-none focus:ring-2 focus:ring-brand-teal border-none" placeholder="practitioner@clinic.org" type="email" />
<Link to="/login" className="px-5 py-3 rounded-full bg-brand-teal text-white text-xs font-bold hover:bg-brand-coral transition-colors shadow-md whitespace-nowrap flex items-center justify-center">
            Request Sandbox
          </Link>
</div>
<p className="text-[10px] text-gray-400 font-mono">Granular consent • Client-side privacy controls</p>
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

      {/* BEGIN: Footer */}
<footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-brand-ink/60">
<div className="flex items-center gap-3">
<div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-[10px]">
        BS
      </div>
<span className="font-semibold text-brand-ink">Between Sessions Health Inc.</span>
<span>© 2026 All rights reserved.</span>
</div>
<div className="flex flex-wrap items-center gap-6 font-medium text-brand-ink/80">
<Link className="hover:text-brand-teal transition-colors" to="/login">For Individuals</Link>
<Link className="hover:text-brand-teal transition-colors" to="/login">For Practitioners</Link>
<a className="hover:text-brand-teal transition-colors" href="#architecture">Continuity Layers</a>
<a className="hover:text-brand-teal transition-colors" href="#safety-boundary">Clinical Boundaries</a>
<a className="hover:text-brand-teal transition-colors" href="tel:14416">Tele-MANAS (14416)</a>
</div>
</div>
</footer>
{/* END: Footer */}

    </div>
  );
}
