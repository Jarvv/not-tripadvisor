var CACHE_NAME = "cache:0.1.0";
var urlsToCache = [
    "/",
    "/search",
    "/user/checkSession",
    "/stylesheets/style.css",
    "/js/mapsearch.js",
    "/js/search.js",
    "/js/register.js",
    "/js/login.js",
    "/js/create.js",
    "/js/app.js",
    "/js/database.js",
    "/js/edit.js",
    "/js/login.js",
    "/js/review.js",
    "/js/sockets/search.js",
    "/images/restaurant_default.png",
    "/boot/files/css/bootstrap.min.css",
    "/boot/files/js/bootstrap.min.js",
    "/jquery/files/jquery.min.js",
    "/stylesheets/fontawesome/web-fonts-with-css/css/fontawesome-all.min.css",
    "/stylesheets/fontawesome/web-fonts-with-css/webfonts/fa-solid-900.ttf",
    "/stylesheets/fontawesome/web-fonts-with-css/webfonts/fa-solid-900.woff",
    "/stylesheets/fontawesome/web-fonts-with-css/webfonts/fa-solid-900.woff2",
    "/stylesheets/fontawesome/web-fonts-with-css/webfonts/fa-solid-900.svg",
    "/socket/io/socket.io.js",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/10.0.2/bootstrap-slider.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/10.0.2/css/bootstrap-slider.min.css"
];

self.addEventListener("install", function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    //console.log('[Service Worker] Fetch', e.request.url);
    /*if (e.request.url) {
        console.log(e.request.url);
        return fetch(e.request).then(function (response) {
            return response;
        })
    } else {*/
    e.respondWith(network(e.request, 500).then((res) => {
        return res;
    }).catch(() => {
        return cache(e.request).catch(() => {});
    }));

    /*e.respondWith(
        caches.match(e.request).then(function (response) {
            return response ||
                fetch(e.request)
                .then(function (response) {
                    if (!response.ok) {
                        console.log("error: " + err);
                    }
                })
                .catch(function (e) {
                    console.log("error: " + err);
                })
        })
    );*/
    //}
});

function network(request, time) {
    return new Promise((resolve, reject) => {
        var timeout = setTimeout(reject, time);
        fetch(request).then((response) => {
            clearTimeout(timeout);
            resolve(response);
        }, reject);
    })
}

function cache(request) {
    return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((matching) => {
            return matching || Promise.reject('no-match');
        });
    });
}