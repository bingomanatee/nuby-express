var FL = require('./lib/File_Loader');

var fl = new FL();

var done = false;
fl.start_load(function(){
    if (done){
        console.log('REALLY done!');
    } else {
        console.log('done with file loading: ' + fl.paths.join("\n"));
    }
}, __dirname + '/test_resources/Loader_test');