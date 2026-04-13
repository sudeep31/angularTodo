# Angular Todo App — AI Guidelines

## Project Overview

Angular 21 Todo app with SSR, TailwindCSS, and Vitest.

- **Framework**: Angular 21 (standalone, signals, OnPush, SSR)
- **Styling**: TailwindCSS via `@import "tailwindcss"` in `styles.css`
- **Testing**: Vitest
- **Mock API**: json-server on `localhost:3000`
- **Font**: Inter (Google Fonts)
- **Formatting**: Prettier — single quotes, 100 character line width, kebab-case files, PascalCase classes

## Build & Run

| Command               | Purpose               |
| --------------------- | --------------------- |
| `npm start`           | Dev server            |
| `npm test`            | Vitest                |
| `npm run build`       | Production build      |
| `npm run json-server` | Mock API on port 3000 |

## Non-Negotiables (Every File, Every Request)

See `angular.instructions.md` for the full list — applied automatically on all `*.ts` files.

## Boundaries — What Copilot Must Never Do

- **No CSS unless asked**: Do not add custom CSS, inline styles, debug colours, or `!important` unless the user explicitly requests styling changes
- **No positioning classes unless asked**: Do not add `absolute`, `relative`, `fixed`, `sticky`, or `z-index` classes speculatively
- **No debug markup**: No bright background colours, neon borders, or debug `console.log` left in code
- **No feature creep**: Only implement what was asked — do not add "nice-to-have" extras
- **No deprecated APIs**: Never use `*ngIf`, `*ngFor`, `@Input()`, `@Output()`, or constructor injection
- **No hallucinations**: Only use APIs, classes, imports, and patterns that are confirmed to exist in Angular 21 and the installed dependencies — never invent method names, module paths, or configuration options
- **No assumptions**: Do not assume missing requirements — if a task is ambiguous, incomplete, or could be interpreted in more than one way, stop and ask before generating any code
- **No unsolicited improvements**: Do not refactor, rename, reformat, or "clean up" code that was not part of the request — make only the changes explicitly asked for
- **Ask first**: If the intent behind a request is unclear, ask one focused clarifying question — do not generate a best-guess solution and silently hope it is correct

## MCP Server Priority

Always call MCP before generating or editing code — live guidelines override static examples:

- `mcp_angular-cli_get_best_practices` — before any component or service work
- `mcp_angular-cli_search_documentation` — for specific Angular API questions
- `mcp_tailwindcss-s_get_tailwind_utilities` — before applying any CSS classes

## Error Checking (Mandatory)

Run `get_errors` on every modified file before completing any task. Never hand back code with TypeScript or template compilation errors.

## Instruction Files — Detailed Rules by File Type

| File pattern                    | Instruction file           | What it covers                                               |
| ------------------------------- | -------------------------- | ------------------------------------------------------------ |
| `src/**/*.ts`                   | `angular.instructions.md`  | Angular 21 patterns, error prevention, TypeScript strictness |
| `src/**/*.html`, `src/**/*.css` | `tailwind.instructions.md` | CSS boundaries, TailwindCSS utilities, no-debug policy       |
| `src/**/*.spec.ts`              | `testing.instructions.md`  | Vitest patterns, signal testing, HTTP mocking                |
