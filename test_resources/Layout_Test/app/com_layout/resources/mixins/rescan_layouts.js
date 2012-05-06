var Gate = require('support/gate');
var NE = require('./../../../../../../lib');
var util = require('util');

module.exports = {
    init:function (frame, cb) {
        console.log('rescanning')

        var layout_handler = new NE.Path_Handler({
            name: 'layout_dir_layout_handler',
            type: 'dir',
            re: /(.*)/,
            execute: function(props, callback){
                console.log('making layout over %s', props.full_path);
                var layout_res = new NE.Layout({
                   path: props.full_path
                });
                layout_res.start_load(function(){
                    props.loader.add_resource(layout_res);
                    callback();
                });
              //  callback();
            }
        })

        var layout_dir_handler = new NE.Path_Handler({
            name: 'layout_dir_handler',
            re: /^layout(s)?$/,
            type: 'dir',
            execute: function(props, kkk){
                console.log('found layout dir %s', props.full_path);
                var layout_loader = new NE.Loader({path: props.full_path});
                layout_loader.add_handler(layout_handler);

              layout_loader.start_load(
                  function(){
                    var res = layout_loader.get_resources();
                  //  console.log('harvested resources %s fromm %s', util.inspect(res), props.full_path);
                    frame.add_resources(res);
                      kkk();
                  }
              );
            }
        });

        var gate = new Gate(cb, 'rescan layouts');
     //   gate.debug=true;

        var loader = new NE.Loader({path: frame.path});
        loader.add_handler(layout_dir_handler);
        gate.task_start();
        loader.start_load(function(){
         //   console.log('ldh: loader %s', util.inspect(loader));
            frame.add_resources(loader.get_resources('layout'));
            gate.task_done();
        }, frame.path);
        gate.start();
     //   console.log('scanning %s', frame.path);
    }
}