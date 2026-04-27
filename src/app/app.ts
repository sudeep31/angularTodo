import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TodoListComponent } from './features/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TodoListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
  protected readonly title = signal('Angular Todo App');
}
