# Angular Performance Patterns

## OnPush Change Detection Strategy

### Component Optimization

```typescript
@Component({
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (todo of todos(); track todo.id) {
      <app-todo-item [todo]="todo" (toggle)="onToggle($event)" (delete)="onDelete($event)" />
    }
  `,
})
export class TodoListComponent {
  readonly todos = input.required<Todo[]>();

  // Events bubble up to parent for state updates
  readonly todoToggled = output<string>();
  readonly todoDeleted = output<string>();

  onToggle(id: string): void {
    this.todoToggled.emit(id);
  }

  onDelete(id: string): void {
    this.todoDeleted.emit(id);
  }
}

@Component({
  selector: 'app-todo-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center p-2 hover:bg-gray-50">
      <input
        type="checkbox"
        [checked]="todo().completed"
        (change)="toggle.emit(todo().id)"
        class="mr-3"
      />

      <span [class.line-through]="todo().completed" [class.text-gray-500]="todo().completed">
        {{ todo().title }}
      </span>

      <button (click)="delete.emit(todo().id)" class="ml-auto text-red-500 hover:text-red-700">
        Delete
      </button>
    </div>
  `,
})
export class TodoItemComponent {
  readonly todo = input.required<Todo>();
  readonly toggle = output<string>();
  readonly delete = output<string>();
}
```

## Signal-Based Performance

### Computed Signals for Expensive Operations

```typescript
@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly _todos = signal<Todo[]>([]);
  private readonly _filter = signal<TodoFilter>('all');
  private readonly _searchTerm = signal('');

  // Expensive filtering computation cached with computed()
  readonly filteredTodos = computed(() => {
    const todos = this._todos();
    const filter = this._filter();
    const searchTerm = this._searchTerm().toLowerCase();

    return todos
      .filter((todo) => {
        // Filter by completion status
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
      })
      .filter((todo) => {
        // Filter by search term
        return (
          searchTerm === '' ||
          todo.title.toLowerCase().includes(searchTerm) ||
          todo.description.toLowerCase().includes(searchTerm)
        );
      })
      .sort((a, b) => {
        // Sort by priority, then by created date
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  });

  // Only computed when filter changes, not on every todo update
  readonly filterCounts = computed(() => {
    const todos = this._todos();
    return {
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    };
  });
}
```

### Virtual Scrolling for Large Lists

```typescript
@Component({
  selector: 'app-todo-list',
  template: `
    <cdk-virtual-scroll-viewport itemSize="60" class="h-96 w-full">
      @for (todo of filteredTodos(); track todo.id) {
        <app-todo-item [todo]="todo" (toggle)="onToggle($event)" (delete)="onDelete($event)" />
      }
    </cdk-virtual-scroll-viewport>
  `,
})
export class TodoListComponent {
  readonly filteredTodos = computed(() => this.todoService.filteredTodos());
}
```

## Lazy Loading and Code Splitting

### Feature Module Lazy Loading

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'todos',
    loadComponent: () =>
      import('./features/todos/todo-list.component').then((m) => m.TodoListComponent),
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then((m) => m.settingsRoutes),
  },
  { path: '', redirectTo: '/todos', pathMatch: 'full' },
  { path: '**', redirectTo: '/todos' },
];

// features/settings/settings.routes.ts
export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
  },
];
```

### Dynamic Component Loading

```typescript
@Component({
  template: `
    <div class="space-y-4">
      @for (widget of widgets(); track widget.id) {
        <ng-container *componentOutlet="widget.component; inputs: widget.inputs"> </ng-container>
      }
    </div>
  `,
})
export class DashboardComponent {
  readonly widgets = signal<Widget[]>([]);

  async loadWidget(type: WidgetType): Promise<void> {
    const component = await this.getWidgetComponent(type);

    this.widgets.update((widgets) => [
      ...widgets,
      {
        id: crypto.randomUUID(),
        component,
        inputs: { data: this.getWidgetData(type) },
      },
    ]);
  }

  private async getWidgetComponent(type: WidgetType): Promise<ComponentType<any>> {
    switch (type) {
      case 'chart':
        return (await import('./widgets/chart/chart.component')).ChartComponent;
      case 'table':
        return (await import('./widgets/table/table.component')).TableComponent;
      default:
        throw new Error(`Unknown widget type: ${type}`);
    }
  }
}
```

## Bundle Size Optimization

### Tree Shaking Configuration

```typescript
// angular.json optimization configuration
"build": {
  "builder": "@angular/build:browser",
  "options": {
    "optimization": {
      "scripts": true,
      "styles": {
        "minify": true,
        "inlineCritical": false
      },
      "fonts": {
        "inline": true
      }
    },
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "500kb",
        "maximumError": "1mb"
      },
      {
        "type": "anyComponentStyle",
        "maximumWarning": "2kb",
        "maximumError": "4kb"
      }
    ]
  }
}

// Selective imports
import { HttpClient } from '@angular/common/http';
// Instead of: import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// Instead of: import * as Material from '@angular/material';
```

### Preloading Strategies

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // Preload all lazy routes
      // Or custom strategy:
      // withPreloading(CustomPreloadingStrategy)
    )
  ]
};

// Custom preloading strategy
@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload routes marked with data.preload = true
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}

// Route with preloading hint
{
  path: 'important-feature',
  loadComponent: () => import('./important/important.component'),
  data: { preload: true }
}
```

## Memory Leak Prevention

### Subscription Management

```typescript
@Component({
  template: `<!-- template -->`,
})
export class TodoComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly todosService = inject(TodosService);

  ngOnInit(): void {
    // Subscription with takeUntil pattern
    this.todosService.todos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((todos) => this.processTodos(todos));

    // Multiple subscriptions
    merge(this.todosService.loading$, this.todosService.error$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(([loading, error]) => {
        this.handleState(loading, error);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Modern signal approach (no subscriptions needed)
@Component({
  template: `<!-- template -->`,
})
export class ModernTodoComponent {
  private readonly todosService = inject(TodosService);

  // Signals automatically clean up
  readonly todos = this.todosService.todos;
  readonly loading = this.todosService.loading;
  readonly error = this.todosService.error;
}
```

### Effect Cleanup

```typescript
@Component({
  template: `<!-- template -->`,
})
export class TodoComponent implements OnInit {
  private readonly userPreferences = inject(UserPreferencesService);

  readonly theme = signal<'light' | 'dark'>('light');

  ngOnInit(): void {
    // Effect with cleanup
    effect(() => {
      const theme = this.theme();

      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);

      // Cleanup function
      return () => {
        document.documentElement.removeAttribute('data-theme');
      };
    });
  }
}
```

## Performance Monitoring

### Core Web Vitals

```typescript
// performance.service.ts
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private observer?: PerformanceObserver;

  initWebVitals(): void {
    // Cumulative Layout Shift
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
      }
    });
    this.observer.observe({ type: 'layout-shift', buffered: true });

    // First Input Delay
    this.observer.observe({ type: 'first-input', buffered: true });

    // Largest Contentful Paint
    this.observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  measureComponentRender(componentName: string): void {
    performance.mark(`${componentName}-start`);

    setTimeout(() => {
      performance.mark(`${componentName}-end`);
      performance.measure(
        `${componentName}-render`,
        `${componentName}-start`,
        `${componentName}-end`,
      );
    });
  }
}
```
