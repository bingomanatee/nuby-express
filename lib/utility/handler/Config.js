var Path_Handler = require('../../Loader/Path_Handler.js');
var fs = require('fs');
var _ = require('underscore');
var util = require('util');
var digest_config = require('./../digest_config');

var _DEBUG = false;

module.exports = function (config) {
    var ph_config = {
        name:'config_handler',
        type:'file',
        re:/(.*)_config.json$/i,

        execute:function (match_path, callback, target, match) {
          //  console.log('digesting path %s for owner %s', match_path, this.owner.heritage());
            var self = this;
            fs.readFile(match_path, 'utf8', function (err, content) {
                try {
                    var config = JSON.parse(content);
                    digest_config(self.owner, config);
                } catch (e) {
                    console.log('cannot parse %s', content);
                    throw e;
                }
                callback(null, true);
            });
        }
    };
    if (config) {
     //   console.log('extending config handler configuration with %s', util.inspect(config));
        var p = {};
        _.extend(p, ph_config, config);
        return new Path_Handler(p);
    } else {

        return new Path_Handler(ph_config);
    }
};