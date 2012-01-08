var path = require('path');


module.exports = function(fw, lpath){

    var layout = require(lpath);
var template;
    if (layout.template){
        template = layout.template;
    } else {
        template = lpath + '/template.html';
    }

    if (path.existsSync(template)){
        // @TODO: ensure ne_static loaded
        var static_contexts = fw.set('static contexts');
        static_contexts.push({prefix: layout.prefix, root: layout.static});

    } else {
        throw new Error ('cannot find template ' + template + ' for layout');
    }

}