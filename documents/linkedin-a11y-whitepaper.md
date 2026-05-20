# A Little Bit on Web Accessibility (A11y) and WCAG Standards

**By Sudeep Parchure** | Angular Solutions Architect | May 2026


## Executive Summary

Over one billion people worldwide — roughly 15% of the global population — live with some form of disability. Yet the majority of websites and web applications remain inaccessible to them. Web accessibility is not a niche concern. It is a legal requirement in most jurisdictions, a commercial opportunity, and most fundamentally, a matter of human dignity.

This paper is a practitioner's guide. It walks through the complete landscape: why accessibility matters, what the WCAG 2.1 standard requires, how WAI-ARIA bridges the gap between dynamic applications and assistive technologies, what the most common mistakes are and how to avoid them, and how to test effectively — all grounded in real implementation patterns from a production Angular application.

Whether you are an architect designing component systems, a developer implementing ARIA patterns, or a lead who needs to make the case for investing in accessibility, this paper covers it all.

---

## Table of Contents

1. [Why Accessibility Matters](#1-why-accessibility-matters)
2. [Understanding WCAG 2.1 — The Standard](#2-understanding-wcag-21--the-standard)
3. [ARIA — The Bridge Between Rich UIs and Assistive Technologies](#3-aria--the-bridge-between-rich-uis-and-assistive-technologies)
4. [ARIA Roles — What an Element Is](#4-aria-roles--what-an-element-is)
5. [ARIA Properties — Naming, Describing, and Relating](#5-aria-properties--naming-describing-and-relating)
6. [ARIA States — Reflecting Dynamic Conditions](#6-aria-states--reflecting-dynamic-conditions)
7. [Live Regions — Announcing What Changes](#7-live-regions--announcing-what-changes)
8. [Custom Widget Patterns — Following the APG](#8-custom-widget-patterns--following-the-apg)
9. [Screen Readers — Understanding Your Users' Tools](#9-screen-readers--understanding-your-users-tools)
10. [Anti-patterns — The 25 Most Common ARIA Mistakes](#10-anti-patterns--the-25-most-common-aria-mistakes)
11. [Angular CDK A11y Primitives — Production-Ready Tools](#11-angular-cdk-a11y-primitives--production-ready-tools)
12. [Installing and Configuring Accessibility Tools](#12-installing-and-configuring-accessibility-tools)
13. [Testing Accessibility — A Practical Guide](#13-testing-accessibility--a-practical-guide)
14. [A Real-World Audit — Case Study](#14-a-real-world-audit--case-study)
15. [Key Takeaways and Recommendations](#15-key-takeaways-and-recommendations)
16. [References and Further Reading](#16-references-and-further-reading)

---

## 1. Why Accessibility Matters

### 1.1 The Scale of the Problem

According to the World Health Organization, 1.3 billion people experience significant disability. In the United States alone, the CDC reports that 1 in 4 adults — 61 million people — have some form of disability. These are not edge-case users. They are colleagues, customers, and family members.

WebAIM's 2024 analysis of the top 1 million home pages found that **96.3% had automatically detectable WCAG failures**. The average page had 56.8 distinct accessibility errors. This is not ignorance — it is neglect that has been normalised.

### 1.2 Disability Categories

Understanding _who_ we are building for shapes how we design:

| Category        | Scope                                     | Assistive Technology                                      |
| --------------- | ----------------------------------------- | --------------------------------------------------------- |
| **Visual**      | Blindness, low vision, colour blindness   | Screen readers, Braille displays, magnifiers              |
| **Auditory**    | Deafness, hard of hearing                 | Captions, transcripts, visual alerts                      |
| **Motor**       | Limited hand mobility, tremors, paralysis | Keyboard-only, switch access, eye tracking, voice control |
| **Cognitive**   | Dyslexia, ADHD, memory impairments        | Clear language, consistent navigation, error recovery     |
| **Speech**      | Non-verbal, stuttering                    | AAC devices, text-based alternatives                      |
| **Situational** | Broken arm, bright sunlight, slow network | Everyone at some point in their lives                     |

The last row is critical. Situational disability is the most frequently experienced category. A developer typing one-handed with a wrist injury. A parent holding a baby. A construction worker in direct sunlight. Accessibility improvements that help permanent disability users make every interaction better for everyone.

### 1.3 The Legal Landscape

Accessibility is not optional in most jurisdictions:

- **United States:** Section 508 (federal agencies), ADA Title III (case law has established websites as places of public accommodation). DOJ issued a final rule in April 2024 requiring state and local government websites to meet WCAG 2.1 AA.
- **European Union:** European Accessibility Act (EAA), effective 2025, extends requirements to private sector products and services.
- **United Kingdom:** Equality Act 2010, Public Sector Bodies Accessibility Regulations 2018.
- **Canada:** Accessible Canada Act (ACA), AODA in Ontario.
- **Australia:** Disability Discrimination Act 1992.

Between 2018 and 2023, US federal accessibility lawsuits exceeded 4,000 per year, up 300% from the prior decade. The cost of defending and settling these suits consistently exceeds the cost of building accessibly from the start.

### 1.4 The Business Case

Beyond legal compliance, accessibility drives measurable outcomes:

- **Market size:** The disability market controls over $490 billion in annual disposable income in the US alone.
- **SEO overlap:** Semantic HTML, descriptive link text, meaningful headings, and image alt text are identical practices to what search engines reward.
- **Brand equity:** Microsoft's Inclusive Design research shows accessible features are repeatedly cited in positive brand perception studies.
- **Reduced support cost:** Clear error messages and keyboard navigation reduce user errors and support tickets.
- **Technical quality:** Accessible code is inherently more modular, semantic, and testable. Teams that build accessibly write better code.

---

## 2. Understanding WCAG 2.1 — The Standard

### 2.1 What WCAG Is

The **Web Content Accessibility Guidelines (WCAG)** are published by the W3C's Web Accessibility Initiative (WAI). WCAG 2.1, published June 2018, contains 78 success criteria organised under four high-level principles known as **POUR**. It is the de facto global standard referenced by virtually every accessibility law worldwide.

WCAG 2.2 was published in October 2023 and adds nine additional success criteria. WCAG 3.0 is in development. For most organisations, WCAG 2.1 AA remains the target.

### 2.2 The POUR Principles

Every success criterion falls under one of four principles:

#### Perceivable

Content must be presentable in ways all users can perceive. They cannot interact with information they cannot access.

Key requirements:

- Text alternatives for non-text content (images, icons, audio)
- Captions and transcripts for multimedia
- Content can be presented in different ways without losing meaning
- Sufficient colour contrast (4.5:1 for normal text, 3:1 for large text)
- Text can be resized to 200% without loss of content or function
- No content that flashes more than 3 times per second

#### Operable

UI components and navigation must be operable. Users cannot interact with controls they cannot operate.

Key requirements:

- All functionality accessible by keyboard alone
- No keyboard traps (focus cannot become stuck)
- Users can skip repeated blocks of navigation (skip links)
- Pages have descriptive titles
- Users have enough time to read and use content
- No interactions that require specific physical gestures

#### Understandable

Information and UI operation must be understandable. Complexity must not become a barrier.

Key requirements:

- Language of the page is identified
- Pages behave predictably
- Input errors are identified and described in text
- Labels and instructions for inputs
- Error suggestions are provided where possible
- Error prevention for legal/financial/data transactions

#### Robust

Content must be robust enough that it can be interpreted by a wide variety of assistive technologies, now and in the future.

Key requirements:

- Valid HTML (well-formed markup)
- Name, role, and value of all UI components are programmatically determinable
- Status messages are programmatically determinable without focus change

### 2.3 Conformance Levels

| Level   | Description | Requirement                                                          |
| ------- | ----------- | -------------------------------------------------------------------- |
| **A**   | Minimum     | Must satisfy; baseline barrier removal                               |
| **AA**  | Standard    | Industry target, legal requirement in most jurisdictions             |
| **AAA** | Enhanced    | Optional; highest level, some criteria cannot be met for all content |

Level AA is the practical target for commercial products. It includes everything in A plus additional criteria for contrast, text resizing, keyboard navigation, error suggestions, and status messages.

### 2.4 From Criterion to Code — The Semantic HTML Foundation

Before any ARIA attribute is written, the most powerful accessibility tool is the correct HTML element. Native elements carry implicit semantics: built-in roles, keyboard support, and state management that ARIA must replicate manually when not used.

**The "div soup" problem — what a screen reader hears without semantic HTML:**

```
"My Todos Buy groceries Add a task"
```

No context. No structure. No way to know what is a heading, what is a list item, what is a button.

**With semantic HTML — what a screen reader announces:**

```
"My Todos, heading level 1"
"Buy groceries, mark complete, checkbox, unchecked"
"Delete task: Buy groceries, button"
"Add a task, text field"
```

Every piece of information is correctly contextualised. The user knows what everything is without seeing the screen.

**Semantic elements reference:**

| Element                   | When to use                         | What AT announces                   |
| ------------------------- | ----------------------------------- | ----------------------------------- |
| `<main>`                  | Primary content area (one per page) | "Main, landmark"                    |
| `<nav>`                   | Navigation link groups              | "Navigation"                        |
| `<h1>`–`<h6>`             | Headings and sub-headings           | "Heading level N"                   |
| `<button>`                | Interactive actions                 | "Button" + keyboard support         |
| `<a href>`                | Navigation and links                | "Link"                              |
| `<ul>` / `<ol>`           | Lists                               | "List, N items"                     |
| `<input type="checkbox">` | Binary selections                   | "Checkbox, checked/unchecked"       |
| `<label>`                 | Associates text with form control   | Announced when field receives focus |
| `<fieldset>` + `<legend>` | Groups related form controls        | Group name + individual label       |

The cardinal rule: **if a native HTML element provides the semantics you need, use it**. ARIA is a supplement for cases where HTML alone is insufficient, not a replacement.

---

## 3. ARIA — The Bridge Between Rich UIs and Assistive Technologies

### 3.1 What ARIA Is

**WAI-ARIA** (Accessible Rich Internet Applications) is a W3C specification (version 1.2, published June 2023) that defines a set of HTML attributes allowing developers to communicate the semantics of dynamic, JavaScript-driven UIs to assistive technologies.

ARIA gives developers three capabilities:

- **Roles** — what an element _is_ (e.g., `role="dialog"`, `role="tab"`)
- **Properties** — metadata and relationships that rarely change (e.g., `aria-label`, `aria-describedby`)
- **States** — dynamic conditions that change at runtime (e.g., `aria-expanded`, `aria-checked`)

### 3.2 The Accessibility Tree

Every browser maintains two parallel tree structures from the DOM:

1. **The DOM Tree** — used for rendering, layout, and JavaScript
2. **The Accessibility Tree** — used by assistive technologies

The accessibility tree strips visual CSS, ignores decorative elements, and adds semantic meaning derived from HTML tags and ARIA attributes. It is the lens through which screen readers, Braille displays, and voice control software perceive your application.

The pipeline from code to screen reader announcement:

```
HTML + ARIA attributes
        ↓
Browser Engine (Chrome/Firefox/Safari)
        ↓
Accessibility Tree (roles, names, states, values)
        ↓
Platform Accessibility API
  Windows:  UI Automation / IAccessible2
  macOS:    NSAccessibility
  Linux:    AT-SPI2
        ↓
Assistive Technology (NVDA, JAWS, VoiceOver)
        ↓
Screen reader announcement / Braille output
```

### 3.3 Hiding Content from Assistive Technologies

Three distinct techniques serve different use cases:

| Technique                            | Visible to eyes? | Visible to AT? | Use case                         |
| ------------------------------------ | ---------------- | -------------- | -------------------------------- |
| `aria-hidden="true"`                 | ✅ Yes           | ❌ No          | Decorative icons, duplicate text |
| `display:none` / `visibility:hidden` | ❌ No            | ❌ No          | Panels not yet shown             |
| `.sr-only` CSS class                 | ❌ No            | ✅ Yes         | Labels visible only to AT        |

The `.sr-only` (or Tailwind's `sr-only`) class is indispensable: it visually hides text using `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0)` while keeping the element in the accessibility tree.

### 3.4 The Five Golden Rules of ARIA

1. **Don't use ARIA if a native HTML element provides the semantics.** A `<button>` already has `role="button"`, Enter/Space keyboard activation, and disabled state management. Writing `<div role="button">` loses all of that and requires manual re-implementation.

2. **Don't change native semantics unless you have a very good reason.** Adding `role="presentation"` to a `<table>` used for layout is valid. Removing the native role from a `<button>` is not.

3. **All interactive ARIA controls must be keyboard accessible.** ARIA roles alone add no keyboard behaviour. `role="button"` on a `<div>` does nothing without also adding `tabindex="0"` and keyboard event handlers for Enter and Space.

4. **Don't use `aria-hidden` on focusable elements.** A hidden element that receives focus creates a silent, invisible focus trap — one of the most disorienting experiences for screen reader users.

5. **All interactive elements must have an accessible name.** An `aria-label` or `aria-labelledby` or visible label. A button with no name is announced as "button" with no context.

---

## 4. ARIA Roles — What an Element Is

### 4.1 The Role Taxonomy

WAI-ARIA 1.2 defines **82 roles** across five categories:

| Category               | Count | Purpose                             |
| ---------------------- | ----- | ----------------------------------- |
| **Landmark**           | 8     | Page regions for navigation         |
| **Widget**             | 29    | Interactive controls                |
| **Document Structure** | 25    | Content organisation                |
| **Live Region**        | 5     | Dynamic content containers          |
| **Abstract**           | 15    | Base types only — never use in HTML |

### 4.2 Native HTML Implicit Roles

Every HTML element has an implicit role. These are provided for free — no ARIA needed:

| Element                   | Implicit Role         | What AT announces                   |
| ------------------------- | --------------------- | ----------------------------------- |
| `<button>`                | `button`              | "Save, button"                      |
| `<a href>`                | `link`                | "Home, link"                        |
| `<h1>`–`<h6>`             | `heading` (level 1–6) | "Main title, heading level 1"       |
| `<nav>`                   | `navigation`          | "Navigation" (landmark)             |
| `<main>`                  | `main`                | "Main" (landmark)                   |
| `<ul>` / `<ol>`           | `list`                | "List, 3 items"                     |
| `<input type="checkbox">` | `checkbox`            | "Accept terms, checkbox, unchecked" |
| `<input type="text">`     | `textbox`             | "Title, text field"                 |
| `<div>` / `<span>`        | `generic` (no role)   | Nothing — invisible to AT           |

### 4.3 Landmark Roles

Landmarks divide the page into navigable regions. Screen reader users press a single key (`D` in NVDA/JAWS) to cycle through them — like having a table of contents for the page structure.

| Role            | HTML Equivalent        | Rules                                                      |
| --------------- | ---------------------- | ---------------------------------------------------------- |
| `main`          | `<main>`               | **One per page only**                                      |
| `navigation`    | `<nav>`                | Requires `aria-label` if more than one nav exists          |
| `banner`        | `<header>` (top-level) | One per page, page-level header only                       |
| `contentinfo`   | `<footer>` (top-level) | One per page, page-level footer only                       |
| `region`        | `<section>`            | Requires `aria-label` or `aria-labelledby` to be announced |
| `complementary` | `<aside>`              | Supporting content                                         |
| `form`          | `<form>`               | Requires accessible name                                   |
| `search`        | `<search>`             | Search functionality                                       |

**Critical rule:** Never place `role="main"` on an Angular component host element if `app.html` already contains a `<main>` element. This creates two main landmarks — a WCAG 1.3.6 failure — and confuses screen reader users navigating by landmarks.

### 4.4 Widget Roles

Widget roles identify interactive controls. When you use one, you take on a contract: implement all required keyboard interactions and maintain all expected ARIA states.

Key widget roles:

- **`button`** — single activation; use `<button>` unless it is impossible
- **`checkbox`** — toggle; supports `true`/`false`/`mixed` via `aria-checked`
- **`combobox`** — text input with associated list; requires `aria-expanded`, `aria-controls`, `aria-activedescendant`
- **`dialog`** — modal overlay; requires `aria-labelledby`, focus trapping, Escape to close
- **`tab`** / **`tablist`** / **`tabpanel`** — tabbed interface; arrow key navigation
- **`listbox`** / **`option`** — selection list; supports single and multi-select
- **`menu`** / **`menuitem`** — application menus; arrow key navigation
- **`slider`** — range input; requires `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- **`switch`** — on/off toggle; use `aria-checked` with `true`/`false` only (no `mixed`)

---

## 5. ARIA Properties — Naming, Describing, and Relating

### 5.1 Properties vs States

**Properties** define the _nature_ of an element — its name, description, and relationships. They are set at render time and rarely change.

**States** reflect the _current condition_ — they change dynamically in response to user interaction or data updates. Covered in Section 6.

### 5.2 Naming Properties — Precedence Order

The accessible name computation algorithm determines what a screen reader announces as the label for an element. The sources are resolved in this priority order:

1. **`aria-labelledby`** — references the text content of another element on the page (highest priority)
2. **`aria-label`** — inline string used when no visible label exists
3. **`<label>` element** — the preferred method for form inputs
4. **Element text content** — for buttons and links, their visible text
5. **`title` attribute** — last resort; inconsistently supported across AT (do not rely on it alone)

```html
<!-- Option 1: aria-labelledby — links to visible text -->
<h2 id="section-title">Active Tasks</h2>
<section aria-labelledby="section-title">…</section>

<!-- Option 2: aria-label — when no visible text is appropriate -->
<button type="button" aria-label="Delete: Buy groceries">
  <svg aria-hidden="true">…</svg>
</button>

<!-- Option 3: Native label for form inputs — preferred -->
<label for="todo-title">Title</label>
<input id="todo-title" type="text" />
```

### 5.3 Describing Properties

**`aria-describedby`** links an element to a longer description. Screen readers announce the label first, then the description after a short pause.

```html
<input id="todo-title" aria-required="true" aria-invalid="true" aria-describedby="title-error" />
<p id="title-error" role="alert">Title is required</p>
```

The user hears: _"Title, text field, required, invalid — Title is required"_

### 5.4 Relationship Properties

| Property           | What it expresses                                                    |
| ------------------ | -------------------------------------------------------------------- |
| `aria-controls`    | This element controls another element (a button controlling a panel) |
| `aria-owns`        | Claims non-DOM-child elements as owned children                      |
| `aria-flowto`      | Specifies reading order when DOM order differs from visual order     |
| `aria-describedby` | Points to element containing a longer description                    |
| `aria-details`     | Points to complex description (a `<figure>`, `<table>`, etc.)        |

### 5.5 Widget Configuration Properties

| Property                                            | Values                                          | Use                                      |
| --------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- |
| `aria-required`                                     | `true` / `false`                                | Form field must be filled                |
| `aria-haspopup`                                     | `menu` / `listbox` / `dialog` / `grid` / `tree` | Button reveals a popup                   |
| `aria-readonly`                                     | `true` / `false`                                | Field is readable but not editable       |
| `aria-multiselectable`                              | `true` / `false`                                | Listbox/grid accepts multiple selections |
| `aria-orientation`                                  | `horizontal` / `vertical`                       | Direction for arrow key navigation       |
| `aria-valuemin` / `aria-valuemax` / `aria-valuenow` | Numbers                                         | For sliders and spinners                 |

---

## 6. ARIA States — Reflecting Dynamic Conditions

### 6.1 State Types

| Type     | Values                     | Examples                                                     |
| -------- | -------------------------- | ------------------------------------------------------------ |
| Boolean  | `true` / `false`           | `aria-expanded`, `aria-selected`, `aria-busy`, `aria-hidden` |
| Tristate | `true` / `false` / `mixed` | `aria-checked` (indeterminate checkbox)                      |
| Token    | named values               | `aria-current="page"`, `aria-invalid="grammar"`              |
| Integer  | numeric                    | `aria-level`, `aria-posinset`, `aria-setsize`                |

### 6.2 Essential States Reference

**`aria-expanded`** — for accordions, menus, dropdowns:

```html
<button [attr.aria-expanded]="isOpen()" aria-controls="panel-id">Filter options</button>
<div id="panel-id" [hidden]="!isOpen()">…</div>
```

Announces: _"Filter options, button, collapsed"_ / _"…expanded"_

**`aria-checked`** — for checkboxes, switches, and "select all" patterns:

```html
<!-- Indeterminate (select all with partial selection) -->
<input type="checkbox" [attr.aria-checked]="selectAllState()" />
<!-- selectAllState() returns 'true' | 'false' | 'mixed' -->
```

**`aria-selected`** — for tabs, list options, grid cells:

```html
<button role="tab" [attr.aria-selected]="activeTab() === 'all'">All</button>
```

Note: `aria-selected` is for _selectable_ items in tabs/listboxes/grids. Not for list items (`<li>`).

**`aria-invalid`** — for form validation errors:

```html
<input [attr.aria-invalid]="hasError() ? 'true' : null" />
```

Bind `null` — not `'false'` — to remove the attribute when the field is valid. `aria-invalid="false"` is technically valid but adds noise to AT announcements.

**`aria-disabled` vs native `disabled`**:

| Attribute              | In tab order?        | Clickable?         | Announced by AT?            |
| ---------------------- | -------------------- | ------------------ | --------------------------- |
| `disabled`             | ❌ Removed entirely  | ❌                 | ❌ Invisible to AT          |
| `aria-disabled="true"` | ✅ Remains focusable | ❌ (prevent in JS) | ✅ "dimmed" / "unavailable" |

Use `aria-disabled` when you want keyboard users to discover the button exists but understand it is currently unavailable — for example, a "Submit" button that is disabled until the form is valid.

**`aria-current`** — marks the current item in navigation:

| Value      | Use                                 |
| ---------- | ----------------------------------- |
| `page`     | Current page in a navigation bar    |
| `step`     | Current step in a multi-step wizard |
| `date`     | Selected date in a date picker      |
| `time`     | Selected time                       |
| `location` | Current location in a breadcrumb    |

```html
<a [attr.aria-current]="currentRoute() === '/home' ? 'page' : null">Home</a>
```

**`aria-busy`** — during loading states:

```html
<section [attr.aria-busy]="isLoading()">
  <!-- content -->
</section>
```

Announces: _"Todo list, region, busy"_ — tells AT users content is loading and to wait.

---

## 7. Live Regions — Announcing What Changes

### 7.1 The Problem Live Regions Solve

Screen readers work in two modes: _reading mode_ (browsing content) and _interaction mode_ (operating controls). In both modes, the AT only announces what the user navigates to or interacts with.

Dynamic web applications update the DOM constantly — loading spinners, success toasts, error messages, search result counts — without moving focus. By default, screen readers miss all of this. The user submits a form and hears nothing. They have no way to know if it succeeded or failed.

WCAG 2.1 SC 4.1.3 (Level AA): _Status messages — information conveyed through change in content that does not receive focus — must be programmatically determinable._

Live regions solve this by telling the AT: "watch this area — announce its changes automatically, even without focus."

### 7.2 The Three Live Region Attributes

**`aria-live`** — the core attribute:

| Value       | Behaviour                                                    | When to use                                         |
| ----------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `polite`    | Waits for the user to finish reading before announcing       | Adds, completions, filter results, success messages |
| `assertive` | Interrupts immediately, regardless of what the user is doing | Deletions, critical errors, timeouts                |
| `off`       | No automatic announcement (default)                          | —                                                   |

**`aria-atomic`** — controls what is announced when the region updates:

- `aria-atomic="true"` — re-reads the entire region as one unit
- `aria-atomic="false"` — announces only the changed portion

**`aria-relevant`** — which types of changes trigger announcements:

- `additions` — new nodes added
- `removals` — nodes removed
- `text` — text content changes
- `all` — any change (rarely useful)

### 7.3 Shortcut Role Combinations

| Role            | Equivalent to                              | Use                        |
| --------------- | ------------------------------------------ | -------------------------- |
| `role="alert"`  | `aria-live="assertive" aria-atomic="true"` | Errors, urgent messages    |
| `role="status"` | `aria-live="polite" aria-atomic="true"`    | Success messages, info     |
| `role="log"`    | `aria-live="polite"`                       | Chat, activity feeds       |
| `role="timer"`  | `aria-live="off"`                          | Timers (announce manually) |

### 7.4 The Critical Timing Rule

**The live region element must exist in the DOM before content is injected into it.**

If you create the region and set its content in the same JavaScript tick (or the same change detection cycle in Angular), most screen readers silently ignore the announcement. The region must be present — even if empty — before the dynamic content is inserted.

```html
<!-- ✅ Correct: empty region always in DOM, content injected later -->
<div role="status" aria-live="polite" class="sr-only">
  @if (statusMessage()) { {{ statusMessage() }} }
</div>

<!-- ❌ Wrong: region only exists when there is content -->
@if (statusMessage()) {
<div role="status">{{ statusMessage() }}</div>
}
```

### 7.5 Angular CDK LiveAnnouncer

Angular's CDK provides `LiveAnnouncer` as the recommended approach for programmatic announcements. It creates and manages the live region element internally, handles browser quirks, and provides a clean `Promise`-based API.

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject } from '@angular/core';

private readonly liveAnnouncer = inject(LiveAnnouncer);

// Polite — for non-urgent updates
onAddTodo(): void {
  this.liveAnnouncer.announce(`Task "${title}" added`, 'polite');
}

// Assertive — for destructive or critical actions
onDeleteTodo(title: string): void {
  this.liveAnnouncer.announce(`"${title}" deleted`, 'assertive');
}

// With item count for filter changes
onFilterChanged(filter: string): void {
  const count = this.filteredTodos().length;
  this.liveAnnouncer.announce(
    `Showing ${count} ${filter} task${count !== 1 ? 's' : ''}`,
    'polite'
  );
}
```

### 7.6 SPA Route Change Announcements

Single-page application frameworks (Angular, React, Vue) do not natively announce page changes to screen readers. A router navigation is invisible to AT — focus stays where it was, no announcement is made.

The solution is a `TitleAnnouncer` service that listens to `Router` events and announces the new page title via a `role="status"` region on `NavigationEnd`:

```typescript
// In a TitleAnnouncer service injected at the root level
router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
  liveAnnouncer.announce(titleService.getTitle(), 'polite');
});
```

---

## 8. Custom Widget Patterns — Following the APG

### 8.1 The APG Rule

The **ARIA Authoring Practices Guide (APG)** — published at `w3.org/WAI/ARIA/apg/patterns` — defines the authoritative implementation contract for every complex widget. Before building any custom interactive component, consult the APG.

Each pattern defines three things you must implement:

1. **ARIA roles, properties, and states** — the required role hierarchy and attributes
2. **Keyboard interaction contract** — which keys do what (deviating breaks expectations)
3. **Focus management rules** — where focus goes on open, close, and navigate

### 8.2 Modal Dialog

The APG dialog pattern is the most critical to implement correctly. A dialog that does not trap focus is a WCAG 2.1.2 (No Keyboard Trap) failure.

**Required implementation:**

- `role="dialog"` on the container
- `aria-modal="true"` (tells AT to ignore background content)
- `aria-labelledby` pointing to the dialog title element
- Focus trapped inside while open (Angular CDK `FocusTrap` or `cdkTrapFocus` directive)
- Escape key closes the dialog
- Focus returns to the trigger element on close

### 8.3 Tabs

```
role="tablist" (container)
  └─ role="tab" aria-selected="true/false" aria-controls="panel-id" (each tab)
       └─ role="tabpanel" aria-labelledby="tab-id" (each panel)
```

**Keyboard contract:**

- Tab key moves into the tablist and onto the active tab only
- Arrow Left/Right navigates between tabs
- Home/End move to first/last tab
- Tab from a tab moves to the associated tabpanel

### 8.4 Combobox / Autocomplete

```
role="combobox"  aria-expanded  aria-controls="listbox-id"  aria-activedescendant
  └─ role="listbox" (the suggestion dropdown)
       └─ role="option" aria-selected (each suggestion)
```

**Keyboard contract:**

- Arrow Down opens the listbox and moves to the first option
- Arrow Up/Down navigate options
- Enter selects the highlighted option
- Escape closes without selecting

### 8.5 Angular CDK vs Custom Decision Matrix

| Widget       | CDK Solution                                    | Complexity                       |
| ------------ | ----------------------------------------------- | -------------------------------- |
| Modal Dialog | `cdkTrapFocus` directive                        | Low — CDK handles focus trapping |
| Tooltip      | `cdkOverlay` + `aria-describedby`               | Low                              |
| Tabs         | Custom roles + `cdkObserveContent`              | Medium                           |
| Combobox     | Custom + `ActiveDescendantKeyManager`           | High                             |
| Data Grid    | Custom + `FocusKeyManager` with roving tabindex | High                             |

---

## 9. Screen Readers — Understanding Your Users' Tools

### 9.1 Market Share (WebAIM Survey 2024)

Understanding which screen readers your users rely on is essential for prioritising testing:

| Screen Reader   | Primary Use Share | Platform    | Cost               |
| --------------- | ----------------- | ----------- | ------------------ |
| JAWS            | ~46%              | Windows     | Commercial         |
| NVDA            | ~30%              | Windows     | Free / open source |
| VoiceOver iOS   | ~11%              | iPhone/iPad | Free (built-in)    |
| VoiceOver macOS | ~9%               | Mac         | Free (built-in)    |
| TalkBack        | ~7%               | Android     | Free (built-in)    |
| Narrator        | ~2%               | Windows 11  | Free (built-in)    |

### 9.2 Recommended Testing Combinations

The three combinations that cover approximately 85% of real-world screen reader usage:

| Screen Reader | Browser        | Why this pair                               |
| ------------- | -------------- | ------------------------------------------- |
| NVDA          | Firefox        | Free; most widely used combo among AT users |
| JAWS          | Chrome or Edge | Dominant enterprise screen reader           |
| VoiceOver     | Safari         | Only valid Apple AT pairing                 |

Testing across all three catches the majority of bugs before real users do.

### 9.3 How Screen Readers Work — The Virtual Buffer

NVDA and JAWS do not interact with the live DOM — they build a **virtual buffer**: a simplified text representation of the page. Users navigate this buffer using AT-specific keyboard shortcuts that have no direct relationship to the browser's focus.

This creates a class of bugs specific to screen readers:

- Content added dynamically after page load may not appear in the buffer until it is refreshed
- Focus management that works visually may have no effect on the AT's reading cursor
- ARIA changes must trigger accessibility tree updates, not just DOM changes

### 9.4 ARIA Announcement Matrix

How the same ARIA attribute is announced across different AT:

| Attribute/State             | NVDA + Firefox         | JAWS + Chrome          | VoiceOver macOS        |
| --------------------------- | ---------------------- | ---------------------- | ---------------------- |
| `role="button"`             | "button"               | "button"               | "button"               |
| `aria-expanded="false"`     | "collapsed"            | "collapsed"            | "collapsed"            |
| `aria-expanded="true"`      | "expanded"             | "expanded"             | "expanded"             |
| `aria-label="Delete: Item"` | "Delete: Item"         | "Delete: Item"         | "Delete: Item"         |
| `aria-live="polite"` change | After speech finishes  | After speech finishes  | After speech finishes  |
| `role="alert"` content      | Interrupts immediately | Interrupts immediately | Interrupts immediately |
| `aria-invalid="true"`       | "invalid entry"        | "invalid entry"        | "invalid"              |

---

## 10. Anti-patterns — The 25 Most Common ARIA Mistakes

### 10.1 Focus Management Anti-patterns

**AP-1 (Critical) — Ghost Focus**
Focusing a `<div>` with `tabindex="-1"` but no role and no aria-label. The focus moves but the screen reader announces nothing. The user is stranded.

```html
<!-- ❌ Ghost focus — announces nothing -->
<div tabindex="-1" id="modal">Modal content here</div>

<!-- ✅ Named region receives focus correctly -->
<div role="dialog" aria-labelledby="modal-title" tabindex="-1" id="modal">
  <h2 id="modal-title">Confirm Delete</h2>
</div>
```

**AP-2 (Critical) — No focus management on modal open**
Opening a dialog without moving focus to it. The user triggers the button, hears nothing, and does not know the dialog exists.

**AP-3 (Critical) — Focus not returned on modal close**
Closing a dialog and returning focus to `document.body` instead of the trigger that opened it. The user is lost in the page.

**AP-4 (High) — Broken focus after conditional rendering**
In Angular, `@if` blocks that remove a currently-focused element destroy that element with no focus recovery. Focus falls to `document.body`. Fix: detect focused element before removal and move focus explicitly.

### 10.2 Role & Semantic Misuse

**AP-5 (High) — `role="button"` on `<div>` when `<button>` is possible**
`<div role="button">` loses: Enter and Space key activation, form participation, disabled state, native click semantics. Requires manual re-implementation of every keyboard behaviour.

**AP-6 (High) — Two `main` landmarks**
Placing `role="main"` on a component host when the shell template already has `<main>`. Fails WCAG 1.3.6. Use `role="region"` for sub-sections.

**AP-7 (Medium) — `role="presentation"` on focusable elements**
`role="presentation"` removes semantics from an element. If that element is focusable, the AT lands on something with no name, no role, no state. AT users hear nothing.

**AP-8 (Medium) — `role="region"` without an accessible name**
A `region` landmark that has no `aria-label` or `aria-labelledby` is not exposed as a landmark at all in most AT. The semantic purpose is lost.

### 10.3 Label & Name Anti-patterns

**AP-9 (Critical) — Icon buttons with no accessible name**

```html
<!-- ❌ Announces: "button" — user has no idea what it does -->
<button type="button">
  <svg>…</svg>
</button>

<!-- ✅ Announces: "Delete: Buy groceries, button" -->
<button type="button" [attr.aria-label]="'Delete: ' + todo().title">
  <svg aria-hidden="true">…</svg>
</button>
```

**AP-10 (High) — Redundant labels**
`aria-label="Submit button"` on a `<button>`. The screen reader announces "Submit button button". The word "button" is already announced from the role.

**AP-11 (High) — Empty `aria-label=""`**
An empty aria-label is treated differently across AT. Some fall back to element content; some announce nothing.

**AP-12 (Medium) — `title` as the only label**
VoiceOver in Safari does not reliably announce the `title` attribute. It is not a safe accessible name source. Always pair it with `aria-label` or a visible label.

**AP-13 (Medium) — `aria-labelledby` pointing to a non-existent ID**
Results in an empty accessible name. Screen readers announce the role and nothing else. Always verify ID references exist in the DOM.

### 10.4 Live Region Anti-patterns

**AP-14 (Critical) — Creating a live region and injecting content in the same tick**
Most AT silently ignore announcements from regions that did not exist before the content was set. The region must already be in the DOM.

**AP-15 (High) — `aria-live="assertive"` for non-urgent messages**
`assertive` interrupts the user mid-sentence. Use it only for destructive actions, critical errors, or session timeouts. Use `polite` for everything else.

**AP-16 (High) — Removing and re-adding live region elements**
AT registers live regions once when they appear in the accessibility tree. Removing and re-creating a region (`@if` toggling the region element itself) causes AT to lose the registration.

### 10.5 Keyboard Anti-patterns

**AP-17 (Critical) — Mouse-only interactions**
Any action requiring hover, drag without keyboard alternative, or right-click with no keyboard equivalent fails WCAG 2.1.1. Every interactive feature must be operable with a keyboard.

**AP-18 (Critical) — Keyboard trap**
Focus enters a component and cannot leave without a mouse click. WCAG 2.1.2 requires a mechanism to escape all keyboard traps.

**AP-19 (High) — Missing `event.preventDefault()` on arrow key navigation**
Arrow key handlers in custom widgets (menus, grids, carousels) must call `event.preventDefault()` to stop the browser default (page scroll) while navigating.

### 10.6 Angular-Specific Pitfalls

**AP-20 (High) — OnPush components not triggering ARIA attribute bindings**
Angular's `OnPush` change detection skips components whose inputs have not changed. Signal-based ARIA bindings (`[attr.aria-label]="signal()"`) work correctly because signals trigger `markForCheck`. RxJS-derived values require explicit `markForCheck()` calls.

**AP-21 (High) — SSR hydration ARIA ID mismatches**
Dynamic IDs generated with `Math.random()` or `Date.now()` differ between server-rendered HTML and client hydration. Use Angular's `inject(PLATFORM_ID)` pattern or stable deterministic ID generation.

**AP-22 (Medium) — `@defer` blocks and premature AT discovery**
Deferred blocks that load lazily may appear partially rendered in the accessibility tree. AT can discover and announce incomplete content. Use `aria-busy="true"` on the containing region during deferred loading.

---

## 11. Angular CDK A11y Primitives — Production-Ready Tools

The `@angular/cdk/a11y` module provides battle-tested, platform-normalised accessibility primitives that handle browser differences, SSR safety, and cleanup automatically.

### 11.1 Installation

```bash
npm install @angular/cdk
```

No module registration required. All primitives are `providedIn: 'root'` or directives applied in component templates.

### 11.2 LiveAnnouncer

Manages a visually hidden `aria-live` region and posts programmatic announcements safely.

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject } from '@angular/core';

private readonly liveAnnouncer = inject(LiveAnnouncer);

// Politeness levels: 'polite' | 'assertive' | 'off'
this.liveAnnouncer.announce('3 tasks found', 'polite');
this.liveAnnouncer.announce('"Buy milk" deleted', 'assertive');
```

### 11.3 FocusTrap — Modal Dialogs

`FocusTrap` contains keyboard focus within a container. Essential for dialogs, drawers, and any overlay pattern.

```typescript
import { FocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';
import { ElementRef, inject, afterNextRender, OnDestroy } from '@angular/core';

private readonly focusTrapFactory = inject(FocusTrapFactory);
private readonly elementRef = inject(ElementRef);
private focusTrap?: FocusTrap;

constructor() {
  afterNextRender(() => {
    this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
    this.focusTrap.focusInitialElementWhenReady();
  });
}

ngOnDestroy(): void {
  this.focusTrap?.destroy();
}
```

Or declaratively with the `cdkTrapFocus` directive:

```html
<div role="dialog" cdkTrapFocus cdkTrapFocusAutoCapture>
  <!-- focus is automatically contained here -->
</div>
```

### 11.4 FocusMonitor — Keyboard vs Mouse Focus Styling

`FocusMonitor` distinguishes between mouse, keyboard, touch, and programmatic focus — enabling the WCAG 2.4.7 pattern of showing focus rings only for keyboard navigation.

```typescript
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ElementRef, inject, OnDestroy, afterNextRender } from '@angular/core';

private readonly focusMonitor = inject(FocusMonitor);
protected readonly focusOrigin = signal<FocusOrigin | null>(null);

constructor() {
  afterNextRender(() => {
    this.focusMonitor.monitor(this.elementRef).subscribe(origin => {
      this.focusOrigin.set(origin);
    });
  });
}

ngOnDestroy(): void {
  this.focusMonitor.stopMonitoring(this.elementRef);
}
```

### 11.5 HighContrastModeDetector

Windows High Contrast Mode (forced-colors) overrides CSS. Images, borders, box-shadows, and background-color-based UI disappear. The `HighContrastModeDetector` lets components adapt:

```typescript
import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { inject } from '@angular/core';

private readonly hcDetector = inject(HighContrastModeDetector);
protected readonly isHighContrast = this.hcDetector.getHighContrastMode() !== 'none';
```

### 11.6 ActiveDescendantKeyManager and FocusKeyManager

CDK's key managers handle arrow key navigation for composite widgets (menus, listboxes, tab panels) while maintaining ARIA's roving tabindex or `aria-activedescendant` pattern.

```typescript
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';

// For listbox / combobox (uses aria-activedescendant)
this.keyManager = new ActiveDescendantKeyManager(this.options())
  .withWrap() // Arrow wraps at edges
  .withHomeAndEnd() // Home/End support
  .withTypeAhead(); // Typeahead navigation
```

### 11.7 Signal-Based ARIA Patterns in Angular 21

Angular 21's `computed()` signals integrate naturally with `[attr.aria-*]` template bindings. State changes are reflected in the accessibility tree synchronously on every change detection cycle.

```typescript
// Dynamic list label reflecting active filter
protected readonly ariaListLabel = computed(() => ({
  all: 'All tasks',
  active: 'Active tasks',
  completed: 'Completed tasks',
}[this.filter()]));

// Region label with live stats
protected readonly ariaLabel = computed(() => {
  const stats = this.todoStats();
  return `Todo list — ${stats.total} items, ${stats.active} active`;
});

// Error state — null removes the attribute entirely
protected readonly titleAriaInvalid = computed(() =>
  this.formErrors().title ? 'true' : null
);
```

```html
<ul [attr.aria-label]="ariaListLabel()">
  …
</ul>
<section [attr.aria-label]="ariaLabel()">…</section>
<input [attr.aria-invalid]="titleAriaInvalid()" />
```

### 11.8 Host Bindings for Component Host Elements

Angular components render a custom element tag in the parent template. Using `host` in `@Component` applies ARIA attributes directly to the host element, avoiding the need for a redundant wrapper `<div>`:

```typescript
@Component({
  selector: 'app-todo-list',
  host: {
    class: 'block w-full', // CSS classes
    role: 'region', // Landmark role
    '[attr.aria-label]': 'ariaLabel()', // Dynamic label from computed signal
  },
})
export class TodoListComponent {
  protected readonly ariaLabel = computed(() => `Todo list — ${this.stats().total} items`);
}
```

---

## 12. Installing and Configuring Accessibility Tools

### 12.1 Angular CDK

```bash
npm install @angular/cdk
```

For Angular 21 and CDK 21, no additional provider or module registration is required. All CDK a11y services are `providedIn: 'root'`.

**Verify the install:**

```bash
npm list @angular/cdk
```

### 12.2 axe-core for Automated Unit Testing

```bash
npm install --save-dev axe-core jest-axe
# or for Vitest:
npm install --save-dev axe-core vitest-axe
```

Running axe in component specs catches a large percentage of WCAG failures automatically:

```typescript
import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

it('has no WCAG violations', async () => {
  const results = await axe(fixture.nativeElement);
  expect(results).toHaveNoViolations();
});
```

### 12.3 NVDA (Free Screen Reader for Windows)

1. Download from `nvaccess.org/download`
2. Install — no reboot required
3. Launch with `Ctrl+Alt+N`
4. Pair with Firefox for most reliable testing

**Essential NVDA shortcuts:**

| Shortcut     | Action                     |
| ------------ | -------------------------- |
| `NVDA+F7`    | List all landmarks         |
| `NVDA+F6`    | List all headings          |
| `NVDA+Space` | Toggle browse / forms mode |
| `H`          | Next heading               |
| `D`          | Next landmark              |
| `B`          | Next button                |
| `F`          | Next form field            |
| `Escape`     | Stop reading               |

### 12.4 Browser Extensions

| Tool                     | Store Link                       | Key use                     |
| ------------------------ | -------------------------------- | --------------------------- |
| axe DevTools             | Chrome Web Store: `axe devtools` | WCAG rule-by-rule audit     |
| WAVE                     | Chrome Web Store: `WAVE`         | Visual error overlay        |
| Colour Contrast Analyser | TPGi.com                         | Exact contrast ratio picker |

---

## 13. Testing Accessibility — A Practical Guide

### 13.1 The Four-Layer Testing Approach

No single tool catches everything. A robust accessibility testing strategy combines four layers:

| Layer                   | Tools                              | What it catches                             |
| ----------------------- | ---------------------------------- | ------------------------------------------- |
| **1. Automated (unit)** | axe-core, vitest-axe               | ~30–40% of WCAG issues                      |
| **2. Automated (page)** | Lighthouse, axe DevTools, WAVE     | ~30–40% (overlapping)                       |
| **3. Manual keyboard**  | Browser only                       | Tab order, focus visibility, keyboard traps |
| **4. Screen reader**    | NVDA + Firefox, VoiceOver + Safari | AT-specific behaviour, announcements        |

Automated tools together catch approximately 40% of WCAG issues. The remaining 60% requires human testing. Both are necessary.

### 13.2 Chrome DevTools — Accessibility Panel

**Steps:**

1. Open DevTools (`F12`) → Elements tab → Accessibility panel (right side)
2. Click any element to inspect its accessibility tree entry
3. Verify: Role, Name (accessible name), Properties (aria-required, aria-live, etc.)

**What to verify:**

| Element           | Expected Role | Expected Name           |
| ----------------- | ------------- | ----------------------- |
| `<main>`          | `main`        | —                       |
| `<nav>`           | `navigation`  | "Primary"               |
| `<footer>`        | `contentinfo` | "Site information"      |
| Icon-only buttons | `button`      | "Delete: Buy groceries" |
| Form inputs       | `textbox`     | "Title (required)"      |
| Filter buttons    | `tab`         | "All (3)"               |

### 13.3 Lighthouse Audit

**Steps:**

1. DevTools (`F12`) → Lighthouse tab
2. Select Accessibility only → Analyse page load
3. Target score: **90+**

Lighthouse tests automatically: colour contrast, form labels, alt text, valid ARIA roles, landmark presence, skip link, interactive element accessibility, heading order.

### 13.4 axe DevTools (Chrome Extension)

**Steps:**

1. Install from Chrome Web Store
2. DevTools → axe DevTools tab
3. Scan ALL of my page
4. Filter by Impact: Critical and Serious first

After implementing all accessibility fixes, the target is:

- **0 Critical violations**
- **0 Serious violations** relating to labels, ARIA, contrast

### 13.5 WAVE Visual Audit

**Steps:**

1. Install from Chrome Web Store
2. Click WAVE icon while on the target page
3. Check:
   - No red (error) icons — especially "Missing form label"
   - Every input has a green label icon (`L`)
   - Heading hierarchy is correct (H1 → H2 → H3, no skips)
   - Skip link appears at the top

Click **Structure** in the WAVE sidebar to see the landmark and heading outline.

### 13.6 Keyboard-Only Testing

The most revealing and fastest manual test:

1. Disconnect the mouse
2. Start at the browser address bar
3. Tab through the entire page — verify:
   - Every interactive element receives visible focus (a visible focus ring)
   - Tab order matches the visual reading order
   - The skip link appears on first Tab press
   - No focus traps except intentional dialogs
   - Escape closes modals and menus
   - Enter/Space activates buttons
   - Arrow keys navigate tabs, menus, and listboxes
   - Form can be fully submitted by keyboard

### 13.7 NVDA + Firefox — Screen Reader Test

Essential steps:

1. Launch NVDA (`Ctrl+Alt+N`)
2. Open Firefox → navigate to the app
3. Press `NVDA+F7` — verify all expected landmarks appear
4. Press `NVDA+F6` — verify heading hierarchy
5. Tab through interactive elements — verify each announces correctly
6. Submit the form — verify success/error messages are announced
7. Delete an item — verify deletion is announced assertively
8. Test filter buttons — verify count is announced on change

### 13.8 Automated Unit Tests for ARIA

Signal-based ARIA bindings must be tested to confirm they update correctly:

```typescript
it('sets aria-invalid when a validation error is present', () => {
  component.testFormErrors.set({ title: 'Title is required', description: '' });
  fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('#todo-title');
  expect(input.getAttribute('aria-invalid')).toBe('true');
});

it('removes aria-invalid when the error is cleared', () => {
  component.testFormErrors.set({ title: '', description: '' });
  fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('#todo-title');
  expect(input.getAttribute('aria-invalid')).toBeNull();
});

it('announces deletion assertively via LiveAnnouncer', () => {
  vi.spyOn(liveAnnouncer, 'announce');
  component.onDeleteTodo('todo-1');
  expect(liveAnnouncer.announce).toHaveBeenCalledWith(
    expect.stringContaining('deleted'),
    'assertive',
  );
});
```

---

## 14. A Real-World Audit — Case Study

To ground this paper in concrete practice, this section documents an accessibility audit performed on an Angular 21 Todo application against WCAG 2.1 AA.

### 14.1 Audit Scope and Method

- **Application:** Angular 21 Todo App with SSR, TailwindCSS, Angular CDK
- **Standard:** WCAG 2.1 AA
- **Tools used:** Chrome DevTools Accessibility Panel, Lighthouse, axe DevTools, NVDA + Firefox
- **Scope:** App shell, todo list feature, todo form, todo item component

### 14.2 Findings Summary

| Severity                  | Count | Fixed  |
| ------------------------- | ----- | ------ |
| Critical (WCAG A failure) | 4     | ✅ All |
| Serious (WCAG AA failure) | 4     | ✅ All |
| Moderate (Best practice)  | 4     | ✅ All |

**Total issues resolved: 12**

### 14.3 Critical Findings and Fixes

**Issue 1 — Duplicate `main` landmark (WCAG 1.3.6)**

The `TodoListComponent` host declared `role: 'main'`. The shell `app.html` already contained a `<main>` element. This created two main landmarks. NVDA's landmark list (`INSERT+F7`) showed "Main" twice — screen reader users could not determine the true page structure.

_Fix:_ Changed `role: 'main'` → `role: 'region'` with `aria-label` bound to a computed signal reflecting live stats.

---

**Issue 2 — No skip link (WCAG 2.4.1)**

No "Skip to main content" link existed. Keyboard users were forced to Tab through the entire navigation bar on every page load before reaching todo content.

_Fix:_ Added a visually-hidden skip link as the first focusable element on the page, styled to appear on focus:

```html
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ..."
>
  Skip to main content
</a>
<main id="main-content" tabindex="-1">…</main>
```

The `tabindex="-1"` on `<main>` is required for programmatic focus to land correctly in all browsers.

---

**Issue 3 — Navigation with no accessible name (WCAG 1.3.1)**

`<nav>` elements require accessible names when they need to be distinguished. Without `aria-label`, screen readers announce "navigation" with no context. NVDA users pressing `D` to browse landmarks could not tell which navigation was which.

_Fix:_ Added `aria-label="Primary"` to the header `<nav>`.

---

**Issue 4 — Colour contrast failure (WCAG 1.4.3)**

The MFE session stats panel used amber-400 background (`#f59e0b`) with white text (`#fff`). Measured contrast ratio: **2.1:1** — far below the WCAG AA minimum of **4.5:1** for body text.

_Fix:_ Changed text color to stone-900 (`#1c1917`), achieving **8.6:1** contrast.

---

### 14.4 Serious Findings and Fixes

**Issue 5 — Form inputs missing `aria-required` and `aria-invalid` (WCAG 3.3.1, 3.3.2)**

Inputs were visually required and validated but lacked `aria-required="true"` and `aria-invalid` attributes. Screen reader users navigating by form fields had no indication fields were required or in error.

_Fix:_ Added `aria-required="true"` statically and bound `[attr.aria-invalid]="hasError() ? 'true' : null"` dynamically. Error paragraphs received `id` attributes and were linked via `aria-describedby`.

---

**Issue 6 — Icon buttons with no accessible names (WCAG 2.4.6)**

Edit and Delete buttons contained only SVG icons with no text. Screen readers announced "button" for every item — users had no way to know which item they were about to delete.

_Fix:_ Added `[attr.aria-label]="'Delete: ' + todo().title"` and `[attr.aria-label]="'Edit: ' + todo().title"` to each button. SVG elements received `aria-hidden="true"`.

---

**Issue 7 — Filter tabs not using tab role (WCAG 4.1.2)**

Filter buttons (All / Active / Completed) were `<button>` elements with no tab semantics. Screen readers announced three plain buttons with no indication they were related or that one was selected.

_Fix:_ Added `role="tab"`, `[attr.aria-selected]="activeFilter() === filter"`, contained in a `role="tablist"`, linked to the todo list via `aria-controls`.

---

**Issue 8 — No live announcements for dynamic changes (WCAG 4.1.3)**

Adding, deleting, toggling, and filtering todos produced no screen reader announcements. Screen reader users had no confirmation their actions succeeded.

_Fix:_ Installed `@angular/cdk` and added `LiveAnnouncer` announcements for all five interaction types: add (`polite`), delete (`assertive`), toggle (`polite`), filter change with count (`polite`), clear completed (`polite`).

---

### 14.5 Before and After

**Before:** Screen reader user submits the form → silence. Presses Tab → cannot find any indication a task was added.

**After:** Screen reader user submits the form → _"Task 'Buy milk' added"_ announced politely. Deletes a task → _"'Buy milk' deleted"_ announced assertively. Changes filter → _"Showing 2 active tasks"_ announced.

**Lighthouse score before:** 72  
**Lighthouse score after:** 98

**axe violations before:** 7 Critical, 4 Serious  
**axe violations after:** 0 Critical, 0 Serious

---

## 15. Key Takeaways and Recommendations

### 15.1 Architecture Level

1. **Establish a semantic HTML foundation first.** Every native element used correctly is an ARIA attribute that does not need to be written and maintained.

2. **One `<main>` per page.** No exceptions. Components that represent page sections use `role="region"` with a named `aria-label`.

3. **Skip links are non-negotiable.** They are WCAG 2.4.1 Level A — the absolute minimum. Every page needs one.

4. **Route change announcements are required for SPAs.** Angular does not provide this out of the box. Implement a `TitleAnnouncer` service.

5. **Install Angular CDK early.** `LiveAnnouncer`, `FocusTrap`, and `FocusMonitor` solve 80% of dynamic accessibility requirements without custom code.

### 15.2 Component Design Level

6. **Consult the APG before building any custom widget.** Every complex interactive pattern has a documented contract. Following it exactly is the only way to guarantee predictable AT behaviour.

7. **Use signals for all dynamic ARIA attributes.** `computed()` + `[attr.aria-*]` bindings are synchronous, predictable, and testable. They are the correct Angular 21 pattern.

8. **Per-item labels on every action button.** _"Delete button"_ repeated 10 times is useless. _"Delete: Buy groceries"_ tells users exactly what they are operating on.

9. **Bind `null` to remove ARIA attributes.** `aria-invalid="false"` adds noise. `null` removes the attribute entirely — the correct behaviour for valid fields.

10. **Guard all DOM access with `afterNextRender()` or `isPlatformBrowser()`.** SSR breaks any code that accesses `document`, `window`, or browser APIs in Angular lifecycle hooks.

### 15.3 Testing Level

11. **Run Lighthouse on every feature.** A score drop from 95 to 87 immediately after a PR is a signal that something regressed.

12. **Add axe-core to your component specs.** Automatic detection of label violations, contrast issues, and invalid ARIA in unit tests catches problems before they reach the browser.

13. **Keyboard test every new component.** Five minutes of keyboard-only navigation reveals focus traps, invisible focus, and unimplemented keyboard patterns that no automated tool will catch.

14. **Test with NVDA + Firefox for every significant feature.** Reading mode versus forms mode, virtual buffer refresh, and announcement timing are invisible to automated tools.

15. **Do not treat accessibility as a post-release audit.** The cost of retrofitting accessibility onto a shipped component is 10–15× the cost of building it correctly from the start.

---

## 16. References and Further Reading

### Standards and Specifications

- **WCAG 2.1:** [w3.org/TR/WCAG21](https://www.w3.org/TR/WCAG21/)
- **WAI-ARIA 1.2:** [w3.org/TR/wai-aria-1.2](https://www.w3.org/TR/wai-aria-1.2/)
- **ARIA Authoring Practices Guide:** [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/)
- **HTML-AAM (HTML to Accessibility API Mappings):** [w3.org/TR/html-aam-1.0](https://www.w3.org/TR/html-aam-1.0/)

### Angular and CDK

- **Angular Accessibility Guide:** [angular.dev/best-practices/a11y](https://angular.dev/best-practices/a11y)
- **Angular CDK A11y Module:** [material.angular.io/cdk/a11y](https://material.angular.io/cdk/a11y/overview)

### Testing Tools

- **axe-core:** [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core)
- **NVDA:** [nvaccess.org](https://www.nvaccess.org)
- **WAVE:** [wave.webaim.org](https://wave.webaim.org)
- **WebAIM Screen Reader Survey:** [webaim.org/projects/screenreadersurvey10](https://webaim.org/projects/screenreadersurvey10)

### Further Reading

- **Inclusive Design Principles:** [inclusivedesignprinciples.org](https://inclusivedesignprinciples.org)
- **A11y Project Checklist:** [a11yproject.com/checklist](https://www.a11yproject.com/checklist/)
- **Deque University (free resources):** [deque.com/axe/axe-for-web](https://www.deque.com/axe/axe-for-web/)

---

## About the Author

**Sudeep Parchure** is a Solutions Architect and Angular specialist focused on building accessible, performant, and inclusive web applications. This paper is derived from hands-on implementation work on production Angular 21 applications, covering the full spectrum from WCAG compliance strategy through Angular CDK a11y primitives to screen reader testing.

---

_© 2026 Sudeep Parchure. Published for educational purposes._

_Tags: #WebAccessibility #A11y #WCAG #ARIA #Angular #InclusiveDesign #UXDesign #FrontendDevelopment #AngularCDK #ScreenReaders_
