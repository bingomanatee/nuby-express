var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var async = require('async');

/* ***************** CLOSURE ************* */

var _log = [];
var _log_path = false;
var _logger;

/* ***************** MODULE *********** */

module.exports = {
    init:function (log_path) {
        if (_log_path) {
            return;
        }
        _log_path = path.normalize(log_path);
        console.log('logging to %s', _log_path);

    },

    log: function(task){
        try {
            JSON.stringify(task);
            _log.push(task);
            fs.writeFileSync(_log_path, JSON.stringify(_log));
        } catch (er) {
            console.log('cannot stringify %s: %s', util.inspect(task), util.inspect(er));
        }
    },

    error: function(task){
        var good = true;
        try {
            this.log(task);
        } catch(err){
            good = false;
        }

        if (good){
            throw new Error(JSON.stringify(task));
        } else {
            throw new Error(task.msg ? task. msg: 'Error ...');
        }
    }

};