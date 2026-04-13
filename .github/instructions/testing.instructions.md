---
description: 'Use when writing tests for Angular components, services, and other code using Vitest framework. Covers testing patterns, signal testing, and component testing strategies.'
name: 'Angular Vitest Testing'
applyTo: 'src/**/*.spec.ts'
---

# Angular Vitest Testing Guidelines

## Basic Test Setup

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentName], // Standalone components
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Signal Testing Patterns

```typescript
it('should update signal value', () => {
  // Test signal initial value
  expect(component.items()).toEqual([]);

  // Trigger signal update
  component.addItem('test');

  // Test signal updated value
  expect(component.items()).toContain('test');
});

it('should compute derived values correctly', () => {
  component.todos.set([
    { id: 1, title: 'Todo 1', completed: false },
    { id: 2, title: 'Todo 2', completed: true },
  ]);

  // Test computed signal
  expect(component.completedCount()).toBe(1);
  expect(component.activeCount()).toBe(1);
});
```

## Service Testing

```typescript
import { TestBed } from '@angular/core/testing';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should add todo', () => {
    const todo = { title: 'Test Todo', completed: false };
    service.addTodo(todo);

    expect(service.todos()).toHaveLength(1);
    expect(service.todos()[0].title).toBe('Test Todo');
  });
});
```

## Component Interaction Testing

```typescript
it('should emit event when button clicked', () => {
  const spy = vi.spyOn(component.todoAdded, 'emit');

  // Simulate user interaction
  const button = fixture.debugElement.query(By.css('[data-testid="add-todo"]'));
  button.nativeElement.click();

  expect(spy).toHaveBeenCalledWith(expect.any(Object));
});
```

## Mock Patterns

```typescript
import { vi } from 'vitest';

// Mock service
const mockTodoService = {
  todos: signal([]),
  addTodo: vi.fn(),
  deleteTodo: vi.fn(),
};

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ComponentName],
    providers: [{ provide: TodoService, useValue: mockTodoService }],
  }).compileComponents();
});
```

## Testing Best Practices

- Use `data-testid` attributes for reliable element selection
- Test component behavior, not implementation details
- Focus on user interactions and observable outcomes
- Mock external dependencies and services
- Test signal state changes and computed values
- Use descriptive test names that explain the behavior being tested

## Error Prevention in Tests

### Component Property Visibility

- Use `public` for properties that tests need to read directly
- Add a `public` getter for properties that must stay `protected` in the component
- Never access internals with `(component as any).x` — it bypasses type safety and breaks on refactor
- Do not expose internal `WritableSignal` state outside the class — test through public methods

### HTTP Call Mocking with HttpTestingController

```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

let httpMock: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MyService],
  });
  httpMock = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpMock.verify(); // Fails the test if there are unmatched requests
});

it('should load todos from API', () => {
  service.getAll();
  const req = httpMock.expectOne('/api/todos');
  expect(req.request.method).toBe('GET');
  req.flush([{ id: 1, title: 'Test', completed: false }]);
  expect(service.todos()).toHaveLength(1);
});

it('should set error signal when API fails', () => {
  service.getAll();
  const req = httpMock.expectOne('/api/todos');
  req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  expect(service.error()).toBeTruthy();
});
```

### Event Object Mocking

Do not cast `{}` directly to `Event` — use `as unknown as Event` to avoid TypeScript conversion errors:

```typescript
// ❌ Type error: '{}' cannot be converted to type 'Event'
const event = {} as Event;

// ✅ Correct pattern
const inputEvent = { target: { value: 'new text' } } as unknown as InputEvent;
component.onInput(inputEvent);

// ✅ For checkbox events
const checkboxEvent = { target: { checked: true } } as unknown as Event;
component.onToggle(checkboxEvent);
```

### Test Coverage Minimums

- Every component must have a `.spec.ts` file — no exceptions
- Test: initial signal values on component creation
- Test: signal updates after user actions (`set`, `update`)
- Test: `computed()` derivations produce correct values
- Test: error state (what happens when an API call fails)
- Test: at least one test per `public` method on services
- Test: `aria-label` or visible label present on interactive elements
