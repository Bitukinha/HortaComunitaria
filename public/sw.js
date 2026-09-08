// Minimal service worker: only exists so the app is installable as a PWA.
// It deliberately does NOT cache HTML pages or _serverFn requests — this app
// is a live CRUD tool backed by Postgres, and serving stale data offline
// would be worse than no offline support at all.
const CACHE = "horta-static-v1";
const PRECACHE_URLS = ["/manifest.webmanifest", "/pwa-192.png", "/pwa-512.png", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isPrecachedAsset = PRECACHE_URLS.includes(url.pathname);
  if (event.request.method !== "GET" || !isPrecachedAsset) return;

  event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)));
});
