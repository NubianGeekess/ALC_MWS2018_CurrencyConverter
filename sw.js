const staticCacheName = 'currency-static-v3';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(function(reg) {
      // registration worked
      console.log('Service worker registration succeeded ' );
    }).catch(function(error) {
      // registration failed
      alert(`Service worker registration failed with error: ${error}.
             Currency converter will not work offline`);
    });
  }

  self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll([
            './',
            './main.css',
            './dollar.svg',
            './bkg-img.jpg',
            './app.js',
            'https://fonts.googleapis.com/css?family=Montserrat:400,700',
            'https://fonts.gstatic.com/s/montserrat/v12/JTURjIg1_i6t8kCHKm45_dJE3gnD_g.woff2',
          ]);
      })
    );
  });

  self.addEventListener('activate', function(event){
      event.waitUntil(
          caches.keys().then(function(cacheNames) {
              return Promise.all(
                  cacheNames.filter(function(cacheName) {
                      return cacheName.startsWith('currency-') &&
                             cacheName != staticCacheName;
                  }).map(function(cacheName) {
                      return caches.delete(cacheName);
                  })
              );
          })
      );
  });

  self.addEventListener('fetch', function (event){
      event.respondWith(
        caches.match(event.request).then(function(response) {
          if (response) return response;
          return fetch(event.request).then(
            function(response) {
              if(response.status == 404) {
                return new Response("404 Error")
              }
              return response;
              }).catch(function() {
            return new Response("Unknown Server Error!")
          });
        })
      );
    });