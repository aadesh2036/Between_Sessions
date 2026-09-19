with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    lines = f.readlines()

new_lines = lines[:13] # everything up to line 13

hooks_code = """
  // 1. Dynamically calculate sticky top so the card pins exactly when its bottom is visible
  useEffect(() => {
    const updateStickyTop = () => {
      if (!stickyRef.current) return;
      const windowHeight = window.innerHeight;
      const elHeight = stickyRef.current.offsetHeight;
      
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
  }, []);

  // 2. Scroll listener to peel off cards one by one on scroll
  useEffect(() => {
    const handleScroll = () => {
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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCard]);
"""

new_lines.append(hooks_code)
new_lines.extend(lines[64:]) # everything after `}, [activeCard]);`

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.writelines(new_lines)
