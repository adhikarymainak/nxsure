/* NxSure offline worker: keeps the website and the partner portal on the device, so they open instantly and work offline. */
const CACHE = 'nxsure-app-697ffdc3bb';
const FILES = ["./", "./index.html", "./partners.html", "./manifest.webmanifest", "./partners.webmanifest", "./apple-touch-icon.png", "./favicon-32.png", "./icon-192.png", "./icon-512.png", "./icon.svg", "./maskable-192.png", "./maskable-512.png"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('nxsure-app-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // pages: the latest from the network, the saved copy when offline
  if (req.mode === 'navigate') {
    const page = url.pathname.endsWith('partners.html') ? './partners.html' : './index.html';
    e.respondWith(fetch(req)
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(page, copy)); } return res; })
      .catch(() => caches.match(page)));
    return;
  }
  // icons and manifests: the saved copy first
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
