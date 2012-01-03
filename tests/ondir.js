var util = require('util');
var ondir = require('./../lib/support/ondir');
var path = require('path');
var fs = require('fs');

module.exports = {
    test_on_dir:function (test) {
        function on_file(file_path, callback){
       //     console.log('reading file path ' + file_path);
            var filename = path.basename(file_path);
            fs.readFile(file_path, function(err, path_content){
               test.equals(filename, path_content,
                   util.format('path %s content %s does not contain its file name', path_content, file_path));
                callback();
            });

        }

        function on_dir(dir_path, callback){
        //    console.log('reading dir path', dir_path);
            var dirs = fs.readdirSync(dir_path);
            var fnn = parseInt(path.basename(dir_path));
            test.equals(dirs.length, fnn, util.format('directory has %n files', fnn));
            callback();
        }

        var resource_path = path.resolve(__dirname,  '../test_resources/ondir');
        ondir(resource_path, function(){test.done()}, on_file, on_dir);
    },

    test_no_dir: function(test){
        var nullf = function(c){console.log('nully'); c();};
        var MADE_UP_PATH = 'madeuppath';

        var on_no_path = function(p, callback){
            test.equals(MADE_UP_PATH, MADE_UP_PATH, util.format("there is no path %s", MADE_UP_PATH));
            callback();
        }
        ondir(MADE_UP_PATH, function(){
        //    console.log('done with ' + MADE_UP_PATH)
            test.done()}, nullf, nullf, on_no_path);
    }
}