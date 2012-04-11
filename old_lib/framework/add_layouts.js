var ondir = require('./../support/ondir');

module.exports = function(layout_root, callback){
    var fw = this;
    function _err(){
        throw new Error('add layouts: cannot find layout root ' + layout_root);
    }

    function _add_layout(layout_path, on_done){
        fw.add_layout(layout_path);
        on_done();
    };

    ondir(layout_root, callback, null, _add_layout, _err);

}