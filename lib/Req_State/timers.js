
var mt = require('microtime');

module.exports = {

    add_time:function (event, context, ctx_id) {
        this.times.push({
            event:event,
            context:context,
            ctx_id:ctx_id,
            time:mt.nowDouble()
        });
    },

    show_times:function () {
        var start_time = 0;
        console.log("\n ----- TIME REPORT -----")
        var contexts = {};

        function _say_time(t, min_time) {
            if (!min_time) {
                min_time = start_time;
            }
            if (t.context) {
                console.log('%s sec: [%s: %s] %s', t.time - min_time, t.context, t.ctx_id, t.event);
            } else {
                console.log('%s sec: %s', t.time - min_time, t.event);
            }
        }

        function add_context_time(t) {

            if (!t.ctx_id) {
                t.ctx_id = 0;
            }
            if (!contexts[t.context]) {
                contexts[t.context] = [];
            }

            var found = false;
            _.each(contexts[t.context], function (ctx) {
                if (ctx.id == t.ctx_id) {
                    ctx.times.push(t);
                    found = true;
                }
            })

            if (!found) {
                contexts[t.context].push({
                    id:t.ctx_id,
                    times:[t]
                });
            }
        }

        _.forEach(this.times, function (t) {
            if (!start_time) {
                start_time = t.time;
            }

            _say_time(t);

            if (t.context) {
                add_context_time(t);
            }
        });

        _.each(contexts, function (id_groups, name) {

            console.log("\n ---------- CONTEXT %s ----------", name);

            id_groups.forEach(function (id_group) {
                console.log("\n ---------- CONTEXT %s :: ID %s ----------", name, id_group.id);
                var min_time = Infinity, max_time = 0;

                id_group.times.forEach(function (t) {
                    min_time = Math.min(min_time, t.time);
                    max_time = Math.max(max_time, t.time);
                })
                id_group.times.forEach(function (t) {
                    _say_time(t, min_time)
                });
                console.log("\n ---------- END CONTEXT %s :: ID %s  (span = %s) ----------", name, id_group.id, (max_time - min_time));
            });

            console.log("\n ---------- END CONTEXT %s ----------", name);
        })

        console.log("\n ----- END TIME REPORT -----")
    },
}