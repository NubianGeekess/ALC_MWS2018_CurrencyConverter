'use strict';
var apiBaseUrl = 'https://free.currencyconverterapi.com/api/v5/';
var apiKey = 'your-api-key-here';
var dbCacheName = 'currency-db';
var dbCurrencies = 'currencies';
var dbUSDExchange = 'usd-exchange';

var dbo;

window.onload = function (){
    let url = `${apiBaseUrl}currencies`;
    let cboCurrencyFrom = document.getElementById('fromCurrency');
    let cboCurrencyTo = document.getElementById('toCurrency');

    dbo = idb.open(dbCacheName, 1, function(upgradeDb) {
        let storeExchange = upgradeDb.createObjectStore(dbUSDExchange,{
            keyPath:"id"
        });
        let storeCurrencies = upgradeDb.createObjectStore(dbCurrencies);
      });

    fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(currenciesJson) {
      dbo.then(function(db) {
        if(!db) return;
        let tx = db.transaction(dbCurrencies, 'readwrite');
        let store = tx.objectStore(dbCurrencies);
        store.put(currenciesJson, 1);
      })
      for(let curr in currenciesJson.results){
          let optFrom = document.createElement("option");
          let optTo = document.createElement("option");
          optFrom.text = `From: ${currenciesJson.results[curr].currencyName} (${currenciesJson.results[curr].id})`;
          optFrom.value = currenciesJson.results[curr].id;
          cboCurrencyFrom.add(optFrom, null);

          optTo.text = `To  : ${currenciesJson.results[curr].currencyName} (${currenciesJson.results[curr].id})`;
          optTo.value = currenciesJson.results[curr].id;
          cboCurrencyTo.add(optTo, null);
      }
      //console.log(cboCurrencyFrom.innerHTML);
    });
}

document.getElementById('btnConvert').onclick = function (){

  let cboCurrencyFrom = document.getElementById('fromCurrency');
  let fromCurrency = cboCurrencyFrom.options[cboCurrencyFrom.selectedIndex].value || 'USD';

  let cboCurrencyTo = document.getElementById('toCurrency');
  let toCurrency = cboCurrencyTo.options[cboCurrencyTo.selectedIndex].value || 'ZAR';

  let amount = document.getElementById('input').value || 1;

  convertCurrency(amount, fromCurrency, toCurrency);

}

function convertCurrency(amount, fromCurrency, toCurrency) {

  fromCurrency = encodeURIComponent(fromCurrency);
  toCurrency = encodeURIComponent(toCurrency);
  let query = fromCurrency + '_' + toCurrency;

  let url = `${apiBaseUrl}convert?q=${query}&compact=ultra`;

  fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(conversionJson) {
    let result = conversionJson[query] * amount;
    console.log(conversionJson[query]);
    document.getElementById('result').value = Number.parseFloat(result).toFixed(2);
  });
}

function showNotification(msg, pauseFor = 3000) {
    let x = document.getElementById("notification");
    x.innerHTML = msg;
    x.className = "show";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, pauseFor);
}
