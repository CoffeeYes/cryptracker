//list of exchanges and their cryptos
var exchange_list = {
  "Exchanges" : ["Bitfinex","Binance","Coinbase","Bittrex","Okex","Bitthumb","Kraken"],
  "Bitfinex" : {
    "currencies" : ["Bitcoin","Ethereum","Ripple","Litecoin","Bitcoin Cash","EOS","NEO","Iota","Ethereum Classic","Zcash","Monero","Dash","OmiseGO","Bitcoin Gold","Santiment","Qtum","Aelf","TRON","0x","Qash","ETP","Status","Streamr",
  "FunFair","Eidoo","YOYOW","Decentraland","Time New Bank","Golem","AidCoin","SpankChain","Aventus","Augur","Basic Attention Token","iExec","SingularDTV","RCN"],
    "against" : ["USD","BTC","ETH"]
  },
  "Binance" : {
    "currencies": ["ETH",
    "LTC","BNB","NEO","QTUM","EOS","BCC","SNT","BNT","HSR","USDT","GAS","ICN","DNT","MCO","OAX","LRC","WTC","OMG","YOYO","STRAT","ZRX","BQX","KNC","SNGLS","SNM",
    "FUN","LINK","IOTA","CTR","SALT","XVG","MTL","MDA","ETC","SUB","ENG","MTH","ZEC","AST","DASH","EVX","REQ","BTG","TRX","VIB","ARK","POWR","MOD","XRP","STORJ",
    "ENJ","VEN","RCN","KMD","NULS","RDN","DLT","XMR","AMB","BAT","BCPT","ARN","CDT","GVT","POE","GXS","QSP","BTS","XZC","TNT","LSK","MANA","BCD","FUEL","ADX",
    "DGD","ADA","PPT","CMT","XLM","CND","LEND","WABI","TNB","GTO","WAVES","ICX","OST","ELF","AION","BRD","NEBL","EDO","NAV","WINGS","TRIG","LUN","VIBE","INS","APPC",
    "RLC","IOST","PIVX","STEEM","CHAT","VIA","NANO","AE","BLZ","RPX",],
    "against": ["BTC","ETH","BNB","USDT"]
  },
  "Coinbase" : {
    "currencies" : ["Bitcoin","Litecoin","Ethereum","Bitcoin Cash"],
    "against": ["USD","EUR","GBP"]
  },
  "Bittrex" : {
    "currencies" : [ 'Litecoin','Dogecoin','Vertcoin','Peercoin','Feathercoin','ReddCoin','NXT','Dash','PotCoin','BlackCoin','Einsteinium','Myriad','AuroraCoin','ElectronicGulden','GoldCoin','SolarCoin','PesetaCoin ','Groestlcoin','Gulden','RubyCoin','WhiteCoin','MonaCoin','HempCoin',
    'EnergyCoin','EuropeCoin','VeriCoin','CureCoin','Monero','CloakCoin','StartCoin','Kore','DigitalNote','TrustPlus','NAVCoin','StealthCoin','ViaCoin ','PinkCoin','I/OCoin','CannabisCoin','SysCoin','NeosCoin','Digibyte','BURSTCoin','ExclusiveCoin','Bitswift','DopeCoin','BlockNet','ArtByte',
    'Bytecent','Magi','Blitzcash','BitBay','FairCoin','SpreadCoin','vTorrent','Ripple','GameCredits','Circuits of Value','Nexus','Counterparty','BitBean','GeoCoin','FoldingCoin','GridCoin','Florin','Nubits','MonetaryUnit','NewEconomyMovement','CLAMs','Diamond','Gambit','Sphere','OkCash',
    'Synergy','ParkByte','CapriCoin','Aeon','Ethereum','GlobalCurrencyReserve','TransferCoin','BitCrystals','Expanse','InfluxCoin','OMNI','AMP','IDNI Agoras','Lumen','Bitcoin','ClubCoin','Voxels','EmerCoin','Factom','MaidSafe','EverGreenCoin','SaluS','Radium','Decred','BitSend',
    'Verge','Pivx','Vcash','Memetic','STEEM','2GIVE','Lisk','Project Decorum','Breakout','Waves','LBRY Credits','SteemDollars','Breakout Stake','Ethereum Classic','Stratis','UnbreakableCoin','Syndicate','eBoost','Verium','Sequence','Augur','Shift','Ardor','ZCoin','Neo',
    'Zcash','Zclassic','Internet Of People','Golos','Ubiq','Komodo','GBG','Siberian Chervonets','Ion','Lomocoin','Qwark','Crown','Swarm City Token','Melon','Ark','Dynamic','Tokes','Musicoin','Databits','Incent','Bytes','Golem','Nexium','Edgeless','Legends',
    'Trustcoin','Wings DAO','iEx.ec','Gnosis','Guppy','Lunyr','Humaniq','Aragon','Siacoin','Basic Attention Token','Zencash','FirstBlood','Quantum Resistant Ledger','Firstblood','CreditBit','Patientory','Cofound.it','Bancor','Numeraire','Status Network Token','DECENT','Elastic','Monaco','adToken','TenX Pay Token',
    'Storj','AdEx','ZCash','OmiseGO','Civic','Particl','Qtum','Bitcoin Cash','district0x','Ada','Decentraland','Salt','Blocktix','Ripio Credit Network','Viberate','Mercury','PowerLedger','Bitcoin Gold','Enigma','UnikoinGold','Ignis','Sirin Token','Worldwide Asset Exchange','0x Protocol','BLOCKv'],
    "against" : ["BTC","ETH","USD"]
  },
  "Okex" : {
    "currencies" : ['Litecoin','Ethereum','Ethereum Classic','Bitcoin Cash',' Bitcoin','Neo','Bitcoin Gold','Bitcoin Futures','S2Xcoin Futures','Qtum','Hcash','Neo','GAS'],
    "against" : ['BTC','USD']
  },
  "Bitthumb" : {
    "currencies" : ['BTC','ETH','DASH','LTC','ETC','XRP','BCH','XMR','ZEC','QTUM','BTG','EOS'],
    "against" : ['USD']
  },
  "Kraken" : {
    "currencies" : ["BCH","DASH","EOS","GNO","ETC","ETH","ICN","LTC","MLN","REP","XBT","XDG","XLM","XMR","XRP","ZEC"],
    "against" : ["USD","EUR","JPY","CAD","GBP"]
  }
}

$(document).ready(function() {

  $('.add-button').click(function() {
    $('.opaque-background').css('display','flex');
  })

  $('.close-form').click(function() {
    $('.opaque-background').css('display','none');
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
    var Gvalue = (parseFloat($(this).find($('.display-Cvalue')).text()) - parseFloat($(this).find($('.display-Ovalue')).text())).toFixed(4)
    var color_val = $(this).find($('.display-Cvalue')).css('color')

    $(this).find($('.display-Gvalue')).text(Gvalue)
    $(this).find($('.display-Gvalue')).css('color',color_val)
  })
})
