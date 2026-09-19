with open('frontend/src/index.css', 'r') as f:
    css = f.read()

# We want to replace the whole 3D CARD STACK section to ensure it's clean.
import re

start_marker = "/* ================= 3D CARD STACK & VERTICAL PEEL-OFF SCROLL ================= */"
end_marker = "/* ----------------- END OF ANIMATIONS ----------------- */" # If it doesn't exist, we just replace to the end.

idx_start = css.find(start_marker)
if idx_start != -1:
    css_before = css[:idx_start]
else:
    css_before = css

new_css = css_before + """/* ================= 3D CARD STACK & VERTICAL PEEL-OFF SCROLL ================= */
.card-stack-stage {
  perspective: 1600px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
}

/* Card leaving (scrolling down pushes it up and back into -z) */
.card-peel-up {
  transform: translateY(-80%) translateZ(-500px) rotateX(15deg);
  opacity: 0;
  pointer-events: none;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out;
}

/* Card active */
.card-peel-active {
  transform: translateY(0px) translateZ(0px) rotateX(0deg) scale(1);
  opacity: 1;
  z-index: 30;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out;
}

/* Cards waiting below */
.card-peel-next-1 {
  transform: translateY(40px) translateZ(-100px) scale(0.95);
  opacity: 0.9;
  z-index: 20;
  pointer-events: none;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out;
}

.card-peel-next-2 {
  transform: translateY(80px) translateZ(-200px) scale(0.90);
  opacity: 0.7;
  z-index: 10;
  pointer-events: none;
  transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out;
}
"""

with open('frontend/src/index.css', 'w') as f:
    f.write(new_css)

print("Updated index.css animations successfully!")
