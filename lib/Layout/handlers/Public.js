var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Gate = require('support/gate');

var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^public?$/i,
        name:'component_controller_dir',
        execute:function (match_path, callback, target) {
            this.owner.set_public_path(match_path);
        }
    });
}