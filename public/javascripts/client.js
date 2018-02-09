//list of exchanges and their cryptos
var exchange_list = {
  "Exchanges" : ["Bitfinex","Binance"],
  "Bitfinex" : ["Bitcoin","Litecoin","Ethereum","Ethereum Classic","Ripple","EOS","Bitcoin Cash","Iota","Dash","Zcash","Monero","OmiseGo"],
  "Binance" : ["Bitcoin","Ethereum","Raiblocks"]
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

  $('.add-ticker').submit(function(e) {
    if( $('#volume').val().trim() == "" || $('#buyIn').val().trim() == "") {
      e.preventDefault();
      $('.error').text('fields cannot be empty')
    }

  })

  //change color of current value relative to original value
  $('.ticker').each(function() {
    if(parseInt($(this).find($('.display-Cvalue')).text()) > parseInt($(this).find($('.display-Ovalue')).text())) {
      $(this).find($('.display-Cvalue')).css('color','green')
    }
    else {
      $(this).find($('.display-Cvalue')).css('color','red')
    }

    //calculate and assign gained value, aswell as color
    var Gvalue = parseInt($(this).find($('.display-Cvalue')).text()) - parseInt($(this).find($('.display-Ovalue')).text())
    var color_val = $(this).find($('.display-Cvalue')).css('color')

    $(this).find($('.display-Gvalue')).text(Gvalue)
    $(this).find($('.display-Gvalue')).css('color',color_val)
  })
})
