var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var _ = require('underscore');
var util = require('util');

var _DEBUG = false;

module.exports = new Path_Handler({
    name: 'framework_config_handler',
    type:'file',
    re:/frame(work)?_((.*)_)?config.json/i,

    execute:function (match_path, callback, target, match) {
        var self = this;
        fs.readFile(match_path, 'utf8', function (err, content) {
           if (_DEBUG)  console.log('PATH HANDLER: Config ---- config read: %s: %s into %s %s',
                match_path, content, target.CLASS, target.path);
            if (err) {
                return callback(err);
            }
            try {
                var config = JSON.parse(content);
                _.extend(target.config, config);
              if (_DEBUG)   console.log('added config: %s to %s', content, util.inspect(target, null, 0));
            } catch (e) {
                console.log('cannot parse %s', content);
                throw e;
            }
            callback(null, true);
        });
    }
});