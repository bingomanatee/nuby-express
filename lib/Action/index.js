var util = require('util');
var _ = require('underscore');
var path= require('path');

function Action(config){
    _.extend(this, config);
}

_.extend(Action.prototype, {
    name: function(){
        var base = path.basename(this.path);
        return '<<action>>' + base.replace('action_', '');
    }
});

module.exports = Action;