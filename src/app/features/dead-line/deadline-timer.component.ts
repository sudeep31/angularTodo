import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { fromEvent, interval, merge, of, timer } from 'rxjs';
import { catchError, filter, retry, startWith, switchMap, takeWhile } from 'rxjs/operators';

/**
 * DeadlineTimerComponent
 *
 * Polls an API every 10 seconds for { secondsLeft: number } and displays a
 * live countdown.  Works in two ways:
 *
 * 1. Copy-paste into any Angular 21+ project (standalone component).
 *    Your app must provide HttpClient:
 *      providers: [provideHttpClient()]
 *    Then use it in a template:
 *      <deadline-timer apiUrl="http://..." color="#fff" />
 *
 * 2. Drop-in Web Component — include the built deadline-timer-element.js and
 *    use the custom element in any HTML page:
 *      <deadline-timer api-url="http://..." color="#fff"></deadline-timer>
 *    (Attributes use kebab-case; properties use camelCase.)
 */
@Component({
  selector: 'deadline-timer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    role: 'region',
    '[attr.aria-label]': 'label()',
  },
  template: `
    <div
      class="wrapper"
      [style.background-color]="backgroundColor()"
      [style.color]="color()"
      [style.font-family]="fontFamily()"
    >
      <div class="label">{{ label() }}</div>

      @if (loading()) {
        <div class="value" aria-busy="true">Loading…</div>
      } @else if (fetchError()) {
        <!-- Initial load failed — no known value to display -->
        <div class="error" role="alert" aria-live="assertive">{{ fetchError() }}</div>
      } @else if (secondsLeft() !== null && secondsLeft()! <= 0) {
        <div class="expired" role="alert">Deadline Reached</div>
      } @else {
        <!-- Show last known countdown even when a subsequent poll fails -->
        <div class="value" role="timer" aria-live="off" aria-atomic="true" [style.font-size]="fontSize()">
          {{ formattedTime() }}
        </div>
        @if (syncError()) {
          <div class="sync-error" role="status" aria-live="polite">{{ syncError() }}</div>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .wrapper {
        padding: 24px 32px;
        border-radius: 12px;
        text-align: center;
        min-width: 200px;
      }
      .label {
        font-size: 0.8rem;
        margin-bottom: 10px;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      .value {
        font-weight: 700;
        line-height: 1;
      }
      .expired {
        font-size: 1.4rem;
        font-weight: 700;
        color: #ff4444;
      }
      .error {
        font-size: 0.85rem;
        color: #ff8888;
      }
      .sync-error {
        margin-top: 8px;
        font-size: 0.7rem;
        opacity: 0.6;
        color: #ffaa55;
      }
    `,
  ],
})
export class DeadlineTimerComponent {
  // ── Configurable inputs ───────────────────────────────────────────────────
  /** API endpoint. Must return { secondsLeft: number }. */
  readonly apiUrl = input('http://localhost:3000/api/deadline');
  /** Text / number colour (CSS colour value). */
  readonly color = input('#ffffff');
  /** Card background colour (CSS colour value). */
  readonly backgroundColor = input('#1a1a2e');
  /** Font family (CSS font-family value). */
  readonly fontFamily = input('monospace');
  /** Font size for the countdown value (CSS font-size value). */
  readonly fontSize = input('2rem');
  /** Heading label shown above the countdown. */
  readonly label = input('Time Remaining');
  /** How often to poll the API in milliseconds. */
  readonly pollInterval = input(10_000);

  // ── Internal state ────────────────────────────────────────────────────────
  readonly secondsLeft = signal<number | null>(null);
  readonly loading = signal(true);
  /** Set only on initial load failure (no value to display yet). */
  readonly fetchError = signal<string | null>(null);
  /** Set on subsequent poll failures; the countdown stays visible. */
  readonly syncError = signal<string | null>(null);

  /** Human-readable countdown derived from secondsLeft. */
  readonly formattedTime = computed(() => {
    const s = this.secondsLeft();
    if (s === null) return null;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  });

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  constructor() {
    /**
     * Reactive effect: re-starts polling whenever `apiUrl` input changes.
     * `onCleanup` tears down the previous RxJS subscription automatically.
     *
     * All signal writes happen exclusively inside `subscribe` — never inside
     * RxJS operators — so they are always batched correctly in zoneless mode.
     */
    effect((onCleanup) => {
      const url = this.apiUrl(); // register reactive dependency
      const pollMs = this.pollInterval();

      // Skip polling on the server — browser APIs (document, interval) are unavailable.
      if (!isPlatformBrowser(this.platformId)) return;

      this.loading.set(true);
      this.secondsLeft.set(null);
      this.fetchError.set(null);
      this.syncError.set(null);

      // Re-poll immediately when the user returns to the tab.
      const doc = this.document;
      const restore$ = fromEvent(doc, 'visibilitychange').pipe(
        filter(() => !doc.hidden)
      );

      const sub = merge(interval(pollMs).pipe(startWith(0)), restore$)
        .pipe(
          // Skip ticks while the tab is hidden — avoids wasted HTTP requests.
          filter(() => !doc.hidden),
          switchMap(() =>
            this.http
              .get<{ secondsLeft: number }>(url)
              .pipe(
                // Exponential backoff: 2 s → 4 s before giving up.
                retry({ count: 2, delay: (_err, attempt) => timer(Math.min(1_000 * 2 ** attempt, 30_000)) }),
                catchError(() => of(null))
              )
          ),
          // Stop the stream automatically once the deadline is reached.
          takeWhile((res) => res === null || res.secondsLeft > 0, true)
        )
        .subscribe((res) => {
          this.loading.set(false);

          if (res === null) {
            // Initial load failure → show blocking error (no value yet).
            // Subsequent poll failure → keep last known value, show subtle indicator.
            if (this.secondsLeft() === null) {
              this.fetchError.set(`Unable to reach ${url}`);
            } else {
              this.syncError.set('⟳ Sync failed — retrying shortly');
            }
          } else {
            this.fetchError.set(null);
            this.syncError.set(null);
            this.secondsLeft.set(res.secondsLeft);
          }
        });

      onCleanup(() => sub.unsubscribe());
    });
  }
}
