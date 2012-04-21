var digest_config = require('./../utility/digest_config');
var heritage = require('./../utility/heritage');

var _ = require('underscore');
var util = require('util');
var events = require('events');

/**
 * A Res is a catchall for a reusable bundle of functionality.
 * View helpers, models and action helpers are all Ress.
 *
 * Note - as a rule, all Res modules should be FACTORIES -
 * that is, functions that return a Res. This is because
 * some Ress (like models) are SINGLETONS - one object exists and
 * is shared for all users. Others are unique per owner. The calling
 * contexts shouldn't have to know which case is true for a given resouce.
 *
 *
 */


function Res(config) {
   if (config){
       _.extend(this, config);
   }
}

util.inherits(Res, events.EventEmitter);

_.extend(Res.prototype, {
    digest_config:digest_config,
    heritage:heritage,

    type:'general',
    name: false
})

module.exports = Res;