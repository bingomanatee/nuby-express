var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');

module.exports = {
    name: 'css',

    init: function(rs, input, cb){
        input.css = _.uniq(rs.action.get_config('css', [], true));
        cb(null, this.name);
    }

};