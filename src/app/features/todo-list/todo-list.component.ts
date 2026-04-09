import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Todo } from '../../interfaces/todo.interface';
import { TodoItemComponent } from '../../components/todo-item/todo-item.component';

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block w-full max-w-2xl mx-auto',
    'role': 'main',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class TodoListComponent {
  // State signals
  protected readonly todos = signal<Todo[]>([]);
  protected readonly filter = signal<'all' | 'active' | 'completed'>('all');
  protected readonly loading = signal(false);
  protected readonly newTodoTitle = signal('');

  // Computed values
  protected readonly filteredTodos = computed(() => {
    const todos = this.todos();
    const currentFilter = this.filter();

    switch (currentFilter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
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

  protected readonly hasActiveTodos = computed(() =>
    this.todoStats().active > 0
  );

  protected readonly hasCompletedTodos = computed(() =>
    this.todoStats().completed > 0
  );

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Public methods
  onAddTodo(): void {
    const title = this.newTodoTitle().trim();
    if (!title) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title,
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    };

    this.todos.update(todos => [...todos, newTodo]);
    this.newTodoTitle.set('');
  }

  onTodoToggled(todoId: string): void {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === todoId
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    );
  }

  onTodoDeleted(todoId: string): void {
    this.todos.update(todos => todos.filter(todo => todo.id !== todoId));
  }

  onTodoEdited(updatedTodo: Todo): void {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === updatedTodo.id
          ? { ...updatedTodo, updatedAt: new Date() }
          : todo
      )
    );
  }

  onFilterChanged(filter: 'all' | 'active' | 'completed'): void {
    this.filter.set(filter);
  }

  onClearCompleted(): void {
    this.todos.update(todos => todos.filter(todo => !todo.completed));
  }

  onToggleAll(): void {
    const allCompleted = this.todos().every(todo => todo.completed);
    this.todos.update(todos =>
      todos.map(todo => ({
        ...todo,
        completed: !allCompleted,
        updatedAt: new Date()
      }))
    );
  }

  onNewTodoInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newTodoTitle.set(target.value);
  }

  onNewTodoKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onAddTodo();
    }
  }

  // Private methods
  private initializeSampleData(): void {
    const sampleTodos: Todo[] = [
      {
        id: '1',
        title: 'Learn Angular 21 Signals',
        description: 'Master the new signal-based reactive patterns',
        completed: false,
        priority: 'high',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        tags: ['angular', 'learning']
      },
      {
        id: '2',
        title: 'Set up TailwindCSS',
        description: 'Configure TailwindCSS for the project',
        completed: true,
        priority: 'medium',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        tags: ['setup', 'css']
      },
      {
        id: '3',
        title: 'Write unit tests',
        description: 'Add comprehensive test coverage with Vitest',
        completed: false,
        priority: 'medium',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        tags: ['testing', 'vitest']
      }
    ];

    this.todos.set(sampleTodos);
  }
}