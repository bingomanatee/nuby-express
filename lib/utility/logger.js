var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var async = require('async');

/* ***************** CLOSURE ************* */

var MAX_LOG = 500;
var FLUSH_TIME = 5000;
var _DEBUG = false;
var _log = [];
var _log_path = false;
var _logger;
var _flush_timeout;

/* ***************** MODULE *********** */

module.exports = {

    set_log_file: function(file, params){

        if (params && params.reset){
            if (fs.existsSync(file)){
                _log_path = file;
                fs.unlink(_log_path)
            }
        }
        _log_path = file;
    },

    _flush_log: function(){
        try {
            if (_log_path){
                var h = fs.createWriteStream(_log_path, {flags: 'w+', encoding: 'utf8'});
                _log.forEach(function(item){
                    h.write("\r\n" + item.time + ': ' + item.task);
                })
                h.end();
            }
        } catch(err){
            console.log('cannot write to log %s: %s', _log_path, util.inspect(err));
        }

        delete _log;
        _log = [];
        if (_flush_timeout) {
            clearTimeout(_flush_timeout);
        }
    },

    start_flush_timer: function(){
        if (!_flush_timeout){
            _flush_timeout = setTimeout(this._flush_log, FLUSH_TIME);
        }
    },

    log:function (task, content) {
        if (_.isString(task)) {
            if (content) {
                task = {msg:task, content:content};
            } else {
                task = {msg:task};
            }
        }

        _log.push({time: new Date().getTime(),
            task:util.inspect(task, true, 3)});
        if (_log.length > MAX_LOG){
            this._flush_log();
        } else if (!_flush_timeout) {
            this.start_flush_timer();
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