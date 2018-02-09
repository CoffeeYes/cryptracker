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
        //pull api data based on exchange and currency, return data in callback
        functions.get_api_data_2(data[0].cryptos[0].exchange,data[0].cryptos[0].currency).then(function(result) {
          var result = JSON.parse(result)
          data[0].cryptos[0].Cvalue = parseInt(result.ask) * parseInt(data[0].cryptos[0].volume)
          res.render('index',{ticker_arr: data[0].cryptos})
        })
      })
    })
  }
});

module.exports = router;
