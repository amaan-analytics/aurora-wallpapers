// Service Worker for Aurora Wallpapers PWA
const CACHE_NAME = 'aurora-cache-v1';
const IMAGE_CACHE_NAME = 'aurora-images-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/robots.txt',
  '/sitemap.xml'
];

// Install event: cache core shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Aurora SW: Precaching App Shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== IMAGE_CACHE_NAME) {
            console.log('Aurora SW: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: service routing strategies
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (e.g. Firestore, Auth operations)
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Ignore non-http/https protocols (e.g. chrome-extension://, data:, blob:)
  if (!requestUrl.protocol.startsWith('http')) {
    return;
  }

  // Strategy for external high-res wallpaper images: Cache First
  if (
    requestUrl.hostname.includes('images.pexels.com') || 
    requestUrl.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone(); // Clone synchronously immediately
              cache.put(event.request, responseToCache).catch((err) => {
                console.warn('Aurora SW: Failed to put image in cache', err);
              });
            }
            return networkResponse;
          }).catch(() => {
            // Return default image placeholder if offline and not cached
            return caches.match('/icons/icon-192.png');
          });
        });
      })
    );
    return;
  }

  // Strategy for app assets/shell: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache new successful GET requests
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone(); // Clone synchronously immediately
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((err) => {
              console.warn('Aurora SW: Failed to put asset in cache', err);
            });
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.warn('Aurora SW: Network fetch failed, offline fallback active.', error);
        
        // Return cached index.html for page navigation queries when offline
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
