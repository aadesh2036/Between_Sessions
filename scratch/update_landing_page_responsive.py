with open('frontend/src/pages/LandingPage.jsx', 'r') as f:
    code = f.read()

# 1. Update import
code = code.replace("import React from 'react';", "import React, { useState } from 'react';")

# 2. Add state to LandingPage component
old_fn_start = "export default function LandingPage() {\n  return ("
new_fn_start = """export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return ("""
code = code.replace(old_fn_start, new_fn_start)

# 3. Update Navbar to include mobile toggle and slide-down drawer
old_header = """{/* BEGIN: FloatingNavbar */}
<header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
<nav className="flex items-center justify-between px-6 py-3 rounded-full bg-white/85 backdrop-blur-xl shadow-card-lift max-w-5xl w-full">
{/* Logo Mark */}
<a className="flex items-center gap-2.5 group" href="#">
<div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
<path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9 2.03 0 3.9-.67 5.4-1.8L12 13V2z" strokeLinecap="round" strokeLinejoin="round" />
<circle cx="12" cy="12" r="3" />
</svg>
</div>
<span className="font-bold tracking-tight text-brand-ink text-base">Between<span className="text-brand-coral">Sessions</span></span>
</a>
{/* Navigation Links */}
<div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-brand-ink/80 tracking-normal">
<a className="hover:text-brand-teal transition-colors" href="#architecture">Continuity Layers</a>
<a className="hover:text-brand-teal transition-colors" href="#trial">For Individuals</a>
<a className="hover:text-brand-teal transition-colors" href="#practitioners">For Practitioners</a>
<a className="hover:text-brand-teal transition-colors" href="#safety-boundary">Clinical Safety</a>
</div>
{/* Action Buttons */}
<div className="flex items-center gap-2.5">
<a className="text-xs font-semibold px-4 py-2 rounded-full text-brand-ink hover:bg-brand-sand transition-all hidden sm:inline-block" href="#trial">
        For You
      </a>
<a className="text-xs font-semibold px-4 py-2 rounded-full bg-brand-teal text-white hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center gap-1.5" href="#practitioners">
<span>Clinician Access</span>
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
</a>
</div>
</nav>
</header>
{/* END: FloatingNavbar */}"""

new_header = """{/* BEGIN: FloatingNavbar */}
<header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex flex-col items-center px-3 sm:px-4">
  <nav className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/90 backdrop-blur-xl shadow-card-lift max-w-5xl w-full border border-white/60">
    {/* Logo Mark */}
    <a className="flex items-center gap-2 sm:gap-2.5 group" href="#">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-teal flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9 2.03 0 3.9-.67 5.4-1.8L12 13V2z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <span className="font-bold tracking-tight text-brand-ink text-sm sm:text-base">Between<span className="text-brand-coral">Sessions</span></span>
    </a>

    {/* Desktop Navigation Links */}
    <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-brand-ink/80 tracking-normal">
      <a className="hover:text-brand-teal transition-colors" href="#architecture">Continuity Layers</a>
      <a className="hover:text-brand-teal transition-colors" href="#trial">For Individuals</a>
      <a className="hover:text-brand-teal transition-colors" href="#practitioners">For Practitioners</a>
      <a className="hover:text-brand-teal transition-colors" href="#safety-boundary">Clinical Safety</a>
    </div>

    {/* Action Buttons & Mobile Hamburger */}
    <div className="flex items-center gap-2 sm:gap-2.5">
      <a className="text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-brand-ink hover:bg-brand-sand transition-all hidden md:inline-block" href="#trial">
        For You
      </a>
      <a className="text-xs font-semibold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand-teal text-white hover:bg-brand-tealDark shadow-sm hover:shadow transition-all flex items-center gap-1.5" href="#practitioners">
        <span className="hidden xs:inline">Clinician Access</span>
        <span className="xs:hidden">Access</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>

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
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-sand transition-colors" 
          href="#trial"
        >
          For Individuals
        </a>
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-sand transition-colors" 
          href="#practitioners"
        >
          For Practitioners
        </a>
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="px-3 py-2 text-sm font-semibold text-brand-ink rounded-lg hover:bg-brand-sand transition-colors" 
          href="#safety-boundary"
        >
          Clinical Safety & Boundaries
        </a>
      </div>
      <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-3">
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="text-xs font-semibold px-4 py-2 rounded-full text-brand-ink bg-brand-sand flex-1 text-center" 
          href="#trial"
        >
          For You
        </a>
        <a 
          onClick={() => setMobileMenuOpen(false)}
          className="text-xs font-semibold px-4 py-2 rounded-full bg-brand-teal text-white flex-1 text-center" 
          href="tel:14416"
        >
          Tele-MANAS: 14416
        </a>
      </div>
    </div>
  )}
</header>
{/* END: FloatingNavbar */}"""

code = code.replace(old_header, new_header)

# 4. Update Hero section container & typography for mobile responsiveness
old_hero_start = '<section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">'
new_hero_start = '<section className="pt-24 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">'
code = code.replace(old_hero_start, new_hero_start)

# Responsive headline
old_headline = '<h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-brand-ink leading-[1.12]">'
new_headline = '<h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-brand-ink leading-[1.15] sm:leading-[1.12]">'
code = code.replace(old_headline, new_headline)

# Responsive pathway buttons
old_buttons = '<div className="flex flex-wrap items-center gap-3 pt-2">'
new_buttons = '<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">'
code = code.replace(old_buttons, new_buttons)

# Responsive mascot container
old_mascot = '<div className="w-[340px] h-[360px] mx-auto"'
new_mascot = '<div className="w-full max-w-[280px] sm:max-w-[340px] h-auto aspect-[340/360] mx-auto"'
code = code.replace(old_mascot, new_mascot)

with open('frontend/src/pages/LandingPage.jsx', 'w') as f:
    f.write(code)

print("LandingPage updated with mobile navbar and responsive hero!")
