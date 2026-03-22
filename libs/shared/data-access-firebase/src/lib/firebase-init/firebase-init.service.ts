import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import {
  filter,
  take,
  switchMap,
  tap,
  catchError,
  shareReplay,
} from 'rxjs/operators';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { ConfigService } from '@nightfall/shared/util';
import {
  FirebaseInitState,
  FirebaseInitStrategy,
} from '../models/firebase-config.model';

@Injectable({ providedIn: 'root' })
export class FirebaseInitService {
  private readonly config = inject(ConfigService);

  private readonly _state$ = new BehaviorSubject<FirebaseInitState>(
    'uninitialized',
  );
  private readonly _error$ = new BehaviorSubject<Error | null>(null);
  private _app: FirebaseApp | null = null;
  private _initStream$: Observable<FirebaseApp> | null = null;

  /** Current initialization state as an observable. */
  readonly state$: Observable<FirebaseInitState> = this._state$.asObservable();

  /** Last initialization error, if any. */
  readonly error$: Observable<Error | null> = this._error$.asObservable();

  /** Snapshot of the current state — useful for guards and conditions. */
  get state(): FirebaseInitState {
    return this._state$.getValue();
  }

  /** Returns the initialized FirebaseApp, or null if not yet ready. */
  get app(): FirebaseApp | null {
    return this._app;
  }

  /**
   * Initialize Firebase using the given strategy.
   *
   * - **Eager**: Call during APP_INITIALIZER so Firebase is ready before any route loads.
   * - **Lazy**: Call on-demand (e.g., when the user first opens a chat or notification panel).
   *
   * Multiple calls are idempotent — concurrent calls share the same in-flight observable.
   */
  initialize(strategy: FirebaseInitStrategy = 'lazy'): Observable<FirebaseApp> {
    // Already initialized — return the app immediately.
    if (this._state$.getValue() === 'ready' && this._app) {
      return of(this._app);
    }

    // Error state — do not retry automatically; caller must handle.
    if (this._state$.getValue() === 'error') {
      return throwError(
        () =>
          this._error$.getValue() ??
          new Error('Firebase initialization failed.'),
      );
    }

    // Initialization already in-flight — share the stream to prevent race conditions.
    if (this._initStream$) {
      return this._state$.pipe(
        filter((s) => s === 'ready' || s === 'error'),
        take(1),
        switchMap((s) =>
          s === 'ready' && this._app
            ? of(this._app)
            : throwError(
                () =>
                  this._error$.getValue() ??
                  new Error('Firebase initialization failed.'),
              ),
        ),
      );
    }

    this._state$.next('initializing');

    const firebaseConfig = this.config.get('firebase');

    this._initStream$ = from(
      Promise.resolve().then(() => {
        // Prevent duplicate Firebase apps (e.g. HMR in dev mode).
        const existing = getApps().find(
          (a) => a.options['projectId'] === firebaseConfig.projectId,
        );
        return existing ?? initializeApp(firebaseConfig);
      }),
    ).pipe(
      tap((app) => {
        this._app = app;
        this._state$.next('ready');
        this._initStream$ = null;
        if (strategy === 'eager') {
          console.info(
            `[FirebaseInitService] Eagerly initialized Firebase app: ${app.name}`,
          );
        }
      }),
      catchError((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        this._error$.next(error);
        this._state$.next('error');
        this._initStream$ = null;
        console.error('[FirebaseInitService] Initialization failed:', error);
        return throwError(() => error);
      }),
      shareReplay(1),
    );

    return this._initStream$;
  }

  /** Observable that emits once the app is ready — useful for dependent services. */
  whenReady$(): Observable<FirebaseApp> {
    return this._state$.pipe(
      filter((s) => s === 'ready'),
      take(1),
      switchMap(() => of(this._app as FirebaseApp)),
    );
  }

  /** Reset state — useful for testing or tenant-switching scenarios. */
  reset(): void {
    this._app = null;
    this._initStream$ = null;
    this._error$.next(null);
    this._state$.next('uninitialized');
  }
}
