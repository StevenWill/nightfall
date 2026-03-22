/**
 * Well-known FCM topic identifiers for the Nightfall platform.
 * Feature teams extend this via the union type pattern.
 */
export type SystemTopicId =
  | 'system-alerts' // Platform-wide announcements / maintenance
  | 'messaging' // Direct messages and SMS/texting notifications
  | 'chat' // Real-time interactive chat messages
  | 'llm-chatbot' // LLM / AI chatbot responses and status
  | 'investments' // Investment portfolio alerts
  | 'user-profile'; // Profile update confirmations

/** Extensible topic identifier — teams add their own literal types via union. */
export type TopicId = SystemTopicId | string;

/** Metadata for a topic subscription registration. */
export interface FcmTopic {
  /** Unique identifier for the topic — used as the FCM topic name. */
  id: TopicId;
  /** Human-readable label for debugging / UI display. */
  label: string;
  /** Whether the subscription is currently active. */
  active: boolean;
}
