var util = require('util');
var File_Loader = require('./../lib/File_Loader');
var path = require('path');
var fs = require('fs');
var events = require('events');
var _ = require('underscore');
var path = require('path');

var file_loader;

var file_paths = [
    '/test_resources/Loader_test/.ignore_me.txt',
    '/test_resources/Loader_test/a',
    '/test_resources/Loader_test/b',
    '/test_resources/Loader_test/bar.txt',
    '/test_resources/Loader_test/foo.txt',
    '/test_resources/Loader_test/a/bar.txt',
    '/test_resources/Loader_test/b/bar.txt',
    '/test_resources/Loader_test/b/foo.txt'
];
var i_file_paths = [
    '/test_resources/Loader_test/a',
    '/test_resources/Loader_test/b',
    '/test_resources/Loader_test/bar.txt',
    '/test_resources/Loader_test/foo.txt',
    '/test_resources/Loader_test/a/bar.txt',
    '/test_resources/Loader_test/b/bar.txt',
    '/test_resources/Loader_test/b/foo.txt'
];
var module_root = path.dirname(__dirname);
var load_resources_path = module_root + '/test_resources/Loader_test';


function _sort_files(files) {
    return _.sortBy(files, function (f) {
        return f
    });
}

function _make_file(f) {
    return module_root + f;
}

var all_files = _sort_files(_.map(file_paths, _make_file));

var i_all_files = _sort_files(_.map(i_file_paths, _make_file));

module.exports = {
    setup:function (test) {
        file_loader = new File_Loader();
        test.done();
    },

    /**
     * Basic file loading functionality - validates every entry is unique, and
     * both files and directories are recorded. Also validates that the ending
     * _item_count value is zero.
     * @param test
     */
    test_loader:function (test) {
        file_loader.start_load(function () {
            test.equal(file_loader._item_count, 0, 'Item count is zero');
            var files = _sort_files(file_loader.paths);
            test.deepEqual(files, all_files, 'found all files');
            test.done();
        }, load_resources_path);
    },

    /**
     * Tests the reusabiity of a loader. As long as you clear the cache between
     * loads, you should be able to run multiple times without increasing the
     * number of event handlers in your loader.
     *
     * @param test
     */
    test_loader_run_twice:function (test) {
        var file_loader2 = new File_Loader();

        file_loader2.start_load(function () {
            test.equal(file_loader2._item_count, 0, 'Item count is zero');
            var files = _sort_files(file_loader2.paths);
            test.deepEqual(files, all_files, 'found all files');
            if (!file_loader2.run_once) {
                file_loader2.run_once = true;
                file_loader2.paths = [];
                file_loader2.start_load(load_resources_path);
            } else {
                test.done();
            }
        }, load_resources_path);
    },

    test_loader_ignore: function(test){
        var file_loader3 = new File_Loader();
        var _original_can_load = file_loader3.can_load;
        file_loader3.can_load = function(load_path){
            if (/\/\.[^\/]+$/.test(load_path)){
                console.log('ignoring %s', load_path);
                return false;
            } else {
                return _original_can_load(load_path);
            }
        }

        file_loader3.start_load(function () {
            test.equal(file_loader3._item_count, 0, 'Item count is zero');
            var files = _sort_files(file_loader3.paths);
            test.deepEqual(files, i_all_files, 'found all files; ignored dot file');
            test.done();
        }, load_resources_path);
    }

}