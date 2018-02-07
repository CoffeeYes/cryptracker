//list of exchanges and their cryptos
var exchange_list = {
  "Bitfinex" : ["Bitcoin","Litecoin","Ethereum","Ethereum Classic","Ripple","EOS","Bitcoin Cash","Iota","Dash","Zcash","Monero","OmiseGo"],
  "Binance" : ["Bitcoin","Ethereum","Raiblocks"]
}

$(document).ready(function() {
  console.log("jquery ready")
  $('.add-button').click(function() {
    $('.opaque-background').css('display','flex');
  })

  //load up the initial dropdown values
  var exchange = $('.exchange').val();
  $.each(exchange_list[exchange],function(item) {
    $('.currency').append($("<option></option>").text(exchange_list[exchange][item]))
  })

  //on change of exchange, clear currency dropdown values and re-render new values from exchange_list
  $('.exchange').change(function() {
    var exchange = $('.exchange').val();
    $('.currency').empty();
    $.each(exchange_list[exchange],function(item) {
      $('.currency').append($("<option></option>").text(exchange_list[exchange][item]))
    })
  })
})
