var express = require('express');
var router = express.Router();
var functions = require('../public/javascripts/functions.js');
var mClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');
var session = require('express-session');

//file containing api keys included
var api_keys = require('../bin/api_keys.js')

//variables imported from api_keys file
var mongo_url = api_keys.mongo_url;
var mongo_collection_name = api_keys.mongo_collection_name;

router.post('/',function(req,res,next) {
  if (functions.check_empty(req.body)) {
    return res.render('index',{error: "fields cannot be empty"})
  }

  mClient.connect(api_keys.mongo_url,function(error,database) {
    if(error)throw error;
    database.collection(api_keys.mongo_collection_name).find({Username: req.body.username}).toArray(function(error,data) {
      if(error)throw error;
      if(data == '') {
        return res.render('index',{error: "user does not exist"})
      }
      else {
        bcrypt.compare(req.body.password,data[0].Password,function(error,result) {
          if(result == false) {
            return res.render('index',{error: "Incorrect Password"})
          }
          else {
            //initialise session
            req.session.userId = data[0]._id;
            res.redirect('/')
          }
        })
      }
    })
  })

})

module.exports = router;
