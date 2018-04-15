var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var mClient = require('mongodb').MongoClient;
var api_keys = require('../bin/api_keys.js');
var ticker_table = require('../public/javascripts/ticker_table.js')

router.post('/',function(req,res) {
  mClient.connect(api_keys.mongo_url,function(error,database) {
    if(error)throw error;
    var push_data = req.body;
    push_data.buyIn = parseFloat(push_data.buyIn)
    push_data.volume = parseFloat(push_data.volume)
    //negative value check
    if(push_data.volume < 0 ||push_data.buyIn < 0) {
      return res.render('index',{error: 'values cannot be negative',ticker_arr : {}})
    }

    if(push_data.volume < 0.000001) {
      return res.render('index',{error: 'Volume is too small',ticker_arr : {}})
    }

    if(push_data.buyIn < 0.00000001) {
      return res.render('index',{error: 'Buy In is too small',ticker_arr : {}})
    }
    //ticker parsing for each exchange, to ensure matching pairs with api data
    if(push_data.exchange != "Bitthumb" && push_data.exchange != "Kraken") {
        var against = ticker_table.table[push_data.exchange].against[push_data.against]
    }
    if(push_data.exchange == "Bittrex") {
      var ticker = against + ticker_table.table[push_data.exchange][push_data.currency]
    }
    else if (push_data.exchange == "Bitthumb") {
      var ticker = ticker_table.table[push_data.exchange][push_data.currency]
    }
    else if(push_data.exchange == "Kraken") {
      if(ticker_table.table.Kraken['tickers_noedit'].indexOf(push_data.currency) != -1) {
        var ticker = push_data.currency + push_data.against
      }
      else {
        if(push_data.against == "XBT" || push_data.against == "ETH") {
          var ticker = "X" + push_data.currency + "X" + push_data.against;
        }
        else {
          var ticker = "X" + push_data.currency + "Z" + push_data.against;

        }
      }
    }
    else {
      var ticker = ticker_table.table[push_data.exchange][push_data.currency] + against
    }

    //assign ticker in push data after parsing
    push_data.pair = ticker;

    database.collection(api_keys.db_crypto.collection_name).find({[push_data.exchange + "." + ticker] : {$ne : null}}).toArray(function(error,data) {
      if(error)throw error;

      if(data == "") {
        return res.render('index',{ticker_arr : [],error: 'invalid currency/against combination'})
        database.close();
      }

      else {
        database.collection(api_keys.mongo_collection_name).find({_id: ObjectId(req.session.userId)}).toArray(function(error,data) {
          if(error)throw error;
          //get id for ticker
          push_data.id = data[0].ticker_id;
          //calculate original value
          push_data.Ovalue = (parseInt(push_data.volume) * parseFloat(push_data.buyIn))

          //increment id value on db
          database.collection(api_keys.mongo_collection_name).update({_id: ObjectId(req.session.userId)},{$inc : {ticker_id : 1}});

          //push info to database
          database.collection(api_keys.mongo_collection_name).update({_id: ObjectId(req.session.userId)},{$push : {cryptos: push_data}});
          database.close();
          res.redirect('/')
        })

      }

    })

  })
})

module.exports = router
