# Design Patterns & Architectural Patterns for Front-End Engineers

**Sudeep Parchure** | AI Assisted | May 2026 | Angular Solutions Architect

> Source code and working examples: [github.com/sudeep31/angularTodo â€” documents folder](https://github.com/sudeep31/angularTodo/blob/gitHubCopioletAngularTodo/documents)

---

## Table of Contents

1. [Introduction â€” Why Patterns Matter](#1-introduction--why-patterns-matter)
2. [Design Patterns â€” GoF & Front-End](#2-design-patterns--gof--front-end)
   - [2.1 Creational Patterns](#21-creational-patterns)
   - [2.2 Structural Patterns](#22-structural-patterns)
   - [2.3 Behavioural Patterns](#23-behavioural-patterns)
3. [Architectural Patterns](#3-architectural-patterns)
   - [3.1 Micro-Frontend (MFE)](#31-micro-frontend-mfe)
   - [3.2 Atomic Design](#32-atomic-design)
   - [3.3 Backend for Frontend (BFF)](#33-backend-for-frontend-bff)
   - [3.4 Saga Pattern](#34-saga-pattern)
   - [3.5 CQRS & Event Sourcing](#35-cqrs--event-sourcing)
   - [3.6 Flux / NgRx (Redux)](#36-flux--ngrx-redux)
   - [3.7 Smart / Presentational Components](#37-smart--presentational-components)
   - [3.8 Feature-Sliced Design](#38-feature-sliced-design)
4. [Architectural Strategies](#4-architectural-strategies)
   - [4.1 The 12-Factor App â€” Front-End Context](#41-the-12-factor-app--front-end-context)
   - [4.2 The 6-Hour Design Approach](#42-the-6-hour-design-approach)
5. [Tools & Diagram Types](#5-tools--diagram-types)
6. [System Design Case Studies](#6-system-design-case-studies)
   - [6.1 Enterprise Banking Application](#61-enterprise-banking-application)
7. [Resources](#7-resources)

---

## 1. Introduction â€” Why Patterns Matter

Patterns are **proven, reusable solutions to recurring problems** in software design. They are not copy-paste code â€” they are vocabulary and blueprints. For a front-end engineer working with Angular 21, patterns answer three questions:

| Question                                              | Pattern Category       | Example                    |
| ----------------------------------------------------- | ---------------------- | -------------------------- |
| How do I structure this object or service?            | Design Pattern (GoF)   | Factory, Singleton, Facade |
| How do I organise the application?                    | Architectural Pattern  | MFE, Atomic Design, NgRx   |
| How do I make the right strategic decisions at scale? | Architectural Strategy | 12-Factor, 6-Hour Design   |

### Angular 21 Context

Angular 21 introduces features that change _how_ classic patterns are implemented:

| Angular 21 Feature                               | Pattern Impact                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| Signals (`signal()`, `computed()`, `effect()`)   | Replaces RxJS for local state; changes Observer pattern implementation |
| `input()` / `output()` functions                 | Replaces `@Input()` / `@Output()` decorators                           |
| `inject()` function                              | Replaces constructor injection; enables functional patterns            |
| Signal-based forms (`FormField`, `linkedSignal`) | Replaces reactive forms for many use cases                             |
| Standalone components (no NgModule)              | Enables Feature-Sliced Design and lazy loading without modules         |
| SSR + hydration (Angular 21)                     | Affects BFF and state transfer patterns                                |
| `@defer` blocks                                  | Lazy-loading pattern built into templates                              |

> **Principle:** Never apply a pattern just because it exists. Apply it when the problem it solves is present in your codebase.

---

<!-- pagebreak -->

## 2. Design Patterns â€” GoF & Front-End

The Gang of Four (GoF) catalogue defines 23 patterns across three categories. This section maps each relevant pattern to Angular 21, shows how it is implemented, and gives real-world examples.

---

### 2.1 Creational Patterns

Creational patterns deal with **how objects are created**, decoupling the creation logic from the consuming code.

---

#### Factory Pattern

**What it is:** A function or class that creates objects without exposing instantiation logic to the caller. The caller asks for a product; the factory decides which concrete class to return.

**How it helps:** Centralises creation logic, makes swapping implementations easy, and removes `new` calls from consuming code.

**Angular 21 implementation:**

```typescript
// token-storage.factory.ts
export type StorageType = 'local' | 'session' | 'memory';

export interface TokenStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

class LocalTokenStorage implements TokenStorage {
  get(key: string) {
    return localStorage.getItem(key);
  }
  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }
  remove(key: string) {
    localStorage.removeItem(key);
  }
}

class SessionTokenStorage implements TokenStorage {
  get(key: string) {
    return sessionStorage.getItem(key);
  }
  set(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }
  remove(key: string) {
    sessionStorage.removeItem(key);
  }
}

class MemoryTokenStorage implements TokenStorage {
  private store = new Map<string, string>();
  get(key: string) {
    return this.store.get(key) ?? null;
  }
  set(key: string, value: string) {
    this.store.set(key, value);
  }
  remove(key: string) {
    this.store.delete(key);
  }
}

// The Factory
export function createTokenStorage(type: StorageType): TokenStorage {
  switch (type) {
    case 'local':
      return new LocalTokenStorage();
    case 'session':
      return new SessionTokenStorage();
    case 'memory':
      return new MemoryTokenStorage();
  }
}

// Angular DI provider using factory
export const TOKEN_STORAGE = new InjectionToken<TokenStorage>('TOKEN_STORAGE', {
  providedIn: 'root',
  factory: () => createTokenStorage(inject(PLATFORM_ID) === 'browser' ? 'local' : 'memory'),
});
```

> **Code walkthrough â€” how this becomes the Factory Pattern:**
>
> 1. **`StorageType` and `TokenStorage` interface** â€” Define the contract first. Every storage class must implement `get()`, `set()`, and `remove()`. Callers will only ever see this interface â€” never a concrete class.
> 2. **`LocalTokenStorage`, `SessionTokenStorage`, `MemoryTokenStorage`** â€” Three concrete implementations, each wrapping a different browser/server mechanism. Crucially, none of these classes are exported. They are implementation details hidden inside the file.
> 3. **`createTokenStorage(type)` â€” this is the Factory function.** It accepts a plain `StorageType` string and returns whichever concrete class matches. The caller never writes `new LocalTokenStorage()`. That decision lives in one place: the factory.
> 4. **`TOKEN_STORAGE` injection token** â€” Angular's DI calls the factory function automatically. It reads `PLATFORM_ID` to pick `'local'` in the browser and `'memory'` on the server (SSR). Any service that injects `TOKEN_STORAGE` gets the right implementation with no platform-detection code of its own.
>
> **Pattern conclusion:** The interface hides the concrete types. The factory centralises all creation logic. Consumers depend on the `TokenStorage` abstraction â€” they never import or instantiate a storage class directly. Swapping the implementation (e.g. using an encrypted storage class) means changing one line inside the factory â€” zero changes anywhere else.

**Real-world use:** Banking app â€” SSR uses in-memory storage, browser uses `localStorage`. The factory decides at runtime without the consuming service knowing.

---

#### Singleton Pattern

**What it is:** Ensures a class has only one instance and provides a global access point to it.

**How it helps:** Shared state (auth tokens, feature flags, app config) lives in one place, preventing inconsistency.

**Angular 21 implementation:**

Angular's DI system is the Singleton pattern â€” `providedIn: 'root'` creates exactly one instance across the app.

```typescript
// auth.service.ts â€” Angular-native singleton
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  login(credentials: Credentials): Observable<void> {
    return this.http
      .post<AuthResponse>('/api/auth/login', credentials)
      .pipe(tap((response) => this._user.set(response.user)));
  }

  logout(): void {
    this._user.set(null);
  }
}
```

> **Code walkthrough â€” how this becomes the Singleton Pattern:**
>
> 1. **`@Injectable({ providedIn: 'root' })`** â€” This single line is the Singleton declaration. It tells Angular's DI container to create exactly **one instance** of `AuthService` for the entire application. Angular's injector tree is the Singleton registry â€” no static variables needed.
> 2. **`private readonly _user = signal<User | null>(null)`** â€” A private writable signal. Only methods inside this class can change the user. This enforces controlled mutation â€” the core discipline of a Singleton.
> 3. **`readonly user = this._user.asReadonly()`** â€” A public read-only projection. Consumers can read the current user but cannot call `_user.set()` from outside.
> 4. **`readonly isAuthenticated = computed(...)`** â€” Derived state computed from the single source of truth. All consumers that read this signal see the same value because they all reference the same instance.
> 5. **`login()` / `logout()`** â€” The only mutation paths. Because every component injects the **same object**, calling `logout()` in the top nav immediately updates every other component reading `isAuthenticated` or `user`.
>
> **Pattern conclusion:** `providedIn: 'root'` is Angular's native Singleton mechanism. Every component, service, and interceptor that injects `AuthService` receives the **same object**. There is no `static getInstance()` method, no module-level variable â€” the DI container manages the lifecycle and guarantees uniqueness.

> **Anti-pattern warning:** Do not implement the classic `getInstance()` static method in Angular. Let the DI container manage the singleton lifecycle.

**Real-world use:** `AuthService`, `FeatureFlagService`, `AppConfigService` â€” all singletons that multiple unrelated components query.

---

#### Builder Pattern

**What it is:** Separates the construction of a complex object from its representation, allowing step-by-step construction.

**How it helps:** Avoids constructor telescoping (10-parameter constructors). Makes complex object creation readable and testable.

**Angular 21 implementation:**

```typescript
// http-request.builder.ts
export class HttpRequestBuilder<T> {
  private url = '';
  private params = new HttpParams();
  private headers = new HttpHeaders();
  private body: unknown = null;

  withUrl(url: string): this {
    this.url = url;
    return this;
  }

  withParam(key: string, value: string): this {
    this.params = this.params.set(key, value);
    return this;
  }

  withBearerToken(token: string): this {
    this.headers = this.headers.set('Authorization', `Bearer ${token}`);
    return this;
  }

  withBody(body: unknown): this {
    this.body = body;
    return this;
  }

  build(): { url: string; options: object } {
    return {
      url: this.url,
      options: { params: this.params, headers: this.headers, body: this.body },
    };
  }
}

// Usage
const request = new HttpRequestBuilder<Transaction[]>()
  .withUrl('/api/transactions')
  .withParam('accountId', '12345')
  .withParam('pageSize', '50')
  .withBearerToken(inject(AuthService).token())
  .build();
```

> **Code walkthrough â€” how this becomes the Builder Pattern:**
>
> 1. **Private fields (`url`, `params`, `headers`, `body`)** â€” These are the parts of the product under construction. They are private and not exposed until `build()` is called. Nobody outside the builder can see a half-assembled request.
> 2. **`withUrl()`, `withParam()`, `withBearerToken()`, `withBody()`** â€” Each method sets one property and returns `this`. Returning `this` is the Builder signature move â€” it is what enables **method chaining**.
> 3. **Method chaining is self-documenting** â€” The call chain reads: _"Build a request, set its URL, add two query params, attach a bearer token, then build."_ There are no positional arguments to misorder and no optional constructor parameters to guess at.
> 4. **`build()`** â€” The terminal step. It assembles all accumulated parts into the final result object. Only this method produces output. You cannot accidentally use a half-built request because there is no property to read until `build()` is called.
> 5. **Usage** â€” The caller never constructs `HttpParams` or `HttpHeaders` directly. The builder hides that complexity and produces a clean `{ url, options }` object.
>
> **Pattern conclusion:** Without a builder you would pass 6 optional parameters to a function and struggle to remember which position is which. The builder names each step, makes the construction order legible, and enforces a `build()` gate so only complete objects are produced. Adding a new parameter (e.g. a timeout) is adding one `withTimeout()` method â€” no existing callers break.

**Real-world use:** Building paginated API requests, constructing chart config objects, assembling form field metadata.

---

### 2.2 Structural Patterns

Structural patterns deal with **how objects and classes are composed** to form larger structures.

---

#### Facade Pattern

**What it is:** Provides a simplified interface to a complex subsystem of services, APIs, or libraries.

**How it helps:** Components talk to one facade instead of six services. The facade owns the orchestration complexity.

**Angular 21 implementation:**

```typescript
// account-facade.service.ts
@Injectable({ providedIn: 'root' })
export class AccountFacade {
  private readonly accountApi = inject(AccountApiService);
  private readonly transactionApi = inject(TransactionApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly store = inject(Store);

  // Signals exposed to components
  readonly accounts = toSignal(this.store.select(selectAllAccounts), { initialValue: [] });
  readonly isLoading = toSignal(this.store.select(selectAccountsLoading), { initialValue: false });

  loadDashboard(userId: string): void {
    this.store.dispatch(AccountActions.loadAccounts({ userId }));
  }

  async transferFunds(from: string, to: string, amount: number): Promise<void> {
    try {
      await firstValueFrom(this.accountApi.transfer({ from, to, amount }));
      this.notificationService.success(`Transferred Â£${amount}`);
      this.store.dispatch(AccountActions.reloadAccount({ id: from }));
    } catch (error) {
      this.notificationService.error('Transfer failed â€” please retry');
      throw error;
    }
  }
}
```

```typescript
// dashboard.component.ts â€” only knows about facade
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly facade = inject(AccountFacade);
  // No ApiService, no Store, no NotificationService directly
}
```

> **Code walkthrough â€” how this becomes the Facade Pattern:**
>
> 1. **`AccountFacade` injects four dependencies** â€” `AccountApiService`, `TransactionApiService`, `NotificationService`, and `Store`. These four are the **complex subsystem**. The facade is the single point that knows all of them.
> 2. **`readonly accounts` and `readonly isLoading`** â€” Signals derived from the NgRx store. The component reads these directly without ever importing `Store` or knowing what selector drives them.
> 3. **`loadDashboard(userId)`** â€” One method call dispatches an NgRx action. The component does not import `AccountActions`, does not know what action type is dispatched, does not know the store exists.
> 4. **`transferFunds()`** â€” Orchestrates three internal steps: makes the API call, shows a success notification, and dispatches a reload action. It also owns the error handling. The component calls one method and receives a `Promise` â€” the entire workflow is hidden.
> 5. **`DashboardComponent`** â€” Injects only `AccountFacade`. The component's imports list has one item. No `Store`, no `AccountApiService`, no `NotificationService`. If any of the underlying services change their API, `DashboardComponent` is untouched.
>
> **Pattern conclusion:** Instead of the component knowing about four services and their separate APIs, it knows about one â€” the facade. The facade is the **single point of contact**. This is Facade: a simplified interface over a complex subsystem. Refactoring an underlying service changes one file (the facade), not every component that uses it.

**Real-world use:** Banking dashboard facade, checkout facade in e-commerce, user profile facade.

---

#### Adapter Pattern

**What it is:** Converts the interface of one class into another interface that clients expect. Allows incompatible interfaces to work together.

**How it helps:** When integrating a third-party API that returns a different data shape, the adapter normalises it â€” components never see the raw API format.

**Angular 21 implementation:**

```typescript
// legacy-account.adapter.ts
export interface LegacyAccountDto {
  acct_no: string;
  acct_type: string;
  bal: number;
  ccy: string;
}

export interface Account {
  id: string;
  type: 'current' | 'savings' | 'isa';
  balance: number;
  currency: string;
}

export function adaptLegacyAccount(dto: LegacyAccountDto): Account {
  return {
    id: dto.acct_no,
    type: mapAccountType(dto.acct_type),
    balance: dto.bal,
    currency: dto.ccy,
  };
}

function mapAccountType(raw: string): Account['type'] {
  const map: Record<string, Account['type']> = {
    CA: 'current',
    SA: 'savings',
    ISA: 'isa',
  };
  return map[raw] ?? 'current';
}

// In the API service
@Injectable({ providedIn: 'root' })
export class AccountApiService {
  getAccounts(): Observable<Account[]> {
    return this.http
      .get<LegacyAccountDto[]>('/legacy/api/accounts')
      .pipe(map((dtos) => dtos.map(adaptLegacyAccount)));
  }
}
```

> **Code walkthrough â€” how this becomes the Adapter Pattern:**
>
> 1. **`LegacyAccountDto`** â€” The **incompatible interface** from the legacy API. Fields have cryptic names (`acct_no`, `bal`, `ccy`) and legacy type codes (`'CA'`, `'SA'`). This is what the third-party or legacy system sends â€” you cannot change it.
> 2. **`Account`** â€” The **target interface** your Angular app expects. Clean, descriptive names. This is what all components, services, and state management code works with.
> 3. **`adaptLegacyAccount(dto)`** â€” **This is the Adapter.** It takes the incompatible type and returns the target type. Each field mapping is explicit: `dto.acct_no â†’ id`, `dto.bal â†’ balance`, `dto.ccy â†’ currency`. No magic, no mutation â€” pure transformation.
> 4. **`mapAccountType()`** â€” A helper that translates legacy string codes to a typed union. This is part of the adapter's responsibility: not just renaming fields, but translating domain concepts.
> 5. **`AccountApiService.getAccounts()`** â€” The HTTP response type is `LegacyAccountDto[]`. The return type is `Observable<Account[]>`. The `.pipe(map(dtos => dtos.map(adaptLegacyAccount)))` is the adapter in action â€” the transformation happens once, at the boundary. The rest of the app never imports or touches `LegacyAccountDto`.
>
> **Pattern conclusion:** The legacy API and your application speak different "languages". The Adapter is the translator. All legacy complexity is contained in one file. Every component, every service, every test in your application works with the clean `Account` interface. When the legacy API changes its field names, you update one file â€” the adapter.

**Real-world use:** AngularJS â†’ Angular 21 migration (adapting old REST endpoints), integrating third-party payment SDKs, normalising multi-bank API responses.

---

#### Decorator Pattern

**What it is:** Adds behaviour to an object dynamically without modifying its class. Wraps the original object.

**How it helps:** Cross-cutting concerns (logging, caching, retry logic) are added at the service level without polluting business logic.

**Angular 21 implementation:**

```typescript
// cached-account-api.service.ts â€” Decorator over AccountApiService
@Injectable()
export class CachedAccountApiService extends AccountApiService {
  private readonly cache = new Map<string, { data: Account[]; timestamp: number }>();
  private readonly TTL = 60_000; // 1 minute

  override getAccounts(): Observable<Account[]> {
    const cached = this.cache.get('accounts');
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return of(cached.data);
    }
    return super
      .getAccounts()
      .pipe(tap((data) => this.cache.set('accounts', { data, timestamp: Date.now() })));
  }
}

// app.config.ts â€” swap in the decorator
export const appConfig: ApplicationConfig = {
  providers: [{ provide: AccountApiService, useClass: CachedAccountApiService }],
};
```

> **Code walkthrough â€” how this becomes the Decorator Pattern:**
>
> 1. **`extends AccountApiService`** â€” The Decorator inherits from the class it wraps. This is the structural key: `CachedAccountApiService` IS an `AccountApiService` (same interface, same method signatures). Consumers do not know they are talking to a wrapper.
> 2. **`private readonly cache = new Map<...>()`** â€” Internal state the original `AccountApiService` does not have. This is the **added behaviour** â€” the cache layer is entirely new, bolted on without touching the original class.
> 3. **`override getAccounts()`** â€” Intercepts the call before it reaches the real implementation. Angular's `override` keyword makes this explicit and catches typos at compile time.
> 4. **Cache hit check** â€” Reads the cache. If data exists and is less than 60 seconds old, returns `of(cached.data)` immediately. No HTTP request is made. The original service is bypassed entirely.
> 5. **`super.getAccounts()`** â€” Cache miss: delegates to the original service. The real service does not know it is being wrapped. It just runs normally.
> 6. **`.pipe(tap(...))`** â€” After the response arrives, stores it in the cache with a timestamp. Next call within 60 seconds will hit the cache.
> 7. **`{ provide: AccountApiService, useClass: CachedAccountApiService }`** â€” Angular's DI substitutes `CachedAccountApiService` everywhere `AccountApiService` is injected. **Zero changes in consuming code** â€” they still inject `AccountApiService` and call `getAccounts()`.
>
> **Pattern conclusion:** The cache behaviour is added without modifying `AccountApiService`. The original class is unchanged, untouched, still testable on its own. Consumers are unaware of the wrapper â€” they call the same interface. This is Decorator: new behaviour added by wrapping, not by modifying.

**Real-world use:** Caching HTTP responses, adding analytics tracking to service calls, wrapping API services with retry/circuit-breaker logic.

---

#### Proxy Pattern

**What it is:** Provides a surrogate or placeholder that controls access to another object. The proxy implements the same interface.

**How it helps:** Lazy loading, access control, and HTTP interceptors all follow the Proxy pattern.

**Angular 21 implementation â€” HTTP Interceptor as Proxy:**

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  if (!token) return next(req);

  const authorisedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  return next(authorisedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
```

> **Code walkthrough â€” how this becomes the Proxy Pattern:**
>
> 1. **`HttpInterceptorFn`** â€” Angular's functional interceptor sits in the HTTP pipeline, **between the component and the server**. Every outbound request passes through it â€” this is the Proxy position.
> 2. **`inject(AuthService)` and `authService.token()`** â€” The proxy reads the token from the singleton service. It handles this cross-cutting concern so that components and API services never have to.
> 3. **`if (!token) return next(req)`** â€” The proxy is transparent when there is nothing to do. Unauthenticated requests pass through unchanged. The component is not aware this check happened.
> 4. **`req.clone({ headers: ... })`** â€” HTTP requests are immutable. `clone()` creates a modified copy with the `Authorization` header injected. The component that originally called `this.http.get(...)` never modified the request â€” the proxy did it.
> 5. **`catchError(error => ...)`** â€” On a `401 Unauthorized` response, the proxy calls `authService.logout()` and re-throws. The component that triggered the request does not need any 401-handling code â€” the proxy owns that responsibility.
>
> **Pattern conclusion:** The component calls `this.http.get('/api/accounts')` as normal. It does not know a proxy exists. The interceptor â€” the Proxy â€” controls access to the HTTP resource: adding credentials on the way out and handling auth failures on the way back. This is exactly the Proxy pattern: a surrogate that controls and enriches access to another object.

**Real-world use:** Auth token injection, request/response logging, rate limiting, offline queue (service worker proxy).

---

### 2.3 Behavioural Patterns

Behavioural patterns deal with **communication and responsibility between objects**.

---

#### Observer Pattern

**What it is:** Defines a one-to-many dependency â€” when one object changes state, all dependents are notified automatically.

**How it helps:** Decouples publishers from subscribers. Components react to state changes without polling.

**Angular 21 â€” Signals ARE the Observer pattern:**

```typescript
// notifications.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _messages = signal<Notification[]>([]);
  readonly messages = this._messages.asReadonly();
  readonly unreadCount = computed(() => this._messages().filter((m) => !m.read).length);

  push(message: Notification): void {
    this._messages.update((msgs) => [...msgs, message]);
  }

  markRead(id: string): void {
    this._messages.update((msgs) => msgs.map((m) => (m.id === id ? { ...m, read: true } : m)));
  }
}

// notification-bell.component.ts â€” Observer
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class NotificationBellComponent {
  protected readonly count = inject(NotificationService).unreadCount;
  // count() automatically re-renders when unreadCount changes â€” no subscription needed
}
```

**RxJS Observer pattern (for async streams):**

```typescript
// When you need streams (WebSocket, HTTP polling)
readonly transactions$ = this.webSocketService.connect('/ws/transactions').pipe(
  filter(event => event.type === 'TRANSACTION'),
  map(event => event.payload as Transaction),
  shareReplay(1)
);
```

> **Code walkthrough â€” how this becomes the Observer Pattern:**
>
> 1. **`private readonly _messages = signal<Notification[]>([])`** â€” The **Subject** (the Observable source). It holds the canonical list of notifications. `private` means only methods inside this service can change it.
> 2. **`readonly messages = this._messages.asReadonly()`** â€” A read-only **Observable view** of the list. Observers can read but cannot push new values directly.
> 3. **`readonly unreadCount = computed(...)`** â€” A **derived Observable**. It automatically recalculates whenever `_messages` changes. Any component that reads `unreadCount()` is an implicit subscriber to notification changes.
> 4. **`push(message)`** â€” Calls `update()` on the signal. This is the **notify** step. The signal graph propagates the change â€” every computed value and template binding that depends on `_messages` is re-evaluated automatically.
> 5. **`NotificationBellComponent.count`** â€” Reads `inject(NotificationService).unreadCount`. There is no `subscribe()` call. When `push()` is called anywhere in the app, Angular's change detection picks up the signal change and re-renders this component's template. No manual subscription, no memory leak from forgetting to unsubscribe.
>
> **Pattern conclusion:** `_messages` is the publisher. `NotificationBellComponent` (and any other component reading the signal) is the subscriber. The signal graph IS the Observer pattern: when the source changes, all dependents are notified automatically. Angular Signals eliminate the boilerplate (subscribe/unsubscribe) while preserving the pattern's intent.

**Real-world use:** Live transaction feeds, notification centres, real-time dashboard updates.

---

#### Strategy Pattern

**What it is:** Defines a family of algorithms, encapsulates each one, and makes them interchangeable. The algorithm varies independently from the clients that use it.

**How it helps:** Swap sorting, validation, or formatting logic at runtime without `if/switch` chains.

**Angular 21 implementation:**

```typescript
// transaction-sort.strategy.ts
export type SortStrategy = (a: Transaction, b: Transaction) => number;

export const sortByDateDesc: SortStrategy = (a, b) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

export const sortByAmountDesc: SortStrategy = (a, b) => b.amount - a.amount;

export const sortByReference: SortStrategy = (a, b) => a.reference.localeCompare(b.reference);

// transaction-list.component.ts
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class TransactionListComponent {
  private readonly transactions = inject(TransactionService).transactions;
  protected readonly sortKey = signal<'date' | 'amount' | 'reference'>('date');

  private readonly strategies: Record<string, SortStrategy> = {
    date: sortByDateDesc,
    amount: sortByAmountDesc,
    reference: sortByReference,
  };

  protected readonly sorted = computed(() =>
    [...this.transactions()].sort(this.strategies[this.sortKey()]),
  );
}
```

> **Code walkthrough â€” how this becomes the Strategy Pattern:**
>
> 1. **`SortStrategy` type** â€” A function signature that every strategy must satisfy: `(a: Transaction, b: Transaction) => number`. This is the **strategy interface** â€” the contract all algorithms share.
> 2. **`sortByDateDesc`, `sortByAmountDesc`, `sortByReference`** â€” Three **concrete strategies**, each a pure function. They are interchangeable because they all satisfy `SortStrategy`. None of them know about the component or each other.
> 3. **`sortKey = signal<'date' | 'amount' | 'reference'>('date')`** â€” The signal that determines which strategy is **active at runtime**. Changing this signal swaps the algorithm. No service restart, no component rebuild.
> 4. **`strategies: Record<string, SortStrategy>`** â€” A lookup map associating each key to its strategy function. Adding a new sort order is adding one entry to this map.
> 5. **`sorted = computed(() => [...this.transactions()].sort(this.strategies[this.sortKey()]))`** â€” The computed signal reads both `sortKey` and `transactions`. When either changes, it recomputes. It delegates to whichever strategy is currently selected â€” the `computed` itself does not care which algorithm runs.
>
> **Pattern conclusion:** The sorting algorithm is a **variable** â€” a first-class object stored in a map and selected at runtime. There is no `if (sortKey === 'date') { ... } else if (sortKey === 'amount') { ... }` chain. Each algorithm is isolated, independently testable, and interchangeable. Adding a new sort option does not touch existing code â€” this is the Open/Closed Principle, enabled by Strategy.

**Real-world use:** Sorting/filtering strategies, payment validation strategies (UK sort code vs IBAN), export format strategies (CSV/PDF/Excel).

---

#### Command Pattern

**What it is:** Encapsulates a request as an object, allowing parameterisation, queuing, logging, and undo/redo.

**How it helps:** Undo/redo stacks, action queues, and audit logs all rely on commands being first-class objects.

**Angular 21 implementation:**

```typescript
// command.interface.ts
export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

// transfer-funds.command.ts
export class TransferFundsCommand implements Command {
  readonly description: string;

  constructor(
    private readonly api: AccountApiService,
    private readonly store: Store,
    private readonly from: string,
    private readonly to: string,
    private readonly amount: number,
  ) {
    this.description = `Transfer Â£${amount} from ${from} to ${to}`;
  }

  execute(): void {
    this.api
      .transfer({ from: this.from, to: this.to, amount: this.amount })
      .pipe(tap(() => this.store.dispatch(AccountActions.reloadAccount({ id: this.from }))))
      .subscribe();
  }

  undo(): void {
    // Reverse transfer
    this.api.transfer({ from: this.to, to: this.from, amount: this.amount }).subscribe();
  }
}

// command-history.service.ts
@Injectable({ providedIn: 'root' })
export class CommandHistoryService {
  private readonly _history = signal<Command[]>([]);
  readonly history = this._history.asReadonly();

  execute(command: Command): void {
    command.execute();
    this._history.update((h) => [...h, command]);
  }

  undo(): void {
    const last = this._history()[this._history().length - 1];
    if (last) {
      last.undo();
      this._history.update((h) => h.slice(0, -1));
    }
  }
}
```

> **Code walkthrough â€” how this becomes the Command Pattern:**
>
> 1. **`Command` interface** â€” Defines the contract: every command must have `execute()`, `undo()`, and a `description`. This is the **Command abstraction** â€” the history service only knows this interface, never the concrete command type.
> 2. **`TransferFundsCommand` constructor** â€” Captures all data needed at creation time: `api`, `store`, `from`, `to`, `amount`. The command is a **self-contained operation object** â€” everything required to execute (or undo) the operation is stored inside it.
> 3. **`description`** â€” A human-readable label. Useful for audit logs and undo history UI (`"Transfer Â£500 from 12345678 to 87654321"`).
> 4. **`execute()`** â€” Performs the transfer via the API, then refreshes the store. This is the **forward operation**.
> 5. **`undo()`** â€” Performs a reverse transfer (same amount, from and to swapped). This is the **compensating operation** â€” what makes this pattern powerful for financial UIs.
> 6. **`CommandHistoryService._history = signal<Command[]>([])`** â€” The **command stack**. It holds all executed commands in order.
> 7. **`execute(command)`** â€” Runs the command and **pushes it onto the history stack**. The service does not know what the command does â€” it just calls `command.execute()` through the interface.
> 8. **`undo()`** â€” Pops the last command and calls `command.undo()`. Again, the service does not know the implementation â€” it only uses the `Command` interface.
>
> **Pattern conclusion:** The transfer operation is encapsulated as an object with a known lifecycle: create â†’ execute â†’ optionally undo. The `CommandHistoryService` is the **invoker** â€” it manages the queue and calls the interface. The history service can undo any command without knowing anything about banking logic. New commands (e.g. `CreatePayeeCommand`) are added by implementing `Command` â€” no history service code changes.

**Real-world use:** Transaction undo in banking UIs, form wizard step history, admin bulk-action queues.

---

#### Mediator Pattern

**What it is:** Defines an object that encapsulates how a set of objects interact. Components communicate through the mediator rather than directly with each other.

**How it helps:** Reduces tight coupling between sibling components. The mediator (often a service or store) coordinates communication.

**Angular 21 implementation:**

```typescript
// dashboard-mediator.service.ts
@Injectable({ providedIn: 'root' })
export class DashboardMediatorService {
  // Signals act as the shared communication channel
  private readonly _selectedAccount = signal<string | null>(null);
  readonly selectedAccount = this._selectedAccount.asReadonly();

  private readonly _dateRange = signal<DateRange>({ from: startOfMonth(), to: new Date() });
  readonly dateRange = this._dateRange.asReadonly();

  selectAccount(id: string): void {
    this._selectedAccount.set(id);
  }

  setDateRange(range: DateRange): void {
    this._dateRange.set(range);
  }
}

// account-list.component.ts â€” publishes to mediator
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class AccountListComponent {
  private readonly mediator = inject(DashboardMediatorService);
  onSelect(id: string): void {
    this.mediator.selectAccount(id);
  }
}

// transaction-panel.component.ts â€” subscribes from mediator
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class TransactionPanelComponent {
  protected readonly accountId = inject(DashboardMediatorService).selectedAccount;
  // Automatically reacts when selectedAccount signal changes
}
```

> **Code walkthrough â€” how this becomes the Mediator Pattern:**
>
> 1. **`DashboardMediatorService._selectedAccount`** â€” A private writable signal. This is the **shared communication channel** â€” the Mediator's state. No component holds this state; it lives in the Mediator.
> 2. **`readonly selectedAccount = this._selectedAccount.asReadonly()`** â€” Public read-only access. Components can subscribe to changes but cannot write directly.
> 3. **`selectAccount(id)`** â€” A public write method. Any component can call this to announce "the user selected this account". The Mediator does not know â€” or care â€” which component called it.
> 4. **`AccountListComponent`** â€” Injects the Mediator and calls `mediator.selectAccount(id)` on user click. It does **not** hold a reference to `TransactionPanelComponent`. It does not know which other components care about account selection.
> 5. **`TransactionPanelComponent.accountId`** â€” Reads `mediator.selectedAccount`. When `AccountListComponent` calls `selectAccount()`, this signal updates automatically, and `TransactionPanelComponent` re-renders. The two components have **never referenced each other**.
>
> **Pattern conclusion:** Without a Mediator, `AccountListComponent` would hold a reference to `TransactionPanelComponent` and call methods directly â€” tight coupling. With the Mediator, both components only know the Mediator service. The Mediator reduces the connection count from nÃ—n (components referencing each other) to nÃ—1 (every component talks only to the Mediator). Adding a new panel that needs to react to account selection means injecting the Mediator â€” zero changes to existing components.

**Real-world use:** Dashboard coordination between account list, transaction panel, and chart. The mediator replaces a tangle of `@Output()` event chains.

---

#### State Pattern

**What it is:** Allows an object to alter its behaviour when its internal state changes. The object appears to change its class.

**How it helps:** Complex UI workflows (loan application, onboarding wizard) have states that change available actions. The pattern makes state transitions explicit.

**Angular 21 â€” Signal-based State Machine:**

```typescript
// loan-application-state.ts
export type LoanState =
  | 'idle'
  | 'personal-details'
  | 'income-check'
  | 'credit-check'
  | 'decision'
  | 'approved'
  | 'declined';

const TRANSITIONS: Record<LoanState, LoanState[]> = {
  idle: ['personal-details'],
  'personal-details': ['income-check'],
  'income-check': ['credit-check'],
  'credit-check': ['decision'],
  decision: ['approved', 'declined'],
  approved: [],
  declined: ['personal-details'],
};

@Injectable({ providedIn: 'root' })
export class LoanApplicationService {
  private readonly _state = signal<LoanState>('idle');
  readonly state = this._state.asReadonly();

  readonly canSubmit = computed(() => this._state() !== 'approved' && this._state() !== 'declined');

  transition(to: LoanState): void {
    const allowed = TRANSITIONS[this._state()];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid transition: ${this._state()} â†’ ${to}`);
    }
    this._state.set(to);
  }
}
```

> **Code walkthrough â€” how this becomes the State Pattern:**
>
> 1. **`LoanState` union type** â€” Enumerates every possible state the application can be in. These are the **state nodes** in the machine. The type system prevents any other string from being used.
> 2. **`TRANSITIONS` map** â€” Defines which states can follow which. `'decision'` can go to `'approved'` or `'declined'`. `'approved'` has an empty array â€” there is no valid next state. Illegal transitions are structurally impossible.
> 3. **`_state = signal<LoanState>('idle')`** â€” A single signal holds the current state. The entire machine's memory is this one value.
> 4. **`canSubmit = computed(...)`** â€” A derived signal that changes behaviour based on state. In `'approved'` or `'declined'` the submit button should be disabled. The template reads `canSubmit()` â€” no `if` chains needed.
> 5. **`transition(to)`** â€” The **guard function**. It reads `TRANSITIONS[current state]` and throws if the requested transition is not in the allowed list. Only valid transitions call `_state.set(to)`. Invalid transitions are caught early with a descriptive error rather than silently corrupting state.
>
> **Pattern conclusion:** The object's available actions change depending on `_state`. The `TRANSITIONS` map is a declarative replacement for complex `if/switch` logic. A developer reading the code immediately sees the full state graph. Adding a new state (e.g. `'expired'`) means adding one entry to `LoanState` and one row in `TRANSITIONS` â€” no existing transition logic changes.

**Real-world use:** Loan/mortgage application wizard, KYC onboarding flow, checkout state machine (cart â†’ address â†’ payment â†’ confirmation).

---

#### Chain of Responsibility Pattern

**What it is:** Passes a request along a chain of handlers. Each handler decides to process it or pass it to the next handler.

**How it helps:** Middleware pipelines, Angular's HTTP interceptors, and form validators all follow this pattern.

**Angular 21 â€” Custom Validator Chain:**

```typescript
// validator-chain.ts
export type ValidatorFn = (value: string) => string | null;

export function createValidatorChain(...validators: ValidatorFn[]): ValidatorFn {
  return (value: string): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error; // First failure stops the chain
    }
    return null;
  };
}

const requiredValidator: ValidatorFn = (v) => (v.trim() ? null : 'This field is required');
const minLengthValidator =
  (min: number): ValidatorFn =>
  (v) =>
    v.length >= min ? null : `Minimum ${min} characters`;
const sortCodeValidator: ValidatorFn = (v) =>
  /^\d{2}-\d{2}-\d{2}$/.test(v) ? null : 'Sort code must be in format 00-00-00';

// Usage in component with signal forms
const sortCodeValidate = createValidatorChain(
  requiredValidator,
  minLengthValidator(8),
  sortCodeValidator,
);
```

> **Code walkthrough â€” how this becomes the Chain of Responsibility Pattern:**
>
> 1. **`ValidatorFn` type** â€” Every handler in the chain must match this signature: takes a string, returns a string error or `null`. This is the **handler interface** â€” the chain does not care about implementation, only the contract.
> 2. **`createValidatorChain(...validators)`** â€” The **chain builder**. It receives any number of handler functions and returns a new single function that runs them in sequence. The caller assembles the chain; the builder links the handlers.
> 3. **`for (const validator of validators)`** â€” Iterates through each handler in the order they were provided.
> 4. **`if (error) return error`** â€” **This is the chain-breaking behaviour.** The first handler that finds a problem returns its error immediately. The remaining handlers in the chain do not run. This matches the GoF intent: each handler either handles the request (returns an error) or passes it on (`null`).
> 5. **`return null`** â€” If all handlers pass, the chain concludes with no error â€” the value is valid.
> 6. **`requiredValidator`, `minLengthValidator(8)`, `sortCodeValidator`** â€” Three concrete handlers, each responsible for exactly one validation rule. None of them knows about the others.
> 7. **`createValidatorChain(required, minLength(8), sortCode)`** â€” Assembles the chain. Order matters: `required` runs first (cheapest check), then length, then format. This mirrors how HTTP middleware is ordered: auth before parsing, parsing before business logic.
>
> **Pattern conclusion:** Each validator is a single-responsibility handler. None knows about the others. The chain builder links them without any handler needing modification. Adding a new rule (e.g. a `notBlacklistedValidator`) is passing it as an extra argument to `createValidatorChain` â€” existing validators are unchanged. This is Chain of Responsibility: a request (the field value) passes through a sequence of handlers until one handles it (returns an error) or all pass.

**Real-world use:** Form field validation chains, Angular HTTP interceptor pipeline, middleware for auth â†’ logging â†’ error handling.

---

<!-- pagebreak -->

## 3. Architectural Patterns

Architectural patterns are **high-level strategies** for organising the entire application structure, team boundaries, and data flow.

---

### 3.1 Micro-Frontend (MFE)

**What it is:** Splits a large frontend application into smaller, independently deployable units (micro-frontends), each owned by a separate team.

**How it helps:**

- Independent deployment â€” Team A ships without waiting for Team B
- Technology isolation â€” one MFE can be on Angular 21, another still on Angular 15 during migration
- Fault isolation â€” a crashed MFE widget does not crash the shell

**Architecture diagram:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   Shell Application                  â”‚
â”‚              (Angular 21 host app.config)            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Accounts    â”‚ Transactions â”‚    Loans MFE           â”‚
â”‚  MFE         â”‚ MFE          â”‚    (Team Lending)      â”‚
â”‚  (Team Core) â”‚ (Team Tx)    â”‚                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚            Shared Design System (lib)                â”‚
â”‚         Auth Token Service (singleton)               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Angular 21 implementation with Module Federation:**

```javascript
// federation.config.js â€” Accounts MFE (remote)
const { withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'accounts',
  exposes: {
    './AccountsModule': './src/app/features/accounts/accounts.routes.ts',
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/router': { singleton: true, strictVersion: true },
  },
});
```

```typescript
// shell app.routes.ts â€” Shell loading remote
export const routes: Routes = [
  {
    path: 'accounts',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.accountsMfeUrl,
        exposedModule: './AccountsModule',
      }).then((m) => m.accountsRoutes),
  },
];
```

**Communication between MFEs:**

```typescript
// shared-event-bus.service.ts â€” in shared lib
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly events = new Subject<AppEvent>();
  readonly events$ = this.events.asObservable();

  emit(event: AppEvent): void {
    this.events.next(event);
  }
}
```

**Real-world use:** Large banking portals (retail + business banking in same portal), insurance platforms with separate claim/policy/profile teams.

---

### 3.2 Atomic Design

**What it is:** Brad Frost's system for building design systems from the smallest parts (atoms) up to full pages. Five levels: Atoms â†’ Molecules â†’ Organisms â†’ Templates â†’ Pages.

**Angular 21 folder structure:**

```
src/
â””â”€â”€ lib/
    â”œâ”€â”€ atoms/
    â”‚   â”œâ”€â”€ button/
    â”‚   â”œâ”€â”€ input/
    â”‚   â”œâ”€â”€ badge/
    â”‚   â””â”€â”€ icon/
    â”œâ”€â”€ molecules/
    â”‚   â”œâ”€â”€ form-field/        (label + input + error)
    â”‚   â”œâ”€â”€ account-card/      (icon + balance + label)
    â”‚   â””â”€â”€ search-bar/        (input + button)
    â”œâ”€â”€ organisms/
    â”‚   â”œâ”€â”€ transaction-table/
    â”‚   â”œâ”€â”€ account-summary/
    â”‚   â””â”€â”€ navigation-header/
    â”œâ”€â”€ templates/
    â”‚   â”œâ”€â”€ dashboard-layout/
    â”‚   â””â”€â”€ form-page-layout/
    â””â”€â”€ pages/
        â”œâ”€â”€ dashboard-page/
        â””â”€â”€ transfer-page/
```

**Atom example â€” Button:**

```typescript
// atoms/button/button.component.ts
@Component({
  selector: 'lib-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'none' }, // host element is layout; inner <button> has role
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-busy]="loading() ? 'true' : null"
      [class]="buttonClasses()"
    >
      @if (loading()) {
        <span aria-hidden="true" class="spinner" />
        <span class="sr-only">Loadingâ€¦</span>
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'primary' | 'secondary' | 'danger'>('primary');
  readonly disabled = input(false);
  readonly loading = input(false);

  protected readonly buttonClasses = computed(
    () => `btn btn--${this.variant()} ${this.loading() ? 'btn--loading' : ''}`,
  );
}
```

**Real-world use:** Enterprise design systems, component libraries shared across MFEs, brand-consistent UI across products.

---

### 3.3 Backend for Frontend (BFF)

**What it is:** A dedicated backend layer per frontend client (web, mobile, third-party). Each BFF aggregates and shapes data specifically for its client.

**Architecture diagram:**

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  Angular 21 Web    â”‚
                    â”‚  Application       â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   Web BFF          â”‚
                    â”‚  (Node/NestJS)     â”‚
                    â”‚  - Aggregates APIs â”‚
                    â”‚  - Shapes payload  â”‚
                    â”‚  - Handles auth    â”‚
                    â””â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
                       â”‚     â”‚     â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”Œâ”€â”€â”˜  â”Œâ”€â”€â”˜
              â”‚           â”‚     â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â” â”Œâ”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ Accounts   â”‚ â”‚ Loans  â”‚ â”‚ Payments   â”‚
    â”‚ Microserviceâ”‚ â”‚ Serviceâ”‚ â”‚ Service    â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Angular 21 â€” consuming BFF:**

```typescript
// account-bff.service.ts
@Injectable({ providedIn: 'root' })
export class AccountBffService {
  // BFF returns a pre-aggregated DashboardViewModel â€” no multiple round trips
  getDashboard(): Observable<DashboardViewModel> {
    return this.http.get<DashboardViewModel>('/bff/dashboard');
  }
}

// BFF response already has accounts + recent transactions + credit limit
// vs. 3 separate API calls the component would otherwise make
```

**How it helps:**

- Reduces round trips â€” one BFF call vs. 5 microservice calls
- Protects internal service topology from the browser
- Enables server-side token exchange (BFF holds backend credentials)
- SSR-friendly â€” Angular SSR can call BFF directly

**Real-world use:** Banking app (web sees accounts + transactions + alerts in one call), mobile BFF has a different payload optimised for small screens.

---

### 3.4 Saga Pattern

**What it is:** Manages long-running distributed transactions using a sequence of local transactions with compensating actions on failure. In Angular, NgRx Effects implement the Saga pattern.

**How it helps:** When a business operation spans multiple API calls (create account â†’ generate card â†’ send welcome email), Sagas coordinate the steps and handle partial failures.

**NgRx Effect as Saga:**

```typescript
// account-onboarding.effects.ts
@Injectable()
export class AccountOnboardingEffects {
  private readonly actions$ = inject(Actions);
  private readonly accountApi = inject(AccountApiService);
  private readonly cardApi = inject(CardApiService);
  private readonly emailApi = inject(EmailApiService);

  startOnboarding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OnboardingActions.start),
      switchMap(({ customerId }) =>
        this.accountApi.createAccount(customerId).pipe(
          // Step 2: provision card
          switchMap((account) =>
            this.cardApi.provisionCard(account.id).pipe(
              // Step 3: send welcome email
              switchMap((card) =>
                this.emailApi.sendWelcome({ customerId, accountId: account.id }).pipe(
                  map(() => OnboardingActions.complete({ account, card })),
                  // Compensating action if email fails
                  catchError(() => of(OnboardingActions.partialSuccess({ account, card }))),
                ),
              ),
              // Compensating action if card provisioning fails
              catchError((err) =>
                this.accountApi
                  .closeAccount(account.id)
                  .pipe(map(() => OnboardingActions.failed({ error: err.message }))),
              ),
            ),
          ),
          catchError((err) => of(OnboardingActions.failed({ error: err.message }))),
        ),
      ),
    ),
  );
}
```

**Saga state flow:**

```
START
  â””â”€â–º Create Account
        â”œâ”€ SUCCESS â†’ Provision Card
        â”‚               â”œâ”€ SUCCESS â†’ Send Email â†’ COMPLETE
        â”‚               â””â”€ FAIL â†’ Close Account (compensate) â†’ FAILED
        â””â”€ FAIL â†’ FAILED
```

**Real-world use:** Banking onboarding, loan disbursement (approve â†’ disburse â†’ notify), e-commerce checkout (reserve stock â†’ charge card â†’ dispatch).

---

### 3.5 CQRS & Event Sourcing

**What it is:**

- **CQRS (Command Query Responsibility Segregation):** Separates read operations (queries) from write operations (commands).
- **Event Sourcing:** Instead of storing current state, store the sequence of events that produced it.

**Angular 21 â€” CQRS with NgRx:**

```typescript
// COMMANDS (write side) â€” dispatched actions
store.dispatch(AccountActions.debit({ accountId, amount }));
store.dispatch(AccountActions.credit({ accountId, amount }));

// QUERIES (read side) â€” selectors
const balance$ = store.select(selectAccountBalance(accountId));
const transactions$ = store.select(selectAccountTransactions(accountId));

// The reducer handles commands and produces new read-model state
const accountReducer = createReducer(
  initialState,
  on(AccountActions.debit, (state, { accountId, amount }) => ({
    ...state,
    accounts: state.accounts.map((acc) =>
      acc.id === accountId ? { ...acc, balance: acc.balance - amount } : acc,
    ),
  })),
);
```

**Event Sourcing â€” transaction log:**

```typescript
// Every state change is an event
type AccountEvent =
  | { type: 'ACCOUNT_OPENED'; accountId: string; openingBalance: number }
  | { type: 'CREDITED'; accountId: string; amount: number; reference: string }
  | { type: 'DEBITED'; accountId: string; amount: number; reference: string }
  | { type: 'ACCOUNT_CLOSED'; accountId: string; reason: string };

// Replay events to reconstruct state
function replayAccount(events: AccountEvent[]): AccountState {
  return events.reduce(applyEvent, initialAccountState);
}
```

**Real-world use:** Financial ledgers (balance = replay of all debits/credits), audit trails, undo history.

---

### 3.6 Flux / NgRx (Redux)

**What it is:** Unidirectional data flow â€” Action â†’ Reducer â†’ State â†’ View â†’ Action.

**Angular 21 NgRx architecture:**

```
Component dispatches Action
        â†“
    Effects (side effects: API calls)
        â†“
    Reducer (pure function: state â†’ new state)
        â†“
    Store (single source of truth)
        â†“
    Selector (memoised derived state)
        â†“
    Component (via toSignal())
```

```typescript
// Modern NgRx with signals
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class AccountsComponent {
  private readonly store = inject(Store);

  protected readonly accounts = toSignal(this.store.select(selectAllAccounts), {
    initialValue: [],
  });
  protected readonly isLoading = toSignal(this.store.select(selectAccountsLoading), {
    initialValue: false,
  });

  load(): void {
    this.store.dispatch(AccountActions.loadAccounts());
  }
}
```

**When to use NgRx vs. Signals:**

| Scenario                                   | Use                            |
| ------------------------------------------ | ------------------------------ |
| Local component state                      | `signal()`                     |
| Shared state between sibling components    | Service with `signal()`        |
| Complex async workflows (multiple effects) | NgRx                           |
| Cross-MFE shared state                     | NgRx or EventBus               |
| Server state (caching, pagination)         | Angular Query / TanStack Query |

---

### 3.7 Smart / Presentational Components

**What it is:** Splits components into two roles:

- **Smart (Container):** Knows about the store/services. Fetches data. Dispatches actions.
- **Presentational (Dumb):** Receives data via `input()`. Emits events via `output()`. No service injection.

**Angular 21 implementation:**

```typescript
// SMART â€” account-list-page.component.ts
@Component({
  selector: 'app-account-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-account-list
      [accounts]="accounts()"
      [isLoading]="isLoading()"
      (accountSelected)="onSelect($event)"
    />
  `,
})
export class AccountListPageComponent {
  private readonly store = inject(Store);
  protected readonly accounts = toSignal(this.store.select(selectAllAccounts), {
    initialValue: [],
  });
  protected readonly isLoading = toSignal(this.store.select(selectLoading), {
    initialValue: false,
  });

  protected onSelect(id: string): void {
    this.store.dispatch(AccountActions.select({ id }));
  }
}
```

```typescript
// PRESENTATIONAL â€” account-list.component.ts
@Component({
  selector: 'app-account-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // No inject() of any service
})
export class AccountListComponent {
  readonly accounts = input.required<Account[]>();
  readonly isLoading = input(false);
  readonly accountSelected = output<string>();
}
```

**Real-world use:** Every screen in a large app benefits from this split. Presentational components are 100% testable with just `ComponentFixture` and no mock services.

---

### 3.8 Feature-Sliced Design

**What it is:** An architectural methodology that organises code by **feature** and **layer**, not by file type. Each feature is a vertical slice containing its own components, services, state, and API.

**Folder structure:**

```
src/app/
â”œâ”€â”€ features/
â”‚   â”œâ”€â”€ accounts/
â”‚   â”‚   â”œâ”€â”€ components/       (Smart + presentational)
â”‚   â”‚   â”œâ”€â”€ services/         (AccountFacade, AccountApiService)
â”‚   â”‚   â”œâ”€â”€ state/            (NgRx actions, reducers, effects, selectors)
â”‚   â”‚   â”œâ”€â”€ models/           (Account interface, DTOs)
â”‚   â”‚   â””â”€â”€ accounts.routes.ts
â”‚   â”œâ”€â”€ transactions/
â”‚   â”‚   â””â”€â”€ ...
â”‚   â””â”€â”€ loans/
â”‚       â””â”€â”€ ...
â”œâ”€â”€ shared/
â”‚   â”œâ”€â”€ ui/                   (Atomic design components)
â”‚   â”œâ”€â”€ utils/                (Pure functions, helpers)
â”‚   â””â”€â”€ services/             (AuthService, NotificationService)
â””â”€â”€ core/
    â”œâ”€â”€ interceptors/
    â”œâ”€â”€ guards/
    â””â”€â”€ app.config.ts
```

**Rule:** Features do not import from each other. They communicate through shared services or the store.

**Real-world use:** Teams map to features. The Accounts team owns `features/accounts/`, the Loans team owns `features/loans/`. No cross-team file conflicts.

---

<!-- pagebreak -->

## 4. Architectural Strategies

---

### 4.1 The 12-Factor App â€” Front-End Context

The 12-Factor App methodology (Heroku, 2011) defines principles for building scalable, maintainable software-as-a-service. Here is each factor mapped to Angular 21 front-end practice.

| Factor                   | Principle                                                | Angular 21 Application                                                 |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| **I. Codebase**          | One codebase tracked in VCS; multiple deploys            | Single git repo per app/MFE; Nx monorepo for multiple                  |
| **II. Dependencies**     | Explicitly declare and isolate dependencies              | `package.json` with exact versions; no CDN scripts in `index.html`     |
| **III. Config**          | Store config in the environment, not code                | `environment.ts` / `environment.prod.ts`; `APP_CONFIG` injection token |
| **IV. Backing services** | Treat APIs as attached resources                         | Abstract all API calls behind service classes; swap via DI             |
| **V. Build/Release/Run** | Strictly separate build, release, and run stages         | `ng build --configuration=production`; Docker image per env            |
| **VI. Processes**        | Execute app as stateless processes                       | SSR stateless; no user state in module-level variables                 |
| **VII. Port binding**    | Export services via port binding                         | Angular dev server on port 4200; SSR on 4000; MFEs on 4201+            |
| **VIII. Concurrency**    | Scale via process model                                  | Multiple SSR instances behind load balancer                            |
| **IX. Disposability**    | Fast startup and graceful shutdown                       | Lazy-loaded routes; `@defer` blocks; small initial bundle              |
| **X. Dev/prod parity**   | Keep dev, staging, and production as similar as possible | Docker Compose for local; same Angular build config                    |
| **XI. Logs**             | Treat logs as event streams                              | `ErrorHandler` streams to logging service; no `console.log` in prod    |
| **XII. Admin processes** | Run admin tasks as one-off processes                     | Seeding scripts separate from app; migration CLI tools                 |

**Angular 21 config injection token (Factor III):**

```typescript
// app-config.token.ts
export interface AppConfig {
  apiBaseUrl: string;
  featureFlags: Record<string, boolean>;
  environment: 'development' | 'staging' | 'production';
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_CONFIG,
      useValue: {
        apiBaseUrl: environment.apiBaseUrl,
        featureFlags: environment.featureFlags,
        environment: environment.name,
      },
    },
  ],
};
```

---

### 4.2 The 6-Hour Design Approach

The 6-Hour Design approach is a **time-boxed architectural decision framework** used when facing a new system or major feature. It forces architects to produce a shippable decision document in a single focused session.

**The 6 hours, structured:**

| Hour       | Activity                                                  | Output                                            |
| ---------- | --------------------------------------------------------- | ------------------------------------------------- |
| **Hour 1** | Understand requirements â€” what problem are we solving?    | Requirements doc, key constraints                 |
| **Hour 2** | Identify components â€” what are the major building blocks? | Component list, responsibility matrix             |
| **Hour 3** | Draw the architecture â€” how do components connect?        | C4 Context + Container diagrams                   |
| **Hour 4** | Identify risks â€” what can go wrong?                       | Risk register, ADR (Architecture Decision Record) |
| **Hour 5** | Define interfaces â€” how do components communicate?        | API contracts, event schemas                      |
| **Hour 6** | Validate and decide â€” is this good enough to start?       | ADR sign-off, backlog tickets                     |

**Architecture Decision Record (ADR) template:**

```markdown
# ADR-001: Adopt Micro-Frontend Architecture for Banking Portal

**Date:** 2026-05-21
**Status:** Accepted
**Context:** The banking portal has 4 teams working on overlapping features, causing deployment bottlenecks.
**Decision:** Adopt MFE with Module Federation. Each team owns one remote.
**Consequences:**

- âœ… Independent deployments per team
- âœ… Fault isolation between features
- âŒ Shared dependency version coordination required
- âŒ Initial setup overhead (~2 sprints)
  **Alternatives considered:**
- Monolith with lazy modules â€” rejected (deployment coupling remains)
- iFrame-based MFE â€” rejected (accessibility and routing complexity)
```

---

<!-- pagebreak -->

## 5. Tools & Diagram Types

### Diagramming Tools

| Tool                       | Best For                                              | Free?     |
| -------------------------- | ----------------------------------------------------- | --------- |
| **draw.io / diagrams.net** | All diagram types; exports SVG/PNG; Confluence plugin | Yes       |
| **Mermaid**                | Code-based diagrams in markdown; Git-friendly         | Yes       |
| **Structurizr**            | C4 Model diagrams; code-as-architecture               | Free tier |
| **Lucidchart**             | Collaborative enterprise diagramming                  | Paid      |
| **PlantUML**               | UML from text; CI-friendly                            | Yes       |
| **Excalidraw**             | Whiteboard-style sketching                            | Yes       |
| **Figma / FigJam**         | Design system + architecture whiteboard               | Paid      |

---

### Diagram Types for Front-End Architecture

#### C4 Model (recommended for Angular apps)

Four levels of zoom:

```
Level 1 â€” System Context   (who uses the system; what it connects to)
Level 2 â€” Container        (Angular app, BFF, microservices, databases)
Level 3 â€” Component        (NgRx store, feature modules, services inside the Angular app)
Level 4 â€” Code             (class diagrams for complex components)
```

**Level 1 â€” System Context (Mermaid):**

> _Note: C4Context syntax requires the Mermaid C4 plugin. The diagram below uses standard `graph LR` for maximum PDF/renderer compatibility. Semantically identical to a C4 Context diagram._

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Bank Customer â”‚â”€â”€ HTTPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚   Online Banking Portal      â”‚
â”‚  (Browser)     â”‚   accounts/        â”‚   Angular 21 SPA + SSR       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   transfers        â”‚                              â”‚
                                      â”‚  REST/gRPC â”€â”€â–º Core Banking  â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â”‚               (Ledger + Pay) â”‚
â”‚ Relationship   â”‚â”€â”€ HTTPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚  REST â”€â”€â”€â”€â”€â”€â–º Credit Bureau  â”‚
â”‚ Advisor        â”‚   customer 360     â”‚               (Experian)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                    â”‚  REST â”€â”€â”€â”€â”€â”€â–º Notification   â”‚
                                      â”‚               (Email/SMS)    â”‚
                                      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Level 2 â€” Container diagram (Mermaid):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Browser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Shell â€” Angular 21 (Module Federation Host)                    â”‚
â”‚   â”œâ”€â”€ Accounts MFE (Remote)                                      â”‚
â”‚   â”œâ”€â”€ Transactions MFE (Remote)                                  â”‚
â”‚   â””â”€â”€ Loans MFE (Remote)                   â”‚ HTTPS requests      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Web BFF â€” NestJS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Auth Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º Aggregation Layer         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Microservices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Accounts Service  â”‚ Transaction Service  â”‚ Loan Service         â”‚
â”‚   Notification Service                                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

#### Sequence Diagram â€” Fund Transfer Flow

```
  User â†’ TransferComponent â†’ AccountFacade â†’ BFF â†’ PaymentsService
                                                  â†’ NotificationService
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  1. User              â”€â”€submit formâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º TransferComponent
  2. TransferComponent â”€â”€transferFunds(from,to,amt)â–º AccountFacade
  3. AccountFacade     â”€â”€POST /bff/transfersâ”€â”€â”€â”€â”€â”€â”€â–º BFF
  4. BFF               â”€â”€POST /payments/initiateâ”€â”€â”€â–º PaymentsService
  5. PaymentsService   â—„â”€â”€payment referenceâ”€â”€â”€â”€â”€â”€â”€â”€ BFF
  6. BFF               â”€â”€POST /notifications/smsâ”€â”€â”€â–º NotificationService
  7. BFF               â”€â”€{ success, reference }â”€â”€â”€â”€â–º AccountFacade
  8. AccountFacade     â”€â”€dispatch(TransferSuccess)â”€â”€â–º TransferComponent
  9. TransferComponent â”€â”€show confirmationâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º User
```

---

#### Component Architecture Diagram

```
â”Œâ”€â”€â”€â”€ Dashboard Feature â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                                     â”‚
â”‚   DashboardPageComponent (Smart)                                    â”‚
â”‚   â”œâ”€â”€ [input] â”€â–º AccountListComponent (Presentational)              â”‚
â”‚   â”œâ”€â”€ [input] â”€â–º TransactionTableComponent (Presentational)         â”‚
â”‚   â””â”€â”€ [input] â”€â–º SpendingChartComponent (Presentational)            â”‚
â”‚               â”‚                                                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                â”‚ via AccountFacade
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   NgRx Store â”€â”€â–º Account Effects  â”€â”€â–º AccountApiService              â”‚
â”‚                  Transaction Effects                                 â”‚
â”‚   NgRx Store â”€â”€â–º Selectors â”€â”€toSignalâ”€â”€â–º DashboardPageComponent     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

<!-- pagebreak -->

## 6. System Design Case Studies

### 6.1 Enterprise Banking Application

#### Requirements

| Category      | Requirement                        |
| ------------- | ---------------------------------- |
| Scale         | 2 million concurrent users at peak |
| Teams         | 8 product teams, 60+ engineers     |
| Compliance    | PSD2, GDPR, FCA regulations        |
| Accessibility | WCAG 2.1 AA                        |
| Performance   | LCP < 2.5s, CLS < 0.1, FID < 100ms |
| Deployment    | Blue/green, zero-downtime          |

#### Architectural Decisions

| Decision             | Choice                                                  | Rationale                                                |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| **App structure**    | Micro-Frontend (Module Federation)                      | 8 teams need independent deployments                     |
| **State management** | NgRx per MFE + Signal service for local state           | Saga pattern for complex workflows; signals for UI state |
| **API layer**        | BFF (NestJS) per client type                            | Aggregate microservices; handle auth token exchange      |
| **Design system**    | Atomic Design component library                         | Consistent brand across all MFEs                         |
| **SSR**              | Angular Universal with hydration                        | SEO + initial load performance                           |
| **Auth**             | OAuth2 / OIDC with PKCE                                 | Regulatory requirement; BFF holds refresh tokens         |
| **Testing**          | Unit (Vitest) + Component (Angular CDK) + E2E (Cypress) | Full confidence at each layer                            |

#### Full System Design (Mermaid)

```
â”Œâ”€â”€â”€ Clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€ BFF Layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Angular 21 Web App (Shell)  â”œâ”€â”€â–ºâ”‚ Web BFF (NestJS)                â”‚
â”‚ Mobile App (React Native)   â”œâ”€â”€â–ºâ”‚ Mobile BFF (NestJS)             â”‚
â”‚ Advisor Portal (Angular 21) â”œâ”€â”€â–ºâ”‚ Advisor BFF (NestJS)            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                  â–¼
                                  â”Œâ”€â”€â”€ API Gateway â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                  â”‚  Kong â€” Rate limiting + Auth     â”‚
                                  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                  â–¼
â”Œâ”€â”€â”€ Microservices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Accounts  â”‚  Payments  â”‚  Loans  â”‚  KYC / Identity  â”‚  Audit      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                         â”‚ Payments events
                         â–¼
             â”Œâ”€â”€â”€ Apache Kafka (Event Bus) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
             â”‚   â”œâ”€â”€ Notification Service (Email / SMS / Push)    â”‚
             â”‚   â””â”€â”€ Audit Log Service                            â”‚
             â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### Angular 21 Shell Implementation

```typescript
// shell/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor, errorInterceptor])),
    provideClientHydration(withEventReplay()),
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25 }),
    {
      provide: APP_CONFIG,
      useValue: {
        apiBaseUrl: environment.bffUrl,
        featureFlags: environment.featureFlags,
      },
    },
  ],
};
```

```typescript
// shell/app.routes.ts
export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'accounts',
        loadChildren: () =>
          loadRemoteModule({
            type: 'module',
            remoteEntry: `${environment.accountsMfeUrl}/remoteEntry.js`,
            exposedModule: './AccountsModule',
          }).then(m => m.accountsRoutes),
      },
      {
        path: 'payments',
        loadChildren: () =>
          loadRemoteModule({
            type: 'module',
            remoteEntry: `${environment.paymentsMfeUrl}/remoteEntry.js`,
            exposedModule: './PaymentsModule',
          }).then(m => m.paymentsRoutes),
      },
      {
        path: 'loans',
        @defer â€” loaded only when user has loan products
        loadChildren: () =>
          loadRemoteModule({
            type: 'module',
            remoteEntry: `${environment.loansMfeUrl}/remoteEntry.js`,
            exposedModule: './LoansModule',
          }).then(m => m.loansRoutes),
      },
    ],
  },
  { path: 'login', loadComponent: () => import('./login/login.component') },
  { path: '**', redirectTo: 'accounts' },
];
```

## 7. Resources

| Resource                 | URL                                                                 | What it covers             |
| ------------------------ | ------------------------------------------------------------------- | -------------------------- |
| Angular Official Docs    | https://angular.dev                                                 | Latest Angular 21 APIs     |
| NgRx Docs                | https://ngrx.io                                                     | State management           |
| Module Federation        | https://webpack.js.org/concepts/module-federation                   | MFE setup                  |
| @angular-architects/mf   | https://github.com/angular-architects/module-federation-plugin      | Angular MFE toolkit        |
| Brad Frost Atomic Design | https://atomicdesign.bradfrost.com                                  | Design system structure    |
| C4 Model                 | https://c4model.com                                                 | Architecture diagrams      |
| 12-Factor App            | https://12factor.net                                                | App methodology            |
| Refactoring Guru         | https://refactoring.guru/design-patterns                            | GoF patterns with examples |
| NgRx Signal Store        | https://ngrx.io/guide/signals                                       | Signal-based state         |
| Mermaid Diagrams         | https://mermaid.js.org                                              | Code-based diagramming     |
| ADR GitHub               | https://github.com/joelparkerhenderson/architecture-decision-record | ADR templates              |
| Strangler Fig Pattern    | https://martinfowler.com/bliki/StranglerFigApplication.html         | Migration strategy         |

---

_Document generated with AI assistance â€” Sudeep Parchure, May 2026_
