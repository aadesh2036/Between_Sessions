import re

files_to_patch = [
    'frontend/src/components/StackedFeatureCards.jsx',
    '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'
]

for file_path in files_to_patch:
    with open(file_path, 'r') as f:
        content = f.read()

    # Replace specific font-mono patterns with font-sans
    
    # 1. Any uppercase tracking-wider labels
    content = content.replace('font-mono font-bold text-brand-coral uppercase tracking-wider', 'font-sans font-bold text-brand-coral uppercase tracking-widest')
    content = content.replace('font-mono font-bold bg-brand-coral/10 text-brand-coral px-3 py-1 rounded-full uppercase tracking-wider', 'font-sans font-bold bg-brand-coral/10 text-brand-coral px-3 py-1 rounded-full uppercase tracking-widest')
    content = content.replace('font-mono font-bold text-brand-teal uppercase tracking-wider', 'font-sans font-bold text-brand-teal uppercase tracking-widest')
    content = content.replace('font-mono font-bold text-brand-amber uppercase tracking-wider', 'font-sans font-bold text-brand-amber uppercase tracking-widest')
    content = content.replace('font-mono font-bold text-brand-lavender uppercase tracking-wider', 'font-sans font-bold text-brand-lavender uppercase tracking-widest')
    content = content.replace('font-mono font-bold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider', 'font-sans font-bold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest')
    content = content.replace('font-mono font-bold text-teal-100 uppercase tracking-wider', 'font-sans font-bold text-teal-100 uppercase tracking-widest')
    content = content.replace('font-mono font-bold bg-brand-coralSoft text-brand-coral px-3 py-1 rounded-full uppercase tracking-wider', 'font-sans font-bold bg-brand-coralSoft text-brand-coral px-3 py-1 rounded-full uppercase tracking-widest')
    content = content.replace('font-mono uppercase tracking-wider font-bold', 'font-sans uppercase tracking-widest font-bold')

    # 2. Pill tags
    content = content.replace('font-mono font-bold text-brand-teal bg-brand-softerTeal px-2 py-0.5 rounded-full', 'font-sans font-bold text-brand-teal bg-brand-softerTeal px-2 py-0.5 rounded-full uppercase tracking-wider')
    content = content.replace('font-mono font-bold bg-brand-ink text-white px-3 py-1 rounded-full', 'font-sans font-bold bg-brand-ink text-white px-3 py-1 rounded-full uppercase tracking-wider')

    # 3. Bottom bar links/text
    content = content.replace('font-mono text-white/60 pt-3', 'font-sans font-medium text-white/60 pt-3')
    content = content.replace('font-mono text-brand-teal pt-3', 'font-sans font-medium text-brand-teal pt-3')
    content = content.replace('font-mono text-white/50 pt-3', 'font-sans font-medium text-white/50 pt-3')
    content = content.replace('font-mono text-brand-lavender pt-3', 'font-sans font-medium text-brand-lavender pt-3')
    content = content.replace('font-mono text-teal-100 pt-3', 'font-sans font-medium text-teal-100 pt-3')
    content = content.replace('font-mono text-brand-ink/70 pt-4', 'font-sans font-medium text-brand-ink/70 pt-4')
    content = content.replace('font-mono text-brand-ink/50 border-t', 'font-sans font-medium text-brand-ink/50 border-t')

    # 4. EXHALE tag
    content = content.replace('font-mono text-white font-bold', 'font-sans text-white font-bold tracking-widest')

    # 5. Cohort items text
    content = content.replace('font-mono text-white/90 mb-1', 'font-sans font-medium tracking-wide text-white/90 mb-1')
    
    # 6. Tab labels
    content = content.replace('font-mono font-bold transition-all', 'font-sans font-bold transition-all tracking-wide')
    
    # 7. "Visceral Urge Crest" / "Telemetry Spline"
    content = content.replace('font-mono">Visceral', 'font-sans font-medium tracking-wide">Visceral')
    content = content.replace('font-mono">Telemetry', 'font-sans font-medium tracking-wide">Telemetry')

    # Ensure SUDS numbers and time limits stay font-mono. They are fine.
    # '(01)', '(02)', '(03)' stay font-mono.

    with open(file_path, 'w') as f:
        f.write(content)

print("Boxy fonts removed from UI elements successfully!")
