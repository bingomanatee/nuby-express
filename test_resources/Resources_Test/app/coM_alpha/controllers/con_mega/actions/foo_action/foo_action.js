var util = require('util');

module.exports = {

    on_input:function (rs) {
        var self = this;
     //
        var input = rs.req_props;
       //
      //
       //
        this.models.widgets.put(input, function(err, widget){
            self.on_process(rs, widget);
        });
    }
}