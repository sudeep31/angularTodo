Feature: Todo List Display
  As a user
  I want to see my todo list
  So that I can track my tasks

  Background:
    Given the todo API returns the fixture todos
    And I am on the todo list page

  Scenario: Page loads and displays todos
    Then I should see a heading "My Tasks"
    And I should see 3 todo items
    And the stats should show "3 total"
    And the stats should show "2 active"
    And the stats should show "1 done"

  Scenario: Completed todo is visually struck through
    Then the todo "Set up TailwindCSS" should appear completed

  Scenario: Incomplete todo is not struck through
    Then the todo "Learn Angular 21 Signals" should appear incomplete

  Scenario: Loading state is shown before data arrives
    Given the API is delayed
    When I visit the todo list page
    Then I should see "Loading tasks..."

  Scenario: Error state when API is unavailable
    Given the todo API returns a 500 error
    When I visit the todo list page
    Then I should see an error message

  Scenario: Empty state when no todos exist
    Given the todo API returns an empty list
    When I visit the todo list page
    Then I should see "No tasks to show."
