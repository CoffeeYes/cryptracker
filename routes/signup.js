var express = require('express');
var router = express.Router();
var functions = require('../public/javascripts/functions.js')


router.get('/', function(req, res, next) {
  res.render('signup');
});

router.post('/',function(req,res,next) {
  if(functions.check_empty(req.body)) {
    return res.render('signup',{error: "fields cannot be empty"})
  }
});

module.exports = router;
