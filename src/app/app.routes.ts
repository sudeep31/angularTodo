import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/todo-list/todo-list.component').then(
        (m) => m.TodoListComponent
      ),
    title: 'Angular Todo App',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/cl-contact-form/cl-contact-form.component').then(
        (m) => m.ClContactFormComponent
      ),
    title: 'Contact Us',
  },
];
