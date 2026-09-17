import re

# --- 1. Fix StackedFeatureCards.jsx ---
with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    jsx = f.read()

# Fix Sticky Container
jsx = jsx.replace('className="sticky top-16 min-h-[92vh] flex flex-col justify-center items-center"',
                  'className="sticky top-0 h-screen w-full flex flex-col justify-center items-center py-6"')

# Fix Stage Height
jsx = jsx.replace('className="card-stack-stage relative w-full max-w-6xl h-[680px] sm:h-[660px] lg:h-[680px]"',
                  'className="card-stack-stage relative w-full max-w-6xl h-[65vh] min-h-[480px] max-h-[640px] w-full"')

# Reduce inner border radii (from 3xl, 2xl, xl to lg or rounded)
# Outer cards: rounded-[40px] -> rounded-[32px]
jsx = jsx.replace('rounded-[40px]', 'rounded-3xl')

# Inner panels
jsx = jsx.replace('rounded-3xl', 'rounded-lg')
jsx = jsx.replace('rounded-2xl', 'rounded-md')
jsx = jsx.replace('rounded-xl', 'rounded')

# The scroll logic
old_scroll_logic = """    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Sticky top is 64px (top-16)
      const stickyOffset = 64;
      const scrollStart = rect.top - stickyOffset;
      
      // Only start progress calculation AFTER the container has pinned
      const scrolled = scrollStart > 0 ? 0 : -scrollStart;
      const scrollableDist = rect.height - windowHeight;
      if (scrollableDist <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

      // Wider deadzones so cards stay visible longer before peeling
      if (progress < 0.25) {
        if (activeCard !== 0) setActiveCard(0);
      } else if (progress < 0.65) {
        if (activeCard !== 1) setActiveCard(1);
      } else {
        if (activeCard !== 2) setActiveCard(2);
      }
    };"""

new_scroll_logic = """    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Sticky is top-0 and h-screen, so it pins exactly at rect.top <= 0
      const scrolled = rect.top > 0 ? 0 : -rect.top;
      const scrollableDist = rect.height - windowHeight;
      if (scrollableDist <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

      // 0.20 deadzone = 80vh of scrolling before anything moves. Plentiful time to read.
      if (progress < 0.20) {
        if (activeCard !== 0) setActiveCard(0);
      } else if (progress < 0.60) {
        if (activeCard !== 1) setActiveCard(1);
      } else {
        if (activeCard !== 2) setActiveCard(2);
      }
    };"""

if old_scroll_logic in jsx:
    jsx = jsx.replace(old_scroll_logic, new_scroll_logic)
else:
    print("WARNING: Could not find old scroll logic in JSX to replace.")

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx)


# --- 2. Fix landing_page_preview.html ---
preview_path = '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'
with open(preview_path, 'r') as f:
    html = f.read()

html = html.replace('class="sticky top-16 min-h-[92vh] flex flex-col justify-center items-center"',
                    'class="sticky top-0 h-screen w-full flex flex-col justify-center items-center py-6"')

html = html.replace('class="card-stack-stage relative w-full max-w-6xl h-[680px] sm:h-[660px] lg:h-[680px]"',
                    'class="card-stack-stage relative w-full max-w-6xl h-[65vh] min-h-[480px] max-h-[640px] w-full"')

html = html.replace('rounded-[40px]', 'rounded-3xl')
html = html.replace('rounded-3xl', 'rounded-lg')
html = html.replace('rounded-2xl', 'rounded-md')
html = html.replace('rounded-xl', 'rounded')

html_old_scroll = """  // Scroll listener for 3D card peel-off
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

html_new_scroll = """  // Scroll listener for 3D card peel-off
  window.addEventListener('scroll', function() {
    const sec = document.getElementById('architecture');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const scrolled = rect.top > 0 ? 0 : -rect.top;
    const dist = rect.height - windowHeight;
    if (dist <= 0) return;
    
    const progress = Math.max(0, Math.min(1, scrolled / dist));
    
    if (progress < 0.20) {
      if (currentCardIndex !== 0) setCard(0);
    } else if (progress < 0.60) {
      if (currentCardIndex !== 1) setCard(1);
    } else {
      if (currentCardIndex !== 2) setCard(2);
    }
  }, { passive: true });"""

if html_old_scroll in html:
    html = html.replace(html_old_scroll, html_new_scroll)
else:
    print("WARNING: Could not find old scroll logic in HTML to replace.")

with open(preview_path, 'w') as f:
    f.write(html)

print("Fixes applied successfully!")
