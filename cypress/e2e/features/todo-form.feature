Feature: Add Todo
  As a user
  I want to add new tasks
  So that I can keep track of work to do

  Background:
    Given the todo API returns the fixture todos
    And the create todo API is ready
    And I am on the todo list page

  Scenario: Add button is disabled when title is empty
    Then the "Add Task" button should be disabled

  Scenario: Successfully add a new todo with required fields
    When I fill in the title "Buy groceries"
    And I click "Add Task"
    Then the form should be submitted
    And the todo list should contain "Buy groceries"

  Scenario: Add a todo with all fields filled
    When I fill in the title "Write report"
    And I fill in the description "Quarterly business review"
    And I select priority "high"
    And I click "Add Task"
    Then the form should be submitted
    And the todo list should contain "Write report"

  Scenario: Title validation - title is required
    When I type and clear the title field
    Then I should see a title validation error

  Scenario: Description validation - special characters rejected
    When I fill in the title "Valid title"
    And I fill in the description "Invalid!@#$"
    Then I should see a description validation error
    And the "Add Task" button should be disabled

  Scenario: Form clears after successful submission
    When I fill in the title "Temporary task"
    And I click "Add Task"
    Then the title input should be empty
