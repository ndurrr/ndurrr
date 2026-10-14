// Keeps the Nest launcher instant and usable offline. Today's quest is always fetched fresh first.
const CACHE = "nest-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./mark.svg", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.pathname.endsWith("today.json")) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("today.json", c)); return r; }).catch(() => caches.match("today.json")));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
