import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Subscription,
  Observable,
  catchError,
  EMPTY,
} from 'rxjs';
import {
  FcmService,
  MessagingMessage,
} from '@nightfall/shared/data-access-firebase';
import { NotificationMessage } from './notification-message.model';

const TOPIC_ID = 'messaging' as const;

// ─────────────────────────────────────────────────────────────────────────────
// Seed data shown when Firebase is unavailable (development / offline mode)
// ─────────────────────────────────────────────────────────────────────────────
function buildSeedMessages(): NotificationMessage[] {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      senderName: 'Alex Johnson',
      preview: 'Hey, are you free for a quick call this afternoon?',
      sentAt: new Date(now - 5 * 60 * 1000).toISOString(),
      channel: 'in-app',
    },
    {
      id: 'seed-2',
      senderName: 'Sarah Miller',
      preview: 'The project report has been shared with you.',
      sentAt: new Date(now - 22 * 60 * 1000).toISOString(),
      channel: 'push',
    },
    {
      id: 'seed-3',
      senderName: 'Tech Support',
      preview: 'Your support ticket #4821 has been resolved.',
      sentAt: new Date(now - 60 * 60 * 1000).toISOString(),
      channel: 'in-app',
    },
    {
      id: 'seed-4',
      senderName: 'Jordan Lee',
      preview: "Don't forget the team standup at 10am tomorrow!",
      sentAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      channel: 'sms',
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class MessagingService implements OnDestroy {
  private readonly fcm = inject(FcmService);

  private readonly _messages$ = new BehaviorSubject<NotificationMessage[]>([]);
  private subscription: Subscription | null = null;
  private seedLoaded = false;

  /** Observable stream of received FCM notification messages. */
  readonly messages$: Observable<NotificationMessage[]> =
    this._messages$.asObservable();

  /**
   * Initialize the FCM connection and begin listening for incoming notifications.
   * Seed messages are shown immediately so the UI is never empty in development.
   * Real FCM messages append on top when Firebase is available.
   * Safe to call multiple times — idempotent.
   */
  initialize(): void {
    this.fcm.initializeTopicSubscription({
      id: TOPIC_ID,
      label: 'Messaging Notifications',
      active: true,
    });

    // Show seed data immediately so the UI is never empty on first load.
    if (!this.seedLoaded) {
      this.seedLoaded = true;
      buildSeedMessages().forEach((msg) => this.addMessage(msg));
    }

    if (!this.subscription) {
      this.subscription = this.fcm
        .getMessageByTopicId$(TOPIC_ID)
        .pipe(
          catchError((err) => {
            console.error('[MessagingService] FCM stream error:', err);
            return EMPTY;
          }),
        )
        .subscribe((msg) => {
          const fcmMsg = msg as MessagingMessage;
          this.addMessage({
            id: fcmMsg.threadId ?? crypto.randomUUID(),
            senderName: fcmMsg.senderName,
            preview: fcmMsg.preview,
            sentAt: fcmMsg.sentAt,
            channel: fcmMsg.channel,
          });
        });
    }

    this.fcm
      .initialize()
      .pipe(
        catchError((err) => {
          console.warn(
            '[MessagingService] Firebase not available, running in mock mode:',
            err.message,
          );
          return EMPTY;
        }),
      )
      .subscribe();
  }

  private addMessage(msg: NotificationMessage): void {
    this._messages$.next([...this._messages$.getValue(), msg]);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.fcm.removeTopicSubscription(TOPIC_ID);
  }
}
