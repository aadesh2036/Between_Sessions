import re

file_path = 'frontend/src/components/StackedFeatureCards.jsx'
with open(file_path, 'r') as f:
    jsx = f.read()

# 1. Update refs
jsx = jsx.replace('const stickyRef = useRef(null);', 
                  'const stickyContainerRef = useRef(null);\n  const stageWrapperRef = useRef(null);\n  const stageRef = useRef(null);')

# 2. Replace hooks block
old_hooks_pattern = re.compile(r'// 1\. Dynamically calculate sticky top.*?}, \[activeCard\]\);', re.DOTALL)

new_hooks = """// 1. Scale stage to fit viewport automatically
  useEffect(() => {
    const updateScale = () => {
      if (!stageWrapperRef.current || !stageRef.current) return;
      const availableHeight = stageWrapperRef.current.offsetHeight;
      const targetHeight = 760;
      
      if (availableHeight < targetHeight) {
        const scale = availableHeight / targetHeight;
        stageRef.current.style.transform = `scale(${scale})`;
      } else {
        stageRef.current.style.transform = `scale(1)`;
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // 2. Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !stickyContainerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const stickyRect = stickyContainerRef.current.getBoundingClientRect();
      
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
  }, [activeCard]);"""

jsx = old_hooks_pattern.sub(new_hooks, jsx)

# 3. Update sticky container class and add wrapper
# Finding the sticky div
sticky_div_pattern = re.compile(r'<div\s+ref=\{stickyRef\}\s+className="sticky[^"]*">')
new_sticky_div = '<div ref={stickyContainerRef} className="sticky top-[90px] w-full h-[calc(100vh-100px)] flex flex-col items-center overflow-hidden pb-4 z-10">'
jsx = sticky_div_pattern.sub(new_sticky_div, jsx)

# 4. Wrap the stage
# The stage currently starts with:
# <div className="card-stack-stage relative w-full h-[700px] lg:h-[760px]">
stage_pattern = re.compile(r'<div className="card-stack-stage relative w-full h-\[700px\] lg:h-\[760px\]">')
new_stage = """<div ref={stageWrapperRef} className="w-full max-w-6xl flex-1 flex justify-center items-start origin-top w-full">
          <div ref={stageRef} className="card-stack-stage relative w-full h-[760px]" style={{ transformOrigin: 'top center' }}>"""
jsx = stage_pattern.sub(new_stage, jsx)

# Now we need to add the closing div for stageWrapperRef.
# The stage closes just before `</section>`.
# Wait, the structure is:
# <section>
#   <div ref=stickyContainerRef>
#      <header.../>
#      <div ref=stageWrapperRef>
#          <div ref=stageRef>
#              ...cards...
#          </div>
#      </div>
#   </div>
# </section>
# If we replaced `<div className="card-stack-stage...">` with TWO opening divs, we must add one extra closing div.
# Let's find the end of the section.
jsx = jsx.replace('      </div>\n    </section>', '      </div>\n        </div>\n      </div>\n    </section>')
# Wait, let's be more precise.
# The original end was:
#         </article>
#       </div>
#     </div> // <- wait, the sticky container closing div?
#   </section>
# Let's just do a regex replace for the end of the section block.
end_pattern = re.compile(r'(\s*</div>\s*</div>\s*</section>)')
# Actually, the original had:
# 1. <div ref={stickyRef}>
# 2.    <header>
# 3.    <div className="card-stack-stage...">
# 4.       ...
# 5.    </div>
# 6. </div>
# So it ended with two closing divs before </section>.
# Now it should end with THREE closing divs.
jsx = jsx.replace('        </article>\n      </div>\n    </div>\n  </section>', 
                  '        </article>\n      </div>\n        </div>\n    </div>\n  </section>')

with open(file_path, 'w') as f:
    f.write(jsx)

print("Scale fix applied to JSX!")
