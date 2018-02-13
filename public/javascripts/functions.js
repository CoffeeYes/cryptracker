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


module.exports = {
  check_empty: check_empty,
  validate_email: validate_email,
  get_api_data_2: get_api_data_2,
  bitfinex_interval: bitfinex_interval,
  get_binance_data: get_binance_data
}
