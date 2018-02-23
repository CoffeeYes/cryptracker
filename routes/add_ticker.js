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
    if(push_data.exchange != "Bittrex") {
      var ticker = ticker_table.table[push_data.exchange][push_data.currency] + push_data.against
    }
    else {
      var ticker = push_data.against + ticker_table.table[push_data.exchange][push_data.currency]
    }
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
