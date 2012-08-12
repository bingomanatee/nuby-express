var Gate = require('support/gate');
var NE = require('nuby-express');
var util = require('util');
var ne = require('nuby-express');
var _DEBUG_LAYOUT_LOADER = false;

module.exports = {
    name: 'layout_public_paths',
    init:function (frame, cb) {
        var layouts = frame.get_resources('layout');

        layouts.forEach(function (layout) {
            var root = layout.path.substr(frame.path.length) + '/public';
            var prefix;
            if (_DEBUG_LAYOUT_LOADER) console.log('>>> public static layout = %s', util.inspect(layout_res, false, 2));
            if (layout.config.static_prefix) {
                prefix = layout.config.static_prefix;
            } else {
                prefix = '';
            }
            // the static path is added as a seperate resource to the frame
            var name = 'layout_' + layout.name + '_static_route';
            ne.utility.add_static_route(root, name, prefix, frame);

        });

        cb();

        /*
         if (_DEBUG_LAYOUT_LOADER) console.log('rescanning for frame %s', frame.id());

         var layout_handler = new NE.Path_Handler({
         name:'layout_dir_layout_handler',
         type:'dir',
         re:/(.*)(_layout)?/,
         execute:function (props, callback) {
         if (_DEBUG_LAYOUT_LOADER)   console.log('making layout over %s', props.full_path);
         var layout_res = new NE.Layout({
         path:props.full_path
         });
         if (_DEBUG_LAYOUT_LOADER)   console.log('adding layout %s', util.inspect(layout_res, true, 0));
         layout_res.start_load(function () {
         var root = layout_res.path.substr(frame.path.length) + '/public';
         var prefix;
         if (_DEBUG_LAYOUT_LOADER) console.log('>>> public static layout = %s', util.inspect(layout_res, false, 2));
         if (layout_res.config.static_prefix) {
         prefix = layout_res.config.static_prefix;
         } else {
         prefix = '';
         }
         // the static path is added as a seperate resource to the frame
         var data = {
         type:'static_route',
         name:'layout_' + layout_res.name + '_static_route',
         prefix:prefix,
         root:root};
         if (_DEBUG_LAYOUT_LOADER) console.log(' >>>>>>>>>> adding static path for %s to >>>>>>>> %s(%s)', util.inspect(data), frame.id(), util.inspect(frame, false, 0));
         frame.add_resource(data);

         if (_DEBUG_LAYOUT_LOADER)  console.log(' >>>>>>>>>> layout added as %', util.inspect(layout_res, false, 0));
         props.loader.add_resource(layout_res);
         callback();
         }, props.full_path, frame);
         //  callback();
         }
         })

         var layout_dir_handler = new NE.Path_Handler({
         name:'layout_dir_handler',
         re:/^layout(s)?$/,
         type:'dir',
         execute:function (props, cb) {
         //   console.log('found layout dir %s', props.full_path);
         var layout_loader = new NE.Loader({path:props.full_path});
         layout_loader.add_handler(layout_handler);

         layout_loader.start_load(
         function () {
         var res = layout_loader.get_resources();
         //  console.log('harvested resources %s fromm %s', util.inspect(res), props.full_path);
         frame.add_resources(res);
         cb();
         }, props.full_path, frame
         );
         }
         });

         var gate = new Gate(cb, 'rescan layouts');
         //   gate.debug=true;

         function _after_load(loader) {
         if (_DEBUG_LAYOUT_LOADER)  console.log('ldh: loader %s', util.inspect(loader));
         frame.add_resources(loader.get_resources());
         gate.task_done()
         }

         frame.get_controllers().forEach(function (con) {
         gate.task_start();
         con.reload([layout_dir_handler], _after_load);
         })

         frame.get_components().forEach(function (con) {
         gate.task_start();
         con.reload([layout_dir_handler], _after_load);
         })


         gate.task_start();
         frame.reload([layout_dir_handler], _after_load, frame);
         gate.start(); //   console.log('scanning %s', frame.path);
         */
    }
}