import re

with open('frontend/src/components/StackedFeatureCards.jsx', 'r') as f:
    lines = f.readlines()

def check_balance(lines):
    stack = []
    
    # We will just parse simple tags that start the line or are prominent.
    # It's better to use a proper parser or just print the tags.
    pass

# Let's write a simple HTML tag parser to find the mismatch.
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.line_offset = 0

    def handle_starttag(self, tag, attrs):
        if tag in ['div', 'section', 'article']:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in ['div', 'section', 'article']:
            if not self.stack:
                print(f"ERROR: Unmatched closing {tag} at line {self.getpos()[0]}")
                return
            last_tag, pos = self.stack.pop()
            if last_tag != tag:
                print(f"ERROR: Mismatched closing {tag} at line {self.getpos()[0]}, expected {last_tag} opened at {pos[0]}")

parser = MyHTMLParser()
# Convert React specific stuff to valid HTML for the parser if needed, but it should handle basic tags fine
# Just strip JSX expressions that might break the parser
jsx_cleaned = ""
for line in lines:
    jsx_cleaned += line

try:
    parser.feed(jsx_cleaned)
    if parser.stack:
        print("Unclosed tags left in stack:")
        for tag, pos in parser.stack:
            print(f" - {tag} opened at {pos[0]}")
    else:
        print("Perfectly balanced!")
except Exception as e:
    print(f"Parser failed: {e}")

