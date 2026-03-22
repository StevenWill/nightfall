export interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  vapidKey: string;
}

export interface AppConfig {
  tenantId: string;
  tenantName: string;
  apiBaseUrl: string;
  firebase: FirebaseRuntimeConfig;
  features: {
    investments: boolean;
    userProfile: boolean;
    fcmMessaging: boolean;
    llmChatbot: boolean;
  };
}
