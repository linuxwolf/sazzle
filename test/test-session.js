/*!
 * test/test-session.js - SASL Session Tests
 *
 * Copyright (c) 2013-2014 Matthew A. Miller
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
    SASLSession = require("../lib/session.js").SASLSession;

module.exports = {
    "test create" : function(test) {
        var mech = {
            "name": "mech",
            "stepStart" : function(config) {
                return q.resolve({
                    state: "complete",
                    data: new Buffer("client initial")
                });
            }
        };
        var config,
            session;

        config = {};
        session = new SASLSession(mech, config);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        config = { state:"complete" };
        session = new SASLSession(mech, config);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        config = {
            username:"bilbo.baggins",
            password:"! 84G3nd"
        };
        session = new SASLSession(mech, config);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        session = new SASLSession(mech);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        test.done();
    },
    "test create (by function)" : function(test) {
        var mech = {
            "name": "mech",
            "stepStart" : function(config) {
                return q.resolve({
                    state: "complete",
                    data: new Buffer("client initial")
                });
            }
        };
        var config,
            session;

        config = {};
        session = SASLSession(mech, config);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        config = { state:"complete" };
        session = new SASLSession(mech, config);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        config = {
            username:"bilbo.baggins",
            password:"! 84G3nd"
        };
        session = new SASLSession(mech, config);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        session = new SASLSession(mech);
        test.equal(session.mechanism, mech.name);
        test.ok(session.properties);
        test.ok(typeof(session.properties) === "object");
        test.ok(!session.completed);

        test.done();
    },
    "test step single-stage success": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state:"complete",
                    data:new Buffer("client initial")
                });
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
    "test step single-stage success (config data)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state:"complete",
                    data: new Buffer("client initial:" +
                                     config.username + ":" +
                                     config.password),
                    username: "bilbo.baggins"
                });
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
    "test step single-stage success (mech returns directly)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return {
                    state:"complete",
                    data: new Buffer("client initial:" +
                                     config.username + ":" +
                                     config.password),
                    username: "bilbo.baggins"
                };
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
    "test step single-stage success (config updated)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);
                
                config.state = "complete";
                return q.resolve({
                    data: new Buffer("client initial:" +
                                     config.username + ":" +
                                     config.password)
                });
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
    "test step single-stage failure (from mech)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.reject(new Error("mechanism failure"));
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.fail();
            test.done();
        }, function(err) {
            test.ok(err instanceof Error);
            test.equal(err.message, "mechanism failure");
            test.ok(session.completed);
            test.done();
        });
    },
    "test step single-stage failure (from mech directly)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return new Error("mechanism failure");
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.fail();
            test.done();
        }, function(err) {
            test.ok(err instanceof Error);
            test.equal(err.message, "mechanism failure");
            test.ok(session.completed);
            test.done();
        });
    },
    "test step single-stage failure (thrown from mech)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                throw new Error("mechanism failure");
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(function(output) {
            test.fail();
            test.done();
        }, function(err) {
            test.ok(err instanceof Error);
            test.equal(err.message, "mechanism failure");
            test.ok(session.completed);
            test.done();
        });
    },
    "test step single-stage failure (invalid state)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state: "complete",
                    data: new Buffer("client initial")
                });
            }
        };
        config = {};
        session = new SASLSession(mech, config);

        var promise;
        var startResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(session.completed);

            var promise = session.step();
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(tutils.unexpectedPass(test), completeRejected);
        };
        var completeRejected = function(err) {
            test.ok(err instanceof Error);
            test.equal(err.message, "invalid state");
            test.ok(session.completed);
            test.done();
        };

        promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(startResolved,
                     tutils.unexpectedFail(test));
    },
    "test step single-stage failure (invalid input)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state: "complete",
                    data: new Buffer("client initial")
                });
            }
        };
        config = {};
        session = new SASLSession(mech, config);

        var promise;
        var startResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(session.completed);

            try {
                var promise = session.step({});
                test.fail("unexpected success");
            } catch (err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "invalid input");
            }
            test.done();
        };
        var completeRejected = function(err) {
            test.ok(err instanceof Error);
            test.equal(err.message, "invalid state");
            test.ok(session.completed);
            test.done();
        };

        promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(startResolved,
                     tutils.unexpectedFail(test));
    },
    "test step multi-stage success": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state: "next",
                    data: new Buffer("client initial")
                });
            },
            stepNext: function(config, input) {
                test.ok(config);
                test.equal(config.state, "next");
                test.ok(input instanceof Buffer);
                test.equal(input.toString(), "server initial");

                return q.resolve({
                    state: "complete",
                    data: new Buffer("client next")
                });
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise;

        var startResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(!session.completed);

            promise = session.step(new Buffer("server initial"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(nextResolved, tutils.unexpectedFail(test));
        };
        var nextResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client next");
            test.ok(session.completed);
            test.done();
        };
        promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(startResolved, tutils.unexpectedFail(test));
    },
    "test step multi-stage success (string input 'binary')": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state: "next",
                    data: new Buffer("client initial")
                });
            },
            stepNext: function(config, input) {
                test.ok(config);
                test.equal(config.state, "next");
                test.ok(input instanceof Buffer);
                test.equal(input.toString(), "server initial");

                return q.resolve({
                    state: "complete",
                    data: new Buffer("client next")
                });
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise;

        var startResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(!session.completed);

            promise = session.step("server initial", "binary");
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(nextResolved, tutils.unexpectedFail(test));
        };
        var nextResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client next");
            test.ok(session.completed);
            test.done();
        };

        promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(startResolved, tutils.unexpectedFail(test));
    },
    "test step multi-stage success (string input base64)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state: "next",
                    data: new Buffer("client initial")
                });
            },
            stepNext: function(config, input) {
                test.ok(config);
                test.equal(config.state, "next");
                test.ok(input instanceof Buffer);
                test.equal(input.toString(), "server initial");

                return q.resolve({
                    state: "complete",
                    data: new Buffer("client next")
                });
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise;

        var startResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(!session.completed);

            promise = session.step("c2VydmVyIGluaXRpYWw=", "base64");
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(nextResolved, tutils.unexpectedFail(test));
        };
        var nextResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client next");
            test.ok(session.completed);
            test.done();
        };

        promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(startResolved, tutils.unexpectedFail(test));
    },
    "test step multi-stage success (string input hex)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state: "next",
                    data: new Buffer("client initial")
                });
            },
            stepNext: function(config, input) {
                test.ok(config);
                test.equal(config.state, "next");
                test.ok(input instanceof Buffer);
                test.equal(input.toString(), "server initial");

                return q.resolve({
                    state: "complete",
                    data: new Buffer("client next")
                });
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise;

        var startResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(!session.completed);

            promise = session.step("73657276657220696e697469616c", "hex");
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(nextResolved, tutils.unexpectedFail(test));
        };
        var nextResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client next");
            test.ok(session.completed);
            test.done();
        };

        promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(startResolved, tutils.unexpectedFail(test));
    },
    "test step multi-stage success (string input implicit)": function(test) {
        var config,
            session;
        var mech = {
            name : "MOCK-MECH",
            stepStart: function(config, input) {
                test.ok(config);
                test.equal(config.state, "start");
                test.ok(!input);

                return q.resolve({
                    state: "next",
                    data: new Buffer("client initial")
                });
            },
            stepNext: function(config, input) {
                test.ok(config);
                test.equal(config.state, "next");
                test.ok(input instanceof Buffer);
                test.equal(input.toString(), "server initial");

                return q.resolve({
                    state: "complete",
                    data: new Buffer("client next")
                });
            }
        };
        config = {};
        session = new SASLSession(mech, config);
        var promise;

        var startResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client initial");
            test.ok(!session.completed);

            // assume base64
            promise = session.step("c2VydmVyIGluaXRpYWw=");
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(nextResolved, tutils.unexpectedFail(test));
        };
        var nextResolved = function(output) {
            test.ok(output instanceof Buffer);
            test.equal(output.toString(), "client next");
            test.ok(session.completed);
            test.done();
        };

        promise = session.step();
        test.ok(promise);
        test.equal(typeof(promise.then), "function");
        promise.then(startResolved, tutils.unexpectedFail(test));
    }
}

// run test directly from node (if main)
tutils.run(module);
