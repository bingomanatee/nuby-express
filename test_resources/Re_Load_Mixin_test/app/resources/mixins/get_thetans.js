var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var NE = require('../../../../../lib');
var async = require('async');
var Loader = NE.Loader;

/* *************** MODULE ********* */

module.exports = {
    name: 'thetan_mixins',
    init:function (frame, cb) {
        console.log('initializing thetan loader');

        var theta_path_handler = new NE.Path_Handler({
            type:'file',
            filename:'thetan.json',
            name:'theta_path_handler',

            execute:function (match_path, theta_cb, target, match, context) {
                console.log('thetan match path: %s', match_path);

                if (!target.thetans) {
                    target.thetans = [];
                }

                fs.readfile(match_path, 'utf8', function (err, contents) {
                    if (err) {
                        console.log('error in theta mixin: %s', err.toString());
                        theta_cb(err);
                    } else {
                        try {
                            var t = JSON.parse(contents);
                            t.context = context;
                            console.log('thetan %s found in %s', contents, match_path);
                            target.config.thetans.push(t);
                            theta_cb();
                        } catch (err2) {
                            console.log('error reading thetan : %s', util.inspect(err2));
                            theta_cb(err2);
                        }
                    }
                });

            }
        });

        function _read_thetans(context, ctcb){
            var loader = new Loader();
            loader.add_handler(theta_path_handler);
            loader.start_load(ctcb, context.path, frame, context);
        }

        var thetan_targets = {};

        function _add_thetan_target(context){
            console.log('initializing thetan target %s', context.path);
            thetan_targets[context.path] = context;
            if (context.controllers){
                _.each(context.controllers, _add_thetan_target);
            }

            if (context.components){
                _.each(context.components, _add_thetan_target);
            }
        }

        _add_thetan_target(frame);

        var thetan_queue = async.queue(_read_thetans, 2);

        thetan_queue.push(_.toArray(thetan_targets), function(){
            console.log('thetan series done');
        });

        thetan_queue.drain = cb;

    }

};