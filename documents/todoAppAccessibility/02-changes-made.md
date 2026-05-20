# Changes Made — What, Why, and How

All changes target WCAG 2.1 AA compliance. No visual design was modified beyond the contrast fix.

---

## Package Installed

### `@angular/cdk@21.2.11`

```bash
npm install @angular/cdk
```

**Why:** The Angular CDK's `LiveAnnouncer` service posts messages to a visually hidden `aria-live` region that screen readers monitor. It is the recommended Angular pattern for announcing dynamic DOM changes without moving focus. It is free, official, and maintained by the Angular team.

**Used in:** `TodoListComponent` to announce add, delete, toggle, filter, and clear actions.

---

## File 1 — `src/app/app.html`

### Change 1.1 — Skip link added

```html
<!-- BEFORE: nothing -->

<!-- AFTER -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ..."
>
  Skip to main content
</a>
```

**WCAG criterion:** 2.4.1 Bypass Blocks (Level A)  
**Why:** Every keyboard user must be able to skip the navigation and jump directly to the main content. The `sr-only` class hides the link visually until it receives focus; keyboard users see it on first `Tab`.

---

### Change 1.2 — `<nav>` labelled

```html
<!-- BEFORE -->
<nav class="bg-white ...">
  <!-- AFTER -->
  <nav aria-label="Primary" class="bg-white ..."></nav>
</nav>
```

**WCAG criterion:** 1.3.1 Info and Relationships (Level A)  
**Why:** When NVDA or JAWS users press `D` to navigate between landmarks, they hear "navigation". With `aria-label="Primary"` they hear "Primary navigation". This distinguishes the header nav from any other `<nav>` that may appear via the router outlet.

---

### Change 1.3 — `<main>` gets `id` and `tabindex`

```html
<!-- BEFORE -->
<main class="max-w-3xl ...">
  <!-- AFTER -->
  <main id="main-content" tabindex="-1" class="max-w-3xl ..."></main>
</main>
```

**WCAG criterion:** 2.4.1 Bypass Blocks (Level A)  
**Why:** The skip link `href="#main-content"` targets this `id`. The `tabindex="-1"` is required so that programmatic focus (from the skip link click) lands on the element correctly in all browsers, including Safari.

---

### Change 1.4 — Footer labelled

```html
<!-- BEFORE -->
<footer class="py-6 ...">
  <!-- AFTER -->
  <footer aria-label="Site information" class="py-6 ..."></footer>
</footer>
```

**WCAG criterion:** 1.3.1 Info and Relationships (Level A)  
**Why:** `<footer>` creates a `contentinfo` landmark when it is a top-level element. Adding `aria-label` gives it a descriptive name in the landmarks list.

---

### Change 1.5 — Tech-stack `<span>` hidden from AT

```html
<!-- BEFORE -->
<span class="text-xs text-gray-400">Angular 21 · Signals · TailwindCSS</span>

<!-- AFTER -->
<span class="text-xs text-gray-400" aria-hidden="true">Angular 21 · Signals · TailwindCSS</span>
```

**Why:** This is a visual decoration with no functional meaning. Hiding it prevents screen readers from reading "Angular 21 Signals TailwindCSS" after every navigation item.

---

## File 2 — `src/app/features/todo-list/todo-list.component.ts`

### Change 2.1 — Remove duplicate `main` landmark

```typescript
// BEFORE
host: { role: 'main', ... }

// AFTER
host: { role: 'region', ... }
```

**WCAG criterion:** 1.3.6 Identify Purpose (Level AAA) / HTML spec  
**Why:** There must be exactly one `<main>` landmark per page. The component was nested inside `<main>` in `app.html`, so its own `role: 'main'` created a duplicate. Changed to `role: 'region'` — the component now creates a named region landmark instead.

---

### Change 2.2 — Import and inject `LiveAnnouncer`

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';

private readonly liveAnnouncer = inject(LiveAnnouncer);
```

**WCAG criterion:** 4.1.3 Status Messages (Level AA)  
**Why:** Angular CDK's `LiveAnnouncer` injects a visually hidden `aria-live` region into the DOM and posts messages to it. This is the correct Angular pattern for announcing dynamic changes without moving focus.

---

### Change 2.3 — Add `ariaListLabel` computed signal

```typescript
protected readonly ariaListLabel = computed(() => {
  const labels = { all: 'All tasks', active: 'Active tasks', completed: 'Completed tasks' };
  return labels[this.filter()];
});
```

**Why:** Provides a dynamic accessible name for the `<ul>` that reflects the currently active filter. Used by `[attr.aria-label]="ariaListLabel()"` on the list element.

---

### Change 2.4 — Announce all task mutations

| Method               | Announcement                    | Priority  |
| -------------------- | ------------------------------- | --------- |
| `onAddTodo()`        | `Task "Buy milk" added`         | polite    |
| `onTodoToggled()`    | `"Buy milk" marked as complete` | polite    |
| `onTodoDeleted()`    | `"Buy milk" deleted`            | assertive |
| `onFilterChanged()`  | `Showing 3 active tasks`        | polite    |
| `onClearCompleted()` | `2 completed tasks cleared`     | polite    |
| `onToggleAll()`      | `All tasks marked as complete`  | polite    |

**WCAG criterion:** 4.1.3 Status Messages (Level AA)  
**Why:** Delete is `assertive` because it is irreversible — the user must be informed immediately. All other updates are `polite` so they do not interrupt the user mid-sentence.

---

## File 3 — `src/app/features/todo-list/todo-list.component.html`

### Change 3.1 — Form section gets accessible name

```html
<!-- BEFORE -->
<section class="bg-white ...">
  <h3 class="...">Add New Task</h3>

  <!-- AFTER -->
  <section aria-labelledby="add-task-heading" class="bg-white ...">
    <h3 id="add-task-heading" class="...">Add New Task</h3>
  </section>
