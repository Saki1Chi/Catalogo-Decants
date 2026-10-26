// Service worker del catálogo público (PWA instalable, ver manifest.json).
//
// No es un precache completo tipo Workbox (este proyecto usa Turbopack, que
// hoy no es compatible con plugins de service worker basados en webpack como
// next-pwa) — es cache-en-tiempo-de-uso: cada página/recurso que se visita
// online queda guardado, y se sirve desde ahí si después no hay conexión.
// Alcanza para el caso real: Alfredo/un cliente entra online al menos una
// vez, después el catálogo sigue disponible sin conexión.
//
// Los DATOS (perfumes, precios, stock) no dependen de este archivo — esos
// los cachea Firestore solo (ver src/lib/firebase.ts, persistentLocalCache).
// Esto es solo el shell: HTML, CSS, JS, imágenes.

const CACHE = "catalogo-v1";
const RUTA_OFFLINE = "/";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([RUTA_OFFLINE, "/manifest.json"])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Firestore/Storage: no tocar, ya cachean solos

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copia));
        return respuesta;
      })
      .catch(async () => {
        const enCache = await caches.match(request);
        if (enCache) return enCache;
        if (request.mode === "navigate") {
          const shell = await caches.match(RUTA_OFFLINE);
          if (shell) return shell;
        }
        return Response.error();
      }),
  );
});
