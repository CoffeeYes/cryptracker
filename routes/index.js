var express = require('express');
var router = express.Router();
var mClient = require('mongodb').MongoClient;
var api_keys = require('../bin/api_keys.js');
var ObjectId = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.userId) {
    res.render('index');
  }
  else {
    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      database.collection(api_keys.mongo_collection_name).find({_id: ObjectId(req.session.userId)}).toArray(function(error,data) {
        if(error)throw error;
        res.render('index',{ticker_arr: data[0].cryptos})
      })
    })
  }
});

module.exports = router;
