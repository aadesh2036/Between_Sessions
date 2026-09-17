with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    jsx = f.read()

# 1. Add stickyRef to the component
if 'const stickyRef = useRef(null);' not in jsx:
    jsx = jsx.replace('const containerRef = useRef(null);', 'const containerRef = useRef(null);\n  const stickyRef = useRef(null);')

# 2. Update the sticky container div
old_sticky = 'className="sticky top-0 h-screen w-full flex flex-col justify-center items-center py-6"'
new_sticky = 'ref={stickyRef} className="sticky bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"'
jsx = jsx.replace(old_sticky, new_sticky)

# 3. Fix the stage height so content isn't clipped
old_stage = 'className="card-stack-stage relative w-full max-w-6xl h-[65vh] min-h-[480px] max-h-[640px] w-full"'
new_stage = 'className="card-stack-stage relative w-full max-w-6xl h-[700px] lg:h-[760px]"'
jsx = jsx.replace(old_stage, new_stage)

# 4. Replace handleScroll logic
import re
scroll_pattern = re.compile(r'const handleScroll = \(\) => \{.*?\};', re.DOTALL)

new_scroll_logic = """const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const stickyRect = stickyRef.current.getBoundingClientRect();
      
      // The child is sticky at the bottom. It scrolls normally until its bottom hits the viewport's bottom.
      // Once it pins, rect.top continues to scroll up (negative) while stickyRect.top stays fixed.
      // The difference is exactly our scrolled distance!
      const scrolled = Math.max(0, stickyRect.top - rect.top);
      
      const scrollableDist = rect.height - stickyRect.height;
      if (scrollableDist <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

      // Small deadzone so it rests for a moment after pinning before peeling
      if (progress < 0.10) {
        if (activeCard !== 0) setActiveCard(0);
      } else if (progress < 0.55) {
        if (activeCard !== 1) setActiveCard(1);
      } else {
        if (activeCard !== 2) setActiveCard(2);
      }
    };"""

jsx = scroll_pattern.sub(new_scroll_logic, jsx)

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx)

print("Updated JSX successfully!")
