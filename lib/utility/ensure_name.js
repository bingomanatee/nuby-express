var path = require('path');
var util = require('util');
module.exports = function(frame, re){
    if (!frame.name){
        if (frame.path){
            var name = path.basename(frame.path, 'js');
            var match = re.exec(name)
            if (match){
                name = match[match.length - 1];
            } else {
                console.log('cannot find %s in %s', re.toString(), name);
            }
            frame.name = name;
        } else {
            throw new Error('frame for intrepret_name has neither name NOR path');
        }
    }
}