---
description: 'Use when creating or modifying Angular components, services, pipes, guards, and other Angular TypeScript files. Covers Angular 21 modern patterns, standalone components, signals, and SSR compatibility.'
name: 'Angular Code Generation'
applyTo: 'src/**/*.ts'
---

# Angular 21 Code Generation Guidelines

## Non-Negotiables (Every File, Every Request)

- Standalone components — no NgModules
- `ChangeDetectionStrategy.OnPush` on every component
- `signal()` for state — `computed()` for derived state
- `input()` / `output()` functions — **not** `@Input()` / `@Output()` decorators
- `inject()` for DI — **not** constructor parameters
- `@if` / `@for` / `@switch` — **not** `*ngIf` / `*ngFor`
- `@for` always has a `track` — never `track $index` on mutable lists
- Signal mutations use `.set()` or `.update()` — never direct mutation
- Every component: 4 files (`.ts`, `.html`, `.css`, `.spec.ts`)
- Files in correct folders: `components/`, `features/`, `services/`, `interfaces/`

## Folder Structure — Always Follow This

```
src/app/
├── components/     ← Reusable UI components (todo-item/, modal/, shared/)
├── features/       ← Feature-specific pages (todo-list/, settings/)
├── services/       ← Business logic and HTTP services
├── interfaces/     ← TypeScript interfaces and models
├── guards/         ← Route guards
├── pipes/          ← Custom pipes
└── shared/         ← Utilities, constants, types
```

## File Creation Standard

Every component **must** be created with exactly 4 files:

```
component-name.component.ts       ← Logic, signals, DI
component-name.component.html     ← Template, Angular control flow
component-name.component.css      ← TailwindCSS classes only
component-name.component.spec.ts  ← Vitest unit tests
```

- **Components**: `src/app/components/[component-name]/`
- **Features**: `src/app/features/[feature-name]/`
- **Services**: `src/app/services/`
- **Interfaces**: `src/app/interfaces/`
- **Guards**: `src/app/guards/`
- **Pipes**: `src/app/pipes/`

## Compilation Error Resolution — File Structure Validation

Before completing any task, validate:

1. Every pipe, directive, and component used in the template is in the `imports[]` array
2. Every interface imported matches its actual file location in `src/app/interfaces/`
3. No circular imports — a component must not import itself or create a cycle
4. `rootDir` is explicitly set in `tsconfig.app.json` — do not leave it implicit
5. Spec files include `/// <reference types="vitest" />` or have `types: ["vitest"]` in `tsconfig.spec.json`
6. Run `get_errors` — zero errors required before handing back any file

## Component Structure

> Call `mcp_angular-cli_get_best_practices` for the current canonical component scaffold example.

Key rules:

- `selector`, `imports[]`, `templateUrl`, `styleUrl`, `changeDetection: ChangeDetectionStrategy.OnPush`
- `input()` / `output()` functions for API surface
- `signal()` / `computed()` for all state
- `protected readonly` for template-bound properties
- `.set()` / `.update()` for all signal mutations — never direct mutation

## Modern Angular Patterns

> Call `mcp_angular-cli_search_documentation` for live examples of DI, signals, and control flow.

- **DI**: `inject()` function — never constructor parameters
- **State**: `signal()` for mutable state, `computed()` for derived state
- **Control flow**: `@if` / `@for` / `@switch` — never `*ngIf` / `*ngFor` / `*ngSwitch`

## Service Patterns

> Call `mcp_angular-cli_get_best_practices` for the current canonical service scaffold example.

- `@Injectable({ providedIn: 'root' })`
- Private `signal()` exposed via `.asReadonly()` for external consumers
- `inject()` for dependencies

## SSR Compatibility Rules

- Always check for browser environment before using browser-only APIs
- Use `isPlatformBrowser()` from `@angular/common`
- Avoid direct DOM manipulation in component logic
- Use afterNextRender() or afterRender() for browser-only operations

## Testing Patterns

> Testing rules and patterns are in `testing.instructions.md` (applied to `src/**/*.spec.ts`).
> Call `mcp_angular-cli_get_best_practices` for Vitest + Angular testing examples.

## File Organization

> Folder structure and file creation standard are defined at the top of this file.
> Use the tree diagram above as the single source of truth for placement.

- Use kebab-case for files and folders (`todo-item.component.ts`)
- Use PascalCase for classes (`TodoItemComponent`)
- Use index.ts files for clean imports where appropriate

## Development Boundaries

### Component Creation Rules

