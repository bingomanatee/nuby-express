var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events');

var _ = require('underscore');
var File_Loader = require('./../lib/File_Loader');

var file_paths = [
    '/test_resources/Loader_test/.b',
    '/test_resources/Loader_test/.b/.bar.txt',
    '/test_resources/Loader_test/.b/bar.txt',
    '/test_resources/Loader_test/.b/foo.txt',
    '/test_resources/Loader_test/.ignore_me.txt',
    '/test_resources/Loader_test/a',
    '/test_resources/Loader_test/a/bar.txt',
    '/test_resources/Loader_test/b',
    '/test_resources/Loader_test/b/bar.txt',
    '/test_resources/Loader_test/b/foo.txt',
    '/test_resources/Loader_test/bar.txt',
    '/test_resources/Loader_test/foo.txt' ];
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
       //
        test.done();
    },

    /**
     * Basic file loading functionality - validates every entry is unique, and
     * both files and directories are recorded. Also validates that the ending
     * _item_count value is zero.
     * @param test
     */
    test_loader:function (test) {
     //
        file_loader.start_load(function () {
            test.equal(file_loader._item_count, 0, 'Item count is zero');
            var files = _sort_files(file_loader.paths);
            test.deepEqual(files, all_files, 'found all files');
            test.done();
        }, load_resources_path);
    },

    test_loader_ignore:function (test) {

   //
        var file_loader3 = new File_Loader();
        file_loader3.read_dots = false;

        file_loader3.start_load(function () {
            test.equal(file_loader3._item_count, 0, 'Item count is zero');
            var files = _sort_files(file_loader3.paths);
            test.deepEqual(files, i_all_files, 'found all files; ignored dot file');
            test.done();
        }, load_resources_path);
    }

}