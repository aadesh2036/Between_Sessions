import re

file_path = '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'
with open(file_path, 'r') as f:
    html = f.read()

# 1. Update sticky container class
sticky_div_pattern = re.compile(r'<div id="sticky-container" class="sticky[^"]*">')
new_sticky_div = '<div id="sticky-container" class="sticky top-[90px] w-full h-[calc(100vh-100px)] flex flex-col items-center overflow-hidden pb-4 z-10">'
html = sticky_div_pattern.sub(new_sticky_div, html)

# 2. Add stage wrapper and stage id
stage_pattern = re.compile(r'<div class="card-stack-stage relative w-full h-\[700px\] lg:h-\[760px\]">')
new_stage = """<div id="stage-wrapper" class="w-full max-w-6xl flex-1 flex justify-center items-start origin-top w-full">
        <div id="card-stage" class="card-stack-stage relative w-full h-[760px]" style="transform-origin: top center;">"""
html = stage_pattern.sub(new_stage, html)

# 3. Add extra closing div at the end
html = html.replace('        </article>\n      </div>\n    </div>\n  </section>', 
                    '        </article>\n      </div>\n        </div>\n    </div>\n  </section>')

# 4. Update JS logic
script_pattern = re.compile(r'function updateStickyTop\(\).*?\{ passive: true \}\);', re.DOTALL)
new_script = """function updateScale() {
    const stageWrapper = document.getElementById('stage-wrapper');
    const stage = document.getElementById('card-stage');
    if (!stageWrapper || !stage) return;
    
    const availableHeight = stageWrapper.offsetHeight;
    const targetHeight = 760;
    
    if (availableHeight < targetHeight) {
      const scale = availableHeight / targetHeight;
      stage.style.transform = `scale(${scale})`;
    } else {
      stage.style.transform = `scale(1)`;
    }
  }
  window.addEventListener('resize', updateScale);
  window.addEventListener('DOMContentLoaded', updateScale);
  updateScale();

  window.addEventListener('scroll', function() {
    const sec = document.getElementById('architecture');
    const stickyContainer = document.getElementById('sticky-container');
    if (!sec || !stickyContainer) return;
    
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

html = script_pattern.sub(new_script, html)

with open(file_path, 'w') as f:
    f.write(html)

print("Scale fix applied to HTML!")
