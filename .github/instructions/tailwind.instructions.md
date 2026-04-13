---
description: 'Use when styling Angular components with TailwindCSS. Covers utility classes, responsive design, component styling patterns, and todo app specific design tokens.'
name: 'TailwindCSS Styling'
applyTo: ['src/**/*.html', 'src/**/*.css']
---

# TailwindCSS Styling Guidelines

## MCP Server Usage (REQUIRED)

**ALWAYS use the TailwindCSS MCP server tools before applying styling:**

### 🛠️ Tool Activation (FIRST STEP)

```typescript
// Activate TailwindCSS MCP tools before use:
activate_tailwindcss_utilities_and_documentation_tools(); // For utilities and docs
activate_tailwindcss_configuration_tools(); // For installation/config
activate_color_palette_generation_tools(); // For color management
```

### 📋 When to Use Which Tool

| **Task**             | **MCP Tool**                                      | **Use Case**                               |
| -------------------- | ------------------------------------------------- | ------------------------------------------ |
| Find utility classes | `mcp_tailwindcss-s_get_tailwind_utilities()`      | When you need specific TailwindCSS classes |
| Convert CSS to TW    | `mcp_tailwindcss-s_convert_css_to_tailwind()`     | When converting existing CSS               |
| Generate components  | `mcp_tailwindcss-s_generate_component_template()` | For buttons, cards, forms, modals          |
| Color information    | `mcp_tailwindcss-s_get_tailwind_colors()`         | When working with colors/themes            |
| Documentation        | `mcp_tailwindcss-s_search_tailwind_docs()`        | When you need TailwindCSS guidance         |
| Setup guides         | `mcp_tailwindcss-s_install_tailwind()`            | For installation instructions              |

### � Example Workflow

```typescript
// 1. Activate tools first
activate_tailwindcss_utilities_and_documentation_tools();

// 2. Find appropriate classes
const layoutClasses =
  (await mcp_tailwindcss) -
  s_get_tailwind_utilities({
    category: 'layout',
  });

// 3. Get color information
const colors =
  (await mcp_tailwindcss) -
  s_get_tailwind_colors({
    colorName: 'blue',
  });

// 4. Generate a component template if needed
const buttonTemplate =
  (await mcp_tailwindcss) -
  s_generate_component_template({
    componentType: 'button',
    style: 'modern',
    responsive: true,
  });

// 5. Apply classes in HTML template
// <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
```

### �🔍 Finding TailwindCSS Classes

```typescript
// Use these MCP tools to get accurate TailwindCSS classes:

// 1. Get utilities by category
mcp_tailwindcss - s_get_tailwind_utilities({ category: 'layout' }); // flex, grid, etc.
mcp_tailwindcss - s_get_tailwind_utilities({ category: 'spacing' }); // p-4, m-2, etc.
mcp_tailwindcss - s_get_tailwind_utilities({ category: 'colors' }); // bg-blue-500, etc.

// 2. Get utilities by CSS property
mcp_tailwindcss - s_get_tailwind_utilities({ property: 'margin' }); // m-1, mx-auto, etc.
mcp_tailwindcss - s_get_tailwind_utilities({ property: 'background' }); // bg-white, bg-opacity-50

// 3. Search for specific utilities
mcp_tailwindcss - s_get_tailwind_utilities({ search: 'rounded' }); // rounded-lg, rounded-full
mcp_tailwindcss - s_get_tailwind_utilities({ search: 'shadow' }); // shadow-md, shadow-lg
```

### 🎨 Color Palette Tools

```typescript
// Get TailwindCSS color information
mcp_tailwindcss - s_get_tailwind_colors({ colorName: 'blue' }); // All blue shades
mcp_tailwindcss - s_get_tailwind_colors({ includeShades: true }); // All colors with shades

// Generate custom color palettes
mcp_tailwindcss -
  s_generate_color_palette({
    baseColor: '#3B82F6',
    name: 'brand',
  });
```

### 🔄 CSS Conversion Tools

```typescript
// Convert existing CSS to TailwindCSS utilities
mcp_tailwindcss -
  s_convert_css_to_tailwind({
    css: `
    .my-style {
      padding: 16px;
      background-color: #3B82F6;
      border-radius: 8px;
    }
  `,
    mode: 'classes', // Returns: 'p-4 bg-blue-500 rounded-lg'
  });
```

### 🧩 Component Generation

```typescript
// Generate pre-styled component templates
mcp_tailwindcss -
  s_generate_component_template({
    componentType: 'button', // 'card', 'form', 'navbar', 'modal', etc.
    style: 'modern', // 'minimal', 'modern', 'playful'
    responsive: true, // Include responsive classes
    darkMode: false, // Include dark mode support
  });
```

### 📚 Documentation Search

```typescript
// Search TailwindCSS documentation
mcp_tailwindcss -
  s_search_tailwind_docs({
    query: 'flexbox utilities',
    category: 'layout', // Optional filter
    limit: 10, // Limit results
  });
```

### 🚀 Installation & Configuration

