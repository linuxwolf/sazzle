/*!
 * test/test-PLAIN.js - PLAIN Mechanism Tests
 *
 * Copyright (c) 2013 Matthew A. Miller
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
var q = require("q"),
    tutils = require("./utils.js"),
    helpers = require("../lib/helpers.js"),
    PBKDF2 = require("../lib/pbkdf2.js"),
    PLAIN = require("../mechanisms/plain.js");

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
        },
        "test failure (non-empty success)": function(test) {
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

                promise = mech.stepVerify(config,
                                          new Buffer("success"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");
                promise.then(function(out) {
                    test.fail("unexpected success");
                    test.done();
                }, verifyFailed);
            };
            var verifyFailed = function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "unexpected data");
                test.done();
            };

            promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(startResolved, tutils.unexpectedFail(test));
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
        "test success (empty username)" : function(test) {
            var config = {
                state:"start",
                username:"",
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000\u0000! 84G3nd"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "");
                test.equal(out.authzid, "");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (empty password)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:""
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000bilbo.baggins\u0000"));
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
        "test success (empty everything)" : function(test) {
            var config = {
                state:"start",
                username:"",
                password:""
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("\u0000\u0000"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "");
                test.equal(out.authzid, "");
                test.done();
            }, function(err) {
                test.fail(err && err.message);
                test.done();
            });
        },
        "test success (non-plaintext compare defaults)" : function(test) {
            var derivedKey = new Buffer("/D5YiMsQK+NdpXy819AMALqDxu8=", "base64").
                             toString("binary");
        
            var config = {
                state:"start",
                username:"bilbo.baggins",
                derivedKey:function(config, username, prf, salt, iterations) {
                    test.equal(username, "bilbo.baggins");
                    test.equal(prf, helpers.DEFAULT_PRF);
                    test.equal(salt, helpers.DEFAULT_SALT);
                    test.equal(iterations, helpers.DEFAULT_ITERATIONS);
                    
                    return derivedKey;
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
        "test success (non-plaintext compare specifics)" : function(test) {
            var derivedKey = new Buffer("U661kKoun6gLWu+sXb1u2ss+nRR49l4NPNQ75tBndsY=", "base64").
                             toString("binary");
        
            var config = {
                state:"start",
                username:"bilbo.baggins",
                prf:"sha256",
                salt:new Buffer("Uqn4YwFF4lTkYRwJ/o/viLU5mYUm2TMF", "base64").
                     toString("binary"),
                iterations:8192,
                derivedKey:function(config, username, prf, salt, iterations) {
                    test.equal(username, "bilbo.baggins");
                    test.equal(prf, config.prf);
                    test.equal(salt, config.salt);
                    test.equal(iterations, config.iterations);
                    
                    return derivedKey;
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
        "test success (authorize callback boolean)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authorize:function(cfg, username, authzid) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, "bilbo.baggins");
                    test.strictEqual(authzid, "mayor@hobbiton.lit");

                    return true;
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
        "test success (authorize callback promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authorize:function(cfg, username, authzid) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(username, "bilbo.baggins");
                    test.strictEqual(authzid, "mayor@hobbiton.lit");

                    return q.resolve(true);
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
        "test success (authorize promise)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authorize:q.resolve(true)
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
        "test success (client-provided username)": function(test) {
            var config = {
                state:"start",
                password: function(cfg, usr) {
                    test.equal(usr, "bilbo.baggins");
                    
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
        "test success (server first)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                serverFirst:true
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer(""));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "start");
                test.equal(out.data.toString("binary"), "");
            });
            
            promise = mech.stepStart(config,
                                     new Buffer("\u0000bilbo.baggins\u0000! 84G3nd"));
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
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer("mayor@hobbiton.lit\u0000bilbo.baggins\u0000! 84G3nd"));
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
        "test failure (authorize callback error)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authorize:function(cfg, username, authzid) {
                    throw new Error("authorize callback errored");
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
                test.equal(err.message, "authorize callback errored");
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
        "test failure (authorize callback reject)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authorize:function(cfg, username, authzid) {
                    return q.reject(new Error("authorize callback rejected"));
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
                test.equal(err.message, "authorize callback rejected");
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
        "test failure (authorize promise reject)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                authorize:q.reject(new Error("authorize callback rejected"))
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
                test.equal(err.message, "authorize callback rejected");
                test.done();
            });
        },
        "test failure (empty request)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            var mech = PLAIN.server;

            var promise = mech.stepStart(config,
                                         new Buffer(""));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.fail("unexpected success");
                test.done();
            }, function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "client data required");
                test.done();
            });
        }
    }
}

tutils.run(module);
