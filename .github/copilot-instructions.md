# Angular Todo App - Development Guidelines

## Project Overview

This is an Angular 21 Todo application with SSR support, using modern Angular patterns, TailwindCSS for styling, and Vitest for testing.

## Code Style

- **Formatting**: Use Prettier with single quotes, 100 character line width
- **File naming**: Use kebab-case for files (`todo-list.component.ts`)
- **Component naming**: Use PascalCase classes (`TodoListComponent`)
- **Templates**: Use Angular template syntax with separate `.html` files
- **Styles**: Use separate `.css` files with TailwindCSS utility classes

## Architecture

- **Standalone Components**: Always use standalone components (no NgModules)
- **Signals**: Prefer signals over traditional observables for state management
- **SSR Compatibility**: Ensure all components work with server-side rendering
- **Folder Structure**: Follow standard Angular project structure with organized feature folders

## Project Structure Standards

### Folder Organization

```
src/app/
├── components/          # Reusable UI components
│   ├── todo-item/
│   ├── modal/
│   └── shared/
├── services/            # Business logic and data services
│   ├── todo.service.ts
│   ├── api.service.ts
│   └── auth.service.ts
├── interfaces/          # TypeScript interfaces and models
│   ├── todo.interface.ts
│   ├── user.interface.ts
│   └── api.interface.ts
├── guards/              # Route guards
├── pipes/               # Custom pipes
├── directives/          # Custom directives
├── features/            # Feature-specific modules
│   ├── todo-list/
│   ├── settings/
│   └── profile/
└── shared/              # Shared utilities and helpers
    ├── utils/
    ├── constants/
    └── types/
```

### Component Creation Requirements

**ALWAYS create components with 4 standard files:**

1. **`.component.ts`** - Component logic with signals and OnPush strategy
2. **`.component.html`** - Template with modern control flow syntax
3. **`.component.css`** - Styles using TailwindCSS utility classes
4. **`.component.spec.ts`** - Vitest unit tests with signal testing patterns

**Example component structure:**

```
src/app/components/todo-item/
├── todo-item.component.ts
├── todo-item.component.html
├── todo-item.component.css
└── todo-item.component.spec.ts
```

### File Creation Standards

- **Components**: Place in `src/app/components/[component-name]/`
- **Services**: Place in `src/app/services/`
- **Interfaces/Models**: Place in `src/app/interfaces/`
- **Guards**: Place in `src/app/guards/`
- **Pipes**: Place in `src/app/pipes/`
- **Feature modules**: Place in `src/app/features/[feature-name]/`

## Angular 21 Patterns

