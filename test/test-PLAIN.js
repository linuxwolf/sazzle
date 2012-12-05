/*!
 * test/test-PLAIN.js - PLAIN Mechanism Tests
 */
var promised_io = require("promised-io"),
    PLAIN = require("../plain.js");

module.exports = {
    client: {
        "test success": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (username callback value)": function(test) {
            var config = {
                state:"start",
                username:function(cfg) {
                    test.strictEqual(cfg, config);
                    return "bilbo.baggins";
                },
                password:"! 84G3nd"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (username callback promise)": function(test) {
            var config = {
                state:"start",
                username:function(cfg) {
                    test.strictEqual(cfg, config);
                    var deferred = new promised_io.Deferred();
                    deferred.resolve("bilbo.baggins");
                    return deferred.promise;
                },
                password:"! 84G3nd"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (username promise)": function(test) {
            var config = {
                state:"start",
                username:promised_io.whenPromise("bilbo.baggins"),
                password:"! 84G3nd"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (password callback value)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:function(cfg, username) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, config.username);
                    return "! 84G3nd";
                }
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (password callback promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:function(cfg, username) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, config.username);
                    var deferred = new promised_io.Deferred();
                    deferred.resolve("! 84G3nd");
                    return deferred.promise;
                }
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (password callback promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:promised_io.whenPromise("! 84G3nd")
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid callback value)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(cfg, username) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, config.username);
                    return "mayor@hobbiton.lit";
                }
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid callback value)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(cfg, username) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, config.username);
                    var deferred = new promised_io.Deferred();
                    deferred.resolve("mayor@hobbiton.lit");
                    return deferred.promise;
                }
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid callback value)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:promised_io.whenPromise("mayor@hobbiton.lit")
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            test.equal(config.state, "complete");
            promise.then(function(out) {
                test.ok(out instanceof Buffer);
                test.equal(out.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        }
    }
}