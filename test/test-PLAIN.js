/*!
 * test/test-PLAIN.js - PLAIN Mechanism Tests
 */
var q = require("q"),
    tutils = require("./utils.js"),
    helpers = require("../lib/helpers.js"),
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

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
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

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test success (username callback promise)": function(test) {
            var config = {
                state:"start",
                username:function(cfg) {
                    test.strictEqual(cfg, config);
                    return q.resolve("bilbo.baggins");
                },
                password:"! 84G3nd"
            };
            var mech = PLAIN.client;

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test success (username promise)": function(test) {
            var config = {
                state:"start",
                username:q.resolve("bilbo.baggins"),
                password:"! 84G3nd"
            };
            var mech = PLAIN.client;

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
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

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test success (password callback promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:function(cfg, username) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, config.username);
                    return q.resolve("! 84G3nd");
                }
            };
            var mech = PLAIN.client;

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test success (password promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:q.resolve("! 84G3nd")
            };
            var mech = PLAIN.client;

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test success (authzid)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
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

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test success (authzid callback promise)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(cfg, username) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, config.username);
                    return q.resolve("mayor@hobbiton.lit");
                }
            };
            var mech = PLAIN.client;

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test success (authzid promise)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:q.resolve("mayor@hobbiton.lit")
            };
            var mech = PLAIN.client;

            var promise;
            var startResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");
                test.equal(out.state, "verify");

                var data = out.data;
                test.ok(data instanceof Buffer);
                test.equal(data.toString(), "mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd");

                promise = mech.stepVerify(config);
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(verifyResolved, tutils.unexpectedFail(test));
            };
            var verifyResolved = function(out) {
                test.ok(out);
                test.ok(typeof(out) === "object");

                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
        },
        "test failure (username callback error)": function(test) {
            var config = {
                state:"start",
                username:function(config) {
                    throw new Error("username callback errored");
                },
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "username callback errored");
                test.done();
            });
        },
        "test failure (password callback error)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:function(config, username) {
                    throw new Error("password callback errored");
                },
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "password callback errored");
                test.done();
            });
        },
        "test failure (authzid callback error)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config, username) {
                    throw new Error("authzid callback errored");
                }
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "authzid callback errored");
                test.done();
            });
        },
        "test failure (username callback reject)": function(test) {
            var config = {
                state:"start",
                username:function(config) {
                    return q.reject(new Error("username callback rejected"));
                },
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "username callback rejected");
                test.done();
            });
        },
        "test failure (password callback reject)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:function(config) {
                    return q.reject(new Error("password callback rejected"));
                },
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "password callback rejected");
                test.done();
            });
        },
        "test failure (authzid callback reject)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config, username) {
                    return q.reject(new Error("authzid callback rejected"));
                }
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "authzid callback rejected");
                test.done();
            });
        },
        "test failure (username promise reject)": function(test) {
            var config = {
                state:"start",
                username:q.reject(new Error("username callback rejected")),
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "username callback rejected");
                test.done();
            });
        },
        "test failure (password promise reject)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:q.reject(new Error("password callback rejected")),
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "password callback rejected");
                test.done();
            });
        },
        "test failure (authzid promise reject)": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:q.reject(new Error("authzid callback rejected"))
            };
            var mech = PLAIN.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "authzid callback rejected");
                test.done();
            });
        }
    },
    server: {
        "test success": function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (username callback value)" : function(test) {
            var config = {
                state:"start",
                username:function(config) { return "bilbo.baggins" },
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (username callback promise)" : function(test) {
            var config = {
                state:"start",
                username:function(config) {
                    return q.resolve("bilbo.baggins");
                },
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (username promise)" : function(test) {
            var config = {
                state:"start",
                username:q.resolve("bilbo.baggins"),
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
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
                password:function(config, username) {
                    test.equal(username, "bilbo.baggins");
                    return "! 84G3nd";
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
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
                password:function(config, username) {
                    test.equal(username, "bilbo.baggins");
                    return q.resolve("! 84G3nd");
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (password promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:q.resolve("! 84G3nd")
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid callback value)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config, username) {
                    test.equal(username, "bilbo.baggins");
                    return "mayor@hobbiton.lit";
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid callback promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config, username) {
                    test.equal(username, "bilbo.baggins");
                    return q.resolve("mayor@hobbiton.lit");
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (authzid promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:q.resolve("mayor@hobbiton.lit")
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (server authzid)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (server authzid callback value)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config, username) {
                    test.equal(username, "bilbo.baggins");
                    return "mayor@hobbiton.lit";
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (server authzid callback promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config, username) {
                    test.equal(username, "bilbo.baggins");
                    return q.resolve("mayor@hobbiton.lit");
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (server authzid promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:q.resolve("mayor@hobbiton.lit")
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "mayor@hobbiton.lit");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test failure (username mismatch)" : function(test) {
            var config = {
                state:"start",
                username:"frodo.baggins",
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "not authorized");
                test.done();
            });
        },
        "test failure (password mismatch)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"t43R3&84ck"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "not authorized");
                test.done();
            });
        },
        "test failure (authzid mismatch)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("thief@thorin-party.lit\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "not authorized");
                test.done();
            });
        },
        "test failure (username callback error)" : function(test) {
            var config = {
                state:"start",
                username:function(config) {
                    throw new Error("username callback errored");
                },
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "username callback errored");
                test.done();
            });
        },
        "test failure (password callback error)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:function(config) {
                    throw new Error("password callback errored");
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "password callback errored");
                test.done();
            });
        },
        "test failure (authzid callback error)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config) {
                    throw new Error("authzid callback errored");
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "authzid callback errored");
                test.done();
            });
        },
        "test failure (username callback reject)" : function(test) {
            var config = {
                state:"start",
                username:function(config) {
                    return q.reject(new Error("username callback rejected"));
                },
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "username callback rejected");
                test.done();
            });
        },
        "test failure (password callback reject)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:function(config) {
                    return q.reject(new Error("password callback rejected"));
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "password callback rejected");
                test.done();
            });
        },
        "test failure (authzid callback reject)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:function(config) {
                    return q.reject(new Error("authzid callback rejected"));
                }
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "authzid callback rejected");
                test.done();
            });
        },
        "test failure (username promise reject)" : function(test) {
            var config = {
                state:"start",
                username:q.reject(new Error("username callback rejected")),
                password:"! 84G3nd",
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "username callback rejected");
                test.done();
            });
        },
        "test failure (password promise reject)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:q.reject(new Error("password callback rejected")),
                authzid:"mayor@hobbiton.lit"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "password callback rejected");
                test.done();
            });
        },
        "test failure (authzid promise reject)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authzid:q.reject(new Error("authzid callback rejected"))
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "authzid callback rejected");
                test.done();
            });
        }
    }
}

tutils.run(module);
