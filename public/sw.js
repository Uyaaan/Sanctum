/* Sanctum service worker — handles Web Push only. */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Sanctum Bell',
    body: 'The day is closing. What did you do?',
    url: '/dashboard',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      /* malformed payload — fall back to defaults */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: 'sanctum-bell',
      badge: '/favicon.ico',
      icon: '/favicon.ico',
      data: { url: data.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const url = new URL(client.url);
          if (url.origin === self.location.origin && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
