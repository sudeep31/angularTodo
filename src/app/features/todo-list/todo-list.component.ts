import { Component, signal, computed, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Todo } from '../../interfaces/todo.interface';
import { TodoApiService } from '../../services/todo-api.service';
import { TodoItemComponent } from '../../components/todo-item/todo-item.component';
import { DeadlineTimerComponent } from '../dead-line/deadline-timer.component'

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent, DeadlineTimerComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block w-full',
    // region (not main) — WCAG 1.3.6: the outer <main> in app.html is the only main landmark
    'role': 'region',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class TodoListComponent implements OnInit {
  private readonly todoApiService = inject(TodoApiService);
  // LiveAnnouncer — CDK service that posts to an aria-live region so screen
  // readers hear dynamic changes (add / delete / toggle / filter) that would
  // otherwise be silent because the DOM updates happen outside focus.
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  // ── MFE Stats — input() signals (Angular 17+) ────────────────────────────
  // Angular Elements generates DOM property setters for input() signals,
  // identical to @Input(). Shell sets wcRef.current.visitCount = N and
  // Angular's signal machinery updates the view — no @Input() or manual
  // signal wrapper needed. Read-only from inside the component.
  readonly visitCount = input(0);
  readonly allVisitCounts = input<Record<string, number>>({});
  readonly userName = input('');
  readonly sessionStartTime = input('');
  readonly lastVisited = input('');

  protected readonly allVisitEntries = computed(() =>
    Object.entries(this.allVisitCounts()).map(([key, count]) => ({ key, count }))
  );
  // State signals – backed by service
  protected readonly todos = computed(() => this.todoApiService.todos());
  protected readonly loading = computed(() => this.todoApiService.isLoading());
  protected readonly apiError = computed(() => this.todoApiService.error());
  protected readonly filter = signal<'all' | 'active' | 'completed'>('all');

  // Signal-based reactive form approach
  protected readonly newTodoForm = signal({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  // Form validation signals
  protected readonly formErrors = signal({
    title: '',
    description: ''
  });

  // Form validity computed signal
  protected readonly isFormValid = computed(() => {
    const form = this.newTodoForm();
    const errors = this.formErrors();
    const alphanumericPattern = /^[a-zA-Z0-9\s]+$/;

    const titleValid = form.title.trim() && alphanumericPattern.test(form.title.trim());
    const descriptionValid = form.description.trim() && alphanumericPattern.test(form.description.trim());

    return titleValid && descriptionValid && !errors.title && !errors.description;
  });

  // Computed properties for template binding
  protected readonly newTodoTitle = computed(() => this.newTodoForm().title);
  protected readonly newTodoDescription = computed(() => this.newTodoForm().description);
  protected readonly newTodoPriority = computed(() => this.newTodoForm().priority);
  protected readonly newTodoDueDate = computed(() => this.newTodoForm().dueDate);

  /*
  // COMMENTED OUT: Form signal approach for future reference (old version)
  // Optimized form state - single signal instead of 4 separate ones
  protected readonly newTodoForm = signal({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  // Computed properties for template binding (maintains clean template syntax)
  protected readonly newTodoTitle = computed(() => this.newTodoForm().title);
  protected readonly newTodoDescription = computed(() => this.newTodoForm().description);
  protected readonly newTodoPriority = computed(() => this.newTodoForm().priority);
  protected readonly newTodoDueDate = computed(() => this.newTodoForm().dueDate);
  */

  // Computed values
  protected readonly filteredTodos = computed(() => {
    const todos = this.todos();
    const filter = this.filter();
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  });

  protected readonly todoStats = computed(() => {
    const todos = this.todos();
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length
    };
  });

  protected readonly ariaLabel = computed(() => {
    const stats = this.todoStats();
    return `Todo list with ${stats.total} items, ${stats.active} active, ${stats.completed} completed`;
  });

  // Accessible label for the <ul> that reflects the active filter
  protected readonly ariaListLabel = computed(() => {
    const labels: Record<string, string> = {
      all: 'All tasks',
      active: 'Active tasks',
      completed: 'Completed tasks',
    };
    return labels[this.filter()];
  });

  protected readonly hasActiveTodos = computed(() =>
    this.todoStats().active > 0
  );

  protected readonly hasCompletedTodos = computed(() =>
    this.todoStats().completed > 0
  );

  ngOnInit(): void {
    this.todoApiService.getAll();
  }

  // Signal-based reactive form approach with validation
  onAddTodo(): void {
    const form = this.newTodoForm();
    this.validateForm();

    if (!this.isFormValid()) {
      console.log('Form is invalid, cannot submit');
      return;
    }

    const addedTitle = form.title.trim();
    this.todoApiService.create({
      title: addedTitle,
      description: form.description.trim(),
      completed: false,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      tags: []
    });
    this.resetForm();
    this.liveAnnouncer.announce(`Task "${addedTitle}" added`, 'polite');
  }

  // Reactive form field updates with validation
  onTitleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFormField('title', target.value);
    this.validateField('title');
  }

  onDescriptionInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFormField('description', target.value);
    this.validateField('description');
  }

  onPriorityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateFormField('priority', target.value as 'low' | 'medium' | 'high');
  }

  onDueDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFormField('dueDate', target.value);
  }

  onFormKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.isFormValid()) {
      this.onAddTodo();
    }
  }

  // Helper methods for signal-based form management
  private updateFormField(field: string, value: any): void {
    this.newTodoForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  private validateField(field: 'title' | 'description'): void {
    const form = this.newTodoForm();
    const value = form[field].trim();
    const alphanumericPattern = /^[a-zA-Z0-9\s]+$/;

    let error = '';
    if (!value) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else if (!alphanumericPattern.test(value)) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} should only contain letters, numbers, and spaces`;
    }

    this.formErrors.update(errors => ({
      ...errors,
      [field]: error
    }));
  }

  private validateForm(): void {
    this.validateField('title');
    this.validateField('description');
  }

  private resetForm(): void {
    this.newTodoForm.set({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });

    this.formErrors.set({
      title: '',
      description: ''
    });
  }

  /*
  // COMMENTED OUT: Template Reference Variable Approach for future reference
  // Public methods - Template Reference Variable Approach with Validation
  onAddTodo(titleInput: HTMLInputElement, descriptionInput: HTMLInputElement, prioritySelect: HTMLSelectElement, dueDateInput: HTMLInputElement): void {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = prioritySelect.value as 'low' | 'medium' | 'high';
    const dueDate = dueDateInput.value;

    // Validation: Check if fields are required and contain only alphanumeric characters
    const alphanumericPattern = /^[a-zA-Z0-9\s]+$/;

    if (!title) {
      this.showValidationError(titleInput, 'Title is required');
      return;
    }

    if (!description) {
      this.showValidationError(descriptionInput, 'Description is required');
      return;
    }

    if (!alphanumericPattern.test(title)) {
      this.showValidationError(titleInput, 'Title should only contain letters, numbers, and spaces');
      return;
    }

    if (!alphanumericPattern.test(description)) {
      this.showValidationError(descriptionInput, 'Description should only contain letters, numbers, and spaces');
      return;
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title,
      description: description,
      completed: false,
      priority: priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: []
    };

    this.todos.update(todos => [...todos, newTodo]);

    // Reset form inputs directly
    this.resetFormInputs(titleInput, descriptionInput, prioritySelect, dueDateInput);
  }

  // Show validation error by focusing the field and showing browser validation message
  private showValidationError(inputElement: HTMLInputElement, message: string): void {
    inputElement.setCustomValidity(message);
    inputElement.reportValidity();
    inputElement.focus();

    // Clear the custom validity after user starts typing again
    inputElement.addEventListener('input', () => {
      inputElement.setCustomValidity('');
    }, { once: true });
  }

  // Reset form inputs using template reference variables
  private resetFormInputs(titleInput: HTMLInputElement, descriptionInput: HTMLInputElement, prioritySelect: HTMLSelectElement, dueDateInput: HTMLInputElement): void {
    titleInput.value = '';
    descriptionInput.value = '';
    prioritySelect.value = 'medium';
    dueDateInput.value = '';

    // Clear any custom validation messages
    titleInput.setCustomValidity('');
    descriptionInput.setCustomValidity('');
  }
  */

  /*
  // COMMENTED OUT: Previous signal-based approach for future reference
  // Public methods
  onAddTodo(): void {
    const form = this.newTodoForm();
    const title = form.title.trim();
    if (!title) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title,
      description: form.description.trim(),
      completed: false,
      priority: form.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      tags: []
    };

    this.todos.update(todos => [...todos, newTodo]);

    // Reset form - much simpler with single signal!
    this.resetForm();
  }
  */

  onTodoToggled(todoId: string): void {
    const todo = this.todos().find(t => t.id === todoId);
    if (todo) {
      const newState = !todo.completed;
      this.todoApiService.update(todoId, { completed: newState });
      this.liveAnnouncer.announce(
        `“${todo.title}” marked as ${newState ? 'complete' : 'incomplete'}`,
        'polite',
      );
    }
  }

  onTodoDeleted(todoId: string): void {
    const todo = this.todos().find(t => t.id === todoId);
    const title = todo?.title ?? 'Task';
    this.todoApiService.delete(todoId);
    this.liveAnnouncer.announce(`“${title}” deleted`, 'assertive');
  }

  onTodoEdited(updatedTodo: Todo): void {
    this.todoApiService.update(updatedTodo.id, updatedTodo);
  }

  onFilterChanged(filter: 'all' | 'active' | 'completed'): void {
    this.filter.set(filter);
    const count = this.filteredTodos().length;
    this.liveAnnouncer.announce(
      `Showing ${count} ${filter} task${count === 1 ? '' : 's'}`,
      'polite',
    );
  }

  onClearCompleted(): void {
    const count = this.todoStats().completed;
    this.todos()
      .filter(t => t.completed)
      .forEach(t => this.todoApiService.delete(t.id));
    this.liveAnnouncer.announce(
      `${count} completed task${count === 1 ? '' : 's'} cleared`,
      'polite',
    );
  }

  onToggleAll(): void {
    const allCompleted = this.todos().every(todo => todo.completed);
    this.todos().forEach(todo =>
      this.todoApiService.update(todo.id, { completed: !allCompleted }),
    );
    this.liveAnnouncer.announce(
      allCompleted ? 'All tasks marked as incomplete' : 'All tasks marked as complete',
      'polite',
    );
  }

  /*
  // COMMENTED OUT: Event-based form update methods for future reference
  // Optimized form update methods
  onNewTodoInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFormField('title', target.value);
  }

  onNewTodoDescriptionInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFormField('description', target.value);
  }

  onNewTodoDescriptionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onAddTodo();
    }
  }

  onPriorityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateFormField('priority', target.value as 'low' | 'medium' | 'high');
  }

  onDueDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFormField('dueDate', target.value);
  }

  // Helper methods for form management
  private updateFormField(field: string, value: any): void {
    this.newTodoForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  private resetForm(): void {
    this.newTodoForm.set({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
  }
  */

  /*
  // COMMENTED OUT: Template Reference Variable keydown handler for future reference
  // Keep onNewTodoDescriptionKeydown for Enter key functionality
  onNewTodoDescriptionKeydown(event: KeyboardEvent, titleInput: HTMLInputElement, descriptionInput: HTMLInputElement, prioritySelect: HTMLSelectElement, dueDateInput: HTMLInputElement): void {
    if (event.key === 'Enter') {
      this.onAddTodo(titleInput, descriptionInput, prioritySelect, dueDateInput);
    }
  }
  */



  // Public getters for testing
  public get testTodos() { return this.todos; }
  public get testFilter() { return this.filter; }
  public get testLoading() { return this.loading; }
  public get testNewTodoForm() { return this.newTodoForm; }
  public get testFormErrors() { return this.formErrors; }
  public get testIsFormValid() { return this.isFormValid; }
  public get testFilteredTodos() { return this.filteredTodos; }
  public get testTodoStats() { return this.todoStats; }
  public get testAriaLabel() { return this.ariaLabel; }
  public get testHasActiveTodos() { return this.hasActiveTodos; }
  public get testHasCompletedTodos() { return this.hasCompletedTodos; }
}
