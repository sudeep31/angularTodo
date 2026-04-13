import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TodoApiService } from './todo-api.service';
import { Todo } from '../interfaces/todo.interface';

const BASE_URL = 'http://localhost:3000/todos';

const MOCK_TODOS: Todo[] = [
  {
    id: '1',
    title: 'Buy groceries',
    description: 'Milk eggs and bread',
    completed: false,
    priority: 'high',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    tags: ['shopping']
  },
  {
    id: '2',
    title: 'Read a book',
    description: 'Finish the chapter',
    completed: true,
    priority: 'medium',
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02'),
    tags: []
  }
];

describe('TodoApiService', () => {
  let service: TodoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoApiService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TodoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensure no outstanding requests
  });

  // ─── Initial State ────────────────────────────────────────────
  describe('Initial State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialise todos as empty array', () => {
      expect(service.todos()).toEqual([]);
    });

    it('should initialise selectedTodo as null', () => {
      expect(service.selectedTodo()).toBeNull();
    });

    it('should initialise loading as false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should initialise error as null', () => {
      expect(service.error()).toBeNull();
    });
  });

  // ─── GET /todos ───────────────────────────────────────────────
  describe('getAll()', () => {
    it('should set loading to true while request is in flight', () => {
      service.getAll();
      expect(service.isLoading()).toBe(true);
      httpMock.expectOne(BASE_URL).flush(MOCK_TODOS);
    });

    it('should populate todos signal with response data', () => {
      service.getAll();
      httpMock.expectOne(BASE_URL).flush(MOCK_TODOS);

      expect(service.todos()).toHaveLength(2);
      expect(service.todos()[0].title).toBe('Buy groceries');
    });

    it('should set loading to false after success', () => {
      service.getAll();
      httpMock.expectOne(BASE_URL).flush(MOCK_TODOS);

      expect(service.isLoading()).toBe(false);
    });

    it('should set error signal on HTTP failure', () => {
      service.getAll();
      httpMock.expectOne(BASE_URL).flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error'
      });

      expect(service.error()).not.toBeNull();
      expect(service.isLoading()).toBe(false);
    });
  });

  // ─── GET /todos/:id ───────────────────────────────────────────
  describe('getById()', () => {
    it('should set selectedTodo signal with the fetched record', () => {
      service.getById('1');
      httpMock.expectOne(`${BASE_URL}/1`).flush(MOCK_TODOS[0]);

      expect(service.selectedTodo()).not.toBeNull();
      expect(service.selectedTodo()!.id).toBe('1');
      expect(service.selectedTodo()!.title).toBe('Buy groceries');
    });

    it('should set selectedTodo to null on HTTP error', () => {
      service.getById('999');
      httpMock.expectOne(`${BASE_URL}/999`).flush('Not found', {
        status: 404,
        statusText: 'Not Found'
      });

      expect(service.selectedTodo()).toBeNull();
      expect(service.error()).not.toBeNull();
    });
  });

  // ─── POST /todos ──────────────────────────────────────────────
  describe('create()', () => {
    it('should append the new todo to the todos signal', () => {
      service.todos.set([...MOCK_TODOS]);

      const payload = {
        title: 'New Task',
        description: 'Details here',
        completed: false,
        priority: 'low' as const,
        tags: []
      };

      const serverResponse: Todo = {
        ...payload,
        id: '3',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.create(payload);
      httpMock.expectOne(BASE_URL).flush(serverResponse);

      expect(service.todos()).toHaveLength(3);
      expect(service.todos().at(-1)!.title).toBe('New Task');
    });

    it('should set error on create failure', () => {
      service.create({
        title: 'Fail Task',
        description: 'Will fail',
        completed: false,
        priority: 'low',
        tags: []
      });
      httpMock.expectOne(BASE_URL).flush('Error', { status: 400, statusText: 'Bad Request' });

      expect(service.error()).not.toBeNull();
    });
  });

  // ─── PUT /todos/:id ───────────────────────────────────────────
  describe('update()', () => {
    beforeEach(() => {
      service.todos.set([...MOCK_TODOS]);
    });

    it('should update the matching todo in the todos signal', () => {
      const updatedRecord: Todo = {
        ...MOCK_TODOS[0],
        title: 'Updated Title',
        updatedAt: new Date()
      };

      service.update('1', { title: 'Updated Title' });
      httpMock.expectOne(`${BASE_URL}/1`).flush(updatedRecord);

      expect(service.todos()[0].title).toBe('Updated Title');
    });

    it('should set error immediately if todo id does not exist locally', () => {
      service.update('non-existent', { title: 'Ghost' });
      httpMock.expectNone(`${BASE_URL}/non-existent`);

      expect(service.error()).not.toBeNull();
    });
  });

  // ─── DELETE /todos/:id ────────────────────────────────────────
  describe('delete()', () => {
    beforeEach(() => {
      service.todos.set([...MOCK_TODOS]);
    });

    it('should remove the deleted todo from the todos signal', () => {
      service.delete('1');
      httpMock.expectOne(`${BASE_URL}/1`).flush(null);

      expect(service.todos()).toHaveLength(1);
      expect(service.todos().find(t => t.id === '1')).toBeUndefined();
    });

    it('should clear selectedTodo if the deleted id matches', () => {
      service.selectedTodo.set(MOCK_TODOS[0]);
      service.delete('1');
      httpMock.expectOne(`${BASE_URL}/1`).flush(null);

      expect(service.selectedTodo()).toBeNull();
    });

    it('should set error on delete failure', () => {
      service.delete('1');
      httpMock.expectOne(`${BASE_URL}/1`).flush('Error', { status: 500, statusText: 'Server Error' });

      expect(service.error()).not.toBeNull();
    });
  });

  // ─── Computed Signals ─────────────────────────────────────────
  describe('Computed Signals', () => {
    beforeEach(() => {
      service.todos.set([...MOCK_TODOS]);
    });

    it('should compute totalCount correctly', () => {
      expect(service.totalCount()).toBe(2);
    });

    it('should compute activeCount correctly', () => {
      expect(service.activeCount()).toBe(1); // mock-1 is not completed
    });

    it('should compute completedCount correctly', () => {
      expect(service.completedCount()).toBe(1); // mock-2 is completed
    });
  });

  // ─── Helper Methods ───────────────────────────────────────────
  describe('Helper Methods', () => {
    it('clearSelectedTodo() should set selectedTodo to null', () => {
      service.selectedTodo.set(MOCK_TODOS[0]);
      service.clearSelectedTodo();
      expect(service.selectedTodo()).toBeNull();
    });

    it('clearError() should reset the error signal', () => {
      service.state.set({ loading: false, error: 'Something went wrong' });
      service.clearError();
      expect(service.error()).toBeNull();
    });
  });
});
