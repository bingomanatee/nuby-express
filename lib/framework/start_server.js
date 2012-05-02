var Gate = require('support/gate');
var async = require('async');

module.exports = function (callback) {
    this._server = require('express').createServer();
    this._server_work = 0;
    this._server_started = false;

    this.import_child_resources();

    var self = this;
    var mixin_taks = [];

    var mixins = this.get_resources('mixin');
    mixins.forEach(function (mixin) {
        mixin_taks.push(function(frame, callback){
            mixin.init(frame, callback);
        })
    });

    async.parallel(mixin_taks, function(){

        var eh = this.get_resources('express_helper');

        var eh_tasks = [];

        eh.forEach(function (ehr) {
            eh_tasks.push(function(frame, callback){
                ehr.start_server(frame, callback);
            });
        });

        async.parallel(eh_tasks, function(){

            var css = [];

            self.components.concat(self.controllers).forEach(function (com) {
                css.push(function(frame, callback){
                    com.start_server(frame, callback);
                })
            });

            queue.parallel(css, callback);

        })

    })

};