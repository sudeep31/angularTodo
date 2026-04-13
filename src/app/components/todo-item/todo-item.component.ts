import { Component, input, output, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { Todo } from '../../interfaces/todo.interface';

@Component({
  selector: 'app-todo-item',
  imports: [TitleCasePipe, DatePipe],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class TodoItemComponent {
  // Inputs using modern input() function
  readonly todo = input.required<Todo>();
  readonly disabled = input(false);

  // Outputs using modern output() function
  readonly todoToggled = output<string>();
  readonly todoDeleted = output<string>();
  readonly todoEdited = output<Todo>();

  constructor() {
    // Use effect to react to todo changes - runs when todo signal is available
    effect(() => {
      // Only log when todo is available
      const currentTodo = this.todo();
      if (currentTodo) {
        console.log('Todo item rendered:', currentTodo);
      }
    });
  }

  // Computed values for accessibility and display
  protected readonly ariaLabel = computed(() =>
    `${this.todo().completed ? 'Completed' : 'Pending'} todo: ${this.todo().title}`
  );

  protected readonly priorityClass = computed(() => {
    const priority = this.todo().priority;
    return `priority-${priority}`;
  });

  protected readonly completedClass = computed(() =>
    this.todo().completed ? 'completed' : ''
  );

  // Methods
  onToggleComplete(): void {
    if (!this.disabled()) {
      this.todoToggled.emit(this.todo().id);
    }
  }

  onDelete(): void {
    if (!this.disabled()) {
      this.todoDeleted.emit(this.todo().id);
    }
  }

  onEdit(): void {
    if (!this.disabled()) {
      this.todoEdited.emit(this.todo());
    }
  }

  // Public getters for testing
  public get testAriaLabel() { return this.ariaLabel; }
  public get testPriorityClass() { return this.priorityClass; }
  public get testCompletedClass() { return this.completedClass; }
}
