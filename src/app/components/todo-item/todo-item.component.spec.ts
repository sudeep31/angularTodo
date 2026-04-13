import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../interfaces/todo.interface';

describe('TodoItemComponent', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;

  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['test', 'angular']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('todo', mockTodo);

    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have proper initial state', () => {
      expect(component.todo()).toEqual(mockTodo);
      expect(component.disabled()).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    it('should compute aria label correctly', () => {
      expect(component.testAriaLabel()).toContain('Pending todo: Test Todo');
    });

    it('should compute aria label for completed todo', () => {
      const completedTodo = { ...mockTodo, completed: true };
      fixture.componentRef.setInput('todo', completedTodo);
      fixture.detectChanges();

      expect(component.testAriaLabel()).toContain('Completed todo: Test Todo');
    });

    it('should compute priority class correctly', () => {
      expect(component.testPriorityClass()).toBe('priority-medium');
    });

    it('should compute completed class correctly', () => {
      expect(component.testCompletedClass()).toBe('');

      const completedTodo = { ...mockTodo, completed: true };
      fixture.componentRef.setInput('todo', completedTodo);
      fixture.detectChanges();

      expect(component.testCompletedClass()).toBe('completed');
    });
  });

  describe('Event Emissions', () => {
    it('should emit todoToggled when toggle is called', () => {
      const emitSpy = vi.spyOn(component.todoToggled, 'emit');

      component.onToggleComplete();

      expect(emitSpy).toHaveBeenCalledWith('1');
    });

    it('should emit todoDeleted when delete is called', () => {
      const emitSpy = vi.spyOn(component.todoDeleted, 'emit');

      component.onDelete();

      expect(emitSpy).toHaveBeenCalledWith('1');
    });

    it('should emit todoEdited when edit is called', () => {
      const emitSpy = vi.spyOn(component.todoEdited, 'emit');

      component.onEdit();

      expect(emitSpy).toHaveBeenCalledWith(mockTodo);
    });

    it('should not emit events when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const toggleSpy = vi.spyOn(component.todoToggled, 'emit');
      const deleteSpy = vi.spyOn(component.todoDeleted, 'emit');
      const editSpy = vi.spyOn(component.todoEdited, 'emit');

      component.onToggleComplete();
      component.onDelete();
      component.onEdit();

      expect(toggleSpy).not.toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
      expect(editSpy).not.toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should render todo title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const titleElement = compiled.querySelector('h3');

      expect(titleElement?.textContent?.trim()).toBe('Test Todo');
    });

    it('should render todo description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const descriptionElement = compiled.querySelector('p');

      expect(descriptionElement?.textContent?.trim()).toBe('Test Description');
    });

    it('should render priority badge', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const priorityBadge = compiled.querySelector('.priority-badge');

      expect(priorityBadge?.textContent?.trim()).toBe('Medium');
      expect(priorityBadge?.classList.contains('priority-medium')).toBe(true);
    });

    it('should render tags', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const tags = compiled.querySelectorAll('[class*="bg-gray-100"]');

      expect(tags).toHaveLength(2);
      expect(tags[0].textContent?.trim()).toBe('test');
      expect(tags[1].textContent?.trim()).toBe('angular');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const hostElement = compiled.querySelector('[aria-label]');

      expect(hostElement?.getAttribute('aria-label')).toContain('Pending todo: Test Todo');
    });

    it('should have proper button labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('[aria-pressed]');
      const editButton = compiled.querySelector('[aria-label*="Edit"]');
      const deleteButton = compiled.querySelector('[aria-label*="Delete"]');

      expect(toggleButton?.getAttribute('aria-label')).toContain('Mark Test Todo as complete');
      expect(editButton?.getAttribute('aria-label')).toBe('Edit Test Todo');
      expect(deleteButton?.getAttribute('aria-label')).toBe('Delete Test Todo');
    });

    it('should be keyboard accessible', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      buttons.forEach(button => {
        expect(button.getAttribute('tabindex')).not.toBe('-1');
      });
    });
  });
});
