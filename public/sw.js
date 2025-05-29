// Simple service worker to prevent 404 errors
// This is a minimal service worker that doesn't do anything
// but prevents the browser from throwing 404 errors

self.addEventListener('install', function(event) {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// No-op fetch handler
self.addEventListener('fetch', function(event) {
  // Let the browser handle all requests normally
  return;
});
