// const staticCacheName = 'site-static-v8';
// const dynamicCacheName = 'site-dynamic-v8';
// const cacheSizeLimit = 50;
// const assets = [
//     '/',
//     '/index.html',
//     '/fallback.html',
//     '/styles.css',
//     '/runtime.js',
//     '/polyfills.js',
//     '/styles.js',
//     '/vendor.js',
//     '/main.js',
//     '/manifest.webmanifest',
//     'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400&display=swap',
//     'https://fonts.gstatic.com/s/nunito/v25/XRXV3I6Li01BKofINeaB.woff2',
//     '/favicon.ico',
//     '/icon-192.png',
//     '/icon.svg',
//     '/apps_cards_src_app_modules_auth_auth_module_ts.js',
//     '/assets/images/welcome_sticker.png',
//     '/assets/images/blanket_sticker.png'
// ]
//
// const limitCacheSize = (name, size) => {
//     caches.open(name).then(cache => {
//         cache.keys().then(keys => {
//             if(keys.length > size) {
//                 cache.delete(keys[0]).then(() => limitCacheSize(name, size))
//             }
//         })
//     })
// }
//
// self.addEventListener('install', (event) => {
//     // console.log('service worker installed')
//     event.waitUntil(
//         caches.open(staticCacheName).then(cache => {
//             console.log('caching assets', assets)
//             cache.addAll(assets)
//         })
//     )
// })
//
// self.addEventListener('activate', (event) => {
//     event.waitUntil(
//         caches.keys().then(keys => {
//             return Promise.all(keys
//                 .filter(key => key !== staticCacheName && key !== dynamicCacheName)
//                 .map(key => caches.delete(key))
//             )
//         })
//     )
// })
//
// self.addEventListener('fetch', function(event) {
//     if(event.request.url.indexOf('firestore.googleapis.com') === -1) {
//         event.respondWith(
//             caches.match(event.request).then(cacheRes => {
//                 return cacheRes || fetch(event.request).then(fetchResponse => {
//                     return caches.open(dynamicCacheName).then(cache => {
//                         cache.put(event.request.url, fetchResponse.clone())
//                         limitCacheSize(dynamicCacheName, cacheSizeLimit)
//                         return fetchResponse;
//                     })
//                 })
//             }).catch(() => {
//                 if(event.request.url.indexOf('board') !== -1) {
//                     return caches.match('/fallback.html')
//                 }
//             })
//         );
//     }
// })
