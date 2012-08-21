var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events');
var _ = require('underscore');

var Req_State = require('./../index.js');
var rs;

module.exports = {

    setUp:function (c) {
        this.rs = new Req_State({query:{a:{foo:1, bar:0, zed: true}, b:2, c:0, d:'', e:null}}, {}, {config:{}}, {}, {});
        c();
    },

    tearDown:function (c) {
        this.rs = null;
        c();
    },

    test_validate_has:function (t) {

        t.ok(this.rs.has('a'), 'has recognizes object');
        t.ok(this.rs.has('b'), 'has recognizes number');
        t.ok(this.rs.has('c'), 'has reconizes item with zero');
        t.ok(!this.rs.has('f'), 'has fails on absent key');
        t.ok(this.rs.has('d'), 'has recognizes empty string value');
        t.ok(this.rs.has('e'), 'has recognizes null value');
        t.ok(this.rs.has('a', 'b', 'c'), 'has accepts multiple keys');
        t.ok(!this.rs.has('a', 'b', 'f'), 'has fails if one of multiple keys is absent');

        t.done();
    },

    test_validate_has_content:function (t) {

        t.ok(this.rs.has_content('a'), 'has_content recognizes object');
        t.ok(this.rs.has_content('b'), 'has_content recognizes number');
        t.ok(!this.rs.has_content('c'), 'has_content fails item with zero');
        t.ok(!this.rs.has_content('f'), 'has_content fails on absent key');
        t.ok(!this.rs.has_content('d'), 'has_content recognizes empty string value');
        t.ok(!this.rs.has_content('e'), 'has_content fails on null value');
        t.ok(this.rs.has_content('a', 'b'), 'has_content accepts multiple keys');
        t.ok(!this.rs.has_content('a', 'b', 'f'), 'has fails if one of multiple keys is absent');

        t.done();
    },

    test_validate_has_content_deep:function (t) {
        t.ok(this.rs.has_content('a.foo'), 'has_content finds deep property');
        t.ok(!this.rs.has_content('a.foo.bar'), 'has_content fails on too deep property');
        t.ok(!this.rs.has_content('a.bar'), 'has_content fails on too deep property');
        t.ok(!this.rs.has_content('z.bar'), 'has_content fails on no root property');
        t.ok(this.rs.has_content('a.foo', 'a.zed'), 'has content accepts multiple deep');
        t.ok(this.rs.has_content('a.foo', 'a.zed', 'b'), 'has content accepts multiple deep with flat');

        t.done();
    }

}