```typescript
// Get framework-specific installation instructions
mcp_tailwindcss -
  s_install_tailwind({
    framework: 'angular', // 'react', 'vue', 'nextjs', etc.
    packageManager: 'npm', // 'yarn', 'pnpm', 'bun'
    includeTypescript: true,
  });

// Get configuration guides
mcp_tailwindcss -
  s_get_tailwind_config_guide({
    framework: 'angular',
    topic: 'customization', // 'installation', 'customization'
  });
```

## Styling Policy (CRITICAL)

- **CSS Policy**: **DO NOT add custom CSS, inline styles, or styling unless explicitly requested by the user**
- **Position Policy**: **DO NOT add TailwindCSS positioning classes (absolute, relative, fixed, sticky, static) unless explicitly requested by the user**
- **MCP First**: **ALWAYS use MCP server tools to find correct TailwindCSS classes before applying them**
- **User-Requested Only**: Only add styling when the user specifically asks for visual changes
- **Clean Templates**: Keep HTML templates clean without unnecessary styling attributes

## Component Styling Patterns

```html
<!-- Card layouts -->
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <!-- Content -->
</div>

<!-- Button styles -->
<button
  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
>
  Action
</button>

<!-- Form inputs -->
<input
  type="text"
  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  placeholder="Enter todo..."
/>
```

## Todo App Design System

```html
<!-- Todo item states -->
<div class="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50">
  <!-- Checkbox -->
  <input type="checkbox" class="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300" />

  <!-- Todo text (completed state) -->
  <span
    class="flex-1 text-gray-900"
    [class.line-through]="todo.completed"
    [class.text-gray-500]="todo.completed"
  >
    {{ todo.title }}
  </span>

  <!-- Actions -->
  <button class="ml-3 text-red-500 hover:text-red-700">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <!-- Delete icon -->
    </svg>
  </button>
</div>
```

## Layout Utilities

```html
<!-- Container -->
<div class="max-w-md mx-auto mt-8 p-6">
  <!-- Flexbox layouts -->
  <div class="flex items-center justify-between">
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-3 gap-4">
        <!-- Responsive -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      </div>
    </div>
  </div>
</div>
```

## State Classes

```html
<!-- Loading states -->
<div class="animate-pulse">
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

<!-- Empty states -->
<div class="text-center py-12 text-gray-500">
  <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor">
    <!-- Icon -->
  </svg>
  <p class="mt-4 text-lg">No todos yet</p>
  <p class="mt-1 text-sm">Add your first todo to get started</p>
</div>

<!-- Error states -->
<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error message here</div>
```

## Interactive Elements

```html
<!-- Hover effects -->
<div class="hover:shadow-lg hover:scale-105 transition-all duration-200">
  <!-- Focus states -->
  <button class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
    <!-- Active states -->
    <button class="active:bg-blue-700 active:transform active:scale-95"></button>
  </button>
</div>
```

## Custom CSS Patterns

```css
/* Use @apply for component styles */
.todo-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded-md;
  @apply hover:bg-blue-600 focus:ring-2 focus:ring-blue-300;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.todo-item {
  @apply flex items-center p-3 border-b border-gray-100;
  @apply hover:bg-gray-50 transition-colors;
}
```

## Dark Mode Support

```html
<!-- Dark mode classes -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <!-- Dark mode borders -->
  <div class="border-gray-200 dark:border-gray-700">
    <!-- Dark mode hover states -->
    <button class="hover:bg-gray-100 dark:hover:bg-gray-700"></button>
  </div>
</div>
```

## Accessibility Patterns

```html
<!-- Screen reader only text -->
<span class="sr-only">Mark as complete</span>

<!-- Focus visible -->
<button class="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
  <!-- High contrast mode -->
  <div class="border border-gray-300 border-solid"></div>
</button>
```

## Best Practices

### MCP Server Workflow (MANDATORY)

1. **Activate TailwindCSS tools**: Use `activate_tailwindcss_utilities_and_documentation_tools` or other relevant activation tools
2. **Search for classes**: Use `mcp_tailwindcss-s_get_tailwind_utilities()` to find appropriate utility classes
3. **Verify colors**: Use `mcp_tailwindcss-s_get_tailwind_colors()` for color palette information
4. **Convert existing CSS**: Use `mcp_tailwindcss-s_convert_css_to_tailwind()` if converting legacy styles
5. **Generate components**: Use `mcp_tailwindcss-s_generate_component_template()` for complex UI patterns
6. **Check documentation**: Use `mcp_tailwindcss-s_search_tailwind_docs()` when in doubt

### Development Guidelines

- **MCP First Approach**: Always query MCP server tools before manually writing TailwindCSS classes
- **Semantic HTML**: Use semantic HTML with Tailwind classes for styling
- **Utility Over Custom**: Prefer utility classes over custom CSS when possible
- **Logical Grouping**: Group related utilities logically in class attributes
- **Consistent Spacing**: Use consistent spacing scale (4, 8, 12, 16, 24, 32...)
- **Interactive States**: Implement hover and focus states for interactive elements
- **Accessibility First**: Consider dark mode and accessibility from the start
- **No Position Classes**: Avoid positioning classes (absolute, relative, fixed, sticky) unless requested
- **User-Requested Styling**: Only add visual styling when explicitly asked by the user
