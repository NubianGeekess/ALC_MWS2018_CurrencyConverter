const staticCacheName = 'currency-static-v1';
var dbCacheName = 'currency-db';
var dbCurrencies = 'currencies';
var dbUSDExchange = 'usd-exchange';
var dbo;

// proper initialization
if( 'function' === typeof importScripts) {
    importScripts('./js/idb.js');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(function(reg) {
      // registration worked
      console.log('Service worker registration succeeded ' );
    }).catch(function(error) {
      // registration failed
      alert(`Service worker registration failed with error: ${error}.
             Currency converter will not work offline`);
      showNotification('Error: Currency converter will not work offline');
    });
  }

  self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll([
            './',
            './css/main.css',
            './css/notification.css',
            './img/dollar.svg',
            './img/bkg-img.jpg',
            './js/app.js',
            './js/idb.js',
            'https://fonts.googleapis.com/css?family=Montserrat:400,700',
            'https://fonts.gstatic.com/s/montserrat/v12/JTURjIg1_i6t8kCHKm45_dJE3gnD_g.woff2',
            'https://free.currencyconverterapi.com/api/v5/currencies'
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

          if (event.request.url.includes('convert')){
            if(!dbo){
               dbo = idb.open(dbCacheName, 1);
            }
            dbo.then(function(db) {
                //debugger;
                if(!db) return;
                let tx = db.transaction(dbCurrencies, 'readwrite')
                  .objectStore(dbCurrencies)
                  .get(1)
                  .then(function(res) {
                    console.log(' * cached db response * ', res);
                    return new Response(res)
                  },function(err) {
                    console.log(' * not cached *');
                    return fetch(event.request);
                  })
                  .erro;
                return;
            })
          }

          return fetch(event.request).then(
            function(response) {
              console.log(' ** svr response ** ', response);
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