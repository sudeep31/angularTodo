import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Todo } from '../interfaces/todo.interface';
import { environment } from '../../environments/environment';

export interface ApiState {
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class TodoApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.apiBaseUrl;

  // ── Signals ────────────────────────────────────────────────────
  readonly todos = signal<Todo[]>([]);
  readonly selectedTodo = signal<Todo | null>(null);
  readonly state = signal<ApiState>({ loading: false, error: null });

  // ── Computed helpers ───────────────────────────────────────────
  readonly isLoading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly totalCount = computed(() => this.todos().length);
  readonly activeCount = computed(() => this.todos().filter(t => !t.completed).length);
  readonly completedCount = computed(() => this.todos().filter(t => t.completed).length);

  // ── GET /todos ─────────────────────────────────────────────────
  getAll(): void {
    this.state.set({ loading: true, error: null });

    this.http.get<Todo[]>(this.BASE_URL).subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.state.set({ loading: false, error: null });
      },
      error: (err: HttpErrorResponse) => {
        this.state.set({ loading: false, error: this.formatError(err) });
      }
    });
  }

  // ── GET /todos/:id ─────────────────────────────────────────────
  getById(id: string): void {
    this.state.set({ loading: true, error: null });

    this.http.get<Todo>(`${this.BASE_URL}/${id}`).subscribe({
      next: (todo) => {
        this.selectedTodo.set(todo);
        this.state.set({ loading: false, error: null });
      },
      error: (err: HttpErrorResponse) => {
        this.selectedTodo.set(null);
        this.state.set({ loading: false, error: this.formatError(err) });
      }
    });
  }

  // ── POST /todos ────────────────────────────────────────────────
  create(payload: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.state.set({ loading: true, error: null });

    const now = new Date().toISOString();
    const newTodo = { ...payload, createdAt: now, updatedAt: now };

    this.http.post<Todo>(this.BASE_URL, newTodo).subscribe({
      next: (created) => {
        this.todos.update(todos => [...todos, created]);
        this.state.set({ loading: false, error: null });
      },
      error: (err: HttpErrorResponse) => {
        this.state.set({ loading: false, error: this.formatError(err) });
      }
    });
  }

  // ── PUT /todos/:id ─────────────────────────────────────────────
  update(id: string, payload: Partial<Omit<Todo, 'id' | 'createdAt'>>): void {
    this.state.set({ loading: true, error: null });

    const existing = this.todos().find(t => t.id === id);
    if (!existing) {
      this.state.set({ loading: false, error: `Todo with id "${id}" not found.` });
      return;
    }

    const updatedTodo: Todo = {
      ...existing,
      ...payload,
      updatedAt: new Date()
    };

    this.http.put<Todo>(`${this.BASE_URL}/${id}`, updatedTodo).subscribe({
      next: (saved) => {
        this.todos.update(todos => todos.map(t => (t.id === id ? saved : t)));
        if (this.selectedTodo()?.id === id) this.selectedTodo.set(saved);
        this.state.set({ loading: false, error: null });
      },
      error: (err: HttpErrorResponse) => {
        this.state.set({ loading: false, error: this.formatError(err) });
      }
    });
  }

  // ── DELETE /todos/:id ──────────────────────────────────────────
  delete(id: string): void {
    this.state.set({ loading: true, error: null });

    this.http.delete<void>(`${this.BASE_URL}/${id}`).subscribe({
      next: () => {
        this.todos.update(todos => todos.filter(t => t.id !== id));
        if (this.selectedTodo()?.id === id) this.selectedTodo.set(null);
        this.state.set({ loading: false, error: null });
      },
      error: (err: HttpErrorResponse) => {
        this.state.set({ loading: false, error: this.formatError(err) });
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────
  clearSelectedTodo(): void {
    this.selectedTodo.set(null);
  }

  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  private formatError(err: HttpErrorResponse): string {
    return err.message ?? 'An unexpected error occurred.';
  }
}
