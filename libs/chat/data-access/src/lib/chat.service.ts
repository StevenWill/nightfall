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
  ChatFcmMessage,
} from '@nightfall/shared/data-access-firebase';
import { ChatMessage } from './chat-message.model';

const TOPIC_ID = 'chat' as const;

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private readonly fcm = inject(FcmService);

  private readonly _messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private subscription: Subscription | null = null;

  /** Observable stream of all chat messages (received + sent). */
  readonly messages$: Observable<ChatMessage[]> =
    this._messages$.asObservable();

  /**
   * Initialize the FCM connection and begin listening for incoming chat messages.
   * Safe to call multiple times — idempotent.
   */
  initialize(): void {
    this.fcm.initializeTopicSubscription({
      id: TOPIC_ID,
      label: 'Chat',
      active: true,
    });

    if (!this.subscription) {
      this.subscription = this.fcm
        .getMessageByTopicId$(TOPIC_ID)
        .pipe(
          catchError((err) => {
            console.error('[ChatService] FCM stream error:', err);
            return EMPTY;
          }),
        )
        .subscribe((msg) => {
          const fcmMsg = msg as ChatFcmMessage;
          this.addMessage({
            id: `${fcmMsg.conversationId}-${fcmMsg.sentAt}`,
            senderName: fcmMsg.senderName,
            text: fcmMsg.text,
            sentAt: fcmMsg.sentAt,
            isSelf: false,
            channel: 'in-app',
          });
        });
    }

    this.fcm
      .initialize()
      .pipe(
        catchError((err) => {
          console.warn(
            '[ChatService] Firebase not available, running in mock mode:',
            err.message,
          );
          return EMPTY;
        }),
      )
      .subscribe();
  }

  /**
   * Send a message from the current user.
   * Echoes locally immediately; wire to backend API when ready.
   */
  send(text: string): void {
    if (!text.trim()) return;
    this.addMessage({
      id: crypto.randomUUID(),
      senderName: 'You',
      text: text.trim(),
      sentAt: new Date().toISOString(),
      isSelf: true,
      channel: 'local',
    });
  }

  private addMessage(msg: ChatMessage): void {
    this._messages$.next([...this._messages$.getValue(), msg]);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.fcm.removeTopicSubscription(TOPIC_ID);
  }
}
