var Path_Handler = require('./../lib/Loader/Path_Handler');
var Loader = require('./../lib/Loader');
var mock_loader;

var json_files = [];
var xml_files = [];
var other_files = [];

module.exports = {
    setup:function (test) {
        mock_loader = {
            handlers:Loader.prototype.handlers,
            load_file:Loader.prototype.load_file,
            _handlers:[
                new Path_Handler({
                    re:/(.*)\.(json|xml)$/i,
                    type: 'file',
                    target: mock_loader,
                    execute:function (match_path, callback, match) {
                        switch (match[2].toLowerCase()) {

                            case 'json':
                                json_files.push(match_path);
                                break;

                            case 'xml':
                                xml_files.push(match_path);

                            default:
                                // we should NEVER get here because the re should block us
                                other_files.push(match_path);
                        }
                        callback(null, true);
                    } // end execute
                }) // end Path_Handler
            ],

            emit:function (what, msg) {
                console.log("MOCK EMIT %s - %s", what, msg);
            },

            work_done_callback: function(){
                return function(msg){
                    console.log('MOCK WORK DONE CALLBACK %s', msg);
                }
            }

        };
        test.done();
    },

    /**
     * Basic file loading functionality - validates every entry is unique, and
     * both files and directories are recorded. Also validates that the ending
     * _item_count value is zero.
     * @param test
     */
    test_path_handler:function (test) {
        var JSON_FILE = '/foo/foo.json';
        mock_loader.load_file(JSON_FILE);
        test.equal(JSON_FILE, json_files[0], 'handler detected file ' + JSON_FILE);

        var XML_FILE = '/bar/bar.xml';
        mock_loader.load_file(XML_FILE);
        test.equal(XML_FILE, xml_files[0], 'handler detected file ' + XML_FILE);

        var BAD_FILE = '/bar/bar.inc';
        mock_loader.load_file(BAD_FILE);
        test.notEqual(BAD_FILE, other_files[0], 'handler did not even see ' + BAD_FILE);

        test.done();


    }

}