- **Single Responsibility**: Each component should have one clear purpose
- **Small and Focused**: Avoid creating large components with multiple concerns
- **Minimal API Surface**: Only expose properties and methods that are actually needed
- **No Speculative Features**: Don't add functionality that wasn't explicitly requested

### Code Generation Standards

- **Verified Imports**: Only use imports that exist in Angular 21 and installed dependencies
- **No Deprecated APIs**: Avoid using deprecated Angular patterns or APIs
- **Consistent Patterns**: Follow the established patterns shown in existing project files
- **Explicit Requirements**: When user requirements are unclear, ask for clarification rather than making assumptions
- **Standard Structure**: Always use the defined folder structure and create all 4 component files
- **Proper File Placement**: Place files in correct directories based on their type (components, services, interfaces)

### Implementation Guidelines

- **Start Minimal**: Create basic working implementation first, enhance only when requested
- **Official Best Practices**: Always use Angular MCP server to verify current best practices before code generation
- **Validate Syntax**: Ensure all generated TypeScript code follows strict mode and compiles correctly
- **Test Compatibility**: Generated components should work with both development and SSR builds
- **Accessibility Compliance**: All generated code must pass AXE checks and follow WCAG AA standards
- **Performance Optimized**: Use OnPush change detection and NgOptimizedImage for static images

## Angular Best Practices Enforcement

Call `mcp_angular-cli_get_best_practices` before writing any component or service code.

Key checks: standalone default (don't set `standalone: true`), OnPush required, `input()`/`output()` not decorators, host bindings in decorator not `@HostBinding`/`@HostListener`.

---

## Error Prevention — Before and After Every Task

### Pre-Development Checklist

1. Call `mcp_angular-cli_get_best_practices` — load live Angular 21 guidelines first
2. Read existing component patterns in the codebase before creating new files
3. Verify all interface definitions exist for data types being used
4. Check which pipes, directives, and components the template will need

### Post-Development Checklist

1. Run `get_errors` on **all modified files** — zero errors required before handing back
2. Every pipe, directive, and component used in the template is in the `imports[]` array
3. Signal mutations use `.set()` or `.update()` — never direct mutation (`this.todos().push(...)`)
4. Every `@for` has a meaningful `track` expression — not `track $index` on mutable lists
5. Template bindings match the component's `public` or `protected` scope
6. All `aria-label` / `type="button"` / `for`-`id` pairs are present on interactive elements

### Common Error Patterns and Fixes

#### Missing Pipe or Directive Import

**Error**: `No pipe found with name 'date'` / `Can't bind to 'ngClass'`
**Fix**: Add to component `imports[]` — `DatePipe`, `TitleCasePipe` from `@angular/common`. Query `mcp_angular-cli_search_documentation` for current import paths.

#### Null Safety Violation

**Error**: `Object is possibly 'undefined'`
**Fix**: Use `obj?.prop` and `value ?? 'default'`. Never use `obj && obj.prop`.

#### Signal Direct Mutation

**Error**: Change detection not firing after update
**Fix**:

```typescript
// ❌ Never
this.todos().push(newTodo);

// ✅ Always
this.todos.update((todos) => [...todos, newTodo]);
```

#### Class Binding Syntax

**Error**: String concatenation in class bindings
**Fix**: Use `[class.my-class]="condition()"` or object syntax `[ngClass]="{ 'class': condition() }"` — never string concatenation.

#### Protected Property Access in Tests

**Error**: `Property 'x' is protected and only accessible within class`
**Fix**: Mark as `public` if tests need it, or add a `public` getter. Do not use `(component as any).x`.

#### Event Type Mismatch in Tests

**Error**: `Conversion of type may be a mistake`
**Fix**: Use `as unknown as Event` cast: `{ target: { value: 'text' } } as unknown as Event`

#### Incorrect TailwindCSS Class Name

**Error**: `flex-shrink-0 can be written as shrink-0`
**Fix**: Use `mcp_tailwindcss-s_get_tailwind_utilities` to find the current class — never guess.

### TypeScript Strictness Rules

- No `any` type — use proper interfaces or generics
- No non-null assertion (`!`) unless unavoidable, with a comment explaining why
- `readonly` on all properties that should not be reassigned
- Explicit return types on all public methods
- All interfaces in `src/app/interfaces/` — never inline in components
- No circular imports — verify before importing a component into itself

### Accessibility Requirements (Every Template)

- All `<button>` elements have `type="button"` (prevents accidental form submit)
- All interactive elements have `aria-label` or a visible `<label>` linked via `for`/`id`
- Error messages linked to inputs via `aria-describedby`
- No colour as the sole means of conveying information
- Performance optimization techniques
