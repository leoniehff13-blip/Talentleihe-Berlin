/**
 * Service Worker – minimales PWA-Setup für Win/Win Talentleihe.
 *
 * Strategie
 *   • App-Shell (HTML/CSS/JS-Bundles) → cache-first
 *   • Navigation → network-first mit Cache-Fallback (Offline-fallback auf "/")
 *   • API-Calls (Appwrite, Nominatim, OpenStreetMap-Tiles) werden NICHT gecached
 *     – sie sollen immer frisch über das Netz laufen.
 *
 * Bei Code-Änderungen die CACHE_NAME-Version hochzählen, damit alte Caches
 * verworfen werden.
 */

const CACHE_NAME = "winwin-v1";
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {
        /* Wenn Precache scheitert, install nicht abbrechen */
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Nur same-origin behandeln; externe APIs/Fonts/Tiles bypassen
  const isSameOrigin = url.origin === self.location.origin;
  const isExternalApi =
    url.hostname.includes("appwrite") ||
    url.hostname.includes("nominatim") ||
    url.hostname.includes("openstreetmap") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("unpkg.com") ||
    url.hostname.includes("tile.openstreetmap.org");
  if (!isSameOrigin || isExternalApi) {
    return; // Browser kümmert sich
  }

  // Navigation: network-first, fallback auf gecachten App-Shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match("/").then(
          (cached) =>
            cached ||
            new Response("Offline", { status: 503, statusText: "Offline" })
        )
      )
    );
    return;
  }

  // Statische Assets: cache-first, mit Hintergrund-Update
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
