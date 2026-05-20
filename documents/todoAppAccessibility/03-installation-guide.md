# Installation & Developer Setup Guide

This guide covers how to run the Angular Todo App with all accessibility improvements applied.

---

## Prerequisites

| Tool    | Version                    | Download                      |
| ------- | -------------------------- | ----------------------------- |
| Node.js | 20 or 22 LTS               | https://nodejs.org            |
| npm     | 9+ (included with Node.js) | —                             |
| Git     | any                        | https://git-scm.com           |
| Chrome  | latest                     | https://www.google.com/chrome |

---

## 1. Install Dependencies

Open a terminal in the project root (`c:\AngularToDO\angularTodo`) and run:

```bash
npm install
```

This will install all packages including the newly added `@angular/cdk@21.2.11`.

**Verify CDK is installed:**

```bash
npm list @angular/cdk
# Expected: @angular/cdk@21.2.11
```

---

## 2. Start the Mock API (json-server)

The app reads and writes todos from a local REST API. Open a **separate terminal** and run:

```bash
npm run json-server
```

This starts json-server on `http://localhost:3000`. Keep this terminal open while testing.

---

## 3. Start the Angular Dev Server

In your main terminal:

```bash
npm start
```

Open Chrome and navigate to: **http://localhost:4200**

---

## 4. Run the Test Suite

```bash
npm test
```

Tests use [Vitest](https://vitest.dev/) and run in jsdom. No browser is needed for unit tests.

---

## Project Scripts Reference

| Command               | Purpose                                |
| --------------------- | -------------------------------------- |
| `npm start`           | Angular dev server on `localhost:4200` |
| `npm test`            | Run Vitest unit tests                  |
| `npm run build`       | Production build                       |
| `npm run json-server` | Mock REST API on `localhost:3000`      |
| `npm run cy:open`     | Open Cypress E2E test runner           |
| `npm run cy:run`      | Run Cypress E2E tests headlessly       |
