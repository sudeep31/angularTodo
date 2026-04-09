---
description: 'Use when styling Angular components with TailwindCSS. Covers utility classes, responsive design, component styling patterns, and todo app specific design tokens.'
name: 'TailwindCSS Styling'
applyTo: ['src/**/*.html', 'src/**/*.css']
---

# TailwindCSS Styling Guidelines

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

- Use semantic HTML with Tailwind classes for styling
- Prefer utility classes over custom CSS when possible
- Group related utilities logically in class attributes
- Use consistent spacing scale (4, 8, 12, 16, 24, 32...)
- Implement hover and focus states for interactive elements
- Consider dark mode and accessibility from the start
