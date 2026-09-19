import re

preview_path = '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'

with open(preview_path, 'r') as f:
    html = f.read()

# 1. Update the sticky container div
old_sticky = 'class="sticky top-0 h-screen w-full flex flex-col justify-center items-center py-6"'
new_sticky = 'id="sticky-container" class="sticky bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"'
html = html.replace(old_sticky, new_sticky)

# 2. Fix the stage height
old_stage = 'class="card-stack-stage relative w-full max-w-6xl h-[65vh] min-h-[480px] max-h-[640px] w-full"'
new_stage = 'class="card-stack-stage relative w-full max-w-6xl h-[700px] lg:h-[760px]"'
html = html.replace(old_stage, new_stage)

# 3. Replace handleScroll logic
scroll_pattern = re.compile(r'window\.addEventListener\(\'scroll\', function\(\) \{.*?\},\s*\{\s*passive:\s*true\s*\}\);', re.DOTALL)

new_scroll_logic = """window.addEventListener('scroll', function() {
    const sec = document.getElementById('architecture');
    const stickyContainer = document.getElementById('sticky-container');
    if (!sec || !stickyContainer) return;
    
    const rect = sec.getBoundingClientRect();
    const stickyRect = stickyContainer.getBoundingClientRect();
    
    const scrolled = Math.max(0, stickyRect.top - rect.top);
    const scrollableDist = rect.height - stickyRect.height;
    
    if (scrollableDist <= 0) return;
    
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));
    
    if (progress < 0.10) {
      if (currentCardIndex !== 0) setCard(0);
    } else if (progress < 0.55) {
      if (currentCardIndex !== 1) setCard(1);
    } else {
      if (currentCardIndex !== 2) setCard(2);
    }
  }, { passive: true });"""

html = scroll_pattern.sub(new_scroll_logic, html)

with open(preview_path, 'w') as f:
    f.write(html)

print("Updated preview successfully!")
