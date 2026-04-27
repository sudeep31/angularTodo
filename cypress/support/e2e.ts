// ***********************************************************
// cypress/support/e2e.ts
// Loaded automatically before every spec file.
// ***********************************************************
import './commands';

// Prevent Cypress from failing on uncaught exceptions thrown by the app
// that are unrelated to the current test (e.g. SSR hydration noise).
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test.
  // Only suppress known Angular/SSR lifecycle errors — let real assertion
  // failures through by checking the message explicitly.
  const suppressedPatterns = [
    'Cannot read properties of null',
    'hydration',
    'ExpressionChangedAfterItHasBeenCheckedError',
  ];
  return !suppressedPatterns.some((p) => err.message.includes(p));
});
