var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Gate = require('support/gate');

var _DEBUG = false;

module.exports = function (layout) {
    return new Path_Handler({
        type:'dir',
        re:/^view(s)?$/i,
        name:'layout_public',
        execute:function (props, callback ) {
            var template =  props.full_path + '/template.html';
            if (_DEBUG) console.log('trying template %s', template);
            fs.stat(template, function(err, stat){
                if (stat.isFile()){
                    if (_DEBUG) console.log('setting template to %s', template);
                    layout.template = template;
                    layout.view_path = props.full_path;
                    callback();
                } else {
                    callback(new Error('no template for view path ' + match_path));
                }
            });
        }
    });
};