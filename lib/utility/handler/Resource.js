var Path_Handler = require('./../../Loader/Path_Handler');
var util = require('util');
var fs = require('fs');
var Gate = require('node-support/gate');

/**
 * DEPRECTATED -- resources now loaded in resourceS handler
 *
 */
module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^(res|resource|model|helper|viewhelper|actionhelper|modelhelper)_/i,
        name:'framework_resource_handler',
        execute:function (match_path, callback, target, match) {
            var self = this;
            var resource_factory = require(match_path);
            var new_resource = resource_factory();
            target.log('added resource %s', new_resource.name());
            new_resource.add(target, function(){
                new_resource.add(self.owner, callback);
            });
        }
    });
}