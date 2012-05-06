var Gate = require('support/gate');
var NE = require('./../../../../lib');

module.exports = {
    init:function (frame, cb) {

        var layout_handler = NE.handlers.Resource_Type('layout');

        var layout_dir_handler = new NE.Path_Handler({
            name: 'layout_dir_handler',
            re: /layout(s)?/,
            type: 'dir',
            execute: function(props, cb){
                var layout_loader = new NE.Loader({path: props.full_path});
                layout_loader.add_handler(layout_handler);
                layout_loader.start_load(function(){
                    frame.add_resources(layout_loader.get_resources('layout'));
                    cb();
                });
            }
        })

        var gate = new Gate(cb);

            var loader = new NE.Loader({path: frame.path});
            loader.add_handler(layout_dir_handler);
            gate.task_start();
            loader.load(function(){
                console.log('ldh: loader %s', util.inspect(loader));
                frame.add_resources(loader.get_resources('layout'));
                gate.task_done();
            })
    }
}