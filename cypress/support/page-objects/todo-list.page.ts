/**
 * Page Object: TodoListPage
 *
 * Encapsulates all selectors and interactions for the todo list view.
 * Using data-cy attributes is preferred; falls back to semantic selectors
 * matching the existing HTML (id / aria-label / role).
 */
export class TodoListPage {
    // ── Navigation ──────────────────────────────────────────────────────────────
    visit() {
        cy.visit('/');
    }

    // ── Stats bar ───────────────────────────────────────────────────────────────
    getTodoCount() {
        return cy.get('#todo-count');
    }

    getTotalCount() {
        return cy.get('#todo-count').contains(/\d+ total/);
    }

    getActiveCount() {
        return cy.get('#todo-count .text-blue-400');
    }

    getDoneCount() {
        return cy.get('#todo-count .text-emerald-500');
    }

    // ── Todo list ────────────────────────────────────────────────────────────────
    getTodoList() {
        return cy.get('#todo-list');
    }

    getTodoItems() {
        return cy.get('#todo-list li');
    }

    getTodoItemByTitle(title: string) {
        return cy.contains('#todo-list li', title);
    }

    // ── Filter tabs ──────────────────────────────────────────────────────────────
    clickFilter(filter: 'all' | 'active' | 'completed') {
        cy.get(`[role="tablist"] [role="tab"][aria-selected]`)
            .contains(new RegExp(filter === 'completed' ? 'Done' : filter, 'i'))
            .click();
    }

    // ── Bulk actions ─────────────────────────────────────────────────────────────
    clickCheckAll() {
        cy.get('[aria-label="Mark all as complete"], [aria-label="Mark all as incomplete"]').click();
    }

    clickClearCompleted() {
        cy.contains('button', /Clear Done/).click();
    }

    // ── States ───────────────────────────────────────────────────────────────────
    getLoadingState() {
        return cy.contains('Loading tasks...');
    }

    getErrorState() {
        return cy.get('.text-red-500').first();
    }

    getEmptyState() {
        return cy.contains('No tasks to show.');
    }
}
