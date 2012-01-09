var path = require('path');

module.exports = function (lpath) {
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
    static_contexts.push({prefix:layout.prefix, root:path.join(lpath, layout.static)});

    if (!fw.layouts) {
        fw.layouts = {};
    }

    fw.layouts[layout.name] = layout;

}