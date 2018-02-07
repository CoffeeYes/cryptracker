var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var mClient = require('mongodb').MongoClient;
var api_keys = require('../bin/api_keys.js');

router.post('/',function(req,res) {
  mClient.connect(api_keys.mongo_url,function(error,database) {
    if(error)throw error;
    database.collection(api_keys.mongo_collection_name).update({_id: ObjectId(req.session.userId)},{$push : {cryptos: req.body}})
  })
})

module.exports = router
