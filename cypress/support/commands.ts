// Custom Cypress commands — types declared in cypress/support/cypress.d.ts

Cypress.Commands.add('interceptTodos', (fixture = 'todos') => {
    cy.intercept('GET', '**/todos', { fixture }).as('getTodos');
});

Cypress.Commands.add('interceptCreateTodo', (body?: object) => {
    cy.intercept('POST', '**/todos', (req) => {
        req.reply({ statusCode: 201, body: body ?? req.body });
    }).as('createTodo');
});

Cypress.Commands.add('interceptUpdateTodo', (id: string) => {
    cy.intercept('PATCH', `**/todos/${id}`, (req) => {
        req.reply({ statusCode: 200, body: req.body });
    }).as('updateTodo');
});

Cypress.Commands.add('interceptDeleteTodo', (id: string) => {
    cy.intercept('DELETE', `**/todos/${id}`, { statusCode: 200, body: {} }).as('deleteTodo');
});

Cypress.Commands.add('resetTodos', () => {
    cy.fixture('todos').then((todos: object[]) => {
        // Delete all existing todos then re-create from fixture.
        cy.request('GET', `${Cypress.env('apiUrl')}/todos`).then((res) => {
            const ids: string[] = res.body.map((t: { id: string }) => t.id);
            ids.forEach((id) => {
                cy.request('DELETE', `${Cypress.env('apiUrl')}/todos/${id}`);
            });
        });
        todos.forEach((todo) => {
            cy.request('POST', `${Cypress.env('apiUrl')}/todos`, todo);
        });
    });
});


