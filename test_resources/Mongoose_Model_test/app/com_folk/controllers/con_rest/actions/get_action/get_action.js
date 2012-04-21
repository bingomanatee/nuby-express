var util = require('util');

module.exports = {

    on_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        this.models.folks.get(input.id, function(err, folk){
            self.on_process(rs, folk);
        });
    }
}