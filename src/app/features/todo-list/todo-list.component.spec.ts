import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoListComponent } from './todo-list.component';
import { TodoItemComponent } from '../../components/todo-item/todo-item.component';
import { Todo } from '../../interfaces/todo.interface';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent, TodoItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with sample data', () => {
      expect(component.todos().length).toBeGreaterThan(0);
    });

    it('should have proper initial state', () => {
      expect(component.filter()).toBe('all');
      expect(component.loading()).toBe(false);
      expect(component.newTodoTitle()).toBe('');
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Active Todo',
          completed: false,
          priority: 'high',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Completed Todo',
          completed: true,
          priority: 'low',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      component.todos.set(testTodos);
    });

    it('should filter todos by status', () => {
      // All todos
      component.filter.set('all');
      expect(component.filteredTodos()).toHaveLength(2);

      // Active todos only
      component.filter.set('active');
      expect(component.filteredTodos()).toHaveLength(1);
      expect(component.filteredTodos()[0].completed).toBe(false);

      // Completed todos only
      component.filter.set('completed');
      expect(component.filteredTodos()).toHaveLength(1);
      expect(component.filteredTodos()[0].completed).toBe(true);
    });

    it('should compute todo statistics correctly', () => {
      const stats = component.todoStats();
      expect(stats.total).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.completed).toBe(1);
    });

    it('should compute aria label correctly', () => {
      const ariaLabel = component.ariaLabel();
      expect(ariaLabel).toContain('2 items');
      expect(ariaLabel).toContain('1 active');
      expect(ariaLabel).toContain('1 completed');
    });

    it('should compute helper flags correctly', () => {
      expect(component.hasActiveTodos()).toBe(true);
      expect(component.hasCompletedTodos()).toBe(true);
    });
  });

  describe('Todo Management', () => {
    beforeEach(() => {
      component.todos.set([]);
    });

    it('should add new todo', () => {
      component.newTodoTitle.set('New Test Todo');
      component.onAddTodo();

      expect(component.todos()).toHaveLength(1);
      expect(component.todos()[0].title).toBe('New Test Todo');
      expect(component.todos()[0].completed).toBe(false);
      expect(component.newTodoTitle()).toBe('');
    });

    it('should not add empty todo', () => {
      component.newTodoTitle.set('   ');
      component.onAddTodo();

      expect(component.todos()).toHaveLength(0);
    });

    it('should toggle todo completion', () => {
      const todo: Todo = {
        id: '1',
        title: 'Test Todo',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      component.todos.set([todo]);

      component.onTodoToggled('1');

      expect(component.todos()[0].completed).toBe(true);
    });

    it('should delete todo', () => {
      const todo: Todo = {
        id: '1',
        title: 'Test Todo',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      component.todos.set([todo]);

      component.onTodoDeleted('1');

      expect(component.todos()).toHaveLength(0);
    });

    it('should edit todo', () => {
      const todo: Todo = {
        id: '1',
        title: 'Original Title',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      component.todos.set([todo]);

      const updatedTodo = { ...todo, title: 'Updated Title' };
      component.onTodoEdited(updatedTodo);

      expect(component.todos()[0].title).toBe('Updated Title');
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Todo 1',
          completed: false,
          priority: 'high',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Todo 2',
          completed: true,
          priority: 'low',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      component.todos.set(testTodos);
    });

    it('should toggle all todos to completed when not all are completed', () => {
      component.onToggleAll();

      expect(component.todos().every(todo => todo.completed)).toBe(true);
    });

    it('should toggle all todos to incomplete when all are completed', () => {
      // First mark all as completed
      component.todos.update(todos => todos.map(todo => ({ ...todo, completed: true })));

      component.onToggleAll();

      expect(component.todos().every(todo => !todo.completed)).toBe(true);
    });

    it('should clear completed todos', () => {
      component.onClearCompleted();

      expect(component.todos()).toHaveLength(1);
      expect(component.todos()[0].completed).toBe(false);
    });
  });

  describe('User Input Handling', () => {
    it('should handle input changes', () => {
      const mockEvent = {
        target: { value: 'New Todo Title' }
      } as Event;

      component.onNewTodoInput(mockEvent);

      expect(component.newTodoTitle()).toBe('New Todo Title');
    });

    it('should handle Enter key to add todo', () => {
      component.newTodoTitle.set('Test Todo');

      const mockEvent = {
        key: 'Enter'
      } as KeyboardEvent;

      const initialLength = component.todos().length;
      component.onNewTodoKeydown(mockEvent);

      expect(component.todos()).toHaveLength(initialLength + 1);
    });

    it('should ignore other keys', () => {
      const mockEvent = {
        key: 'Escape'
      } as KeyboardEvent;

      const initialLength = component.todos().length;
      component.onNewTodoKeydown(mockEvent);

      expect(component.todos()).toHaveLength(initialLength);
    });
  });

  describe('Filter Management', () => {
    it('should change filter', () => {
      component.onFilterChanged('active');
      expect(component.filter()).toBe('active');

      component.onFilterChanged('completed');
      expect(component.filter()).toBe('completed');

      component.onFilterChanged('all');
      expect(component.filter()).toBe('all');
    });
  });

  describe('Template Rendering', () => {
    it('should render header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('h1');

      expect(header?.textContent?.trim()).toBe('Todo App');
    });

    it('should render add todo form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('#new-todo-input');
      const button = compiled.querySelector('button[aria-label="Add new todo"]');

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();
    });

    it('should render todo statistics', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const stats = compiled.querySelector('#todo-count');

      expect(stats?.textContent).toContain('total');
      expect(stats?.textContent).toContain('active');
      expect(stats?.textContent).toContain('completed');
    });

    it('should render filter tabs when todos exist', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const filterTabs = compiled.querySelectorAll('[role="tab"]');

      expect(filterTabs).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      const main = compiled.querySelector('[role="main"]');
      const tablist = compiled.querySelector('[role="tablist"]');
      const tabpanel = compiled.querySelector('[role="tabpanel"]');

      expect(main).toBeTruthy();
      expect(tablist).toBeTruthy();
      expect(tabpanel).toBeTruthy();
    });

    it('should have proper form labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('#new-todo-input');
      const label = compiled.querySelector('label[for="new-todo-input"]');

      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
    });

    it('should have live regions for dynamic content', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const liveRegions = compiled.querySelectorAll('[aria-live]');

      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });
});
