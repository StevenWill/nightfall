import { TopicId } from './fcm-topic.model';

/** Base shape every FCM message must satisfy. */
export interface FcmMessageBase {
  /** The topic this message was received on. */
  topicId: TopicId;
  /** ISO-8601 timestamp of when the message was generated server-side. */
  sentAt: string;
  /** Optional correlation ID for tracing through the system. */
  correlationId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification payload variants
// ─────────────────────────────────────────────────────────────────────────────

/** System-wide alert or announcement. */
export interface SystemAlertMessage extends FcmMessageBase {
  topicId: 'system-alerts';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  body: string;
}

/** Direct message or SMS/texting notification. */
export interface MessagingMessage extends FcmMessageBase {
  topicId: 'messaging';
  senderId: string;
  senderName: string;
  preview: string;
  /** Thread or conversation ID for deep-linking. */
  threadId: string;
  channel: 'in-app' | 'sms' | 'push';
}

/** Real-time interactive chat message. */
export interface ChatFcmMessage extends FcmMessageBase {
  topicId: 'chat';
  senderId: string;
  senderName: string;
  text: string;
  /** Conversation/thread ID for grouping messages. */
  conversationId: string;
}

/** LLM Chatbot response or status update. */
export interface LlmChatbotMessage extends FcmMessageBase {
  topicId: 'llm-chatbot';
  sessionId: string;
  responseStatus: 'streaming' | 'complete' | 'error';
  /** Partial or full response text from the LLM. */
  content: string;
  /** Model identifier (e.g. "gpt-4o", "claude-3-5-sonnet"). */
  model?: string;
}

/** Investment-domain notification. */
export interface InvestmentsMessage extends FcmMessageBase {
  topicId: 'investments';
  alertType: 'price-change' | 'trade-executed' | 'dividend' | 'rebalance';
  symbol: string;
  detail: string;
}

/** Generic fallback for unknown or custom topics. */
export interface GenericFcmMessage extends FcmMessageBase {
  topicId: string;
  data: Record<string, unknown>;
}

/** Discriminated union of all known FCM message types. */
export type FcmMessage =
  | SystemAlertMessage
  | MessagingMessage
  | ChatFcmMessage
  | LlmChatbotMessage
  | InvestmentsMessage
  | GenericFcmMessage;
