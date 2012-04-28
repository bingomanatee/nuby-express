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
        execute:function (match_path, callback, target, match) {
            var layout_name = match[match.length - 1];

            var layout = new Layout();
            layout.start_loat(function(){
                if (!layout.name){
                    layout.name = name;
                }
                target.add_layout(layout);
                callback();
            }, match_path);
        }
    });

}