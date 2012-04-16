var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var _ = require('underscore');
var util = require('util');

var _DEBUG = false;

module.exports = function(){
   return new Path_Handler({
        name: 'component_config_handler',
        type:'file',
        re:/com(ponent)?_config.json/i,

        execute:function (match_path, callback, target, match) {
            var self = this;
            fs.readFile(match_path, 'utf8', function (err, content) {
                try {
                    var config = JSON.parse(content);
                    _.extend(self.owner.config, config);
                } catch (e) {
                    console.log('cannot parse %s', content);
                    throw e;
                }
                callback(null, true);
            });
        }
    });
};