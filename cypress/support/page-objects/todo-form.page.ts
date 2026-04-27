/**
 * Page Object: TodoFormPage
 *
 * Encapsulates all selectors and interactions for the Add New Task form.
 */
export class TodoFormPage {
  // ── Fields ───────────────────────────────────────────────────────────────────
  getTitleInput() {
    return cy.get('#new-todo-input');
  }

  getDescriptionInput() {
    return cy.get('#new-todo-description');
  }

  getPrioritySelect() {
    return cy.get('#priority-select');
  }

  getDueDateInput() {
    return cy.get('#due-date-input');
  }

  getSubmitButton() {
    return cy.contains('button', 'Add Task');
  }

  // ── Validation messages ───────────────────────────────────────────────────────
  getTitleError() {
    return cy.get('#title-error');
  }

  getDescriptionError() {
    return cy.get('#description-error');
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  fillTitle(title: string) {
    this.getTitleInput().clear().type(title);
  }

  fillDescription(description: string) {
    this.getDescriptionInput().clear().type(description);
  }

  selectPriority(priority: 'low' | 'medium' | 'high') {
    this.getPrioritySelect().select(priority);
  }

  fillDueDate(date: string) {
    // date format: YYYY-MM-DD
    this.getDueDateInput().type(date);
  }

  submit() {
    this.getSubmitButton().click();
  }

  /**
   * Fill the full form and submit.
   */
  addTodo(opts: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
  }) {
    this.fillTitle(opts.title);
    if (opts.description) this.fillDescription(opts.description);
    if (opts.priority) this.selectPriority(opts.priority);
    if (opts.dueDate) this.fillDueDate(opts.dueDate);
    this.submit();
  }
}
