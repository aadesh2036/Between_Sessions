---
name: generative-ui
description: >-
  How to render rich interactive HTML widgets inline in the chat or as standalone artifacts. Use this skill when you want to show diagrams, interactive controls, educational walkthroughs, or preview UI components for Between Sessions.
---

# Generative UI for Between Sessions

You can render custom, rich, interactive user interfaces (inline widgets or larger artifacts) directly in the chat or artifact directory. This is an ideal way to preview new pages, components, interactive ERP trackers, and data visualizations.

## Workflow

1.  **Create the HTML Artifact**: Use `write_to_file` to save a self-contained `.html` file (using Tailwind CSS and inline JavaScript) to the artifact directory. Set `UserFacing: true` in `ArtifactMetadata`.
2.  **Embed Inline (optional)**: Include the `<agent-embed>` tag in your chat response when an inline preview is desired:

    ```html
    <agent-embed src="file:///<artifact_path>/widget.html"></agent-embed>
    ```

## Constraints & Theming

*   **Tailwind CDN**: Use the allowlisted script tag in `<head>`:
    ```html
    <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
    ```

*   **Fonts & Between Sessions Palette**: Include the Google Fonts for Newsreader and Plus Jakarta Sans:
    ```html
    <link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    ```

*   **HTML Boilerplate Template for Between Sessions**:
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-editorial { font-family: 'Newsreader', serif; }
      </style>
    </head>
    <body class="bg-[#F7F8F7] text-[#17323A] antialiased p-6">
      <div class="max-w-2xl mx-auto bg-white border border-[#D8DFDE] rounded-md p-6 shadow-[0_12px_36px_-4px_rgba(23,50,58,0.07)]">
        <h2 class="font-editorial text-2xl font-medium text-[#17323A]">Between Sessions Component</h2>
        <p class="text-sm text-[#5B6570] mt-1">Interactive preview rendered with Organic Strategic Editorial tokens.</p>
        <!-- Interactive content -->
      </div>
    </body>
    </html>
    ```
