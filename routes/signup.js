var express = require('express');
var router = express.Router();
var functions = require('../public/javascripts/functions.js');
var mClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');

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

  //check email against regex
  if(functions.validate_email(req.body.email) == false) {
    return res.render('signup',{error: "Invalid email address"})
  }

  mClient.connect(api_keys.mongo_url,function(error,database) {
    if(error)throw error;
    //check if username is taken
    database.collection(api_keys.mongo_collection_name).find({Username: req.body.username}).toArray(function(error,data) {
      if(error)throw error;
      if(data != '') {
        return res.render('signup',{error: "username is already in use"})
      }
      else {
        //check if email is taken
        database.collection(api_keys.mongo_collection_name).find({Email: req.body.email}).toArray(function(error,data) {
          if(data != '') {
            return res.render('signup',{error: "email is already in use"})
          }
          else {

            var user_info = {
              Username: req.body.username,
              Email: req.body.email
            }

            //asynchronously hash the password and push user_info to database on callback
            bcrypt.hash(req.body.password1,10,function(error,hash) {
              if(error)throw error;
              user_info.Password = hash;
              database.collection(api_keys.mongo_collection_name).insertOne(user_info)
              return res.redirect('/')
            })
          }
        })
      }
    })
  })

});

module.exports = router;
