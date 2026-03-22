import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FcmMessage } from '../lib/models/fcm-message.model';
import { FcmTopic, TopicId } from '../lib/models/fcm-topic.model';

/**
 * Test double for FcmService.
 *
 * Use in TestBed providers:
 *   { provide: FcmService, useClass: FcmServiceMock }
 *
 * Control the mock in tests:
 *   const mock = TestBed.inject(FcmService) as unknown as FcmServiceMock;
 *   mock.simulateMessage({ topicId: 'system-alerts', ... });
 */
@Injectable()
export class FcmServiceMock {
  private readonly _token$ = new BehaviorSubject<string | null>(null);
  private readonly _messageSubject$ = new Subject<FcmMessage>();
  private readonly _topics = new Map<TopicId, FcmTopic>();

  /** Mirrors FcmService.token$ */
  readonly token$: Observable<string | null> = this._token$.asObservable();

  /** Mirrors FcmService.allMessages$ */
  readonly allMessages$: Observable<FcmMessage> =
    this._messageSubject$.asObservable();

  // ─────────────────────────────────────────────────────────────────────────
  // FcmService public API (mirrors the real service)
  // ─────────────────────────────────────────────────────────────────────────

  initialize(): Observable<string> {
    const token = this._token$.getValue() ?? 'mock-fcm-token';
    this._token$.next(token);
    return of(token);
  }

  initializeTopicSubscription(topic: FcmTopic): void {
    this._topics.set(topic.id, { ...topic, active: true });
  }

  removeTopicSubscription(topicId: TopicId): void {
    const topic = this._topics.get(topicId);
    if (topic) {
      this._topics.set(topicId, { ...topic, active: false });
    }
  }

  getMessageByTopicId$(topicId: TopicId): Observable<FcmMessage> {
    return this._messageSubject$.pipe(
      filter((msg) => msg.topicId === topicId),
      filter(() => this._topics.get(topicId)?.active ?? false),
    );
  }

  getTopics(): ReadonlyMap<TopicId, FcmTopic> {
    return this._topics;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Test helpers (not on the real service)
  // ─────────────────────────────────────────────────────────────────────────

  /** Push a message into the stream — as if Firebase delivered it. */
  simulateMessage(msg: FcmMessage): void {
    this._messageSubject$.next(msg);
  }

  /** Set the current FCM token — useful for testing token-dependent logic. */
  simulateToken(token: string): void {
    this._token$.next(token);
  }

  /** Reset all state between tests. */
  reset(): void {
    this._token$.next(null);
    this._topics.clear();
  }
}
