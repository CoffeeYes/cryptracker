//list of exchanges and their cryptos
var exchange_list = {
  "Exchanges" : ["Bitfinex","Binance"],
  "Bitfinex" : {
    currencies : ["Bitcoin","Ethereum","Ripple","Litecoin","Bitcoin Cash","EOS","NEO","Iota","Ethereum Classic","Zcash","Monero","Dash","OmiseGO","Bitcoin Gold","Santiment","Qtum","Aelf","TRON","0x","Qash","ETP","Status","Streamr",
  "FunFair","Eidoo","YOYOW","Decentraland","Time New Bank","Golem","AidCoin","SpankChain","Aventus","Augur","Basic Attention Token","iExec","SingularDTV","RCN"],
    against : ["usd","btc"]
  },
  "Binance" : {
    currencies: ["Bitcoin","Ethereum","Raiblocks"],
    against: ["btc","etc"]
  }
}

$(document).ready(function() {
  console.log("jquery ready")
  $('.add-button').click(function() {
    $('.opaque-background').css('display','flex');
  })

  //load up the initial dropdown values
  $.each(exchange_list.Exchanges,function(item) {
    $('.exchange').append($("<option></option>").text(exchange_list.Exchanges[item]))
  })

  var exchange = $('.exchange').val();

  $.each(exchange_list[exchange].currencies,function(item) {
    $('.currency').append($("<option></option>").text(exchange_list[exchange].currencies[item]))
  })

  $.each(exchange_list[exchange].against,function(item) {
    $('.against').append($("<option></option>").text(exchange_list[exchange].against[item]))
  })


  //on change of exchange, clear currency dropdown values and re-render new values from exchange_list
  $('.exchange').change(function() {
    var exchange = $('.exchange').val();

    $('.currency').empty();
    $('.against').empty();

    $.each(exchange_list[exchange].currencies,function(item) {
      $('.currency').append($("<option></option>").text(exchange_list[exchange].currencies[item]))
    })

    $.each(exchange_list[exchange].against,function(item) {
      $('.against').append($("<option></option>").text(exchange_list[exchange].against[item]))
    })
  })

  $('.add-ticker').submit(function(e) {
    if( $('#volume').val().trim() == "" || $('#buyIn').val().trim() == "") {
      e.preventDefault();
      $('.error').text('fields cannot be empty')
    }

  })

  //change color of current value relative to original value
  $('.ticker').each(function() {
    if(parseFloat($(this).find($('.display-Cvalue')).text()) > parseFloat($(this).find($('.display-Ovalue')).text())) {
      $(this).find($('.display-Cvalue')).css('color','green')
    }
    else {
      $(this).find($('.display-Cvalue')).css('color','red')
    }

    //calculate and assign gained value, aswell as color
    var Gvalue = (parseFloat($(this).find($('.display-Cvalue')).text()) - parseFloat($(this).find($('.display-Ovalue')).text())).toFixed(2)
    var color_val = $(this).find($('.display-Cvalue')).css('color')

    $(this).find($('.display-Gvalue')).text(Gvalue)
    $(this).find($('.display-Gvalue')).css('color',color_val)
  })
})
