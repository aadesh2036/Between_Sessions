with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    jsx = f.read()

# We know the exact malformed string:
malformed = """  useEffect(() => {
      // Dynamically calculate sticky top so the card pins exactly when its bottom is visible
  useEffect(() => {"""

corrected = """  // Dynamically calculate sticky top so the card pins exactly when its bottom is visible
  useEffect(() => {"""

if malformed in jsx:
    jsx = jsx.replace(malformed, corrected)
    print("Fixed malformed hook!")
else:
    print("Malformed hook string not found.")

with open('frontend/src/components/StackedFeatureCards.jsx', 'w') as f:
    f.write(jsx)
