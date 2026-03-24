import { Injectable, inject } from '@angular/core';
import { Observable, Subject, from, throwError, BehaviorSubject } from 'rxjs';
import {
  filter,
  map,
  switchMap,
  tap,
  retry,
  shareReplay,
} from 'rxjs/operators';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
} from 'firebase/messaging';
import { ConfigService } from '@nightfall/shared/util';
import { FirebaseInitService } from '../firebase-init/firebase-init.service';
import {
  FcmMessage,
  FcmMessageBase,
  GenericFcmMessage,
} from '../models/fcm-message.model';
import { FcmTopic, TopicId } from '../models/fcm-topic.model';

/** Maximum FCM token retrieval retry attempts. */
const TOKEN_RETRY_ATTEMPTS = 3;

/** Service worker path for background FCM message handling. */
const SW_PATH = '/firebase-messaging-sw.js';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private readonly initService = inject(FirebaseInitService);
  private readonly config = inject(ConfigService);

  private messaging: Messaging | null = null;
  private readonly _token$ = new BehaviorSubject<string | null>(null);
  private readonly _messageSubject$ = new Subject<FcmMessage>();
  private readonly _topics = new Map<TopicId, FcmTopic>();

  /** The current FCM registration token (null until acquired). */
  readonly token$: Observable<string | null> = this._token$.asObservable();

  /** All incoming foreground FCM messages as an observable stream. */
  readonly allMessages$: Observable<FcmMessage> =
    this._messageSubject$.asObservable();

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialize the FCM messaging channel and acquire a registration token.
   * Registers the service worker for background message support.
   * Safe to call multiple times — idempotent via FirebaseInitService.
   */
  initialize(): Observable<string> {
    return this.initService.initialize('lazy').pipe(
      switchMap((app) =>
        from(this.registerServiceWorker()).pipe(
          map((swReg) => {
            this.messaging = getMessaging(app);
            this.startForegroundListener();
            return swReg;
          }),
        ),
      ),
      switchMap((swReg) => this.acquireToken(swReg)),
      tap((token) => this._token$.next(token)),
      shareReplay(1),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Topic Subscriptions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register interest in a topic and start receiving its messages.
   * Topic routing is done client-side by filtering the shared message stream.
   *
   * Server-side topic subscription (via backend API) should be called separately
   * using the token from `token$`.
   */
  initializeTopicSubscription(topic: FcmTopic): void {
    if (!this._topics.has(topic.id)) {
      this._topics.set(topic.id, { ...topic, active: true });
    }
  }

  /** Deactivate a topic — its messages will be filtered out of the stream. */
  removeTopicSubscription(topicId: TopicId): void {
    const topic = this._topics.get(topicId);
    if (topic) {
      this._topics.set(topicId, { ...topic, active: false });
    }
  }

  /**
   * Returns an observable that emits only messages for the given topic.
   * Automatically type-narrows based on the TopicId.
   */
  getMessageByTopicId$(topicId: TopicId): Observable<FcmMessage> {
    return this._messageSubject$.pipe(
      filter((msg) => msg.topicId === topicId),
      filter(() => {
        const topic = this._topics.get(topicId);
        return topic?.active ?? false;
      }),
    );
  }

  /** Snapshot of all registered topics. */
  getTopics(): ReadonlyMap<TopicId, FcmTopic> {
    return this._topics;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error(
        '[FcmService] Service workers are not supported in this browser.',
      );
    }
    return navigator.serviceWorker.register(SW_PATH);
  }

  private acquireToken(swReg: ServiceWorkerRegistration): Observable<string> {
    if (!this.messaging) {
      return throwError(
        () => new Error('[FcmService] Messaging not initialized.'),
      );
    }

    const vapidKey = this.config.get('firebase').vapidKey;
    const messaging = this.messaging;

    return from(
      getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg }),
    ).pipe(
      retry({ count: TOKEN_RETRY_ATTEMPTS, delay: 2000 }),
      map((token) => {
        if (!token) throw new Error('[FcmService] Empty FCM token received.');
        return token;
      }),
    );
  }

  private startForegroundListener(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: MessagePayload) => {
      const msg = this.mapPayloadToMessage(payload);
      this._messageSubject$.next(msg);
    });
  }

  private mapPayloadToMessage(payload: MessagePayload): FcmMessage {
    const data = (payload.data ?? {}) as Record<string, unknown>;
    const topicId = (data['topicId'] as TopicId | undefined) ?? 'system-alerts';

    const sentAt =
      (data['sentAt'] as string | undefined) ?? new Date().toISOString();
    const correlationId = data['correlationId'] as string | undefined;

    const base: FcmMessageBase = { topicId, sentAt, correlationId };

    switch (topicId) {
      case 'messaging':
        return {
          ...base,
          topicId: 'messaging',
          senderId: (data['senderId'] as string | undefined) ?? '',
          senderName: (data['senderName'] as string | undefined) ?? '',
          preview: (data['preview'] as string | undefined) ?? '',
          threadId:
            (data['threadId'] as string | undefined) ?? crypto.randomUUID(),
          channel:
            (data['channel'] as 'in-app' | 'sms' | 'push' | undefined) ??
            'in-app',
        };
      case 'chat':
        return {
          ...base,
          topicId: 'chat',
          senderId: (data['senderId'] as string | undefined) ?? '',
          senderName: (data['senderName'] as string | undefined) ?? '',
          text: (data['text'] as string | undefined) ?? '',
          conversationId: (data['conversationId'] as string | undefined) ?? '',
        };
      case 'system-alerts':
        return {
          ...base,
          topicId: 'system-alerts',
          severity:
            (data['severity'] as 'info' | 'warning' | 'critical' | undefined) ??
            'info',
          title: (data['title'] as string | undefined) ?? '',
          body: (data['body'] as string | undefined) ?? '',
        };
      default: {
        const generic: GenericFcmMessage = { ...base, topicId, data };
        return generic as FcmMessage;
      }
    }
  }
}
