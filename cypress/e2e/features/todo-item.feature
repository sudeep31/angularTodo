Feature: Todo Item Actions
  As a user
  I want to interact with individual todo items
  So that I can manage each task

  Background:
    Given the todo API returns the fixture todos
    And I am on the todo list page

  Scenario: Toggle a todo as complete
    Given the update todo API is ready for todo "1"
    When I toggle the todo "Learn Angular 21 Signals"
    Then the todo "Learn Angular 21 Signals" should appear completed

  Scenario: Toggle a completed todo back to incomplete
    Given the update todo API is ready for todo "2"
    When I toggle the todo "Set up TailwindCSS"
    Then the todo "Set up TailwindCSS" should appear incomplete

  Scenario: Priority badge is displayed correctly for high priority
    Then the todo "Learn Angular 21 Signals" should show a "High priority" badge

  Scenario: Priority badge is displayed correctly for medium priority
    Then the todo "Write unit tests" should show a "Medium priority" badge

  Scenario: Delete a todo
    Given the delete todo API is ready for todo "3"
    When I delete the todo "Write unit tests"
    Then the todo "Write unit tests" should not be visible
