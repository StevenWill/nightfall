/**
 * Firebase project configuration per tenant/environment.
 * Populated from the runtime config.json (never hardcoded or committed).
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  /** VAPID key for Web Push / FCM token generation */
  vapidKey: string;
}

/** Whether Firebase should be initialized immediately (Eager) or on-demand (Lazy). */
export type FirebaseInitStrategy = 'eager' | 'lazy';

/** Tracks the lifecycle of the Firebase initialization state. */
export type FirebaseInitState =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'error';
