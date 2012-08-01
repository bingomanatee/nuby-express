var FL = require('./lib/File_Loader');

var fl = new FL();

fl.start_load(function () {
    console.log('done with file loading: ' + fl.paths.join("\n"));
}, __dirname + '/test_resources/Loader_test');