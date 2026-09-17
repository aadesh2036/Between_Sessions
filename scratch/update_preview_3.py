import re

preview_path = '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'

with open(preview_path, 'r') as f:
    html = f.read()

html = html.replace('min-h-[400vh]', 'min-h-[500vh]')

old_scroll_logic = """  // Scroll listener for 3D card peel-off
  window.addEventListener('scroll', function() {
    const sec = document.getElementById('architecture');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const dist = rect.height - windowHeight;
    if (dist <= 0) return;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / dist));
    if (progress < 0.33) {
      if (currentCardIndex !== 0) setCard(0);
    } else if (progress < 0.67) {
      if (currentCardIndex !== 1) setCard(1);
    } else {
      if (currentCardIndex !== 2) setCard(2);
    }
  }, { passive: true });"""

new_scroll_logic = """  // Scroll listener for 3D card peel-off
  window.addEventListener('scroll', function() {
    const sec = document.getElementById('architecture');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const stickyOffset = 64;
    const scrollStart = rect.top - stickyOffset;
    const scrolled = scrollStart > 0 ? 0 : -scrollStart;
    
    const dist = rect.height - windowHeight;
    if (dist <= 0) return;
    
    const progress = Math.max(0, Math.min(1, scrolled / dist));
    
    if (progress < 0.25) {
      if (currentCardIndex !== 0) setCard(0);
    } else if (progress < 0.65) {
      if (currentCardIndex !== 1) setCard(1);
    } else {
      if (currentCardIndex !== 2) setCard(2);
    }
  }, { passive: true });"""

if old_scroll_logic in html:
    html = html.replace(old_scroll_logic, new_scroll_logic)
else:
    print("Could not find old HTML scroll logic.")

css_pattern = re.compile(r'\.card-stack-stage \{.*?\}(?=\s*</style>)', re.DOTALL)

new_css = """.card-stack-stage {
  perspective: 1600px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
}

.card-peel-up {
  transform: translateY(-80%) translateZ(-500px) rotateX(15deg) !important;
  opacity: 0;
  pointer-events: none;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out !important;
}

.card-peel-active {
  transform: translateY(0px) translateZ(0px) rotateX(0deg) scale(1) !important;
  opacity: 1;
  z-index: 30;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out !important;
}

.card-peel-next-1 {
  transform: translateY(40px) translateZ(-100px) scale(0.95) !important;
  opacity: 0.9;
  z-index: 20;
  pointer-events: none;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out !important;
}

.card-peel-next-2 {
  transform: translateY(80px) translateZ(-200px) scale(0.90) !important;
  opacity: 0.7;
  z-index: 10;
  pointer-events: none;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out !important;
}
"""

old_css_match = css_pattern.search(html)
if old_css_match:
    html = html[:old_css_match.start()] + new_css + html[old_css_match.end():]
else:
    print("Could not find CSS match")

with open(preview_path, 'w') as f:
    f.write(html)
    
print("Updated preview HTML successfully!")
