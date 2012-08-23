var util = require('util');
var _DEBUG = true;

module.exports = function (root, name, prefix, frame) {
    var data = {
        type:'static_route',
        name: name,
        prefix:prefix,
        root:root
    }

    if (_DEBUG){
        console.log('adding static path: %s', util.inspect(data));
    }

    frame.add_resource(data);
}