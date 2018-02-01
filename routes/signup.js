var express = require('express');
var router = express.Router();
var functions = require('../public/javascripts/functions.js');
var mClient = require('mongodb').MongoClient;

//file containing api keys included
var api_keys = require('../bin/api_keys.js')

//variables imported from api_keys file
var mongo_url = api_keys.mongo_url;
var mongo_collection_name = api_keys.mongo_collection_name;


router.get('/', function(req, res, next) {
  res.render('signup');
});

router.post('/',function(req,res,next) {
  if(functions.check_empty(req.body)) {
    return res.render('signup',{error: "fields cannot be empty"})
  }

  if(req.body.password1 != req.body.password2) {
    return res.render('signup',{error: "Passwords do not match"})
  }

  //TODO check email against regex

  mClient.connect(mongo_url,function(error,database) {
    if(error)throw error;

    var user_info = {
      Username: req.body.username,
      Email: req.body.email,
      //need to hash this
      Password: req.body.password1,
    }

    database.collection(mongo_collection_name).insertOne(user_info)
  })
});

module.exports = router;
