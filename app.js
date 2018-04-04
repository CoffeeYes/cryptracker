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

//global counts for bitfinex sequential data get
var global_count_start = 30;
var global_count_end = 60;
var global_count = 0;

//functions for sequentially updating bitfinex data, as rate is limited to 30/minute
setInterval(function() {

  global_count += 1;

  if(global_count == 5) {
    global_count = 1;
  }


  switch(global_count) {
    case 1 :
      var global_count_start = 0;
      var global_count_end = 30;
      break;
    case 2 :
      var global_count_start = 30;
      var global_count_end = 60;
      break;
    case 3 :
      var global_count_start = 60;
      var global_count_end = 90;
      break;
    case 4 :
      var global_count_start = 90;
      var global_count_end = 105;
      break;
  }

  request.get('https://api.bitfinex.com/v1/symbols',function(error,response,body) {
    if(body != []) {
      var result = JSON.parse(body);
    }
    var promises = [];
    for(var i = global_count_start;i<global_count_end;i++) {
      current_ticker = result[i];
      promises.push(functions.bitfinex_interval(current_ticker))
    }
    Promise.all(promises).then(function(api_data) {
      mClient.connect(api_keys.mongo_url,function(error,database) {
        for(var i=global_count_start;i< global_count_end;i++) {
          var current_ticker = result[i];
          var current_price = JSON.parse(api_data[i - global_count_start]).bid
          if(current_price != undefined) {
            database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set: {["Bitfinex." + current_ticker] : current_price}})
          }
        }
        database.close()
        console.log('Bitfinex dataset ' + global_count + ' updated')
      })

    })
  })
},65000)

//interval update of rest of api data on database to avoid rate limiting
setInterval(function() {

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
    for(var i = 0;i< 268;i++) {
      promises.push(functions.bittrex_interval(ticker_arr[i]))
    }
    Promise.all(promises).then(function(api_data) {
      mClient.connect(api_keys.mongo_url,function(error,database) {
        if(error)throw error;
        for(var i = 0; i < 268; i++) {
          if(JSON.parse(api_data[i]).result != null) {
            database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {["Bittrex." + ticker_arr[i]] : JSON.parse(api_data[i]).result.Bid}})
          }
        }
        database.close()
        console.log("Bittrex data updated")
      })
    })
  })

  //update first part of okex data
  Promise.all(functions.get_okex_data(0,21)).then(function(result) {
    var tickers = ticker_table.table.Okex.tickers
    mClient.connect(api_keys.mongo_url,function(error,database) {
      for(var i = 0; i < result.length;i++) {
        if(result[i] != null) {
          database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {["Okex." + tickers[i]] : JSON.parse(result[i]).ticker.sell}})
        }
      }
      database.close();
      console.log('Okex data updated')
    })
  })

  //update bitthumb data
  functions.get_bitthumb_data().then(function(result) {
    var result = JSON.parse(result).data
    var tickers = ticker_table.table.Bitthumb.tickers
    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      for(var i = 0; i < tickers.length; i ++) {
        database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {['Bitthumb.' + tickers[i]] : result[tickers[i]].sell_price}})
      }
      database.close();
      console.log('Bitthumb data updated')
    })
  })

  Promise.all(functions.get_kraken_data()).then(function(result) {
    var tickers = ticker_table.table.Kraken.tickers;
    mClient.connect(api_keys.mongo_url,function(error,database) {
      for(var i = 0; i < result.length;i++) {
        var current_ticker_data = JSON.parse(result[i]);
        var current_ticker = tickers[i]
        var current_price = current_ticker_data.result[tickers[i]].a[0]
        database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set: {['Kraken.' + current_ticker] : current_price}})
      }
      database.close();
      console.log('Kraken data updated')
    })
  })

  Promise.all(functions.get_bitstamp_data()).then(function(result) {
    var tickers = ticker_table.table.Bitstamp.tickers;
    if(result) {
      mClient.connect(api_keys.mongo_url,function(error,database) {
        if(error)throw error;
        for(var i = 0; i < result.length; i ++) {
          var current_bid = JSON.parse(result[i]).bid
          database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set : {['Bitstamp.' + tickers[i]] : current_bid}})
        }
        database.close();
        console.log('Bitstamp data updated')
      })
    }
    else {
      console.log('no Bitstamp data recieved')
    }
  })
/*
  functions.get_bitz_data().then(function(result) {
    var tickers = ticker_table.table.Bitz.tickers;
    mClient.connect(api_keys.mongo_url,function(error,database) {
      if(error)throw error;
      for(var i = 0; i < tickers.length;i++) {
        database.collection(api_keys.db_crypto.collection_name).update({_id: ObjectId(api_keys.db_crypto.id)},{$set: {['Bitz.' + tickers[i]] : result.data[tickers[i]].sell}})
      }
      database.close();
      console.log('Bitz data updated')
    })
  })
  */
},120000)


module.exports = app;
