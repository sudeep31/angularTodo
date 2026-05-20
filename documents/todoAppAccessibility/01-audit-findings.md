# Web Accessibility Audit — Angular Todo App

**Date:** May 2026  
**Standard:** WCAG 2.1 AA  
**Scope:** `src/app/app.html`, `src/app/features/todo-list/`, `src/app/components/todo-item/`

---

## Summary

| Severity                  | Count | Fixed  |
| ------------------------- | ----- | ------ |
| Critical (WCAG A failure) | 4     | ✅ All |
| Serious (WCAG AA failure) | 4     | ✅ All |
| Moderate (Best practice)  | 4     | ✅ All |

---

## Issue 1 — Duplicate `main` landmark _(Critical — WCAG 1.3.6)_

**File:** `src/app/features/todo-list/todo-list.component.ts`

**Problem:**  
The `TodoListComponent` host declared `role: 'main'`. The outer shell `app.html` already wraps everything in `<main>`. This created **two `main` landmarks** on the page. WCAG and the HTML spec allow exactly one `<main>` landmark per document. Screen readers that list landmarks (NVDA `INSERT+F7`, JAWS `INSERT+F3`) would show two "Main" regions, confusing users about the structure.

**Evidence:**

```typescript
// host: { role: 'main' }  ← BEFORE
```

**Fix:** Changed `role: 'main'` → `role: 'region'`. The component now creates a labelled region landmark instead, which is semantically correct for a sub-section of main content.

---

## Issue 2 — No skip link _(Critical — WCAG 2.4.1)_

**File:** `src/app/app.html`

**Problem:**  
There was no "Skip to main content" link at the top of the page. Keyboard-only users must Tab through the entire navigation bar on every page load before reaching the todo content. WCAG 2.4.1 (Bypass Blocks, Level A) requires a mechanism to skip repeated blocks of navigation.

**Fix:** Added a visually hidden skip link as the very first focusable element:

```html
<a href="#main-content" class="sr-only focus:not-sr-only ..."> Skip to main content </a>
```

The `<main>` element received `id="main-content"` and `tabindex="-1"` so the focus lands correctly.

---

## Issue 3 — Navigation has no accessible name _(Critical — WCAG 1.3.1)_

**File:** `src/app/app.html`

**Problem:**  
`<nav>` elements must have accessible names when there is more than one on a page (or to distinguish it from any nav in the router outlet). Without `aria-label`, screen readers announce "navigation" with no context about _which_ navigation. NVDA users pressing `D` to browse landmarks could not tell the header nav from any other region.

**Fix:** Added `aria-label="Primary"` to the `<nav>` element.

---

## Issue 4 — Colour contrast failure in MFE stats header _(Critical — WCAG 1.4.3)_

**File:** `src/app/features/todo-list/todo-list.component.html` (line 5)

**Problem:**  
The MFE Session Stats panel header used `background:#f59e0b` (amber-400) with `color:#fff` (white). Contrast ratio measured at **2.1:1** — far below the WCAG AA minimum of **4.5:1** for normal-weight text below 18px.

**Fix:** Changed `color:#fff` → `color:#1c1917` (stone-900), achieving a contrast ratio of **8.6:1** ✅.

---

## Issue 5 — Form inputs missing `aria-required` and `aria-invalid` _(Serious — WCAG 3.3.1 / 3.3.2)_

**File:** `src/app/features/todo-list/todo-list.component.html`

**Problem:**  
The Title and Description inputs are visually marked as required (validated on submit) but had no `aria-required="true"` attribute. Screen readers rely on this attribute to announce "required" when the field receives focus. Additionally, when the field contained an error, `aria-invalid` was not set — so AT users would not know the field was in an error state when navigating by form controls (`F` in NVDA/JAWS).

**Fix:** Added both attributes to both inputs:

```html
aria-required="true" [attr.aria-invalid]="formErrors().title ? 'true' : null"
```

---

## Issue 6 — Form section has no accessible name _(Serious — WCAG 1.3.1)_

**File:** `src/app/features/todo-list/todo-list.component.html`

**Problem:**  
The "Add New Task" section (`<section>`) had a visible `<h3>` heading but no programmatic association to the section element. Without `aria-labelledby`, the section has no accessible name and screen reader users navigating by regions cannot identify it.

