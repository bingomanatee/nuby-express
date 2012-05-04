var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var async = require('async');


/* ***************** CLOSURE ************* */

var _DEBUG = false;
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

    log:function (task, content) {
        if (_.isString(task)) {
            if (content) {
                task = {msg:task, content:content};
            } else {
                task = {msg:task};
            }
        }
        try {
            JSON.stringify(task);
            _log.push(task);
            fs.writeFileSync(_log_path, JSON.stringify(_log));
        } catch (er) {
            if (_DEBUG) console.log('cannot stringify %s: %s', util.inspect(task), util.inspect(er));
            _log.push({task:util.inspect(task, true, 3)});
        }
    },

    error:function (task) {

        this.log('_______ ERROR _________');
        if (task instanceof Error) {
            this.log(task.toString());
            throw task;
        } else{

            this.log(task);
            if (_.isString(task)){
                throw new Error(task);
            }

            var good = true;
            try {
                JSON.stringify(task);
            } catch (err) {
                good = false;
            }

            if (good) {
                throw new Error(JSON.stringify(task));
            } else {
                throw new Error(task.msg ? task.msg : 'Error ...');
            }

        }
    }
}