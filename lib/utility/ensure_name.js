var path = require('path');
var util = require('util');
module.exports = function(target, re){
    if (!target.name){
        if (target.path){
            var name = path.basename(target.path, 'js');
            var match = re.exec(name)
            if (match){
                name = match[match.length - 1];
            } else {
                console.log('cannot find %s in %s', re.toString(), name);
            }
            target.name = name;
        } else {
            throw new Error('target for intrepret_name has neither name NOR path');
        }
    }
}