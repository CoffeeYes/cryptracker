var check_empty = function(body) {
  for(var item in body) {
    if(body[item].trim() == "") {
      return true
    }
  }
}

module.exports = {
  check_empty: check_empty
}
