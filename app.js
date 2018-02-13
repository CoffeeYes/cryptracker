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
  var promises = [];

  //lookup tickers in ticker table and then perform api call, push result into promises array
  for(var i = 0; i < Object.keys(ticker_table.table.Bitfinex).length; i++) {
    current_ticker = (ticker_table.table.Bitfinex[Object.keys(ticker_table.table.Bitfinex)[i]])

    promises.push(functions.bitfinex_interval(current_ticker))
  }

  //once all promises resolve, parse data and push to database
  Promise.all(promises).then(function(result) {
    for(var i = 0; i < result.length; i++) {
      current_ticker = ticker_table.table.Bitfinex[Object.keys(ticker_table.table.Bitfinex)[i]]
      console.log(current_ticker + " : " + JSON.parse(result[i]).bid)
    }

    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      for(var i = 0;i <result.length;i++) {
        current_ticker = ticker_table.table.Bitfinex[Object.keys(ticker_table.table.Bitfinex)[i]];
        current_value = JSON.parse(result[i]).bid;
        database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {["Bitfinex." + current_ticker] : current_value}})
      }
      console.log('Bitfinex data updated')
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
      console.log('Binance data updated')
    })
  })
},120000)


module.exports = app;
