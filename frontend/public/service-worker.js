/* NutriNexus Progressive Web App Service Worker */
const CACHE_NAME = 'nutrinexus-pwa-v1';

// Core static assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/maskable512.png',
  '/apple-touch-icon.png',
  '/food-recommendation',
  '/daily-tracker',
  '/yoga-guide',
  '/disease-guide',
  '/water-reminder',
  '/medicine-reminder',
  '/ai-chat'
];

// Installation Event: Pre-cache core assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing NutriNexus Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell & static assets...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache warning (some assets cached dynamically):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation Event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating NutriNexus Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing old cache version:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First for static assets, Network-First for API calls with offline fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Handle API Requests: Network First, fallback to cache if offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({ 
                error: 'Offline mode active. Please reconnect to internet for real-time updates.',
                offline: true 
              }), 
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Handle Static & Page Navigation: Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and navigating to a page, serve index.html (SPA entry)
          if (req.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Message Event: Listen for skipWaiting command from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
