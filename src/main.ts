import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// CL Component Library — register all custom elements (cl-button, cl-textbox, etc.)
import '@cl/web-components';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
