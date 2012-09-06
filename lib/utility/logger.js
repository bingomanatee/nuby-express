var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var async = require('async');

/* ***************** CLOSURE ************* */

var _DEBUG = false;
var _log_path = false;
var _write_buffer = false;

/* ***************** MODULE *********** */

module.exports = {

    set_log_file:function (file, params) {

        _log_path = file;
      //  if (!fs.existsSync(file)){
      //      throw new Error(util.format('bad log file passed: %s', file));
      //  }
        if (params && params.reset) {
            if (fs.existsSync(file)) {
                _log_path = file;
                try {

                    fs.unlink(_log_path, function (err) {
                        if (err) {
                            throw err;
                        }
                    })
                     _write_buffer = fs.createWriteStream(_log_path, {encoding:'utf8', flags:'a+'});
                } catch (err) {
                    console.log('error unlinking: %s', err.message);
                }
            } else {

                 _write_buffer = fs.createWriteStream(_log_path, {encoding:'utf8', flags:'a+'});
            }
        }
        _log_path = file;
    },

    log_to_obj: function(cb){
        fs.readFile(_log_path, 'utf8', function(err, log){
            log= util.format('[%s{"task": "end"}]', log);
            try {
                cb(null, JSON.parse(log));
            } catch(err){
                cb(null, log);
            }
        });
    },

    log:function (task, content) {
        if (!_log_path) {
            return;
        }

        var time = new Date().getTime();

        var msg = {
            time: time,
            task: task
        }

        if (content){
            msg.content = content;
        }
        try {
            var m = JSON.stringify(msg);
            _write_buffer.write(m + ",\n");
            _write_buffer.end();
        } catch(err){
         //   console.log('write error: %s', err.message);
            var msg = {
                time: time,
                task: task
            }
            try {
                var m = util.inspect(msg);
                _write_buffer.write(m + ",\n");
            } catch(err){
             //   console.log('write error2: %s', err.message);
               // throw err;
            }
        }

    },

    error:function (task) {

        this.log('_______ ERROR _________');
        if (task instanceof Error) {
            this.log(task.message);
        } else {

            this.log(task);
            if (_.isString(task)) {
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