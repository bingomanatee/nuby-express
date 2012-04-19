var util = require('util');
var _ = require('underscore');

var types = ['info', 'err', 'error', 'warn', 'warning', 'benchmark', 'asswipe'];

module.exports = function(){
    var arg = arguments;
    var a = [].slice.call(arg, 0);
    var type = 'info'
    if (_.include(types, a[a.length - 1])){
        type = a.pop();
    }
    var msg = util.format.apply(util, a);
  //  console.log('arguments: %s, msg: %s ', a.join('|'), msg);
    this._log.push([msg, type, new Date()]);
}

module.exports.report = function(type){
    var msgs = this._log;
    if (type){
       msgs = _.filter(msgs, function(m){
           return m[1] == type;
       })
    }

    return msgs;
}