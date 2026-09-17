with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    jsx = f.read()

# Replace min-h-[400vh] with min-h-[500vh]
jsx = jsx.replace('min-h-[400vh]', 'min-h-[500vh]')

# Replace scroll logic
old_scroll_logic = """    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDist = rect.height - windowHeight;
      if (scrollableDist <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

      if (progress < 0.33) {
        if (activeCard !== 0) setActiveCard(0);
      } else if (progress < 0.67) {
        if (activeCard !== 1) setActiveCard(1);
      } else {
        if (activeCard !== 2) setActiveCard(2);
      }
    };"""

new_scroll_logic = """    const handleScroll = () => {
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

if old_scroll_logic in jsx:
    jsx = jsx.replace(old_scroll_logic, new_scroll_logic)
    print("Updated scroll logic!")
else:
    print("Could not find old scroll logic.")

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx)
