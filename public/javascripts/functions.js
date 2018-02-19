var request = require('request');
var ticker_table = require('./ticker_table.js');
var Promise = require('promise')

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
      request.get('https://api.bitfinex.com/v1/pubticker/' + ticker,function(error,response,body) {
        if(error) reject(error);
        else fulfill(body);
      })
    })
  }
}

var bitfinex_interval = function(ticker) {
  return new Promise(function(fulfill,reject) {
    request.get('https://api.bitfinex.com/v1/pubticker/' + ticker, function(error,response,body) {
      if(error)reject(error);
      else fulfill(body);
    })
  })
}

var get_binance_data = function() {
  return new Promise(function(fulfill,reject) {
    request.get('https://api.binance.com/api/v3/ticker/price',function(error,response,body) {
      if(error) reject(error);
      else fulfill(body);
    })
  })
}

var get_coinbase_data = function() {
  var promises = [];
  var against_arr = ["-USD","-EUR","-GBP"]
  for(var item in ticker_table.table.Coinbase) {
    for(x = 0; x< against_arr.length; x++) {
      current_ticker = ticker_table.table.Coinbase[item] + against_arr[x]
      var promise = new Promise(function(fulfill,reject) {
        request.get('https://api.coinbase.com/v2/prices/' + current_ticker + '/spot',function(error,response,body) {
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
      request.get('https://bittrex.com/api/v1.1/public/getticker?market=' + ticker,function(error,response,body) {
        if(error)reject(error);
        else fulfill(body);
      })
    },1000)
  })
}

module.exports = {
  check_empty: check_empty,
  validate_email: validate_email,
  get_binance_data: get_binance_data,
  bitfinex_interval: bitfinex_interval,
  get_coinbase_data: get_coinbase_data,
  bittrex_interval: bittrex_interval
}
