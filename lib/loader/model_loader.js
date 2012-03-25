var path = require('path');
var util = require('util');

var ondir = require('./../support/ondir');

module.exports = function (controller, on_done) {

    var models_path = controller.path + '/models';

    if (path.existsSync(models_path)) {

        function _on_model_file(mpath, file_done) {
            var model = require(mpath);
            var name = path.basename(mpath, '.js');
            if (controller && controller.model_namespace){
                name = util.format("%s_%s", controller.model_namespace, name);
            }
            controller.framework.models[name] = model();

            file_done();
        }

        ondir(models_path, on_done, _on_model_file);

    } else {
        on_done();
    }


}