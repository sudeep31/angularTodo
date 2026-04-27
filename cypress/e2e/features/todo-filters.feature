Feature: Todo Filters
  As a user
  I want to filter my todo list
  So that I can focus on what matters

  Background:
    Given the todo API returns the fixture todos
    And I am on the todo list page

  Scenario: Default filter shows all todos
    Then I should see 3 todo items
    And the "All" filter tab should be selected

  Scenario: Filter by Active shows only incomplete todos
    When I click the "Active" filter
    Then I should see 2 todo items
    And the todo "Set up TailwindCSS" should not be visible

  Scenario: Filter by Done shows only completed todos
    When I click the "Done" filter
    Then I should see 1 todo item
    And the todo "Set up TailwindCSS" should be visible
    And the todo "Learn Angular 21 Signals" should not be visible

  Scenario: Filter by All restores full list
    When I click the "Active" filter
    And I click the "All" filter
    Then I should see 3 todo items

  Scenario: Check All marks every todo as complete
    Given the update todo API is ready for todo "1"
    And the update todo API is ready for todo "3"
    When I click "Check All"
    Then the done count should be "3 done"

  Scenario: Clear Done removes all completed todos
    When I click "Clear Done"
    Then the todo "Set up TailwindCSS" should not be visible
    And I should see 2 todo items
