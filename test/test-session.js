/*!
 * test/test-session.js - SASL Session Tests
 */

var promised_io = require("promised-io"),
    SASLSession = require("../lib/session.js").SASLSession;

var mockClientMech = {
    "name": "MOCK",
    "stepStart" : function(config) {
        var deferred = new promised_io.Deferred();
        deferred.resolve(new Buffer("client initial"));
        return deferred.promise;
    }
};
var mockServerMech = {
    "name":"MOCK",
    "stepStart": function(config, input) {
        var deferred = new promised_io.Deferred();
        deferred.resolve(new Buffer("server initial"));
        return deferred.promise;
    }
}

module.exports = {
    setUp: function(cb) {
        cb();
    },
    tearDown: function(cb) {
        cb();
    },
    "test create" : function(test) {
        var config,
            session;

        config = {};
        session = new SASLSession(mockClientMech, config);
        test.equal(session.mechanism, mockClientMech.name);
        test.notStrictEqual(session.config, config);
        test.ok(!session.completed);
        test.equal(session.config.state, "start");

        config = { state:"complete" };
        session = new SASLSession(mockClientMech, config);
        test.equal(session.mechanism, mockClientMech.name);
        test.notStrictEqual(session.config, config);
        test.ok(!session.completed);
        test.equal(session.config.state, "start");

        config = {
            username:"bilbo.baggins",
            password:"! 84G3nd"
        };
        session = new SASLSession(mockClientMech, config);
        config.state = "start";
        test.equal(session.mechanism, mockClientMech.name);
        test.notStrictEqual(session.config, config);
        test.ok(!session.completed);
        test.deepEqual(session.config, config);

        session = new SASLSession(mockClientMech);
        test.equal(session.mechanism, mockClientMech.name);
        test.ok(session.config);
        test.ok(!session.completed);
        test.equal(session.config.state, "start");

        test.done();
    },
    "test step - client single-stage success": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.strictEqual(config, session.config);
                test.ok(!input);
                test.equal(config.state, "start");

                config.state = "complete";
                var deferred = new promised_io.Deferred();
                deferred.resolve(new Buffer("client initial"));
                return deferred.promise;
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(session.completed);
            test.done();
        }, function(err) {
            test.fail(err && err.message);
            test.done();
        });
    },
    "test step - client single-stage success (config data)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.strictEqual(config, session.config);
                test.ok(!input);
                test.equal(config.state, "start");

                config.state = "complete";
                var deferred = new promised_io.Deferred();
                deferred.resolve(new Buffer("client initial:" +
                                            config.username + ":" +
                                            config.password));
                return deferred.promise;
            }
        };
        config = {username:"bilbo.baggins", password:"! 84G3nd"};
        session = new SASLSession(mech, config);
        var promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial:bilbo.baggins:! 84G3nd");
            test.ok(session.completed);
            test.done();
        }, function(err) {
            test.fail(err && err.message);
            test.done();
        });
    },
    "test step - client multi-stage success": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.strictEqual(config, session.config);
                test.ok(!input);
                test.equal(config.state, "start");

                config.state = "next";
                var deferred = new promised_io.Deferred();
                deferred.resolve(new Buffer("client initial"));
                return deferred.promise;
            },
            stepNext: function(config, input) {
                test.strictEqual(config, session.config);
                test.ok(input instanceof Buffer);
                test.equal(input.toString(), "server initial");

                config.state = "complete";
                var deferred = new promised_io.Deferred();
                deferred.resolve(new Buffer("client next"));
                return deferred.promise;
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(!session.completed);
        }, function(err) {
            test.fail(err && err.message);
            test.done();
        });

        promise = session.step(new Buffer("server initial"));
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client next");
            test.ok(session.completed);
            test.done();
        }, function(err) {
            test.fail(err && err.message);
            test.done();
        });
    },
    "test step - client multi-stage success (string input)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.strictEqual(config, session.config);
                test.ok(!input);
                test.equal(config.state, "start");

                config.state = "next";
                var deferred = new promised_io.Deferred();
                deferred.resolve(new Buffer("client initial"));
                return deferred.promise;
            },
            stepNext: function(config, input) {
                test.strictEqual(config, session.config);
                test.ok(input instanceof Buffer);
                test.equal(input.toString(), "server initial");

                config.state = "complete";
                var deferred = new promised_io.Deferred();
                deferred.resolve(new Buffer("client next"));
                return deferred.promise;
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(!session.completed);
        }, function(err) {
            test.fail(err && err.message);
            test.done();
        });

        promise = session.step("c2VydmVyIGluaXRpYWw=", "base64");
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client next");
            test.ok(session.completed);
            test.done();
        }, function(err) {
            test.fail(err && err.message);
            test.done();
        });
    }
}