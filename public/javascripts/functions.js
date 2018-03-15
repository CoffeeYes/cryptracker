var request = require('request');
var ticker_table = require('./ticker_table.js');
var Promise = require('promise');
var mClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var https = require('https');
var pool = new https.Agent();

pool.maxSockets = 2;

var check_empty = function(body) {
  for(var item in body) {
    if(body[item].trim() == "") {
      return true
    }
  }
}

var validate_email = function(string) {
  var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return email_regex.test(string);
}

//request api data and return a promise
var get_api_data_2 = function(exchange,currency) {
  var ticker = ticker_table.table[exchange][currency]
  if(exchange == "Bitfinex") {
    return new Promise(function(fulfill,reject) {
      request.get('https://api.bitfinex.com/v1/pubticker/' + ticker,{agent:pool},function(error,response,body) {
        if(error) reject(error);
        else fulfill(body);
      })
    })
  }
}

var bitfinex_interval = function(ticker) {
  return new Promise(function(fulfill,reject) {
    request.get('https://api.bitfinex.com/v1/pubticker/' + ticker,{timeout: 10000,agent:pool}, function(error,response,body) {
      if(error)reject(error);
      else fulfill(body);
    })
  })
}

var get_binance_data = function() {
  return new Promise(function(fulfill,reject) {
    request.get('https://api.binance.com/api/v3/ticker/price',{agent:pool},function(error,response,body) {
      if(error) reject(error);
      else fulfill(body);
    })
  })
}

var get_coinbase_data = function() {
  var promises = [];
  var against_arr = ["-USD","-EUR","-GBP"]
  for(var item in ticker_table.table.Coinbase.tickers) {
    for(x = 0; x< against_arr.length; x++) {
      current_ticker = ticker_table.table.Coinbase.tickers[item] + against_arr[x]
      var promise = new Promise(function(fulfill,reject) {
        request.get('https://api.coinbase.com/v2/prices/' + current_ticker + '/spot',{agent:pool},function(error,response,body) {
          if(error)reject(error);
          else fulfill(JSON.parse(body))
        })
      })
      promises.push(promise)
    }
  }
  return promises
}

var bittrex_interval = function(ticker) {
  return new Promise(function(fulfill,reject) {
    setTimeout(function(){
      request.get('https://bittrex.com/api/v1.1/public/getticker?market=' + ticker,{agent:pool},function(error,response,body) {
        if(error)reject(error);
        else fulfill(body);
      })
    },1000)
  })
}

var get_okex_data = function(start,end) {
  var tickers = ticker_table.table.Okex.tickers;
  var promises = [];
  for(var i = start;i < end;i++) {
    var promise = new Promise(function(fulfill,reject) {
        request.get('https://www.okex.com/api/v1/ticker.do?symbol=' + tickers[i],{timeout : 100000,agent: pool},function(error,response,body) {
          if(error)reject(error);
          else fulfill(body);
        })
    })
    promises.push(promise)
  }
  return promises
}

var get_bitthumb_data = function() {
  return new Promise(function(fulfill,reject) {
    request.get('https://api.bithumb.com/public/ticker/ALL',function(error,response,body) {
      if(error)reject(error);
      else fulfill(body);
    })
  })
}

var get_kraken_data = function(ticker) {
  var tickers = ticker_table.table.Kraken.tickers;
  var promises = [];
  for(var i = 0; i < tickers.length; i++) {
    var promise = new Promise(function(fulfill,reject) {
      request.get('https://api.kraken.com/0/public/Ticker?pair=' + tickers[i],{agent: pool},function(error,response,body) {
        if(error)reject(error);
        else fulfill(body);
      })
    })
    promises.push(promise)
  }
  return promises
}

var get_bitstamp_data = function() {
  var tickers = ticker_table.table.Bitstamp.tickers;
  var promises = [];
  for(var i = 0; i < tickers.length; i++) {
    var promise = new Promise(function(fulfill,reject) {
      request.get('https://www.bitstamp.net/api/v2/ticker/' + tickers[i],{agent:pool},function(error,response,body) {
        if(error)reject(error);
        else fulfill(body);
      })
    })
    promises.push(promise)
  }
  return promises
}
module.exports = {
  check_empty: check_empty,
  validate_email: validate_email,
  get_binance_data: get_binance_data,
  bitfinex_interval: bitfinex_interval,
  get_coinbase_data: get_coinbase_data,
  bittrex_interval: bittrex_interval,
  get_okex_data: get_okex_data,
  get_bitthumb_data:get_bitthumb_data,
  get_kraken_data:get_kraken_data,
  get_bitstamp_data: get_bitstamp_data
}