- Use `signal()` for component state instead of properties
- Use `computed()` for derived state
- Use `effect()` sparingly for side effects
- Use `inject()` function for dependency injection in constructors
- Always use standalone components with `imports` array
- Use control flow syntax (`@if`, `@for`, `@switch`) instead of structural directives
- Use `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators
- Set `changeDetection: ChangeDetectionStrategy.OnPush` for all components
- Use `update()` or `set()` instead of `mutate()` for signal updates
- Use NgOptimizedImage for all static images
- Place host bindings inside component decorators, not @HostBinding/@HostListener
- Use class and style bindings instead of ngClass/ngStyle
- Set `changeDetection: ChangeDetectionStrategy.OnPush` for all components
- Use `update()` or `set()` instead of `mutate()` for signal updates

## Build and Test

- **Start dev server**: `npm start`
- **Run tests**: `npm test` (uses Vitest)
- **Build**: `npm run build`
- **SSR build**: Available via `serve:ssr:angularTodo` script

## Conventions

- **State Management**: Use signals for local component state
- **Styling**: Prefer TailwindCSS utility classes over custom CSS
- **Testing**: Write unit tests using Vitest and testing-library patterns
- **File Structure**: Always follow the standard folder organization defined above
- **Component Creation**: Always create all 4 files (.ts, .html, .css, .spec.ts) for every component
- **File Naming**: Use kebab-case for files and folders, PascalCase for classes

## Error Prevention and Resolution

### CRITICAL: Always Check for Errors

- **Before Code Completion**: Use `get_errors` tool to check for compilation, TypeScript, and HTML errors
- **After Every Edit**: Validate changes don't introduce new errors
- **Component Creation**: Verify all imports are properly added and files compile successfully
- **Template Updates**: Check that all pipes, directives, and bindings are correctly imported

### Common Error Patterns and Solutions

#### 1. Missing Pipe Imports

**Error**: `No pipe found with name 'date'` or `No pipe found with name 'titlecase'`
**Solution**: Use Angular MCP server for current import patterns:

- Call `mcp_angular-cli_get_best_practices` for component structure standards
- Import required pipes: `DatePipe`, `TitleCasePipe`, `CurrencyPipe` from `@angular/common`
- Add to component `imports` array

#### 2. Missing Directive Imports

**Error**: `Can't bind to 'ngClass' since it isn't a known property`
**Solution**: Use Angular MCP server for directive patterns:

- Call `mcp_angular-cli_search_documentation` with query "ngClass directive imports"
- Import Angular common directives: `NgClass`, `NgStyle`, `NgIf`, `NgFor`

#### 3. Null Safety Violations

**Error**: `Object is possibly 'undefined'`
**Solution**: Use optional chaining patterns from Angular best practices:

- Call `mcp_angular-cli_get_best_practices` for null safety guidelines
- Replace `obj && obj.prop` with `obj?.prop`

#### 4. Invalid Class Binding Syntax

**Error**: String concatenation in class bindings
**Solution**: Refer to Angular documentation for binding patterns:

- Call `mcp_angular-cli_search_documentation` with query "class binding syntax"
- Use `[ngClass]="[class1(), class2()]"` instead of string concatenation

#### 5. Incorrect TailwindCSS Classes

**Error**: `The class 'flex-shrink-0' can be written as 'shrink-0'`
**Solution**: Use modern TailwindCSS shorthand classes - reference official documentation

#### 6. Invalid Focus Classes

**Error**: `focus:rounded` without proper context
**Solution**: Use complete focus class names from TailwindCSS documentation

#### 7. Protected Property Access in Tests

**Error**: `Property 'propertyName' is protected and only accessible within class and its subclasses`
**Solution**: Use Angular MCP server for testing patterns:

- Call `mcp_angular-cli_search_documentation` with query "component testing accessibility"
- Make test-accessible properties public or create public getters

#### 8. TypeScript Configuration Errors

**Error**: `The 'rootDir' setting must be explicitly set`
**Solution**: Use Angular MCP server for configuration patterns:

- Call `mcp_angular-cli_get_best_practices` for tsconfig structure

#### 9. Event Type Mismatch in Tests

**Error**: `Conversion of type may be a mistake`
**Solution**: Use Angular MCP server for testing patterns:

- Call `mcp_angular-cli_search_documentation` with query "event mocking testing"

### TypeScript Error Prevention

#### Strict Type Checking

- Always define proper interfaces for data structures
- Use `readonly` for input properties that shouldn't change
- Implement proper return types for methods
- Use union types for properties that can have multiple values

#### Modern Angular Patterns

**Reference**: Use Angular MCP server for current patterns:

- Call `mcp_angular-cli_get_best_practices` for input/output function usage
- Call `mcp_angular-cli_search_documentation` with query "signals computed patterns"
- Use `input()` and `output()` functions instead of decorators
- Use signals for state, computed for derived values

### HTML Template Error Prevention

#### Control Flow Syntax

**Reference**: Use Angular MCP server for template patterns:

- Call `mcp_angular-cli_search_documentation` with query "control flow syntax"
- Use `@if`, `@for`, `@switch` instead of structural directives
- Always provide `track` functions for `@for` loops
- Use proper null safety in templates

#### Accessibility Requirements

- Always provide `aria-label` or `aria-labelledby` for interactive elements
- Use proper semantic HTML elements
- Include `type` attribute for buttons
- Provide proper focus management

#### Template Validation

```html
<!-- Bad -->
<div *ngIf="items && items.length > 0">
  <div *ngFor="let item of items">
    <!-- Good -->
    @if (items()?.length) { @for (item of items(); track item.id) {
    <div>{{ item.name }}</div>
    } }
  </div>
