import re

# 1. Update JSX
with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    jsx = f.read()

jsx = jsx.replace('className="sticky bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"',
                  'className="sticky top-4 sm:top-8 bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"')

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx)

# 2. Update preview HTML
preview_path = '/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html'
with open(preview_path, 'r') as f:
    html = f.read()

html = html.replace('class="sticky bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"',
                    'class="sticky top-4 sm:top-8 bottom-4 sm:bottom-8 w-full flex flex-col justify-center items-center py-6"')

with open(preview_path, 'w') as f:
    f.write(html)

print("Added top sticky fallback successfully!")
