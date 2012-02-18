var path = require('path');
var util = require('util');
function _debug(msg, param, b, c) {
   // return;
    if (param) {
        msg = util.format(msg, param, b, c);
    }
    console.log('loader:: %s', msg);
}

module.exports = function (lpath) {

    _debug('ADD LAYOUT: ', lpath);
    var fw = this;
    var layout = require(lpath);
    var template;
    if (layout.template) {
        template = layout.template;
    } else {
        layout.template = template = lpath + '/template.html';
    }
    if (!path.existsSync(template)) {
        throw new Error('cannot find template ' + template + ' for layout');
    }

    layout.path = lpath;
    if (!layout.name) {
        layout.name = path.filename(lpath);
    }

    // @TODO: ensure ne_static loaded

    var static_contexts = fw.app.set('static contexts');
    if (!static_contexts){
        static_contexts = [];
    }
    static_contexts.push({prefix:layout.prefix, root:path.join(lpath, layout.static)});
    fw.app.set('static contexts', static_contexts);

    if (!fw.layouts) {
        fw.layouts = {};
    }

    fw.layouts[layout.name] = layout;

}