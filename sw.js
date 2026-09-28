// Service worker: lets the installed game start without a connection.
// Network first, so a new deploy shows up on the next launch; the cached copy is the fallback.
// Online matches still need the internet (PeerJS connects players through its server).
// Every file the game loads must be listed in SHELL; tools/pwa.test.mjs checks that.
const CACHE = 'doodle-district-v1';
const SHELL = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './vendor/three/three.module.js', './vendor/three/addons/utils/BufferGeometryUtils.js', './vendor/peerjs/peerjs.min.js',
  './src/audio.js', './src/effects.js', './src/enemies.js', './src/hud.js', './src/input.js', './src/level.js', './src/main.js',
  './src/nairobi-data.js', './src/nav.js', './src/net.js', './src/physics.js', './src/player.js', './src/players.js',
  './src/render.js', './src/touch.js', './src/util.js', './src/weapons.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // PeerJS and anything off-site go straight to the network
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))),
  );
});
