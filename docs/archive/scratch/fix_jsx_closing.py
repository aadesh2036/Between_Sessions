file_path = 'frontend/src/components/StackedFeatureCards.jsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

# Find the last </article>
last_article_idx = -1
for i in range(len(lines) - 1, -1, -1):
    if '</article>' in lines[i]:
        last_article_idx = i
        break

if last_article_idx != -1:
    # Rewrite everything after the last </article>
    new_end = [
        "        </div>\n", # closes card-stack-stage
        "      </div>\n",   # closes stageWrapperRef
        "    </div>\n",     # closes stickyContainerRef
        "  </section>\n",   # closes section
        ");\n",
        "}\n"
    ]
    lines = lines[:last_article_idx + 1] + ["\n"] + new_end
    
    with open(file_path, 'w') as f:
        f.writelines(lines)
    print("Fixed closing tags!")
else:
    print("Could not find </article>")
