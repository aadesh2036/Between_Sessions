with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    code = f.read()

# 1. Update Section padding and sticky top for mobile
code = code.replace(
    'className="relative min-h-[420vh] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"',
    'className="relative min-h-[380vh] sm:min-h-[420vh] py-10 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto"'
)

code = code.replace(
    'className="sticky top-[84px] w-full max-w-6xl mx-auto z-10"',
    'className="sticky top-[68px] sm:top-[84px] w-full max-w-6xl mx-auto z-10"'
)

# 2. Update Stage height to be adaptive on mobile
code = code.replace(
    'className="card-stack-stage relative w-full h-[580px] lg:h-[600px]"',
    'className="card-stack-stage relative w-full h-[560px] sm:h-[580px] lg:h-[600px]"'
)

# 3. Add overflow-y-auto on mobile to all articles
code = code.replace(
    'className={`absolute inset-0 rounded-3xl p-6 sm:p-7 lg:p-8 text-white shadow-2xl flex flex-col justify-between cursor-pointer bg-brand-ink',
    'className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl flex flex-col justify-between overflow-y-auto lg:overflow-hidden custom-scrollbar cursor-pointer bg-brand-ink'
)

code = code.replace(
    'className={`absolute inset-0 rounded-3xl p-6 sm:p-7 lg:p-8 text-white shadow-2xl flex flex-col justify-between cursor-pointer bg-brand-teal',
    'className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl flex flex-col justify-between overflow-y-auto lg:overflow-hidden custom-scrollbar cursor-pointer bg-brand-teal'
)

code = code.replace(
    'className={`absolute inset-0 rounded-3xl p-6 sm:p-7 lg:p-8 text-brand-ink shadow-2xl flex flex-col justify-between cursor-pointer bg-[#FFF9EE] border border-brand-ink/5',
    'className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-brand-ink shadow-2xl flex flex-col justify-between overflow-y-auto lg:overflow-hidden custom-scrollbar cursor-pointer bg-[#FFF9EE] border border-brand-ink/5'
)

# 4. Update stepper controller bar for tight mobile screens
old_controller = """        {/* Compact Stepper & Layer Controller Bar */}
        <div className="flex items-center justify-between gap-4 mb-4 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 border border-brand-border shadow-sm">
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-brand-ink">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse"></span>
            <span className="text-brand-ink/60 font-normal hidden sm:inline">Active Layer:</span>
            <span className="text-brand-teal">
              {activeCard === 0 && "01 • Personal Sanctuary"}
              {activeCard === 1 && "02 • Clinician Terminal"}
              {activeCard === 2 && "03 • Consent & AI Governance"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: '01', label: 'Personal Sanctuary' },
              { id: '02', label: 'Clinician Terminal' },
              { id: '03', label: 'Consent & AI' }
            ].map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveCard(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-bold transition-all ${
                  activeCard === idx
                    ? 'bg-brand-ink text-white shadow-sm'
                    : 'text-brand-ink/60 hover:text-brand-ink hover:bg-brand-sand'
                }`}
              >
                <span className="font-mono">({tab.id})</span> <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>"""

new_controller = """        {/* Compact Stepper & Layer Controller Bar (Fully Responsive) */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 bg-white/95 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-brand-border shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-sans font-bold text-brand-ink truncate">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse shrink-0"></span>
            <span className="text-brand-ink/60 font-normal hidden md:inline">Active:</span>
            <span className="text-brand-teal truncate">
              {activeCard === 0 && "01 • Personal"}
              {activeCard === 1 && "02 • Clinician"}
              {activeCard === 2 && "03 • Consent & AI"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {[
              { id: '01', label: 'Personal' },
              { id: '02', label: 'Clinician' },
              { id: '03', label: 'Consent & AI' }
            ].map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveCard(idx)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-sans font-bold transition-all ${
                  activeCard === idx
                    ? 'bg-brand-ink text-white shadow-sm'
                    : 'text-brand-ink/60 hover:text-brand-ink hover:bg-brand-sand'
                }`}
              >
                <span className="font-mono">({tab.id})</span> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>"""

code = code.replace(old_controller, new_controller)

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(code)

print("StackedFeatureCards updated with responsive mobile layout!")
