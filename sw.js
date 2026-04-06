// Cache-Busting Timestamp: 2026-04-06 01:27:10
const CACHE_NAME = 'platformer-cache-v151';
const ASSETS_TO_CACHE = [
  './?v=151',
  './index.html?v=151',
  './manifest.json?v=151',
  './src/assets/images/icon.svg?v=151',
  './style.css?v=151',
  './src/dist/assets/assets.js?v=151',
  './src/dist/assets/audio.js?v=151',
  './src/dist/data/db.js?v=151',
  './src/dist/core/globals.js?v=151',
  './src/dist/data/levels.js?v=151',
  './src/dist/core/physics.js?v=151',
  './src/dist/render/render.js?v=151',
  './src/dist/render/render_parallax.js?v=151',
  './src/dist/render/render_menus.js?v=151',
  './src/dist/render/render_world.js?v=151',
  './src/dist/render/render_entities.js?v=151',
  './src/dist/render/render_bosses.js?v=151',
  './src/dist/render/render_player.js?v=151',
  './src/dist/render/render_ui.js?v=151',
  './src/dist/render/render_utils.js?v=151',
  './src/dist/render/render_biomes.js?v=151',
  './src/dist/core/input.js?v=151',
  './src/dist/logic/spawner.js?v=151',
  './src/dist/logic/entity_spawner.js?v=151',
  './src/dist/core/game.js?v=151',
  './src/dist/main.js?v=151',
  './src/assets/images/logo.png?v=151',
  './src/dist/assets/sprites_hero.js?v=151',
  './src/dist/assets/sprites_enemies.js?v=151',
  './src/dist/assets/sprites_bosses.js?v=151',
  './src/dist/assets/sprites_biomes.js?v=151',
  './src/dist/core/physics_utils.js?v=151',
  './src/dist/core/physics_boss.js?v=151',
  './src/dist/core/input_utils.js?v=151',
  './src/dist/core/input_touch.js?v=151',
  './src/dist/assets/audio_music.js?v=151',
  './src/dist/assets/audio_sfx.js?v=151',
  './src/dist/core/spatial_grid.js?v=151'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((response) => {
      return response || fetch(e.request);
    })
  );
});
