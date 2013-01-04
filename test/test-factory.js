/*!
 * test/test-factory.js - SASL Factory Tests
 */

var q = require("q"),
    tutils = require("./utils.js"),
    SASLSession = require("../lib/session.js").SASLSession,
    SASLClientFactory = require("../lib/factory.js").SASLClientFactory,
    SASLServerFactory = require("../lib/factory.js").SASLServerFactory;

module.exports = {
    "client factory" : {
        "test construction" : function(test) {
            var factory = new SASLClientFactory();

            test.deepEqual(factory.enabled, []);
            test.deepEqual(factory.available, {});
            test.done();
        },
        "test register() success (without enable)" : function(test) {
            var testMech = function(actual, expected) {
                if (actual && !expected) {
                    test.fail("found unexpected mechanism '" + actual.name + "'");
                    return;
                }
                if (!actual && expected) {
                    test.fail("missing expected mechanism '" + expected.name + "'");
                    return;
                }
                test.ok(actual !== expected);
                test.equal(actual.name, expected.name);
                test.ok(typeof(actual.init), "function");
                expected.init && test.strictEqual(actual.init, expected.init);
                Object.keys(actual).
                       forEach(function(f) {
                            if (f === "name") { return; }
                            if (f === "init") { return; }

                            test.strictEqual(actual[f],
                                             expected[f]);
                       });
            };
            var testAvailable = function(actual, expected) {
                var actMechs = Object.keys(actual);
                test.deepEqual(actMechs, Object.keys(expected));
                actMechs.forEach(function(m) {
                    var mact = actual[m],
                        mexp = expected[m];
                    testMech(mact, mexp);
                })
            };

            var factory = new SASLClientFactory();
            var mech1 = {
                name : "MOCK-1",
                stepStart: function(config, input) {
                    return q.resolve({
                        state:"complete"
                    })
                }
            };
            factory.register(mech1);
            testAvailable(factory.available, {
                "MOCK-1":mech1
            });
            test.deepEqual(factory.enabled, []);

            var mech2 = {
                name: "MOCK-2",
                init: function(config) {
                    return true;
                },
                stepStart: function(config, input) {
                    return q.resolve({
                        state:"complete"
                    });
                }
            };
            factory.register(mech2);
            testAvailable(factory.available, {
                "MOCK-1":mech1,
                "MOCK-2":mech2
            });
            test.deepEqual(factory.enabled, []);

            var mech1A = {
                name:"MOCK-1",
                init: function() {
                    return true;
                },
                stepStart: function(config, input) {
                    return q.resolve({
                        state:"complete"
                    });
                }
            };
            factory.register(mech1A);
            testAvailable(factory.available, {
                "MOCK-1":mech1A,
                "MOCK-2":mech2
            });
            test.deepEqual(factory.enabled, []);

            test.done();
        },
        "test register() success (with enable)": function(test) {
            var testMech = function(actual, expected) {
                if (actual && !expected) {
                    test.fail("found unexpected mechanism '" + actual.name + "'");
                    return;
                }
                if (!actual && expected) {
                    test.fail("missing expected mechanism '" + expected.name + "'");
                    return;
                }
                test.ok(actual !== expected);
                test.equal(actual.name, expected.name);
                test.ok(typeof(actual.init), "function");
                expected.init && test.strictEqual(actual.init, expected.init);
                Object.keys(actual).
                       forEach(function(f) {
                            if (f === "name") { return; }
                            if (f === "init") { return; }

                            test.strictEqual(actual[f],
                                             expected[f]);
                       });
            };
            var testAvailable = function(actual, expected) {
                var actMechs = Object.keys(actual);
                test.deepEqual(actMechs, Object.keys(expected));
                actMechs.forEach(function(m) {
                    var mact = actual[m],
                        mexp = expected[m];
                    testMech(mact, mexp);
                })
            };

            var factory = new SASLClientFactory();
            var mech1 = {
                name : "MOCK-1",
                stepStart: function(config, input) {
                    return q.resolve({
                        state:"complete"
                    })
                }
            };
            factory.register(mech1, false);
            testAvailable(factory.available, {
                "MOCK-1":mech1
            });
            test.deepEqual(factory.enabled, []);

            var mech2 = {
                name: "MOCK-2",
                init: function(config) {
                    return true;
                },
                stepStart: function(config, input) {
                    return q.resolve({
                        state:"complete"
                    });
                }
            };
            factory.register(mech2, true);
            testAvailable(factory.available, {
                "MOCK-1":mech1,
                "MOCK-2":mech2
            });
            test.deepEqual(factory.enabled, ["MOCK-2"]);

            var mech1A = {
                name:"MOCK-1",
                init: function() {
                    return true;
                },
                stepStart: function(config, input) {
                    return q.resolve({
                        state:"complete"
                    });
                }
            };
            factory.register(mech1A, true);
            testAvailable(factory.available, {
                "MOCK-1":mech1A,
                "MOCK-2":mech2
            });
            test.deepEqual(factory.enabled, ["MOCK-1", "MOCK-2"]);

            test.done();
        },
        "test register() failed (bad mech)": function(test) {
            var factory = new SASLClientFactory();

            test.throws(function() {
                var session = factory.register(null);
            }, Error, "mech must be an object");
            test.throws(function() {
                var session = factory.register("mech");
            }, Error, "mech must be an object");
            test.throws(function() {
                var session = factory.register(42);
            }, Error, "mech must be an object");

            test.done();
        },
        "test register() failed (mech missing name)": function(test) {
            var factory = new SASLClientFactory();
            var mech = {
                stepStart: function(config) {
                    return q.resolve({
                        state:"complete"
                    });
                }
            };

            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.name must be a non-empty string");

            mech.name = 42;
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.name must be a non-empty string");

            mech.name = true;
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.name must be a non-empty string");

            test.done();
        },
        "test register() failed (mech missing stepStart)": function(test) {
            var factory = new SASLClientFactory();
            var mech = {
                name:"BAD",
                stepComplete: function(config) {
                    return q.resolve({
                        state:"complete"
                    });
                }
            };

            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.stepStart must be a function");

            mech.stepStart = "start it!";
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.stepStart must be a function");

            mech.stepStart = 42;
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.stepStart must be a function");

            mech.stepStart = true;
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.stepStart must be a function");

            test.done();
        },
        "test register() failed (mech bad init)": function(test) {
            var factory = new SASLClientFactory();
            var mech = {
                name:"BAD",
                stepStart: function(config) {
                    return q.resolve({
                        state:"complete"
                    });
                }
            };

            mech.init = "init it!";
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.init must be a function");

            mech.init = 42;
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.init must be a function");

            mech.init = true;
            test.throws(function() {
                var session = factory.register(mech);
            }, Error, "mech.init must be a function");

            test.done();
        },
        "test create() success" : function(test) {
            var factory = new SASLClientFactory();
            var config;
            var mech1 = {
                name:"MOCK-1",
                init: function(cfg) {
                    test.ok(cfg !== config);
                    var props = Object.keys(cfg);
                    test.deepEqual(props, Object.keys(config));
                    props.forEach(function(p) {
                        test.strictEqual(cfg[p], config[p]);
                    });

                    return true;
                },
                stepStart: function(config, input) {
                }
            };
            factory.register(mech1, true);

            config = {};
            var session = factory.create(["MOCK-1"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            config = {
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            session = factory.create(["MOCK-1"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            test.done();
        },
        "test create() success (multiple enabled)" : function(test) {
            var factory = new SASLClientFactory();
            var config;
            var mech2 = {
                name:"MOCK-2",
                init: function(cfg) {
                    test.ok(cfg !== config);
                    var props = Object.keys(cfg);
                    test.deepEqual(props, Object.keys(config));
                    props.forEach(function(p) {
                        test.strictEqual(cfg[p], config[p]);
                    });

                    return true;
                },
                stepStart: function(config, input) {
                }
            };
            factory.register(mech2, true);
            var mech1 = {
                name:"MOCK-1",
                init: function(cfg) {
                    test.ok(cfg !== config);
                    var props = Object.keys(cfg);
                    test.deepEqual(props, Object.keys(config));
                    props.forEach(function(p) {
                        test.strictEqual(cfg[p], config[p]);
                    });

                    return true;
                },
                stepStart: function(config, input) {
                }
            };
            factory.register(mech1, true);

            config = {};
            var session = factory.create(["MOCK-1"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            config = {
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            session = factory.create(["MOCK-1"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            config = {
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            session = factory.create(["MOCK-2"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-2");
            test.ok(!session.completed);

            test.done();
        },
        "test create() success (multiple offered)" : function(test) {
            var factory = new SASLClientFactory();
            var config;
            var mech1 = {
                name:"MOCK-1",
                init: function(cfg) {
                    test.ok(cfg !== config);
                    var props = Object.keys(cfg);
                    test.deepEqual(props, Object.keys(config));
                    props.forEach(function(p) {
                        test.strictEqual(cfg[p], config[p]);
                    });

                    return true;
                },
                stepStart: function(config, input) {
                }
            };
            factory.register(mech1, true);

            config = {};
            var session = factory.create(["MOCK-1", "MOCK-2"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            config = {
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            session = factory.create(["MOCK-1", "MOCK-2"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            config = {};
            var session = factory.create(["MOCK-2", "MOCK-1"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            config = {
                username:"bilbo.baggins",
                password:"! 84G3nd"
            };
            session = factory.create(["MOCK-2", "MOCK-1"], config);
            test.ok(session instanceof SASLSession);
            test.equal(session.mechanism, "MOCK-1");
            test.ok(!session.completed);

            test.done();
        }
    },
    "server factory" : {

    }
}

// run tests directly from node (if main)
tutils.run(module);
