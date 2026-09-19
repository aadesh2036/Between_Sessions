file_path = 'frontend/src/components/StackedFeatureCards.jsx'
with open(file_path, 'r') as f:
    jsx = f.read()

import re
# Find the exact card-stack-stage div currently in the file
stage_pattern = re.compile(r'<div\s+className="card-stack-stage[^>]*>')
match = stage_pattern.search(jsx)

if match:
    new_stage = """<div ref={stageWrapperRef} className="w-full max-w-6xl flex-1 flex justify-center items-start origin-top w-full">
          <div ref={stageRef} className="card-stack-stage relative w-full h-[760px]" style={{ transformOrigin: 'top center' }}>"""
    jsx = jsx[:match.start()] + new_stage + jsx[match.end():]
    
    with open(file_path, 'w') as f:
        f.write(jsx)
    print("Successfully inserted wrapper in JSX!")
else:
    print("Could not find card-stack-stage div!")
