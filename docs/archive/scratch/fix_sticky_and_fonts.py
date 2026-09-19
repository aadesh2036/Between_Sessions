import re

files_to_patch = [
    'frontend/src/components/StackedFeatureCards.jsx',
    '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'
]

for file_path in files_to_patch:
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Fix Sticky to be bottom-only
    old_sticky = 'class="sticky top-4 sm:top-8 bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"'
    if old_sticky not in content:
        # Check for React className
        old_sticky = 'className="sticky top-4 sm:top-8 bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"'
    
    new_sticky = old_sticky.replace('top-4 sm:top-8 bottom-4 sm:bottom-8', 'bottom-0').replace('justify-center', 'justify-end').replace('py-6', 'pb-4 sm:pb-8 pt-12')
    content = content.replace(old_sticky, new_sticky)

    # 2. Fix the Boxy Fonts (font-mono) mapping to font-sans where appropriate
    replacements = {
        'font-mono font-bold uppercase tracking-wider': 'font-sans font-bold uppercase tracking-widest',
        'text-xs text-white/60 font-mono': 'text-xs text-white/60 font-sans font-medium tracking-wide',
        'text-xs text-teal-100 font-mono': 'text-xs text-teal-100 font-sans font-medium tracking-wide',
        'text-xs text-brand-ink/60 font-mono': 'text-xs text-brand-ink/60 font-sans font-medium tracking-wide',
        'text-[10px] font-mono text-white/50': 'text-[10px] font-sans font-semibold text-white/60 uppercase tracking-widest',
        'text-[10px] font-mono text-white/70': 'text-[10px] font-sans font-semibold text-white/70 uppercase tracking-widest',
        'text-[10px] font-mono text-brand-lavender': 'text-[10px] font-sans font-bold text-brand-lavender',
        'text-[10px] font-mono font-bold text-brand-ink': 'text-[10px] font-sans font-bold text-brand-ink',
        'text-[10px] font-mono text-emerald-900': 'text-[10px] font-sans font-bold text-emerald-900',
        'text-xs font-mono text-white/70': 'text-xs font-sans font-medium text-white/70',
        'text-xs font-mono text-white/80': 'text-xs font-sans font-medium text-white/80',
        'text-xs font-mono text-brand-ink/60': 'text-xs font-sans font-medium text-brand-ink/60',
        'font-mono text-emerald-300': 'font-sans font-bold tracking-wide text-emerald-300',
        'font-mono text-white bg-white/10': 'font-sans font-medium text-white bg-white/10',
        'font-mono font-bold text-white bg-white/20': 'font-sans font-bold text-white bg-white/20'
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Also fix some specific classes that might have been missed
    content = content.replace('text-[10px] font-mono text-brand-lavender bg-brand-lavender/20', 'text-[10px] font-sans font-bold text-brand-lavender bg-brand-lavender/20')

    with open(file_path, 'w') as f:
        f.write(content)

print("Sticky logic and fonts updated successfully!")
