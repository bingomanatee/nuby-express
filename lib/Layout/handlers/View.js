var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Gate = require('support/gate');

var _DEBUG = false;

module.exports = function (layout) {
    return new Path_Handler({
        type:'dir',
        re:/^view$/i,
        name:'layout_public',
        execute:function (match_path, callback, target) {
            var template =  match_path + '/template.html';

            fs.stat(template, function(err, stat){
                if (stat.isFile()){
                    lauyout.config.template = template;
                    layout.config.view_path = match_path;
                    callback();
                } else {
                    callback(new Error('no template for view path ' + match_path));
                }
            });
        }
    });
};