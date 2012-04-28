var fs = require('fs');
var digest_config = require('./../digest_config');

module.exports = function (match_path, callback, target, match, raw) {
    //  console.log('digesting path %s for owner %s', match_path, this.owner.heritage());
    var self = this;
    fs.readFile(match_path, 'utf8', function (err, content) {
        try {
            var config = JSON.parse(content);
            if (!raw) {
                digest_config(self.owner, config);
            }
        } catch (e) {
            console.log('cannot parse %s: %s', match_path, content);
            var config = {};
        }
        callback(null, config);
    });
}