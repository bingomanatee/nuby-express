var util = require('util');
var Loader = require('./../lib/Loader');
var path = require('path');
var fs = require('fs');
var events = require('events');
var _ = require('underscore');

function File_reading_loader(config){
    this.paths = [];
    _.extend(this, config);
}

util.inherits(File_reading_loader, Loader);

_.extend(File_reading_loader.prototype, {
    can_load: function(load_path){
        return fs.existsSync(load_path);
    },

    load_item: function(load_path, callback){
        this.paths.push(load_path);
        var self = this;
        fs.stat(load_path, function(err, stat){
            if (stat.isDir()){
                self.load(callback, load_path);
            } else {
                callback(null, "added " + load_path);
            }
        });
    }
    
});

module.exports = {
    setup:function (test) {


        test.done();
    },

    test_loader:function (test) {
        function _on_loaded_cb() {
            test.equals(1, framework.controllers.length, 'framework has one controller');
            if (framework.controllers.length > 0) {
                var c = framework.controllers[0];
                test.ok(c.actions.hasOwnProperty('main'), 'frameworks controller main action');
                if (c.actions.hasOwnProperty('main')) {
                    var a = c.actions.main;
                    test.equals('/', a.get_route(), 'main action route = /');
                }

                test.ok(c.actions.hasOwnProperty('about_us'), 'frameworks controller about_us action');
                if (c.actions.hasOwnProperty('about_us')){
                    var a = c.actions.about_us;
                    test.equals('/home/about_us', a.get_route(), 'about_us action route = /home/about_us');
                }
            }
            test.done();
        }

        loader.load(framework, _on_loaded_cb);
    }

}