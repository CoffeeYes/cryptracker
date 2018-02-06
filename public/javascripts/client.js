//list of exchanges and their cryptos
var exchange_list = {
  "bitfinex" : ["test","test2"],
  "binance" : ["omak","inta"]
}

$(document).ready(function() {
  console.log("jquery ready")
  $('.add-button').click(function() {
    $('.opaque-background').css('display','flex');
  })

  //on change of exchange value, clear currency values and re-render new values from exchange_list
  $('.exchange').change(function() {
    var exchange = $('.exchange').val();
    $('.currency').empty();
    $.each(exchange_list[exchange],function(item) {
      $('.currency').append($("<option></option>").text(exchange_list[exchange][item]))
    })
  })
})
