# Angular Accessibility Patterns

## Essential ARIA Patterns

### Interactive Elements

```typescript
@Component({
  template: `
    <!-- Button with proper ARIA -->
    <button
      [attr.aria-pressed]="isToggled()"
      [attr.aria-describedby]="helpId"
      (click)="toggle()"
      class="btn">
      {{ isToggled() ? 'Enabled' : 'Disabled' }}
    </button>
    <div [id]="helpId" class="sr-only">
      Click to toggle the feature state
    </div>

    <!-- Form with proper labels -->
    <label [for]="inputId" class="form-label">
      Todo Title
      <span aria-hidden="true" class="required">*</span>
    </label>
    <input
      [id]="inputId"
      [attr.aria-invalid]="hasError() ? 'true' : null"
      [attr.aria-describedby]="hasError() ? errorId : null"
      [(ngModel)]="todoTitle"
      class="form-input"
      required>
    @if (hasError()) {
      <div [id]="errorId" role="alert" class="error-message">
        Todo title is required
      </div>
    }

    <!-- Lists with proper semantics -->
    <ul role="list" [attr.aria-label]="listLabel()">
      @for (todo of todos(); track todo.id) {
        <li role="listitem" [attr.aria-describedby]="todo.id + '-desc'">
          <span [class.line-through]="todo.completed">{{ todo.title }}</span>
          <span [id]="todo.id + '-desc'" class="sr-only">
            {{ todo.completed ? 'Completed' : 'Pending' }} task
          </span>
        </li>
      }
    </ul>
  `
})
```

### Loading States

```typescript
@Component({
  template: `
    <!-- Loading indicator -->
    @if (loading()) {
      <div role="status" aria-live="polite" aria-label="Loading todos">
        <span aria-hidden="true">⏳</span>
        Loading...
      </div>
    }

    <!-- Live region for status updates -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ statusMessage() }}
    </div>
  `,
})
export class TodoListComponent {
  readonly loading = signal(false);
  readonly statusMessage = signal('');

  addTodo(title: string): void {
    this.loading.set(true);
    this.statusMessage.set('Adding new todo...');

    this.todoService.addTodo(title).subscribe({
      next: () => {
        this.loading.set(false);
        this.statusMessage.set('Todo added successfully');
      },
      error: () => {
        this.loading.set(false);
        this.statusMessage.set('Failed to add todo');
      },
    });
  }
}
```

### Focus Management

```typescript
@Component({
  template: `
    <!-- Modal with focus trap -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()" cdkTrapFocus cdkTrapFocusAutoCapture>
        <div
          role="dialog"
          [attr.aria-labelledby]="modalTitleId"
          [attr.aria-describedby]="modalDescId"
          class="modal-content"
        >
          <h2 [id]="modalTitleId">Add New Todo</h2>
          <p [id]="modalDescId">Enter details for your new todo item</p>

          <!-- Form content -->

          <div class="modal-actions">
            <button (click)="save()" class="btn-primary">Save</button>
            <button (click)="closeModal()" class="btn-secondary" #cancelButton>Cancel</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class TodoFormComponent {
  @ViewChild('cancelButton') cancelButton!: ElementRef<HTMLButtonElement>;

  private readonly focusOrigin = signal<HTMLElement | null>(null);

  openModal(triggerElement: HTMLElement): void {
    this.focusOrigin.set(triggerElement);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    // Return focus to the original trigger
    this.focusOrigin()?.focus();
    this.focusOrigin.set(null);
  }
}
```

## TailwindCSS Accessibility Classes

### Screen Reader Support

```css
/* Screen reader only - visible to assistive technology */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
  clip: rect(0, 0, 0, 0);
}

/* Focus visible - only when keyboard focused */
.focus-visible {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2;
}

/* High contrast mode support */
.border-solid {
  border-style: solid;
}
```

### Focus Indicators

```html
<!-- Button with proper focus states -->
<button
  class="
  px-4 py-2 
  bg-blue-500 text-white 
  rounded-md
  
  hover:bg-blue-600
  focus:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-blue-500 
  focus-visible:ring-offset-2
  
  disabled:opacity-50 
  disabled:cursor-not-allowed
  disabled:hover:bg-blue-500
"
>
  Action
</button>

<!-- Link with focus states -->
<a
  class="
  text-blue-600 underline
  
  hover:text-blue-800
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-blue-500
  focus-visible:rounded-sm
  
  visited:text-purple-600
"
>
  Learn more
</a>
```

## Testing Accessibility

### AXE Integration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/test-setup.ts'],
    environment: 'happy-dom',
  },
});

// src/test-setup.ts
import 'jest-axe/extend-expect';

// Component test
import { render } from '@testing-library/angular';
import { axe, toHaveNoViolations } from 'jest-axe';

describe('TodoComponent Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = await render(TodoComponent, {
      componentInputs: { todos: mockTodos },
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const { getByRole } = await render(TodoComponent);
    const button = getByRole('button', { name: /add todo/i });

    button.focus();
    expect(button).toHaveFocus();

    // Test keyboard interaction
    await userEvent.keyboard('{Enter}');
    expect(mockAddTodo).toHaveBeenCalled();
  });
});
```

## WCAG Guidelines Checklist

### Level AA Requirements

- ✅ Color contrast ratio 4.5:1 for normal text, 3:1 for large text
- ✅ Text can be resized up to 200% without horizontal scrolling
- ✅ All interactive elements are keyboard accessible
- ✅ Focus indicators are visible and clear
- ✅ Form fields have associated labels
- ✅ Error messages are programmatically associated with fields
- ✅ Headings follow logical hierarchy (h1 → h2 → h3)
- ✅ Lists use proper semantic markup
- ✅ Images have descriptive alt text
- ✅ Videos have captions and transcripts
