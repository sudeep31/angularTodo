// Augment Cypress chainable with custom commands defined in commands.ts
declare namespace Cypress {
  interface Chainable {
    interceptTodos(fixture?: string): Chainable<null>;
    interceptCreateTodo(body?: object): Chainable<null>;
    interceptUpdateTodo(id: string): Chainable<null>;
    interceptDeleteTodo(id: string): Chainable<null>;
    resetTodos(): Chainable<null>;
  }
}
