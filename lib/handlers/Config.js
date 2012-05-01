var Path_Handler = require('../Loader/Path_Handler.js');
var fs = require('fs');
var _ = require('underscore');
var util = require('util');
var digest_config = require('./../utility/digest_config');

var _DEBUG = false;

var _path_handler = {
    name:'config_handler',
    type:'file',
    re:/(.*)_config.json$/i,

    execute:function (props, callback) {
        var target = props.target;
        var match_path = props.full_path;
        var context = props.context;

        // console.log('digesting path %s for owner %s', match_path, this.owner.heritage());
        var self = this;
        fs.readFile(props.full_path, 'utf8', function (err, content) {
            try {
                var config = JSON.parse(content);
                digest_config(props.context, config, self);
            } catch (e) {
                console.log('cannot parse %s: %s', props.full_path, content);
                throw e;
            }
            callback('loaded config ' + props.full_path);
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