var util = require('util');

module.exports = {

    on_process:function (rs, input) {
        input.id = 1;
        console.log('input: %s', input);
        this.on_output(rs, input);
    }
}