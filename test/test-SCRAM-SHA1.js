/*!
 * test/test-SCRAM-SHA1.js - SCRAM-SHA1 Mechanism Tests
 */

var q = require("q"),
    tutils = require("./utils.js"),
    helpers = require("../lib/helpers.js"),
    SCRAM = require("../scram-sha1.js");

module.exports = {
    client: {
        "test success" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                nonce:"clientnonce"
            };
            var mech = SCRAM.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.equal(out.data.toString("binary"),
                           "n,,n=bilbo.baggins,r=clientnonce");

                var input = "r=clientnonceservernonce,s=c2FsdA==,i=1024";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(function(out) {
                test.equal(out.state, "verify");
                test.equal(out.data.toString("binary"),
                           "c=biws,r=clientnonceservernonce,p=CXUyegiV1Xv5HemuieIK4WVdgSg=");

                var input = "v=OAYXtZgHU0CsIwEUMg9VrhnX+xg=";
                promise = mech.stepVerify(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }).fail(tutils.unexpectedFail(test));
        }
    },
    server: {
        "test success" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:1024
            }
            var mech = SCRAM.server;

            var promise = mech.stepStart(config, new Buffer("n,,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.equal(out.data.toString("binary"),
                           "r=clientnonceservernonce,s=c2FsdA==,i=1024");

                var input = "c=biws,r=clientnonceservernonce,p=CXUyegiV1Xv5HemuieIK4WVdgSg=";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.data.toString("binary"),
                           "v=OAYXtZgHU0CsIwEUMg9VrhnX+xg=");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }).fail(tutils.unexpectedFail(test));
        }
    }
}

tutils.run(module);
