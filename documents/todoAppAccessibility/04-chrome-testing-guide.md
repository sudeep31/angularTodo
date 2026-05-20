# Accessibility Testing Guide — Free Chrome Tools

All tools listed below are **100% free**. No account required unless noted.

---

## Tool Overview

| Tool                                  | Type                        | Cost | Best for                             |
| ------------------------------------- | --------------------------- | ---- | ------------------------------------ |
| Chrome DevTools — Accessibility panel | Built-in                    | Free | Inspect ARIA tree, roles, properties |
| Lighthouse                            | Built-in                    | Free | Automated audit, WCAG score          |
| axe DevTools (free tier)              | Chrome extension            | Free | Detailed rule-by-rule WCAG check     |
| WAVE                                  | Chrome extension            | Free | Visual overlay of errors             |
| NVDA                                  | Screen reader (Windows app) | Free | Real screen reader testing           |
| Keyboard-only testing                 | Browser                     | Free | Tab order, focus visibility          |

---

## 1. Chrome DevTools — Accessibility Panel

**What it does:** Shows the Accessibility Tree (what screen readers see), ARIA roles, names, states, and properties for every element.

### How to use:

1. Open Chrome and go to **http://localhost:4200**
2. Press `F12` to open DevTools
3. Click the **Elements** tab
4. In the right-hand panel, click the **Accessibility** tab (may be hidden — click `»` to find it)
5. Click any element in the DOM to inspect:
   - **Role** — what role the element has (button, region, list, etc.)
   - **Name** — the accessible name screen readers announce
   - **Properties** — aria-required, aria-invalid, aria-live, etc.

### What to verify for this app:

| Element                    | Expected Role | Expected Name                                    |
| -------------------------- | ------------- | ------------------------------------------------ |
| `<main>`                   | `main`        | —                                                |
| `<nav>`                    | `navigation`  | "Primary"                                        |
| `<footer>`                 | `contentinfo` | "Site information"                               |
| `<section>` (Add New Task) | `region`      | "Add New Task"                                   |
| `<app-todo-list>` host     | `region`      | "Todo list with X items…"                        |
| `<ul id="todo-list">`      | `list`        | "All tasks" / "Active tasks" / "Completed tasks" |
| Title `<input>`            | `textbox`     | "Title" (required)                               |
| Edit button                | `button`      | "Edit: Buy milk"                                 |
| Delete button              | `button`      | "Delete: Buy milk"                               |
| Filter tabs                | `tab`         | "All (3)", aria-selected: true/false             |

---

## 2. Lighthouse (Built-in Chrome)

**What it does:** Runs an automated accessibility audit and gives a score (0–100) with itemised failures.

### How to use:

1. Open **http://localhost:4200** in Chrome
2. Press `F12` → click the **Lighthouse** tab
3. Tick only the **Accessibility** checkbox
4. Select **Mobile** or **Desktop**
5. Click **Analyse page load**
6. Wait ~30 seconds for the report

### Target score: **90+**

### What Lighthouse checks automatically:

- Colour contrast (WCAG 1.4.3)
- All form inputs have labels
- All images have `alt` text
- ARIA roles are valid
- Navigation landmarks are present
- Interactive elements are accessible by keyboard
- Skip link is present and functional

### How to read the report:

- **Green (90–100):** Passes
- **Orange (50–89):** Moderate issues
- **Red (0–49):** Critical failures

Each failing rule links to a detailed explanation with the affected element highlighted.

---

## 3. axe DevTools (Free Tier Chrome Extension)

**What it does:** Runs the open-source `axe-core` engine against the page and lists every WCAG violation with exact element references, WCAG criterion, and fix guidance.

### Install:

1. Go to the Chrome Web Store: https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd
2. Click **Add to Chrome** → **Add extension**

### How to use:

1. Open **http://localhost:4200**
2. Press `F12` → find the **axe DevTools** tab (added to DevTools)
3. Click **Scan ALL of my page**
4. Review results:
   - **Critical** — must fix (WCAG A/AA failures)
   - **Serious** — should fix
   - **Moderate** / **Minor** — best practice

