/// <reference path="../../support/cypress.d.ts" />
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { TodoListPage } from '../../support/page-objects/todo-list.page';
import { TodoFormPage } from '../../support/page-objects/todo-form.page';

const list = new TodoListPage();
const form = new TodoFormPage();

// --- Background / setup steps ---────────

Given('the todo API returns the fixture todos', () => {
  // SSR fetches server-side from json-server directly.
  // Seed the DB so the server gets the right data on next request.
  cy.resetTodos();
  // Also set up a browser-level intercept for any client-side re-fetches.
  cy.interceptTodos('todos');
});

Given('the todo API returns an empty list', () => {
  cy.request('PUT', `${Cypress.env('apiUrl')}/todos`, []);
  cy.intercept('GET', '**/todos', { body: [] }).as('getTodos');
});

Given('the todo API returns a 500 error', () => {
  // Cannot inject 500 into SSR server-side request easily;
  // stop json-server by clearing data and relying on client-side error handling.
  cy.intercept('GET', '**/todos', { statusCode: 500 }).as('getTodos');
});

Given('the API is delayed', () => {
  cy.intercept('GET', '**/todos', (req) => {
    req.on('response', (res) => {
      res.setDelay(3000);
    });
  }).as('getTodos');
});

Given('the create todo API is ready', () => {
  cy.interceptCreateTodo();
});

Given('the update todo API is ready for todo {string}', (id: string) => {
  cy.interceptUpdateTodo(id);
});

Given('the delete todo API is ready for todo {string}', (id: string) => {
  cy.interceptDeleteTodo(id);
});

Given('I am on the todo list page', () => {
  list.visit();
  // Angular SSR serves the initial data server-side, so no browser network
  // request fires for GET /todos on first load. Wait for DOM readiness instead.
  cy.contains('h2', 'My Tasks').should('be.visible');
});

When('I visit the todo list page', () => {
  list.visit();
});

// --- List display assertions ---────────

Then('I should see a heading {string}', (text: string) => {
  cy.contains('h2', text).should('be.visible');
});

Then('I should see {int} todo items', (count: number) => {
  list.getTodoItems().should('have.length', count);
});

Then('I should see {int} todo item', (count: number) => {
  list.getTodoItems().should('have.length', count);
});

Then('the stats should show {string}', (text: string) => {
  list.getTodoCount().should('contain.text', text.replace(/\d+ /, '').trim());
});

Then('I should see {string}', (text: string) => {
  cy.contains(text).should('be.visible');
});

Then('I should see an error message', () => {
  list.getErrorState().should('be.visible');
});

// --- Item state assertions ---────

Then('the todo {string} should appear completed', (title: string) => {
  cy.contains('#todo-list li', title).find('input[type="checkbox"]').should('be.checked');
  cy.contains('#todo-list li', title).find('p.line-through').should('exist');
});

Then('the todo {string} should appear incomplete', (title: string) => {
  cy.contains('#todo-list li', title).find('input[type="checkbox"]').should('not.be.checked');
  cy.contains('#todo-list li', title).find('p.line-through').should('not.exist');
});

Then('the todo {string} should not be visible', (title: string) => {
  cy.contains('#todo-list li', title).should('not.exist');
});

Then('the todo {string} should be visible', (title: string) => {
  cy.contains('#todo-list li', title).should('be.visible');
});

Then('the todo {string} should show a {string} badge', (title: string, badge: string) => {
  cy.contains('#todo-list li', title).contains('.rounded-full', badge).should('be.visible');
});

// --- Filter interactions ---────

When('I click the {string} filter', (filter: string) => {
  cy.get('[role="tablist"]').contains('[role="tab"]', filter).click();
});

Then('the {string} filter tab should be selected', (filter: string) => {
  cy.get('[role="tablist"]')
    .contains('[role="tab"]', filter)
    .should('have.attr', 'aria-selected', 'true');
});

// --- Bulk actions ---──────

When('I click {string}', (label: string) => {
  cy.contains('button', label).click();
});

Then('the done count should be {string}', (text: string) => {
  list.getDoneCount().should('contain.text', text.replace('done', '').trim());
});

// --- Form interactions ---──────

When('I fill in the title {string}', (title: string) => {
  form.fillTitle(title);
});

When('I fill in the description {string}', (desc: string) => {
  form.fillDescription(desc);
});

When('I select priority {string}', (priority: 'low' | 'medium' | 'high') => {
  form.selectPriority(priority);
});

When('I type and clear the title field', () => {
  form.getTitleInput().type('abc').clear();
});

Then('the {string} button should be disabled', (label: string) => {
  cy.contains('button', label).should('be.disabled');
});

Then('the form should be submitted', () => {
  cy.wait('@createTodo');
});

Then('the todo list should contain {string}', (title: string) => {
  list.getTodoItemByTitle(title).should('exist');
});

Then('I should see a title validation error', () => {
  form.getTitleError().should('be.visible');
});

Then('I should see a description validation error', () => {
  form.getDescriptionError().should('be.visible');
});

Then('the title input should be empty', () => {
  form.getTitleInput().should('have.value', '');
});

// --- Item actions ---──────

When('I toggle the todo {string}', (title: string) => {
  cy.contains('#todo-list li', title).find('input[type="checkbox"]').click();
  cy.wait('@updateTodo');
});

When('I delete the todo {string}', (title: string) => {
  cy.contains('#todo-list li', title).find('[aria-label="Delete todo"]').click();
  cy.wait('@deleteTodo');
});
