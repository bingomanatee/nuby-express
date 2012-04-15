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
    name: function(){
        var base = path.basename(this.path);
        return '<<action>>' + base.replace('action_', '');
    },
    heritage: heritage
});

module.exports = Action;