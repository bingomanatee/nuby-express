var util = require('util');

module.exports = {

    on_input:function (rs) {
        var self = this;
     //   console.log('rs: %s', util.inspect(rs.req, null, 0));
        var input = rs.req_props;
       // console.log('adding widget %s', util.inspect(input));
      //  console.log('widget action %s', util.inspect(this));
       // console.log('widget frame: %s', util.inspect(this.framework));
        this.models.widgets.put(input, function(err, widget){
            self.on_process(rs, widget);
        });
    }
}