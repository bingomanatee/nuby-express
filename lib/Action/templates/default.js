var util = require('util');

var Base_Template = require('./Base');

var Default_Template = function(){
};

util.inherits(Default_Template, Base_Template);

_.extend(Default_Template.prototype, {

    after_load: function(){
        this.type = 'default';
    }
})