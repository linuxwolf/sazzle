/*!
 * test/test-SCRAM-SHA1.js - SCRAM-SHA1 Mechanism Tests
 */

var promised_io = require("promised-io"),
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
            var failed = false;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.equal(out.data.toString("binary"),
                           "n,,n=bilbo.baggins,r=clientnonce");
            }, function(err) {
                test.fail(err && err.message);
                failed = true;
            });
            if (failed) { test.done(); return; }

            var input = "r=clientnonceservernonce,s=c2FsdA==,i=1024";
            promise = mech.stepAuth(config, new Buffer(input, "binary"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "verify");
                test.equal(out.data.toString("binary"),
                           "c=biws,r=clientnonceservernonce,p=CXUyegiV1Xv5HemuieIK4WVdgSg=");
            }, function(err) {
                test.fail(err && err.message);
                failed = true;
            });
            if (failed) { test.done(); return; }

            input = "v=OAYXtZgHU0CsIwEUMg9VrhnX+xg=";
            promise = mech.stepVerify(config, new Buffer(input, "binary"));
            test.ok(promise);
            test.ok(typeof(promise.then) === "function");
            promise.then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
            }, function(err) {
                test.fail(err && err.message);
                failed = true;
            });

            test.done();
        }
    }
}

require("./utils.js").run(module);
