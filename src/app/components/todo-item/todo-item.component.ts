import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, TitleCasePipe, NgClass } from '@angular/common';
import { Todo } from '../../interfaces/todo.interface';

@Component({
  selector: 'app-todo-item',
  imports: [DatePipe, TitleCasePipe, NgClass],
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
}