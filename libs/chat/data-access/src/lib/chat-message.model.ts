/** A single message in an interactive chat conversation. */
export interface ChatMessage {
  /** Unique message ID (conversationId+timestamp from FCM, or local UUID for sent). */
  id: string;
  /** Display name of the sender. */
  senderName: string;
  /** Full message text. */
  text: string;
  /** ISO-8601 timestamp. */
  sentAt: string;
  /** True when this message was sent by the current user. */
  isSelf: boolean;
  /** How this message was delivered. 'local' means it was sent (not received). */
  channel: 'in-app' | 'push' | 'local';
}
