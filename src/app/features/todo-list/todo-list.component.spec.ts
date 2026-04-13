import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoListComponent } from './todo-list.component';
import { TodoItemComponent } from '../../components/todo-item/todo-item.component';
import { Todo } from '../../interfaces/todo.interface';

// Mock todo list
const MOCK_TODOS: Todo[] = [
  {
    id: 'mock-1',
    title: 'Buy groceries',
    description: 'Milk eggs and bread',
    completed: false,
    priority: 'high',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    tags: ['shopping']
  },
  {
    id: 'mock-2',
    title: 'Read a book',
    description: 'Finish the current chapter',
    completed: true,
    priority: 'medium',
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02'),
    tags: []
  },
  {
    id: 'mock-3',
    title: 'Go for a run',
    description: 'Morning jog in the park',
    completed: false,
    priority: 'low',
    createdAt: new Date('2026-01-03'),
    updatedAt: new Date('2026-01-03'),
    tags: ['fitness']
  }
];

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  const createInputEvent = (value: string): Event =>
    Object.defineProperty({}, 'target', { value: { value }, enumerable: true }) as Event;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent, TodoItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── 1. INITIAL LOADING ──────────────────────────────────────────
  describe('Initial Loading', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load sample todos on init', () => {
      expect(component.testTodos().length).toBeGreaterThan(0);
    });

    it('should start with filter set to "all"', () => {
      expect(component.testFilter()).toBe('all');
    });

    it('should start with loading flag as false', () => {
      expect(component.testLoading()).toBe(false);
    });

    it('should have an empty form on init', () => {
      const form = component.testNewTodoForm();
      expect(form.title).toBe('');
      expect(form.description).toBe('');
      expect(form.priority).toBe('medium');
      expect(form.dueDate).toBe('');
    });

    it('should have no form errors on init', () => {
      expect(component.testFormErrors().title).toBe('');
      expect(component.testFormErrors().description).toBe('');
    });

    it('should have form invalid on init (empty fields)', () => {
      expect(component.testIsFormValid()).toBeFalsy();
    });
  });

  // ─── 2. ADDING A TODO VIA FORM ───────────────────────────────────
  describe('Adding a Todo via Form', () => {
    beforeEach(() => {
      component.testTodos.set([...MOCK_TODOS]);
    });

    it('should add a new todo when both fields are valid', () => {
      component.onTitleInput(createInputEvent('Walk the dog'));
      component.onDescriptionInput(createInputEvent('Take Rex to the park'));
      const before = component.testTodos().length;

      component.onAddTodo();

      expect(component.testTodos().length).toBe(before + 1);
      const added = component.testTodos().at(-1)!;
      expect(added.title).toBe('Walk the dog');
      expect(added.description).toBe('Take Rex to the park');
      expect(added.completed).toBe(false);
    });

    it('should reset the form after a successful submission', () => {
      component.onTitleInput(createInputEvent('Walk the dog'));
      component.onDescriptionInput(createInputEvent('Take Rex to the park'));
      component.onAddTodo();

      const form = component.testNewTodoForm();
      expect(form.title).toBe('');
      expect(form.description).toBe('');
      expect(form.priority).toBe('medium');
    });

    it('should NOT add a todo when the form is invalid', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const before = component.testTodos().length;

      component.onAddTodo();

      expect(component.testTodos().length).toBe(before);
      expect(consoleSpy).toHaveBeenCalledWith('Form is invalid, cannot submit');
      consoleSpy.mockRestore();
    });

    it('should add a new todo to the mock list and verify it appears', () => {
      component.onTitleInput(createInputEvent('New task'));
      component.onDescriptionInput(createInputEvent('Task description'));
      component.onAddTodo();

      expect(component.testTodos().length).toBe(MOCK_TODOS.length + 1);
      expect(component.testTodos().at(-1)!.title).toBe('New task');
    });

    it('should respect priority selection when adding', () => {
      component.onTitleInput(createInputEvent('High priority task'));
      component.onDescriptionInput(createInputEvent('Urgent work'));
      component.onPriorityChange(createInputEvent('high'));
      component.onAddTodo();

      expect(component.testTodos().at(-1)!.priority).toBe('high');
    });
  });

  // ─── 3. FORM ERROR MESSAGES ───────────────────────────────────────
  describe('Form Error Messages', () => {
    it('should show "Title is required" when title is empty', () => {
      component.onTitleInput(createInputEvent(''));

      expect(component.testFormErrors().title).toBe('Title is required');
      expect(component.testIsFormValid()).toBeFalsy();
    });

    it('should show pattern error when title has special characters', () => {
      component.onTitleInput(createInputEvent('Invalid@#$'));

      expect(component.testFormErrors().title).toBe(
        'Title should only contain letters, numbers, and spaces'
      );
    });

    it('should show "Description is required" when description is empty', () => {
      component.onDescriptionInput(createInputEvent(''));

      expect(component.testFormErrors().description).toBe('Description is required');
    });

    it('should show pattern error when description has special characters', () => {
      component.onDescriptionInput(createInputEvent('Bad!@#'));

      expect(component.testFormErrors().description).toBe(
        'Description should only contain letters, numbers, and spaces'
      );
    });

    it('should clear title error when valid title is entered after invalid', () => {
      component.onTitleInput(createInputEvent('Bad@Title'));
      expect(component.testFormErrors().title).not.toBe('');

      component.onTitleInput(createInputEvent('Good Title'));
      expect(component.testFormErrors().title).toBe('');
    });

    it('should mark form valid only when both fields pass validation', () => {
      component.onTitleInput(createInputEvent('Valid title'));
      expect(component.testIsFormValid()).toBeFalsy(); // description still empty

      component.onDescriptionInput(createInputEvent('Valid description'));
      expect(component.testIsFormValid()).toBe(true);
    });
  });

  // ─── 4. LIST ITEMS (with mock data) ──────────────────────────────
  describe('List Items', () => {
    beforeEach(() => {
      component.testTodos.set([...MOCK_TODOS]);
    });

    it('should display all mock todos', () => {
      expect(component.testTodos().length).toBe(3);
      expect(component.testTodos()[0].title).toBe('Buy groceries');
      expect(component.testTodos()[1].title).toBe('Read a book');
      expect(component.testTodos()[2].title).toBe('Go for a run');
    });

    it('should report correct stats for the mock list', () => {
      const stats = component.testTodoStats();
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);    // mock-1 and mock-3 are incomplete
      expect(stats.completed).toBe(1); // mock-2 is done
    });

    it('should toggle a todo from incomplete to complete', () => {
      component.onTodoToggled('mock-1');

      const toggled = component.testTodos().find(t => t.id === 'mock-1')!;
      expect(toggled.completed).toBe(true);
    });

    it('should toggle a todo from complete to incomplete', () => {
      component.onTodoToggled('mock-2');

      const toggled = component.testTodos().find(t => t.id === 'mock-2')!;
      expect(toggled.completed).toBe(false);
    });

    it('should delete a todo from the mock list', () => {
      component.onTodoDeleted('mock-2');

      expect(component.testTodos().length).toBe(2);
      expect(component.testTodos().find(t => t.id === 'mock-2')).toBeUndefined();
    });

    it('should add a new item to the mock list', () => {
      component.onTitleInput(createInputEvent('Exercise'));
      component.onDescriptionInput(createInputEvent('Gym session at 6pm'));
      component.onAddTodo();

      expect(component.testTodos().length).toBe(4);
      expect(component.testTodos().at(-1)!.title).toBe('Exercise');
    });

    it('should update stats after toggling a todo', () => {
      component.onTodoToggled('mock-1'); // was active, now complete

      const stats = component.testTodoStats();
      expect(stats.active).toBe(1);
      expect(stats.completed).toBe(2);
    });

    it('should clear all completed todos', () => {
      component.onClearCompleted();

      expect(component.testTodos().length).toBe(2);
      expect(component.testTodos().every(t => !t.completed)).toBe(true);
    });
  });
});
