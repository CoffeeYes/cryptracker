var express = require('express');
var router = express.Router();
var mClient = require('mongodb').MongoClient;
var api_keys = require('../bin/api_keys.js');
var ObjectId = require('mongodb').ObjectID;
var functions = require('../public/javascripts/functions.js')
var request = require('request');
var ticker_table = require('../public/javascripts/ticker_table.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  //if user is not logged in
  if (!req.session.userId) {
    res.render('index');
  }
  else {
    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      database.collection(api_keys.mongo_collection_name).find({_id: ObjectId(req.session.userId)}).toArray(function(error,data) {
        if(error)throw error;

        //get the users saved crypto currencies
        var user_cryptos = data[0].cryptos;

        //lookup the users cryptos and pull current ticker bid data from database, then render index with pulled data
        database.collection(api_keys.db_crypto.collection_name).find({_id: ObjectId(api_keys.db_crypto.id)}).toArray(function(error,data) {

          for(var i = 0; i < user_cryptos.length;i++) {
            var current_crypto = user_cryptos[i].currency;
            var current_exchange = user_cryptos[i].exchange;
            var current_ticker = user_cryptos[i].pair
            user_cryptos[i].Cvalue = (parseFloat(data[0][current_exchange][current_ticker]) * parseFloat(user_cryptos[i].volume)).toPrecision(4);
          }
          return res.render('index',{ticker_arr: user_cryptos})
        })
      })
    })
  }
});

module.exports = router;
