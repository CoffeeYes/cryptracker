var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var mClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var request = require('request');

//local files
var ticker_table = require('./public/javascripts/ticker_table.js');
var functions = require('./public/javascripts/functions.js')

//require a seperate file containing api_keys which is in .gitignore
var api_keys = require("./bin/api_keys.js");
var mongo_url = api_keys.mongo_url;
var mongo_collection_name = api_keys.mongo_collection_name;

//include routes
var index = require('./routes/index');
var users = require('./routes/users');
var signup = require('./routes/signup');
var login = require('./routes/login');
var logout = require('./routes/logout');
var add_ticker = require('./routes/add_ticker');
var del_ticker = require('./routes/del_ticker');


var app = express();

//session setup
app.use(session({
  secret: api_keys.SECRET,
  resave: false,
  saveUninitialized: false,
  store: new mongoStore({ url: api_keys.mongo_url })
}))

app.use(function(req,res,next) {
  res.locals.currentUser = req.session.userId;
  next();
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//use previously included routes
app.use('/', index);
app.use('/users', users);
app.use('/signup',signup);
app.use('/login',login);
app.use('/logout',logout);
app.use('/add-ticker',add_ticker);
app.use('/del-ticker',del_ticker);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//interval update of api data on database to avoid rate limiting
setInterval(function() {


  //lookup tickers in ticker table and then perform api call, push result into promises array

  request.get('https://api.bitfinex.com/v1/symbols',function(error,response,body) {
    var result = JSON.parse(body);
    var promises = [];
    for(var item in result) {
      current_ticker = result[item];
      promises.push(functions.bitfinex_interval(current_ticker))
    }
    Promise.all(promises).then(function(api_data) {
      mClient.connect(api_keys.mongo_url,function(error,database) {
        for(var i=0;i< result.length;i++) {
          var current_ticker = result[i];
          var current_price = JSON.parse(api_data[i]).bid
          if(current_price != undefined) {
            database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set: {["Bitfinex." + current_ticker] : current_price}})
          }
        }
        database.close()
        console.log('Bitfinex data updated')
      })

    })
  })

  functions.get_binance_data().then(function(result) {
    var result = JSON.parse(result)
    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      for(var item in result) {
        current_ticker = result[item].symbol;
        current_price = result[item].price;
        database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {["Binance." + current_ticker] : current_price}})
      }
      database.close()
      console.log('Binance data updated')
    })
  })

  //get coinbase data and push to database
  Promise.all(functions.get_coinbase_data()).then(function(result) {
    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      for(var item in result) {
        var current_ticker = result[item].data.base + "-" + result[item].data.currency
        var current_value = result[item].data.amount
        database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {["Coinbase." + current_ticker] : current_value}})
      }
      database.close()
      console.log('Coinbase data updated')
    })

  })

  //update first half of bittrex data
  request.get('https://bittrex.com/api/v1.1/public/getmarkets',function(error,response,body) {
    if(error)throw error;
    var result = JSON.parse(body).result
    var ticker_arr = [];
    var promises = [];
    for(var i = 0; i <result.length;i++) {
      ticker_arr.push(result[i].MarketName)
    }
    for(var i = 0;i< 150;i++) {
      promises.push(functions.bittrex_interval(ticker_arr[i]))
    }
    Promise.all(promises).then(function(api_data) {
      mClient.connect(api_keys.mongo_url,function(error,database) {
        if(error)throw error;
        for(var i = 0; i < 150; i++) {
          database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {["Bittrex." + result[i].MarketName] : JSON.parse(api_data[i]).result.Bid}})
        }
        console.log("Bittrex set 1 updated")
      })
    })
  })

  //update second half of bittrex data offset by 1 minute
  setTimeout(function() {
    request.get('https://bittrex.com/api/v1.1/public/getmarkets',function(error,response,body) {
      if(error)throw error;
      var result = JSON.parse(body).result
      var ticker_arr = [];
      var promises = [];
      for(var i = 150;i<268;i++) {
        ticker_arr.push(result[i].MarketName)
      }
      for(var i = 0; i < ticker_arr.length; i++) {
        promises.push(functions.bittrex_interval(ticker_arr[i]))
      }
      Promise.all(promises).then(function(api_data) {
        mClient.connect(api_keys.mongo_url,function(error,database) {
          if(error)throw error;
          for(var i = 0;i<ticker_arr.length;i++) {
            //make sure value is not null to prevent error which crashes program
            if(JSON.parse(api_data[i]).result != null) {
              database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {["Bittrex." + ticker_arr[i]] : JSON.parse(api_data[i]).result.Bid}})
            }
          }
          console.log("Bittrex data set 2 updated")
        })
      })
    })
  },60000)


},120000)


module.exports = app;
