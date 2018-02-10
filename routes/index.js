var express = require('express');
var router = express.Router();
var mClient = require('mongodb').MongoClient;
var api_keys = require('../bin/api_keys.js');
var ObjectId = require('mongodb').ObjectID;
var functions = require('../public/javascripts/functions.js')
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  //if user is logged in
  if (!req.session.userId) {
    res.render('index');
  }
  else {
    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      database.collection(api_keys.mongo_collection_name).find({_id: ObjectId(req.session.userId)}).toArray(function(error,data) {
        if(error)throw error;
        //use promises to get api data for each ticker and render to index once complete
        var tickers = data[0].cryptos;
        var promises = [];

        //get api data for each ticker
        for(var i = 0; i < tickers.length; i++) {
          promises.push(functions.get_api_data_2(tickers[i].exchange,tickers[i].currency));
        }

        request.get("https://api.bitfinex.com/v1/symbols",function(error,response,body) {
          console.log(body)
        })

        //once all promises have resolved, comput current value and render to index
        Promise.all(promises).then(function(result) {
          for(var i = 0;i < tickers.length; i++) {
            var temp = JSON.parse(result[i]);
            var current_ask = temp.ask;
            tickers[i].Cvalue = (parseFloat(current_ask) * parseFloat(tickers[i].volume) ).toFixed(2)
          }
          res.render('index',{ticker_arr: tickers})
        })
      })
    })
  }
});

module.exports = router;
