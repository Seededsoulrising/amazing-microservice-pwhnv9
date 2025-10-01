// Simple service worker for Lazy River Breathing
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (event) => {
  self.clients.claim(); // take control right away
});

// Optional fetch handler (kept minimal here)
self.addEventListener("fetch", (event) => {
  // You could add caching here if you want offline support
});
