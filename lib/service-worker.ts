// Service Worker for offline functionality
const CACHE_NAME = "medic-ai-offline-v1"
const OFFLINE_URL = "/offline"

// Files to cache for offline use
const STATIC_CACHE_URLS = [
  "/",
  "/offline",
  "/emergency",
  "/manifest.json",
  // Add other critical pages and assets
]

// Install event - cache static resources
self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching static resources")
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        // Ensure the service worker takes control immediately
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event: any) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return

  // Handle navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, serve offline page
        return caches.match(OFFLINE_URL)
      }),
    )
    return
  }

  // Handle other requests
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation
        if (event.request.destination === "document") {
          return caches.match(OFFLINE_URL)
        }
      }),
  )
})

// Background sync for caching hospital data
self.addEventListener("sync", (event: any) => {
  if (event.tag === "cache-hospitals") {
    event.waitUntil(
      // This would typically sync with your backend
      console.log("Background sync: caching hospital data"),
    )
  }
})

// Push notifications for emergency updates
self.addEventListener("push", (event: any) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: "emergency-notification",
      requireInteraction: true,
      actions: [
        {
          action: "view",
          title: "View Details",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Handle notification clicks
self.addEventListener("notificationclick", (event: any) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(self.clients.openWindow("/emergency"))
  }
})

export {}
