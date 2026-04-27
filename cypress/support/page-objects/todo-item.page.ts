export class TodoItemPage {
    within(title: string) {
        return cy.contains('#todo-list li', title);
    }

    getCheckbox(title: string) {
        return this.within(title).find('input[type="checkbox"]');
    }

    clickEdit(title: string) {
        this.within(title).find('[aria-label="Edit todo"]').click();
    }

    clickDelete(title: string) {
        this.within(title).find('[aria-label="Delete todo"]').click();
    }

    toggleComplete(title: string) {
        this.getCheckbox(title).click();
    }

    assertCompleted(title: string) {
        this.getCheckbox(title).should('be.checked');
        this.within(title).find('p.line-through').should('exist');
    }

    assertIncomplete(title: string) {
        this.getCheckbox(title).should('not.be.checked');
        this.within(title).find('p.line-through').should('not.exist');
    }

    getPriorityBadge(title: string) {
        return this.within(title).find('.rounded-full').first();
    }
}
