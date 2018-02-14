var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var mClient = require('mongodb').MongoClient;
var api_keys = require('../bin/api_keys.js');

router.post('/',function(req,res) {
  mClient.connect(api_keys.mongo_url,function(error,database) {
    if(error)throw error;
    var push_data = req.body;
    database.collection(api_keys.mongo_collection_name).find({_id: ObjectId(req.session.userId)}).toArray(function(error,data) {
      if(error)throw error;
      //get id for ticker
      push_data.id = data[0].ticker_id;
      //calculate original value
      push_data.Ovalue = (parseInt(push_data.volume) * parseFloat(push_data.buyIn)).toFixed(2);

      //increment id value on db
      database.collection(api_keys.mongo_collection_name).update({_id: ObjectId(req.session.userId)},{$inc : {ticker_id : 1}});

      //push info to database
      database.collection(api_keys.mongo_collection_name).update({_id: ObjectId(req.session.userId)},{$push : {cryptos: push_data}});
      database.close();
      res.redirect('/')
    })
  })
})

module.exports = router
