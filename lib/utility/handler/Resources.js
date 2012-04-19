var Path_Handler = require('./../../Loader/Path_Handler');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Gate = require('node-support/gate');
var _ = require('underscore');

var known_types = ['action_helper', 'view_helper', 'express_helper', 'mixin', 'model', 'model_helper', 'resource'];
known_types = known_types.concat(_.map(known_types, function (type) {
    return type + 's'
}));

/**
 * This is a path trap for any number of directories that can contain resources.
 * resources can be grouped by known type as in
 *
 * /resources/action_helpers/my_action_helper
 *
 * or simply put in the root
 *
 * /resources/my_action_helper
 *
 * however if your action helper has the same name as a known type, it will not laod properly.
 *
 */

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^resource(s)?$/i,
        name:'framework_resources_handler',
        execute:function (match_path, callback, target, match) {
            target.log('scanning resource path %s', match_path);
            console.log('scanning resource path %s', match_path);
            var self = this;
            var gate = new Gate(callback);
            gate.debug = true;
            gate.task_start('load_dir');

            function _add_resource(res_path) {
                var res_module = path.basename(res_path);
                console.log("ADDING RESOURCE %s", res_path);

                try {

                    if (/^\./.test(res_module)) {
                        return;
                    }
                    gate.task_start();
                    fs.stat(res_path, function (err, stat) {
                        //@TODO: handle err

                        try {
                            /* ****************** FILTERING FOR PROPER TYPE ********************* */

                            if (stat.isFile()) {
                                if (!/js$/i.test(res_module)) {
                                    console.log('NOT loading resource file %s', res_module);
                                    gate.task_done('skipping resource file ' + res_path + ' - not a javascript file');
                                    return;
                                }
                            } else if ((!stat.isDirectory())) {
                                gate.task_done();
                                return;
                            }

                            /* *********** REQUIRING RESOURCE *********** */

                            var resource_factory = require(res_path);

                            if (_.isFunction(resource_factory)) {

                                var new_resource = resource_factory(target);
                                target.add_resource(new_resource);
                                target.log('added resource ' + res_path);

                                if (new_resource.hasOwnProperty('on_add')) {
                                    new_resource.on_add(target, gate.task_done_callback());
                                } else {
                                    gate.task_done('add resource mod');
                                }
                            } else {
                                gate.task_done('skipping resource factory ' + res_path + ' - not a function');
                            }

                        } catch (er) {
                            gate.task_done('error in adding resource ' + res_path + ': '.er.toString());
                        }
                    });
                } catch (err){
                    console.log('error reading res_path %s: %s', res_path, err.toString());
                }

            }

            fs.readdir(match_path, function (err, files) {
                if (err) {
                    console.log("ERROR reading %s: %s", match_path, err.toString());
                    return callback(err);
                }
                //The first directory inside resources is a type grouper. mixins, action_helper, view_helper, etc.

                files.forEach(function (type) {
                    var resource_type_path = match_path + '/' + type;
                    if (_.contains(known_types, type)) {
                        console.log('reading known type %s in %s', type, match_path);
                        // is a resource directory or file; we trust the owner to have an appropriate handler for resource

                        gate.task_start();

                            fs.readdir(resource_type_path, function (err, res_modules) {
                                //@TODO: unit test "JUNK / documentation" in resource dirs.
                                _.map(res_modules, function (res_module) {
                                    return resource_type_path + '/' + res_module;
                                })
                                    .forEach(_add_resource);
                                gate.task_done('done loading resource type path ' + resource_type_path);
                            });

                    } else {
                        _add_resource(resource_type_path)
                    }
                }); // end forEach

                gate.task_done('done loading resource root ' + match_path);
            }) // end readdir
            gate.start();
        }
    });
}