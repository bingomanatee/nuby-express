var util = require('util');

module.exports = {

    on_get:function (rs) {
        this.get_validate(rs);
    },

    get_validate:function (rs) {
        if (rs.req_props.id) {
            this.get_process(rs);
        } else {
            this.rest_err(rs, "get folks called with no ID");
        }
    },

    get_process:function (rs) {
        var self = this;
        //
        this.models.folks.get(rs.req_props.id, function (err, folk) {
            //
            if (err) {
                self.rest_err(rs, 'cannot get folk id %s: %s', rs.req_props.id, err.toString());
            } else if (folk) {
                self.on_output(rs, folk.toObject());
            } else {
                self.rest_err(rs, 'cannot find folk id %s', rs.req_props.id);
            }
        });

    },

    on_post:function (rs) {
        this.post_validate(rs);
    },

    post_validate:function (rs) {
        var self = this;
        delete rs.req_props.id;
        var trial_model = new this.models.folks.model(rs.req_props);
        trial_model.validate(function (errs) {

            if (errs) {
                return self.rest_err(rs, errs);
            } else {
                self.post_process(rs);
            }
        });
    },

    post_process:function (rs) {
        var self = this;

        this.models.folks.put(rs.req_props, function (err, folk) {
            //
            if (err) {
                self.rest_err(rs, 'cannot put folk %s: %s', JSON.stringify(rs.req_props), err.toString());
            } else if (folk) {
                self.on_output(rs, folk.toObject());
            } else {
                self.rest_err(rs, 'cannot put folk %s', JSON.stringify(rs.req_props));
            }

        });
    },

    on_put:function (rs) {
        this.put_validate(rs);
    },

    put_validate:function (rs) {
        var id = rs.req_props.id;
        delete rs.req_props.id;
        /**
         * note - unlike post, were we are definitively given a complete record,
         * we are not assuming that the data is complete or valid - an additive model.
         * So we are not fully validating the input here, just the existince of
         * a previous model.
         */

        if (!id) {
            return this.rest_err(rs, 'cannot put to id %s', id);
        }

        var self = this;
        this.models.folks.count({_id:id}, function (err, num) {

            if (err) {
                return self.rest_err(rs, err);
            } else {
                switch (num) {
                    case 0:
                        return self.rest_err(rs, 'cannot put to id %s - record not found', id);
                        break;

                    case 1:
                        return self.put_process(rs, {id:id});
                        break;

                    default:
                        return self.rest_err(rs, 'cannot put to id %s - too many records found', id);
                }
            }
        });
    },

    put_process:function (rs, input) {
        var self = this;
        this.models.folks.get(input.id, function (err, old_folk) {
            if (err) {
                return self.rest_err(rs, 'err getting %s: %s', input.id, err.toString());
            } else {
                for (var f in rs.req_props) {
                    old_folk[f] = rs.req_props[f];
                }

                old_folk.save(function (err, saved_folk) {
                    if (err) {
                        return self.rest_err(rs, 'err updating (put) %s: %s', input.id, err.toString());
                    } else {
                        self.on_output(rs, saved_folk.toObject());
                    }
                });
            }

        });

    },

    on_delete:function (rs) {
        var self = this;
        if (rs.req_props.id) {
            self.model.folks.get(rs.req_props.id, function (err, folk) {
                if (err) {
                    self.rest_err(rs, 'cannot get folk id %s: %s', rs.req_props.id, err.toString());
                } else if (folk) {
                    self.delete_process(rs, folk);
                } else {
                    self.rest_err(rs, 'cannot find folk id %s', rs.req_props.id);
                }
            });
        } else {
            this.rest_err(rs, "get folks called with no ID");
        }
    },

    delete_process:function (rs, folk) {
        var self = this;
        folk.remove(function (err, deleted_folk) {
            self.on_output(rs, deleted_folk.toObject());
        });
    },

    rest_err:function (rs, err) {
        if (err instanceof Error) {
            rs.send({error:err.toString() }, 400);
        } else {

            var args = [].slice.call(arguments, 0);
            args.shift();
            rs.send({error:util.format.apply(util, args)}, 400);
        }
    }
}