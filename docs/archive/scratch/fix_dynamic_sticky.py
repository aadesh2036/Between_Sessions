import re

files_to_patch = [
    'frontend/src/components/StackedFeatureCards.jsx',
    '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'
]

# 1. JSX changes
with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    jsx = f.read()

# Replace sticky classes
old_sticky = 'className="sticky bottom-0 w-full pb-4 sm:pb-8 pt-12 flex flex-col justify-end items-center"'
new_sticky = 'ref={stickyRef} className="sticky w-full flex flex-col justify-center items-center py-6"'

# Wait, the current class in JSX might be slightly different. Let's use regex to find it.
sticky_pattern = re.compile(r'ref=\{stickyRef\}\s+className="sticky[^"]*"')
match = sticky_pattern.search(jsx)
if match:
    jsx = jsx[:match.start()] + 'ref={stickyRef} className="sticky w-full flex flex-col justify-center items-center py-6 lg:py-12"' + jsx[match.end():]

# Add useEffect for dynamic top
use_effect_code = """  // Dynamically calculate sticky top so the card pins exactly when its bottom is visible
  useEffect(() => {
    const updateStickyTop = () => {
      if (!stickyRef.current) return;
      const windowHeight = window.innerHeight;
      const elHeight = stickyRef.current.offsetHeight;
      
      // If element is taller than viewport, pin it so the bottom aligns with viewport bottom.
      // If element is shorter, pin it so it centers or pins to top. Let's pin to center if it fits.
      if (elHeight > windowHeight) {
        // Pin when bottom hits bottom of screen
        const offset = windowHeight - elHeight;
        stickyRef.current.style.top = `${offset}px`;
      } else {
        // Center it
        const offset = (windowHeight - elHeight) / 2;
        stickyRef.current.style.top = `${offset}px`;
      }
    };
    
    updateStickyTop();
    window.addEventListener('resize', updateStickyTop);
    return () => window.removeEventListener('resize', updateStickyTop);
  }, []);"""

# Insert useEffect after containerRef
if 'updateStickyTop' not in jsx:
    # find where to insert
    insert_pos = jsx.find('const handleScroll = () => {')
    jsx = jsx[:insert_pos] + use_effect_code + '\n\n  ' + jsx[insert_pos:]

# Update handleScroll logic to account for dynamic top
scroll_logic_pattern = re.compile(r'const handleScroll = \(\) => \{.*?\};', re.DOTALL)
new_scroll_logic = """const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const stickyRect = stickyRef.current.getBoundingClientRect();
      
      const scrolled = Math.max(0, stickyRect.top - rect.top);
      const scrollableDist = rect.height - stickyRect.height;
      
      if (scrollableDist <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

      if (progress < 0.15) {
        if (activeCard !== 0) setActiveCard(0);
      } else if (progress < 0.55) {
        if (activeCard !== 1) setActiveCard(1);
      } else {
        if (activeCard !== 2) setActiveCard(2);
      }
    };"""

jsx = scroll_logic_pattern.sub(new_scroll_logic, jsx)

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx)

# 2. HTML changes
with open(files_to_patch[1], 'r') as f:
    html = f.read()

# Replace sticky classes
html_sticky_pattern = re.compile(r'id="sticky-container"\s+class="sticky[^"]*"')
match = html_sticky_pattern.search(html)
if match:
    html = html[:match.start()] + 'id="sticky-container" class="sticky w-full flex flex-col justify-center items-center py-6 lg:py-12"' + html[match.end():]

# Add script for dynamic top
html_script = """function updateStickyTop() {
    const stickyContainer = document.getElementById('sticky-container');
    if (!stickyContainer) return;
    const windowHeight = window.innerHeight;
    const elHeight = stickyContainer.offsetHeight;
    if (elHeight > windowHeight) {
      const offset = windowHeight - elHeight;
      stickyContainer.style.top = offset + 'px';
    } else {
      const offset = (windowHeight - elHeight) / 2;
      stickyContainer.style.top = offset + 'px';
    }
  }
  window.addEventListener('resize', updateStickyTop);
  window.addEventListener('DOMContentLoaded', updateStickyTop);
  // Also run immediately in case DOM is already parsed
  updateStickyTop();
"""

if 'updateStickyTop' not in html:
    script_pos = html.find('<script>') + len('<script>\n')
    html = html[:script_pos] + html_script + html[script_pos:]

# Update handleScroll logic in HTML
html_scroll_pattern = re.compile(r'window\.addEventListener\(\'scroll\', function\(\) \{.*?\},\s*\{\s*passive:\s*true\s*\}\);', re.DOTALL)

new_html_scroll_logic = """window.addEventListener('scroll', function() {
    const sec = document.getElementById('architecture');
    const stickyContainer = document.getElementById('sticky-container');
    if (!sec || !stickyContainer) return;
    
    // Safety check: ensure sticky top is calculated if it somehow was missed
    if (!stickyContainer.style.top) updateStickyTop();
    
    const rect = sec.getBoundingClientRect();
    const stickyRect = stickyContainer.getBoundingClientRect();
    
    const scrolled = Math.max(0, stickyRect.top - rect.top);
    const scrollableDist = rect.height - stickyRect.height;
    
    if (scrollableDist <= 0) return;
    
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));
    
    if (progress < 0.15) {
      if (currentCardIndex !== 0) setCard(0);
    } else if (progress < 0.55) {
      if (currentCardIndex !== 1) setCard(1);
    } else {
      if (currentCardIndex !== 2) setCard(2);
    }
  }, { passive: true });"""

html = html_scroll_pattern.sub(new_html_scroll_logic, html)

with open(files_to_patch[1], 'w') as f:
    f.write(html)

print("Dynamic sticky behavior applied!")
