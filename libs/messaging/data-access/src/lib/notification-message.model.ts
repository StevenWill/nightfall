/** A single FCM notification displayed in the messaging viewer. */
export interface NotificationMessage {
  /** Unique message ID (threadId from FCM). */
  id: string;
  /** Display name of the sender. */
  senderName: string;
  /** The message preview text. */
  preview: string;
  /** ISO-8601 timestamp. */
  sentAt: string;
  /** Channel the message arrived on. */
  channel: 'in-app' | 'sms' | 'push';
}
