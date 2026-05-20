# Angular TypeScript — ARIA & Accessibility Patterns Reference

A practical reference for implementing WCAG 2.1 AA compliance inside Angular `.ts` files.
Covers signals, CDK utilities, host bindings, and component architecture patterns.

---

## Table of Contents

1. [Live Announcements — `LiveAnnouncer`](#1-live-announcements--liveannouncer)
2. [Dynamic ARIA Attributes with Signals](#2-dynamic-aria-attributes-with-signals)
3. [Host Bindings for ARIA Roles and Labels](#3-host-bindings-for-aria-roles-and-labels)
4. [Focus Management — `FocusTrap` and `FocusMonitor`](#4-focus-management--focustrap-and-focusmonitor)
5. [SSR Safety — `isPlatformBrowser`](#5-ssr-safety--isplatformbrowser)
6. [Keyboard Interaction Handlers](#6-keyboard-interaction-handlers)
7. [Form Validation and ARIA Error States](#7-form-validation-and-aria-error-states)
8. [Landmark Roles — Host vs Template](#8-landmark-roles--host-vs-template)
9. [Computed Labels for Lists and Regions](#9-computed-labels-for-lists-and-regions)
10. [Testing Accessibility in `.spec.ts`](#10-testing-accessibility-in-spects)

---

## 1. Live Announcements — `LiveAnnouncer`

**When to use:** Any dynamic DOM update that a screen reader would otherwise miss — adds, deletes, state changes, filter results.

### Setup

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject } from '@angular/core';

private readonly liveAnnouncer = inject(LiveAnnouncer);
```

> `LiveAnnouncer` is `providedIn: 'root'` — no module or provider setup needed.

### Politeness levels

| Level         | Use for                       | Screen reader behaviour                                |
| ------------- | ----------------------------- | ------------------------------------------------------ |
| `'polite'`    | Adds, toggles, filter changes | Waits for the user to finish reading before announcing |
| `'assertive'` | Deletions, critical errors    | Interrupts the user immediately                        |

### Patterns used in this project

```typescript
// Task added — polite (not urgent)
onAddTodo(): void {
  // ... create logic
  this.liveAnnouncer.announce(`Task "${title}" added`, 'polite');
}

// Task deleted — assertive (destructive action, user should know immediately)
onTodoDeleted(todoId: string): void {
  const todo = this.todos().find(t => t.id === todoId);
  const title = todo?.title ?? 'Task';
  this.todoApiService.delete(todoId);
  this.liveAnnouncer.announce(`"${title}" deleted`, 'assertive');
}

// Toggle completion state
onTodoToggled(todoId: string): void {
  const todo = this.todos().find(t => t.id === todoId);
  if (todo) {
    const newState = !todo.completed;
    this.todoApiService.update(todoId, { completed: newState });
    this.liveAnnouncer.announce(
      `"${todo.title}" marked as ${newState ? 'complete' : 'incomplete'}`,
      'polite',
    );
  }
}

// Filter changed — announce count so user knows scope
onFilterChanged(filter: 'all' | 'active' | 'completed'): void {
  this.filter.set(filter);
  const count = this.filteredTodos().length;
  this.liveAnnouncer.announce(
    `Showing ${count} ${filter} task${count !== 1 ? 's' : ''}`,
    'polite',
  );
}

// Bulk clear
onClearCompleted(): void {
  const count = this.todoStats().completed;
  // ... delete logic
  this.liveAnnouncer.announce(
    `${count} completed task${count !== 1 ? 's' : ''} cleared`,
    'polite',
  );
}

// Toggle all
onToggleAll(): void {
  const allCompleted = this.todos().every(todo => todo.completed);
  // ... update logic
  this.liveAnnouncer.announce(
    allCompleted ? 'All tasks marked as incomplete' : 'All tasks marked as complete',
    'polite',
  );
}
```

### Announcement message guidelines

- Always include the item **name** so the user knows which item changed.
- Use plain language — no HTML, no special characters.
- Keep messages short (under 80 characters where possible).
- Pluralise counts: `1 task` / `3 tasks`.

---

## 2. Dynamic ARIA Attributes with Signals

Angular signals are ideal for ARIA attributes that reflect component state — they update the DOM synchronously on every state change.

### Pattern: `computed()` signal → `[attr.aria-*]` binding

```typescript
// In the component .ts
protected readonly ariaListLabel = computed(() => {
  const labels: Record<string, string> = {
    all: 'All tasks',
    active: 'Active tasks',
    completed: 'Completed tasks',
  };
  return labels[this.filter()];
});
```

```html
<!-- In the template .html -->
<ul [attr.aria-label]="ariaListLabel()"></ul>
```

### Pattern: `null` to remove an ARIA attribute

When a condition is false, binding `null` removes the attribute entirely from the DOM (correct behaviour — no `aria-invalid="false"` on valid fields).

```typescript
// In the template — aria-invalid only appears when there IS an error
[attr.aria - invalid] = "formErrors().title ? 'true' : null";
```

### Pattern: `aria-expanded` on toggle buttons

```typescript
protected readonly isMenuOpen = signal(false);

toggleMenu(): void {
  this.isMenuOpen.update(v => !v);
}
```

```html
<button
  type="button"
  [attr.aria-expanded]="isMenuOpen()"
  aria-controls="menu-panel"
  (click)="toggleMenu()"
>
  Menu
</button>
<div id="menu-panel" [hidden]="!isMenuOpen()">…</div>
```

### Pattern: `aria-busy` during loading

```typescript
protected readonly loading = computed(() => this.todoApiService.isLoading());
```

```html
<section [attr.aria-busy]="loading()">…</section>
```

---

## 3. Host Bindings for ARIA Roles and Labels

Use the `host` property in `@Component` to attach ARIA roles and labels to the component's **host element** (the custom element tag in the parent template). This avoids adding a redundant wrapper `<div>` inside the template.

```typescript
@Component({
  selector: 'app-todo-list',
  // ...
  host: {
    // CSS classes applied to the host element
    class: 'block w-full',

    // ARIA role on the host element
    // region (not main) — the outer <main> in app.html is the only main landmark
    role: 'region',

    // Dynamic label bound to a computed signal
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class TodoListComponent {
  protected readonly ariaLabel = computed(() => {
    const stats = this.todoStats();
    return `Todo list with ${stats.total} items, ${stats.active} active, ${stats.completed} completed`;
  });
}
```

### Landmark role rules

| Role          | When to use in Angular                          | Notes                                                            |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `main`        | Only once per page — use in `app.html` `<main>` | Never put on a component host if `app.html` already has `<main>` |
| `region`      | Significant sections of the page with a label   | Requires `aria-label` or `aria-labelledby`                       |
| `navigation`  | `<nav>` elements                                | Add `aria-label` to distinguish multiple navs                    |
| `banner`      | Page-level header                               | One per page                                                     |
| `contentinfo` | Page-level footer                               | One per page                                                     |
| `form`        | A `<form>` with a label                         | Use `aria-labelledby` pointing to a heading                      |
| `search`      | A search form                                   | Replaces `role="form"` for search                                |

### Do not duplicate landmarks

```typescript
// ❌ Wrong — app.html already has <main>, this creates two main landmarks
host: { 'role': 'main' }

// ✅ Correct — use region for a section of the page
host: { 'role': 'region', '[attr.aria-label]': 'ariaLabel()' }
```

---

## 4. Focus Management — `FocusTrap` and `FocusMonitor`

### `FocusTrap` — Modal dialogs and drawers

Prevents focus from escaping a container (required for modals per WCAG 2.1 SC 2.1.2).

```typescript
import { FocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';
import { ElementRef, inject, afterNextRender } from '@angular/core';

private readonly focusTrapFactory = inject(FocusTrapFactory);
private readonly elementRef = inject(ElementRef);
private focusTrap?: FocusTrap;

constructor() {
  // afterNextRender — SSR safe, runs only in the browser after first paint
  afterNextRender(() => {
    this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
    this.focusTrap.focusInitialElementWhenReady();
  });
}

ngOnDestroy(): void {
  this.focusTrap?.destroy();
}
```

### `FocusMonitor` — Track focus origin (mouse vs keyboard)

Lets you style differently for keyboard vs mouse focus (common pattern: show focus ring only for keyboard).

```typescript
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ElementRef, inject, OnDestroy, afterNextRender } from '@angular/core';

private readonly focusMonitor = inject(FocusMonitor);
private readonly elementRef = inject(ElementRef);

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

```html
<button type="button" [class.focus-visible]="focusOrigin() === 'keyboard'">Click me</button>
```

---

## 5. SSR Safety — `isPlatformBrowser`

Any code that accesses the DOM, `window`, `document`, or browser-only APIs must be guarded. Angular SSR renders components on the server where these APIs do not exist.

```typescript
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

private readonly platformId = inject(PLATFORM_ID);

someMethod(): void {
  if (isPlatformBrowser(this.platformId)) {
    // Safe — only runs in the browser
    document.getElementById('main-content')?.focus();
  }
}
```

### Prefer `afterNextRender()` for DOM access in lifecycle hooks

```typescript
import { afterNextRender } from '@angular/core';

constructor() {
  // Runs only in the browser, after the first render — no isPlatformBrowser needed
  afterNextRender(() => {
    this.initAccessibilityFeature();
  });
}
```

---

## 6. Keyboard Interaction Handlers

All interactive functionality accessible by mouse must also be accessible by keyboard (WCAG 2.1 SC 2.1.1).

### Enter key to submit a form

```typescript
onFormKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && this.isFormValid()) {
    this.onAddTodo();
  }
}
```

### Escape key to close / cancel

```typescript
onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    this.closePanel();
  }
}
```

### Arrow key navigation (custom widget)

For listboxes, menus, and tab panels that require roving `tabindex`, handle `ArrowUp` / `ArrowDown`:

```typescript
protected readonly focusedIndex = signal(0);

onListKeydown(event: KeyboardEvent): void {
  const items = this.items();
  if (event.key === 'ArrowDown') {
    event.preventDefault(); // stop page scroll
    this.focusedIndex.update(i => Math.min(i + 1, items.length - 1));
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    this.focusedIndex.update(i => Math.max(i - 1, 0));
  }
  if (event.key === 'Home') {
    this.focusedIndex.set(0);
  }
  if (event.key === 'End') {
    this.focusedIndex.set(items.length - 1);
  }
}
```

---

## 7. Form Validation and ARIA Error States

### Signal-based validation with ARIA error ids

```typescript
protected readonly formErrors = signal({ title: '', description: '' });

private validateField(field: 'title' | 'description'): void {
  const value = this.newTodoForm()[field].trim();
  const alphanumericPattern = /^[a-zA-Z0-9\s]+$/;

  let error = '';
  if (!value) {
    error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
  } else if (!alphanumericPattern.test(value)) {
    error = `${field.charAt(0).toUpperCase() + field.slice(1)} must contain only letters, numbers, and spaces`;
  }

  this.formErrors.update(errors => ({ ...errors, [field]: error }));
}
```

```html
<!-- Input with linked error message -->
<input
  id="todo-title"
  type="text"
  aria-required="true"
  [attr.aria-invalid]="formErrors().title ? 'true' : null"
  aria-describedby="title-error"
  (input)="onTitleInput($event)"
/>
<p id="title-error" role="alert" aria-live="polite">
  @if (formErrors().title) { {{ formErrors().title }} }
</p>
```

### Key ARIA attributes for forms

| Attribute                      | Value                                | Purpose                                        |
| ------------------------------ | ------------------------------------ | ---------------------------------------------- |
| `aria-required="true"`         | Static                               | Tells screen readers the field is mandatory    |
| `aria-invalid="true"`          | Dynamic — bind with `null` to remove | Field currently has a validation error         |
| `aria-describedby="error-id"`  | Static id reference                  | Links the input to its error message paragraph |
| `aria-labelledby="heading-id"` | Static id reference                  | Links a form section to its visible heading    |
| `aria-live="polite"`           | Static on error container            | Announces errors as they appear                |

---

## 8. Landmark Roles — Host vs Template

### Decision guide

```
Does the component represent an entire page section?
  └─ YES → Put role in host: { 'role': '...' } — avoids extra wrapper div
  └─ NO  → Put role in the template on the specific element
```

### Common mistakes

```typescript
// ❌ Creates two <main> landmarks — fails WCAG 1.3.6
@Component({
  host: { 'role': 'main' }
})

// ✅ One main in app.html, components use region
@Component({
  host: {
    'role': 'region',
    '[attr.aria-label]': '"Todo application"'
  }
})
```

```html
<!-- ❌ Missing label on region — fails WCAG 1.3.6 (region needs a name) -->
<section role="region">…</section>

<!-- ✅ Named region — screen readers list it in the landmarks menu -->
<section role="region" aria-labelledby="section-heading">
  <h2 id="section-heading">Active Tasks</h2>
</section>
```

---

## 9. Computed Labels for Lists and Regions

Dynamic content labels keep screen reader announcements accurate when state changes.

```typescript
// Label reflects the active filter
protected readonly ariaListLabel = computed(() => {
  const labels: Record<string, string> = {
    all: 'All tasks',
    active: 'Active tasks',
    completed: 'Completed tasks',
  };
  return labels[this.filter()];
});

// Label includes counts for the region host element
protected readonly ariaLabel = computed(() => {
  const stats = this.todoStats();
  return `Todo list with ${stats.total} items, ${stats.active} active, ${stats.completed} completed`;
});

// Per-item action button labels include the item name
// (Defined as input() in TodoItemComponent)
// In template: [attr.aria-label]="'Edit: ' + todo().title"
//              [attr.aria-label]="'Delete: ' + todo().title"
```

### Why per-item labels matter

Without a title in the button label, a screen reader announces "Edit button, Edit button, Edit button…" for every item in the list. With `'Edit: Buy groceries'` the user knows exactly which item they are acting on — essential for WCAG 2.4.6 Headings and Labels and 2.4.9 Link Purpose.

---

## 10. Testing Accessibility in `.spec.ts`

### Test that ARIA attributes update with signals

```typescript
it('sets aria-invalid on the title input when there is a validation error', () => {
  // Trigger validation
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
```

### Test that LiveAnnouncer is called

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';

let liveAnnouncer: LiveAnnouncer;

beforeEach(() => {
  liveAnnouncer = TestBed.inject(LiveAnnouncer);
  vi.spyOn(liveAnnouncer, 'announce');
});

it('announces deletion assertively', () => {
  component.onTodoDeleted('todo-1');
  expect(liveAnnouncer.announce).toHaveBeenCalledWith(
    expect.stringContaining('deleted'),
    'assertive',
  );
});

it('announces toggle with correct completion state', () => {
  component.onTodoToggled('todo-1'); // assuming todo-1 is incomplete
  expect(liveAnnouncer.announce).toHaveBeenCalledWith(
    expect.stringContaining('marked as complete'),
    'polite',
  );
});
```

### Test host role and label

```typescript
it('has role="region" on the host element', () => {
  expect(fixture.nativeElement.getAttribute('role')).toBe('region');
});

it('sets aria-label on the host element from computed signal', () => {
  const label = fixture.nativeElement.getAttribute('aria-label');
  expect(label).toContain('Todo list');
});
```

### Test list label updates on filter change

```typescript
it('updates the ul aria-label when the filter changes', () => {
  component.onFilterChanged('active');
  fixture.detectChanges();

  const ul = fixture.nativeElement.querySelector('ul');
  expect(ul.getAttribute('aria-label')).toBe('Active tasks');
});
```

---

## Quick Reference — ARIA Patterns Cheat Sheet

| Need                        | Angular TypeScript pattern                                            |
| --------------------------- | --------------------------------------------------------------------- |
| Announce dynamic change     | `inject(LiveAnnouncer)` → `.announce(msg, 'polite'\|'assertive')`     |
| Dynamic aria attribute      | `computed()` signal + `[attr.aria-label]="signal()"`                  |
| Remove attribute when false | `[attr.aria-invalid]="condition ? 'true' : null"`                     |
| Role on host element        | `host: { 'role': 'region', '[attr.aria-label]': 'signal()' }`         |
| Trap focus in modal         | `inject(FocusTrapFactory)` + `afterNextRender`                        |
| SSR-safe DOM access         | `inject(PLATFORM_ID)` + `isPlatformBrowser()` or `afterNextRender()`  |
| Keyboard submit             | `if (event.key === 'Enter' && valid) submit()`                        |
| Keyboard dismiss            | `if (event.key === 'Escape') close()`                                 |
| Per-item button labels      | `[attr.aria-label]="'Edit: ' + item().name"`                          |
| Form field error link       | `aria-describedby="error-id"` + `id="error-id"` on `<p role="alert">` |
