with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    jsx = f.read()

# The outer articles have: class="absolute inset-0 rounded-lg p-8..."
jsx = jsx.replace('absolute inset-0 rounded-lg p-8', 'absolute inset-0 rounded-3xl p-8')

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx)


with open('/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html', 'r') as f:
    html = f.read()

html = html.replace('absolute inset-0 rounded-lg p-8', 'absolute inset-0 rounded-3xl p-8')

with open('/home/aadesh/.gemini/antigravity-cli/brain/d56db510-f2f5-4dc5-bb6e-60442b61fa5d/landing_page_preview.html', 'w') as f:
    f.write(html)

print("Restored outer card border radii to 3xl!")
