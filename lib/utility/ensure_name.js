var path = require('path');
var util = require('util');
var _DEBUG = false;

module.exports = function(target, re, index){
    if (!target.name){
        if (target.path){
            var name = path.basename(target.path, 'js');
            var match = re.exec(name);

            if (match){
                if (arguments.length < 3){
                index = match.length - 1;
            }
                if (_DEBUG) console.log('match of %s IN %s == %s, index = %s', name, re.toString(), util.inspect(match), index);
                name = match[index];
          //  } else {
           //     console.log('cannot find %s in %s', re.toString(), name);
            }
            if (_DEBUG)  console.log('name assigned = %s', name);
            target.name = name;
        } else {
            throw new Error('target for ensure_name has neither name NOR path');
        }
    }
}