var Path_Handler = require('../Loader/Path_Handler.js');
var fs = require('fs');
var _ = require('underscore');
var util = require('util');
var digest_config = require('./../utility/digest_config');

var _DEBUG = false;

var _path_handler = {
    name:'config_handler',
    type:'file',
    re:/((.*)_)?config.json$/i,

    execute:function (props, callback) {

        if(_DEBUG) console.log('digesting config path %s', props.full_path);
        var self = this;
        fs.readFile(props.full_path, 'utf8', function (err, content) {
            if(_DEBUG) console.log('read file %s: %s', props.full_path, content);
            var config;
            try {
                 config = JSON.parse(content);
            } catch (e) {
                console.log('cannot parse %s: %s', props.full_path, content);
                throw e;
            }
            digest_config(props.context, config, self);
          callback();
          //  callback('loaded config %s to %s', util.inspect(config), props.context.id());
        });
    }
};

module.exports = function (config) {
    var out =  new Path_Handler(_path_handler);
    if (config){
        _.extend(out, config);
    }
    return out;
};