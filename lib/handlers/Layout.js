var Path_Handler = require('./../Loader/Path_Handler');
var Resource = require('./../Resource');
var util = require('util');
var path = require('path');
var _ = require('underscore');
var Layout = require('./../Layout');

module.exports = function () {

    return new Path_Handler({
        type:'dir',
        re:/$(layout_)?([^.].*)/,
        name:'resource_helper',
        execute:function (config, callback) {
            var frame = config.frame;
            var match_path = config.full_path;
            var context = config.context;

            var layout_name = match[match.length - 1];

            var layout = new Layout();
            layout.start_load(function(){
                if (!layout.name){
                    layout.name = name;
                }
                frame.add_layout(layout);
                callback();
            }, match_path);
        }
    });

}