</section>
```

**WCAG criterion:** 1.3.1 Info and Relationships (Level A)  
**Why:** `<section>` with an accessible name creates a `region` landmark. Screen reader users can now navigate directly to "Add New Task region" using the landmarks menu.

---

### Change 3.2 — `aria-required` and `aria-invalid` on inputs

```html
<!-- Title input — BEFORE -->
<input id="new-todo-input" type="text" ... />

<!-- AFTER -->
<input
  id="new-todo-input"
  type="text"
  aria-required="true"
  [attr.aria-invalid]="formErrors().title ? 'true' : null"
  ...
/>
```

Same change applied to the Description input.

**WCAG criterion:** 3.3.1 Error Identification (Level A), 3.3.2 Labels or Instructions (Level A)  
**Why:** `aria-required` is announced when the field receives focus ("required"). `aria-invalid="true"` is announced when the field has an error ("invalid entry"). These signals are used by NVDA and JAWS to give users context when filling in forms.

---

### Change 3.3 — Stats bar gets `aria-live`

```html
<!-- BEFORE -->
<div id="todo-count" class="...">
  <!-- AFTER -->
  <div id="todo-count" aria-live="polite" aria-atomic="true" class="..."></div>
</div>
```

**WCAG criterion:** 4.1.3 Status Messages (Level AA)  
**Why:** `aria-atomic="true"` means the entire "3 total · 2 active · 1 done" string is re-read on each change, not just the changed word. Without this, NVDA would say "2" when the count drops from 3 to 2.

---

### Change 3.4 — Loading and empty states use `<output>`

```html
<!-- BEFORE -->
<div class="text-center ...">Loading tasks...</div>
<div class="text-center ...">No tasks to show.</div>

<!-- AFTER -->
<output class="block text-center ...">Loading tasks…</output>
<output class="block text-center ...">No tasks to show.</output>
```

**WCAG criterion:** 4.1.3 Status Messages (Level AA)  
**Why:** The `<output>` element has an implicit `role="status"` (polite `aria-live` region). When Angular switches from loading → loaded → filtered empty, these messages are automatically announced without focus movement.

---

### Change 3.5 — API error gets `role="alert"`

```html
<!-- BEFORE -->
<div class="p-4 bg-red-50 ...">{{ apiError() }}</div>

<!-- AFTER -->
<div role="alert" class="p-4 bg-red-50 ...">{{ apiError() }}</div>
```

**WCAG criterion:** 4.1.3 Status Messages (Level AA)  
**Why:** `role="alert"` is an assertive live region — the error message interrupts the screen reader immediately. Network errors are critical: the user must know the action failed.

---

### Change 3.6 — Task list gets accessible label

```html
<!-- BEFORE -->
<ul class="space-y-2" id="todo-list">
  <!-- AFTER -->
  <ul class="space-y-2" id="todo-list" [attr.aria-label]="ariaListLabel()"></ul>
</ul>
```

**WCAG criterion:** 1.3.1 Info and Relationships (Level A)  
**Why:** The label updates reactively ("All tasks", "Active tasks", "Completed tasks") to reflect the current filter. Screen reader users navigating by lists immediately know what the list contains.

---

## File 4 — `src/app/components/todo-item/todo-item.component.html`

### Change 4.1 — Specific button labels

```html
<!-- BEFORE -->
aria-label="Edit todo" aria-label="Delete todo"

<!-- AFTER -->
[attr.aria-label]="'Edit: ' + todo().title" [attr.aria-label]="'Delete: ' + todo().title"
```

**WCAG criterion:** 2.4.6 Headings and Labels (Level AA)  
**Why:** Generic labels like "Edit todo" are useless when a screen reader lists all buttons on the page. Including the task title ("Edit: Buy milk, button") gives each button a unique, descriptive name.

---

### Change 4.2 — Emoji characters hidden from AT

```html
<!-- BEFORE -->
aria-label="Edit todo"> ✏️

<!-- AFTER -->
[attr.aria-label]="'Edit: ' + todo().title">
<span aria-hidden="true">&#x270F;&#xFE0F;</span>
```

**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)  
**Why:** Some screen reader / browser combinations announce both the `aria-label` and the Unicode emoji description. `aria-hidden="true"` on the `<span>` guarantees the emoji is always hidden from AT, leaving only the clean `aria-label` announcement.

---

### Change 4.3 — Priority badge gets `aria-label`

```html
<!-- BEFORE -->
<span class="px-2 py-0.5 rounded-full ...">{{ todo().priority | titlecase }} priority</span>

<!-- AFTER -->
<span [attr.aria-label]="todo().priority + ' priority'" class="...">
  {{ todo().priority | titlecase }} priority
</span>
```

**WCAG criterion:** 1.4.1 Use of Colour (Level A)  
**Why:** Although the text already conveys the priority, the explicit `aria-label` ensures consistent AT output regardless of any future text changes, and signals that the colour coding is supplementary rather than the sole indicator.
