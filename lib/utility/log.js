var util = require('util');


module.exports = function(){
    var arg = arguments;
    var a = [].slice.call(arg, 0);
    var msg = util.format.apply(util, a);
  //  console.log('arguments: %s, msg: %s ', a.join('|'), msg);
    this._log.push(msg);
}