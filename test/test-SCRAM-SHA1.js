/*!
 * test/test-SCRAM-SHA1.js - SCRAM-SHA1 Mechanism Tests
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
                           "c=biws,r=clientnonceservernonce,p=+5Y3mMN7N9y6xHNE5n7tGZL49eA=");

                var input = "v=/6r17onFNn3gH3ArXF0auh1aRwo=";
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

                var input = "c=biws,r=clientnonceservernonce,p=+5Y3mMN7N9y6xHNE5n7tGZL49eA=";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.data.toString("binary"),
                           "v=/6r17onFNn3gH3ArXF0auh1aRwo=");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins");
                test.done();
            }).fail(tutils.unexpectedFail(test));
        }
    }
}

tutils.run(module);
