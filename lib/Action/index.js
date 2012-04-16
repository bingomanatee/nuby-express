var util = require('util');
var _ = require('underscore');
var path= require('path');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Loader = require('./../Loader');

function Action(config){
    Loader.call(this);
    digest_config(this, config);
}

_.extend(Action.prototype, Loader.prototype, {

    /* ***************** EVENTS ***************** */

    _init_server_done:false,

    on_init_server:function (server, framework) {
        if (this._init_server_done){
            return;
        }
        framework.emit('server_init_start');
        this._init_server(server, function(){
            framework.emit('server_init_done');
        })
    },


    /* ********************** NAME ******************* */

    name: function(){
        var base = path.basename(this.path);
        return '<<action>>' + base.replace('action_', '');
    },
    heritage: heritage
});

module.exports = Action;