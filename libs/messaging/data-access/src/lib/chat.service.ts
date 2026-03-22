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

@Injectable({ providedIn: 'root' })
export class MessagingService implements OnDestroy {
  private readonly fcm = inject(FcmService);

  private readonly _messages$ = new BehaviorSubject<NotificationMessage[]>([]);
  private subscription: Subscription | null = null;

  /** Observable stream of received FCM notification messages. */
  readonly messages$: Observable<NotificationMessage[]> =
    this._messages$.asObservable();

  /**
   * Initialize the FCM connection and begin listening for incoming notifications.
   * Safe to call multiple times — idempotent.
   */
  initialize(): void {
    this.fcm.initializeTopicSubscription({
      id: TOPIC_ID,
      label: 'Messaging Notifications',
      active: true,
    });

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
