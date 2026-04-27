import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/cl-contact-form/cl-contact-form.component').then(
        (m) => m.ClContactFormComponent
      ),
    title: 'Contact Us',
  },
];
