var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var mClient = require('mongodb').MongoClient;
var api_keys = require('../bin/api_keys.js');

router.post('/',function(req,res) {
  mClient.connect(api_keys.mongo_url,function(error,database) {
    if(error)throw error;
    var push_data = req.body;
    //calculate original value
    push_data.Ovalue = (parseInt(push_data.volume) * parseFloat(push_data.buyIn)).toFixed(2);
    database.collection(api_keys.mongo_collection_name).update({_id: ObjectId(req.session.userId)},{$push : {cryptos: push_data}});
    database.close();
    res.redirect('/')
  })
})

module.exports = router
