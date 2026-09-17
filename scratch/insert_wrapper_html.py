file_path = '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'
with open(file_path, 'r') as f:
    html = f.read()

import re
stage_pattern = re.compile(r'<div\s+class="card-stack-stage[^>]*>')
match = stage_pattern.search(html)

if match:
    new_stage = """<div id="stage-wrapper" class="w-full max-w-6xl flex-1 flex justify-center items-start origin-top w-full">
          <div id="card-stage" class="card-stack-stage relative w-full h-[760px]" style="transform-origin: top center;">"""
    html = html[:match.start()] + new_stage + html[match.end():]
    
    with open(file_path, 'w') as f:
        f.write(html)
    print("Successfully inserted wrapper in HTML!")
else:
    print("Could not find card-stack-stage div!")