</div>
```

### Testing Error Prevention

#### Component Property Visibility

- Use `public` or `protected` keywords appropriately based on testing needs
- Create public getters for protected properties that need testing
- Avoid overly exposing internal component state

#### Event Mocking in Tests

**Reference**: Use Angular MCP server for testing patterns:

- Call `mcp_angular-cli_search_documentation` with query "event mocking testing"
- Use proper event object creation with Object.defineProperty for target values

#### Signal Testing Patterns

**Reference**: Use Angular MCP server for signal testing:

- Call `mcp_angular-cli_search_documentation` with query "signal testing patterns"
- Test signal updates properly by comparing before/after state changes

### Compilation Error Resolution

#### Import Management

1. **Always import what you use**: Every pipe, directive, and component must be imported
2. **Check standalone component imports**: Verify `imports` array includes all dependencies
3. **Verify interface imports**: Ensure all TypeScript interfaces are properly imported
4. **Check circular imports**: Avoid importing components that create circular dependencies

#### File Structure Validation

**Reference**: Use Angular MCP server for component structure:

- Call `mcp_angular-cli_get_best_practices` for standard component templates
- Ensure all imports match template usage
- Use proper Angular 21 patterns with standalone components and signals

#### TypeScript Configuration Fixes

**Reference**: Use Angular MCP server for configuration:

- Call `mcp_angular-cli_get_best_practices` for tsconfig patterns
- Set explicit `rootDir` in tsconfig files
- Include proper types for Vitest and Node for spec files

### Error Checking Workflow

#### Pre-Development Checklist

1. Read existing component structure and patterns
2. Verify interface definitions exist for data types
3. Check required imports for template features
4. Validate TailwindCSS class usage

#### Post-Development Validation

1. Run `get_errors` tool on all modified files
2. Check TypeScript compilation passes
3. Verify template bindings are correct
4. Test component renders without errors
5. Validate accessibility attributes are present

#### Error Recovery Process

1. **Identify Error Type**: Compilation, TypeScript, or HTML template error
2. **Check Imports**: Verify all required imports are present in component
3. **Validate Syntax**: Ensure proper Angular 21 syntax usage
4. **Test Null Safety**: Add optional chaining where needed
5. **Verify Classes**: Use correct TailwindCSS class names
6. **Re-validate**: Run error check again after fixes

## Error Prevention and Resolution

## MCP Server Integration

### Angular MCP Server Usage

**MANDATORY**: Always use Angular MCP server for up-to-date patterns:

1. **Get Best Practices**: Call `mcp_angular-cli_get_best_practices` before creating components
2. **Search Documentation**: Use `mcp_angular-cli_search_documentation` for specific API questions
3. **Live Examples**: Prefer MCP server responses over static examples in instructions
4. **Version-Specific**: Ensure responses match project's Angular version

### Dynamic Pattern Resolution

- **Component Structure**: Use `mcp_angular-cli_get_best_practices` for component templates
- **Import Patterns**: Reference current Angular documentation via MCP instead of hardcoded examples
- **Template Syntax**: Query MCP for control flow and binding patterns
- **Testing Patterns**: Get signal testing examples from MCP server
- **Configuration**: Use MCP for tsconfig and build configuration patterns

## AI Assistant Guidelines

### MANDATORY: Error Prevention Workflow

- **BEFORE creating/editing components**: Read existing patterns and check for required imports
- **DURING development**: Use proper TypeScript types, null safety, and Angular 21 patterns
- **AFTER every change**: Run `get_errors` tool to validate no compilation or template errors
- **BEFORE completion**: Ensure all files compile successfully and follow project standards

### Code Generation Boundaries

- **No Hallucination**: Only use documented Angular 21 APIs, TailwindCSS classes, and project patterns that actually exist
- **Keep Components Small**: Create focused, single-responsibility components rather than large, complex ones
- **Ask When Unclear**: If requirements are ambiguous or missing details, ask clarifying questions instead of making assumptions
- **No Feature Creep**: Only implement the specific functionality requested - don't add extra features or "nice-to-have" additions
- **Follow Existing Patterns**: Examine existing code in the project before creating new files to maintain consistency
- **Validate APIs**: Ensure all imported modules, classes, and functions exist in Angular 21 and project dependencies
- **Enforce Structure**: Always follow the defined folder structure and create all 4 component files (.ts, .html, .css, .spec.ts)
- **Proper Placement**: Place components in `src/app/components/`, services in `src/app/services/`, interfaces in `src/app/interfaces/`
- **Error-Free Code**: Never complete a task without verifying the code compiles and has no TypeScript or HTML errors

### Best Practices

- **Start Simple**: Begin with minimal implementations that meet requirements, then enhance if requested
- **One Concern Per File**: Create separate files for different responsibilities (component logic, templates, styles, tests)
- **Progressive Enhancement**: Build core functionality first, add advanced features only when explicitly requested
- **Use Angular Best Practices**: Always reference official Angular best practices via MCP server for guidance
- **Live Component Patterns**: Use Angular MCP server for up-to-date component generation examples instead of static templates
- **Expert Knowledge**: For complex Angular tasks, use the `/angular-expert` skill for architecture, performance, accessibility, and advanced patterns
- **Documentation Reference**: When uncertain about syntax or patterns, reference official Angular and TailwindCSS documentation
- **Error Prevention**: Prefer TypeScript strict mode patterns and include proper error handling where appropriate
- **Accessibility First**: Ensure all generated code passes AXE checks and follows WCAG AA standards
- **Import Verification**: Always verify and include required imports for pipes, directives, and components used in templates
- **Template Validation**: Use modern Angular control flow syntax and proper null safety in templates
- **Class Name Accuracy**: Use correct and modern TailwindCSS class names, avoiding deprecated patterns
- **MCP Server Priority**: Always query MCP servers for patterns before using static examples or assumptions
