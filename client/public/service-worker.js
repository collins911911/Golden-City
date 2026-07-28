const CACHE_NAME = 'golden-city-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ── Install — cache static assets ────────────────────────────
self.addEventListener('install', (e) => {
  console.log('✅ Golden City Service Worker installing...');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate — clean up old caches ───────────────────────────
self.addEventListener('activate', (e) => {
  console.log('✅ Golden City Service Worker activated');
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  clients.claim();
});

// ── Fetch — serve from cache, fallback to network ────────────
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Skip API calls — always go to network for fresh data
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback — return cached index.html for navigation
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};

  const title   = data.title || 'Golden City Church';
  const options = {
    body:    data.body    || 'You have a new notification',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/icon-96.png',
    vibrate: [200, 100, 200],
    data:    { url: data.url || '/' },
    actions: [
      { action: 'open',    title: 'Open App'  },
      { action: 'dismiss', title: 'Dismiss'   },
    ],
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Notification Click ────────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;

  const url = e.notification.data?.url || '/member-dashboard';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});