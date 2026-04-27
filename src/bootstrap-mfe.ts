import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { TodoListComponent } from './app/features/todo-list/todo-list.component';

/**
 * MFE bootstrap — registers the Angular Todo feature as a Web Component.
 *
 * Web component tag: <angular-todo-app>
 *
 * We expose TodoListComponent directly (not App) to avoid conflicts with the
 * shell's own router. HttpClient is provided here so the component can call
 * the Todo API regardless of the host shell.
 */
createApplication({
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideHttpClient(withFetch()),
    ],
})
    .then((appRef) => {
        if (!customElements.get('angular-todo-app')) {
            const TodoElement = createCustomElement(TodoListComponent, {
                injector: appRef.injector,
            });
            customElements.define('angular-todo-app', TodoElement);
        }
    })
    .catch((err) => console.error('[angular-todo-app] bootstrap error:', err));