### How to filter by rule:

- Use the **Impact** filter on the left to show only Critical/Serious
- Each result shows the exact element, the WCAG criterion, and a "More info" link

### Expected results after our changes:

- 0 Critical violations
- 0 Serious violations relating to labels, ARIA, or contrast

---

## 4. WAVE — Web Accessibility Evaluation Tool

**What it does:** Overlays the live page with visual icons showing errors (red), alerts (yellow), and structural information (blue). Great for a quick visual pass.

### Install:

1. Chrome Web Store: https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh
2. Click **Add to Chrome**

### How to use:

1. Open **http://localhost:4200**
2. Click the **WAVE** icon in the Chrome toolbar (top right)
3. The page is overlaid with icons:
   - 🔴 Red = Error (missing labels, contrast, etc.)
   - 🟡 Yellow = Alert (possible issue)
   - 🟢 Green = Structural element (headings, landmarks)

### What to check visually:

- Every form input should have a green label icon `L`
- No red "Missing form label" icons
- Heading hierarchy is correct (H1 → H2 → H3, no skips)
- Skip link icon should appear at the top

### Show structural view:

- Click **Structure** in the WAVE sidebar to see the heading and landmark outline

---

## 5. NVDA — Free Screen Reader (Windows Only)

**What it does:** NVDA (NonVisual Desktop Access) is the most widely used free screen reader. Testing with a real screen reader is the gold standard for accessibility.

### Download:

https://www.nvaccess.org/download/ — free, no account required

### Installation:

1. Download the installer
2. Run it — you can choose "Run temporarily" (no install) or install fully
3. After running, NVDA announces itself with a welcome sound

### Basic NVDA + Chrome shortcuts:

| Key                              | Action                                          |
| -------------------------------- | ----------------------------------------------- |
| `NVDA` (usually `INSERT`) + `F7` | Open Elements List (landmarks, links, headings) |
| `Tab`                            | Move to next focusable element                  |
| `Shift+Tab`                      | Move to previous focusable element              |
| `D`                              | Jump to next landmark                           |
| `H`                              | Jump to next heading                            |
| `B`                              | Jump to next button                             |
| `F`                              | Jump to next form field                         |
| `NVDA+Space`                     | Toggle Forms Mode (to interact with inputs)     |
| `Escape`                         | Exit Forms Mode                                 |
| `NVDA+F2` then `Alt+F4`          | Quit NVDA                                       |

### What to test with NVDA:

#### Skip link test:

1. Load **http://localhost:4200**
2. Press `Tab` — the very first focus should be on the "Skip to main content" link
3. Press `Enter` — focus jumps to `<main id="main-content">`

#### Landmark navigation test:

1. Press `NVDA+F7` → click **Landmarks**
2. You should see: Banner, Navigation (Primary), Main, Region (Todo list…), Region (Add New Task), Contentinfo (Site information)

#### Form test:

1. Press `F` to jump to the Title input
2. NVDA should say: "Title, edit text, required"
3. Type invalid characters → press Tab → NVDA should say "invalid entry, Title"

#### Button label test:

1. Press `B` to cycle through buttons
2. NVDA should say: "Edit: Buy milk, button", "Delete: Buy milk, button" etc.
3. NOT "Edit todo, button" or "Delete todo, button"

#### Dynamic announcement test:

1. Fill in the Title and Description fields
2. Click "Add Task"
3. Without moving focus, NVDA should announce: `Task "Your title" added`
4. Click the toggle checkbox on a todo
5. NVDA should announce: `"Your title" marked as complete`
6. Click delete
7. NVDA should announce: `"Your title" deleted`

---

## 6. Keyboard-Only Testing

Test the full app using **only the keyboard** (no mouse). This is the most important test for WCAG 2.1.1 (Keyboard) compliance.

### How to test:

