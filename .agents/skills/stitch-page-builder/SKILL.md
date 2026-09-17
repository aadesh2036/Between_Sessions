---
name: stitch-page-builder
description: >-
  Use this skill whenever creating, fetching, modifying, or iterating on screens and pages for Between Sessions using the Google Stitch MCP server.
---

# Stitch MCP Page Builder for Between Sessions

This skill guides the agent in using the Google Stitch MCP toolset to generate, retrieve, inspect, and iterate on application pages for the Between Sessions platform.

## 1. Project Configuration

*   **Project Resource Name:** `projects/3467580472824619901`
*   **Project ID:** `3467580472824619901`
*   **Project Title:** `BS_FINAL`
*   **Share Token / Identifier:** `AQ.Ab8RN6Kqharpue_qBoqS37-tNRpOuH-uC17es4PHZMIV0hs4ig`
*   **Design System Name:** `Organic Strategic Editorial`
*   **Design System Asset ID:** `assets/5b983aea382c4d5fbfdfe4f98f906e7e`
*   **Device Type:** `DESKTOP` (or `MOBILE` for mobile companion views)

> **Important Workflow Rule:**
> *   **Landing Page (`/`):** Do NOT regenerate via Stitch. Directly use the existing export in `LANDING_PAGE_&_DESIGN_SYS/code.html`.
> *   **All other pages (`/app`, `/app/check-in`, `/app/log`, `/app/practice`, `/app/progress`, `/app/insights`, `/practitioner/*`):** Use Stitch MCP with project `3467580472824619901` to generate visual designs and screens, retrieve the generated code, and integrate it into the codebase.

---

## 2. Core Stitch MCP Tool Calls

When calling lazy tools on Stitch, always use `call_mcp_tool` with `ServerName: "stitch"`:

### 1. List Existing Screens
Check the current screens already in the project before generating new ones:
```json
{
  "ServerName": "stitch",
  "ToolName": "list_screens",
  "Arguments": {
    "projectId": "3467580472824619901"
  }
}
```

### 2. Generate a New Screen from Text
When the user asks for a new page (e.g., Daily Check-in, Personal Dashboard, ERP Practice Companion, or Practitioner Patient View):
```json
{
  "ServerName": "stitch",
  "ToolName": "generate_screen_from_text",
  "Arguments": {
    "projectId": "3467580472824619901",
    "prompt": "Detailed description of the page following the PRD requirements and Organic Strategic Editorial design system...",
    "deviceType": "DESKTOP"
  }
}
```

**Prompt Engineering Guidelines for Between Sessions Screens:**
- Explicitly instruct the model to adopt the **Organic Strategic Editorial** design system:
  - Font: `Newsreader` for major headers and section titles, `Plus Jakarta Sans` for body copy and forms.
  - Colors: `#176B67` (brand teal primary), `#17323A` (brand ink), `#F7F8F7` (canvas), `#FFFFFF` (cards), `#D8DFDE` (subtle hairline borders), with soft pastel accents (`#FFF0EC` coral-soft, `#F0EDFB` lavender-soft, `#FFF6E8` amber-soft).
  - Component styling: 1px hairline borders (`border-subtle`), 4px corner radius (`rounded`), soft ambient micro-elevation, no heavy dark drop shadows.
  - Adhere to the **Anti-Gamification** principle: no dopamine loops, streaks, badges, or celebratory confetti.
  - Adhere to the **Secondary AI Posture**: AI insights must be quiet annotations clearly marked "Synthesized from your logs — not medical advice".

### 3. Retrieve Screen Details and Generated Code
To get the HTML/CSS of a screen by its screen ID or resource name:
```json
{
  "ServerName": "stitch",
  "ToolName": "get_screen",
  "Arguments": {
    "name": "projects/3467580472824619901/screens/<SCREEN_ID>"
  }
}
```
The returned screen object contains the `htmlCode.downloadUrl` or code contents. You can download or inspect it to adapt it into React components or HTML templates.

### 4. Edit or Refine an Existing Screen
To update an existing screen based on user feedback:
```json
{
  "ServerName": "stitch",
  "ToolName": "edit_screens",
  "Arguments": {
    "projectId": "3467580472824619901",
    "screenIds": ["<SCREEN_ID>"],
    "prompt": "Specific refinement instructions..."
  }
}
```

### 5. Ensure Design System Consistency
If a generated screen deviates from the project design system, apply the design system explicitly:
```json
{
  "ServerName": "stitch",
  "ToolName": "apply_design_system",
  "Arguments": {
    "projectId": "3467580472824619901",
    "screenIds": ["<SCREEN_ID>"],
    "designSystemId": "5b983aea382c4d5fbfdfe4f98f906e7e"
  }
}
```

---

## 3. Screen Integration Workflow

1. **Step 1:** Formulate the prompt based on [PRD_FRONTEND_RECREATED.md](file:///run/media/aadesh/New%20Volume%20D/Between_Sessions/PRD_FRONTEND_RECREATED.md).
2. **Step 2:** Generate the screen using `generate_screen_from_text` on project `3467580472824619901`.
3. **Step 3:** Retrieve the code using `get_screen` or inspect the download URL.
4. **Step 4:** Adapt the layout and markup into clean, accessible React/HTML code matching the `design-system/tokens.css` and `design-system/tailwind.config.js`.
5. **Step 5:** Verify clinical safety rules (no dynamic diagnosis, consent checks, persistent Tele-MANAS/safety links).
