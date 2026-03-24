// Firebase Cloud Messaging Service Worker
// Uses the Firebase compat SDK via importScripts so this file can remain a
// classic (non-module) service worker — required by some browsers.
importScripts(
  'https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js',
);

// Fetch the runtime config from the same place the Angular app uses so we
// never have credentials hardcoded in this file.
const configReady = fetch('/assets/config.json')
  .then((res) => res.json())
  .then((config) => {
    firebase.initializeApp(config.firebase);

    const messaging = firebase.messaging();

    // Handle messages that arrive while the app is in the background or closed.
    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title ?? 'New notification';
      const options = {
        body: payload.notification?.body ?? '',
        icon: '/favicon.ico',
        data: payload.data,
      };
      return self.registration.showNotification(title, options);
    });
  })
  .catch((err) =>
    console.error('[firebase-messaging-sw] Initialisation error:', err),
  );

// Block the SW install step until Firebase is ready so the push subscription
// is always backed by an initialised messaging instance.
self.addEventListener('install', (event) => event.waitUntil(configReady));

