---
description: 'Use when creating or modifying Angular components, services, pipes, guards, and other Angular TypeScript files. Covers Angular 21 modern patterns, standalone components, signals, and SSR compatibility.'
name: 'Angular Code Generation'
applyTo: 'src/**/*.ts'
---

# Angular 21 Code Generation Guidelines

## Component Structure (Following Official Angular Best Practices)

```typescript
import { Component, signal, computed, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-feature-name',
  imports: [], // List standalone dependencies
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // Required for all components
})
export class FeatureNameComponent {
  // Use input() function instead of @Input() decorator
  readonly initialItems = input<Item[]>([]);

  // Use output() function instead of @Output() decorator
  readonly itemSelected = output<Item>();

  // Use signals for state
  protected readonly items = signal<Item[]>([]);
  protected readonly loading = signal(false);

  // Use computed for derived state
  protected readonly itemCount = computed(() => this.items().length);

  // Use update() or set() instead of mutate()
  addItem(item: Item): void {
    this.items.update((items) => [...items, item]);
  }
}
```

## Modern Angular Patterns

### Dependency Injection

```typescript
// Use inject() function
constructor() {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
}
```

### Signals over Observables

```typescript
// Prefer signals for component state
protected readonly todos = signal<Todo[]>([]);
protected readonly filter = signal<'all' | 'active' | 'completed'>('all');

// Use computed for derived state
protected readonly filteredTodos = computed(() => {
  const todos = this.todos();
  const filter = this.filter();
  return todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
});
```

### Control Flow Syntax

```html
<!-- Use @if instead of *ngIf -->
@if (loading()) {
<div class="spinner">Loading...</div>
}

<!-- Use @for instead of *ngFor -->
@for (todo of todos(); track todo.id) {
<div class="todo-item">{{ todo.title }}</div>
}

<!-- Use @switch instead of *ngSwitch -->
@switch (status()) { @case ('loading') {
<div>Loading...</div>
} @case ('error') {
<div>Error occurred</div>
} @default {
<div>Content</div>
} }
```

## Service Patterns

```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly _todos = signal<Todo[]>([]);

  // Expose readonly signal
  public readonly todos = this._todos.asReadonly();

  addTodo(todo: Omit<Todo, 'id'>): void {
    const newTodo = { ...todo, id: crypto.randomUUID() };
    this._todos.update((todos) => [...todos, newTodo]);
  }
}
```

## SSR Compatibility Rules

- Always check for browser environment before using browser-only APIs
- Use `isPlatformBrowser()` from `@angular/common`
- Avoid direct DOM manipulation in component logic
- Use afterNextRender() or afterRender() for browser-only operations

## Testing Patterns

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

describe('FeatureComponent', () => {
  let component: FeatureComponent;
  let fixture: ComponentFixture<FeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureComponent], // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureComponent);
    component = fixture.componentInstance;
  });

  it('should update signal when action is performed', () => {
    component.performAction();
    expect(component.items()).toHaveLength(1);
  });
});
```

## File Organization

### Standard Folder Structure

- **Components**: Place in `src/app/components/[component-name]/`
- **Services**: Place in `src/app/services/`
- **Interfaces/Models**: Place in `src/app/interfaces/`
- **Guards**: Place in `src/app/guards/`
- **Pipes**: Place in `src/app/pipes/`
- **Features**: Place in `src/app/features/[feature-name]/`
- **Shared utilities**: Place in `src/app/shared/`

### Component File Requirements

**ALWAYS create all 4 files for every component:**

```
src/app/components/component-name/
├── component-name.component.ts    # Component logic with signals
├── component-name.component.html  # Template with control flow
├── component-name.component.css   # TailwindCSS styling
└── component-name.component.spec.ts # Vitest tests
```

### File Naming Conventions

- Use kebab-case for files and folders (`todo-item.component.ts`)
- Use PascalCase for classes (`TodoItemComponent`)
- Use index.ts files for clean imports where appropriate

## Development Boundaries

### Component Creation Rules

- **Single Responsibility**: Each component should have one clear purpose
- **Small and Focused**: Avoid creating large components with multiple concerns
- **Minimal API Surface**: Only expose properties and methods that are actually needed
- **No Speculative Features**: Don't add functionality that wasn't explicitly requested

### Code Generation Standards

- **Verified Imports**: Only use imports that exist in Angular 21 and installed dependencies
- **No Deprecated APIs**: Avoid using deprecated Angular patterns or APIs
- **Consistent Patterns**: Follow the established patterns shown in existing project files
- **Explicit Requirements**: When user requirements are unclear, ask for clarification rather than making assumptions
- **Standard Structure**: Always use the defined folder structure and create all 4 component files
- **Proper File Placement**: Place files in correct directories based on their type (components, services, interfaces)

### Implementation Guidelines

- **Start Minimal**: Create basic working implementation first, enhance only when requested
- **Official Best Practices**: Always use Angular MCP server to verify current best practices before code generation
- **Validate Syntax**: Ensure all generated TypeScript code follows strict mode and compiles correctly
- **Test Compatibility**: Generated components should work with both development and SSR builds
- **Accessibility Compliance**: All generated code must pass AXE checks and follow WCAG AA standards
- **Performance Optimized**: Use OnPush change detection and NgOptimizedImage for static images

## Angular Best Practices Enforcement

**ALWAYS reference Angular MCP server before generating code to ensure:**

- Latest Angular patterns and APIs
- Proper standalone component structure (standalone is default, don't set to true)
- Correct signal usage patterns (use update/set, never mutate)
- Accessibility compliance (AXE checks, WCAG AA)
- Performance optimization techniques
- Native control flow (@if, @for, @switch instead of *ngIf, *ngFor, \*ngSwitch)
- Use input()/output() functions instead of @Input()/@Output() decorators
- Host bindings inside component decorators, not @HostBinding/@HostListener

**ALWAYS reference Angular MCP server before generating code to ensure:**

- Latest Angular patterns and APIs
- Proper standalone component structure
- Correct signal usage patterns
- Accessibility compliance
- Performance optimization techniques
