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
