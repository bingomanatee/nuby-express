var util = require('util');
var _ = require('underscore');
var path= require('path');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Loader = require('./../Loader');
var config_handler = require('./../utility/handler/Config');

function Action(config){
    Loader.call(this);
    digest_config(this, config, true);
    this._init_handlers();
  //  console.log('ACTION path = ', this.path);
}

_.extend(Action.prototype, Loader.prototype, {
    route: '*',
    /* ********************* SERVER ****************** */

    start_server: function(server, framework, cb){
   //     console.log('logging action %s', this.name());
        framework.log('action %s added route %s', this.name(), this.route);
     //   console.log('starting server for action %s', this.heritage());
        cb();
    },

    /* ********************** NAME ******************* */

    name: function(){
        var base = path.basename(this.path);
        return '<<action>>' + base.replace('action_', '');
    },
    heritage: heritage,

    /* *********************** HANDLERS ****************** */

    _init_handlers:function () {
        this.add_handler(config_handler({re: /^(action_)?((.*)_)?config\.json$/i, name: 'action_config_handler'}));
    }
});

module.exports = Action;