1. Open **http://localhost:4200** in Chrome
2. Click once anywhere on the page to give it focus, then press `Escape` to clear any tooltips
3. Press `Tab` to move forward through all interactive elements
4. Press `Shift+Tab` to move backward
5. Press `Enter` or `Space` to activate buttons and checkboxes

### Checklist:

| Action                              | Expected behaviour                               |
| ----------------------------------- | ------------------------------------------------ |
| First `Tab` press                   | Skip link appears and is focused                 |
| `Enter` on skip link                | Focus jumps past navigation to main content      |
| `Tab` through nav links             | "Todos" and "Contact" links are reachable        |
| `Tab` to Title input                | Blue focus ring is visible                       |
| Type in Title, `Tab` to Description | Both fields accept text                          |
| `Tab` to Priority select            | Select box is focused and usable with arrow keys |
| `Tab` to Add Task button            | Button is focused                                |
| `Enter` on Add Task                 | New todo appears in list                         |
| `Tab` to filter tabs                | All three filter tabs are reachable              |
| Arrow keys on filter tabs           | NVDA/JAWS moves between tabs                     |
| `Tab` to a todo checkbox            | Checkbox is focused                              |
| `Space` to toggle checkbox          | Todo is marked complete                          |
| `Tab` to Edit button                | Button focused, shows "Edit: [title]" in NVDA    |
| `Tab` to Delete button              | Button focused                                   |
| `Enter` to delete                   | Todo removed, NVDA announces deletion            |
| `Tab` to Clear Done button          | Button is reachable when completed todos exist   |

### Focus indicator check:

All focused elements should have a **visible blue ring** or equivalent. If you cannot see where focus is, there is a WCAG 2.4.7 (Focus Visible) failure.

---

## 7. Colour Contrast Checker

For spot-checking specific colour combinations:

**WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/

Enter foreground and background colours to get the contrast ratio:

- **4.5:1** minimum for normal text (WCAG AA)
- **3:1** minimum for large text (18px+ or 14px+ bold)
- **3:1** minimum for UI components (buttons, inputs, focus rings)

### Colours to check in this app:

| Element               | Background | Text      | Ratio  | Pass?                                           |
| --------------------- | ---------- | --------- | ------ | ----------------------------------------------- |
| MFE header            | `#f59e0b`  | `#1c1917` | 8.6:1  | ✅ AAA                                          |
| Body text             | `#f8fafc`  | `#111827` | ~16:1  | ✅ AAA                                          |
| Placeholder text      | white      | `#9ca3af` | 2.85:1 | ⚠️ AA fails — browsers style this, not in scope |
| Priority High badge   | `#fee2e2`  | `#b91c1c` | ~4.9:1 | ✅ AA                                           |
| Priority Medium badge | `#fef9c3`  | `#a16207` | ~4.6:1 | ✅ AA                                           |
| Priority Low badge    | `#dcfce7`  | `#15803d` | ~5.3:1 | ✅ AA                                           |

---

## Quick Test Checklist

Copy this checklist for each test session:

```
AUTOMATED
[ ] Lighthouse accessibility score ≥ 90
[ ] axe DevTools — 0 Critical, 0 Serious violations
[ ] WAVE — 0 red error icons

KEYBOARD
[ ] Skip link appears on first Tab
[ ] All interactive elements reachable by Tab
[ ] Focus ring visible on all focused elements
[ ] Form submits on Enter key
[ ] Todos can be toggled and deleted by keyboard

SCREEN READER (NVDA + Chrome)
[ ] Landmarks list shows: Banner, Navigation, Main, 2× Region, Contentinfo
[ ] Form fields announced as "required"
[ ] Invalid fields announced as "invalid entry"
[ ] Add task announces "Task X added"
[ ] Toggle announces "X marked as complete/incomplete"
[ ] Delete announces "X deleted"
[ ] Filter change announces "Showing N active tasks"
[ ] Edit button says "Edit: [title]", not "Edit todo"
[ ] Delete button says "Delete: [title]", not "Delete todo"
```