**Fix:**  
Added `id="add-task-heading"` to the `<h3>` and `aria-labelledby="add-task-heading"` to the `<section>`.

---

## Issue 7 — Dynamic list changes not announced _(Serious — WCAG 4.1.3)_

**File:** `src/app/features/todo-list/todo-list.component.ts`

**Problem:**  
When a todo was added, deleted, toggled, or when the filter changed, the DOM updated silently. Screen reader users who were focused elsewhere on the page would receive no feedback. WCAG 4.1.3 (Status Messages, Level AA) requires that status messages be announced without requiring focus to move.

**Fix:** Injected `LiveAnnouncer` from `@angular/cdk/a11y` and added polite/assertive announcements:

| Action          | Announcement                       |
| --------------- | ---------------------------------- |
| Add task        | `"Task "Buy milk" added"`          |
| Toggle complete | `""Buy milk" marked as complete"`  |
| Delete task     | `""Buy milk" deleted"` (assertive) |
| Filter changed  | `"Showing 3 active tasks"`         |
| Clear completed | `"2 completed tasks cleared"`      |
| Toggle all      | `"All tasks marked as complete"`   |

---

## Issue 8 — Loading, error, and empty states were silent _(Serious — WCAG 4.1.3)_

**File:** `src/app/features/todo-list/todo-list.component.html`

**Problem:**

- `Loading tasks...` — plain `<div>`, no `aria-live`; screen readers would not announce the loading state
- `{{ apiError() }}` — plain `<div>`, no `role="alert"`; critical errors went unannounced
- `No tasks to show.` — plain `<div>`, no `aria-live`; empty-state changes were silent

**Fix:**

- Loading and empty states → `<output>` element (implicit `role="status"`, `aria-live="polite"`)
- API error → `<div role="alert">` (assertive, interrupts the user for critical failures)

---

## Issue 9 — Generic button labels _(Moderate — WCAG 2.4.6)_

**File:** `src/app/components/todo-item/todo-item.component.html`

**Problem:**  
Edit and delete buttons had `aria-label="Edit todo"` and `aria-label="Delete todo"`. When a screen reader lists all buttons on the page (NVDA `B`, JAWS `INSERT+F7`) a user sees a long list of identically named "Edit todo" and "Delete todo" buttons, with no way to tell which todo each refers to.

**Fix:**

```html
[attr.aria-label]="'Edit: ' + todo().title" [attr.aria-label]="'Delete: ' + todo().title"
```

Buttons now announce `"Edit: Buy milk, button"` etc.

---

## Issue 10 — Emoji characters in buttons not hidden from AT _(Moderate — WCAG 4.1.2)_

**File:** `src/app/components/todo-item/todo-item.component.html`

**Problem:**  
The emoji `✏️` and `🗑️` inside the action buttons were not hidden from assistive technology. When a button has an `aria-label`, the emoji's alt text is suppressed in most browsers — but screen reader behaviour varies. Some readers announce both the `aria-label` and the emoji description (e.g. JAWS may say "pencil emoji, Edit: Buy milk, button"), creating a confusing double announcement.

**Fix:** Wrapped emojis in `<span aria-hidden="true">` to ensure they are always hidden from AT:

```html
<span aria-hidden="true">&#x270F;&#xFE0F;</span>
```

---

## Issue 11 — Stats counter has no `aria-live` _(Moderate — WCAG 4.1.3)_

**File:** `src/app/features/todo-list/todo-list.component.html`

**Problem:**  
The todo stats bar (`3 total · 2 active · 1 done`) updates whenever todos change but had no `aria-live` attribute. AT users would never hear the updated count unless they moved focus to it manually.

**Fix:** Added `aria-live="polite"` and `aria-atomic="true"` to the stats `<div>`. The `aria-atomic="true"` ensures the whole stats line is re-read as a single announcement rather than individual word changes.

---

## Issue 12 — Priority badge accessible name relies on colour _(Moderate — WCAG 1.4.1)_

**File:** `src/app/components/todo-item/todo-item.component.html`

**Problem:**  
Priority was conveyed by text ("High priority") and by colour (red/yellow/green badge). The text is sufficient alone, but the badge element had no `aria-label`, which was a missed opportunity to explicitly expose the semantic meaning to AT users and ensure it is consistently announced.

**Fix:** Added `[attr.aria-label]="todo().priority + ' priority'"` to the badge `<span>`.
