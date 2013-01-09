/*!
 * test/test-helpers.js - testing utility functions
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
    helpers = require("../lib/helpers.js"),
    tutils = require("./utils.js");

module.exports = {
    PBKDF2: {
        "test sha1/salt/password/1/20": function(test) {
            var promise = helpers.PBKDF2("sha1", "password", "salt", 1, 20);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "0c60c80f961f0e71f3a9b524af6012062fe037a6");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha1/salt/password/2/20" : function(test) {
            var promise = helpers.PBKDF2("sha1", "password", "salt", 2, 20);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha1/salt/password/4096/20" : function(test) {
            var promise = helpers.PBKDF2("sha1", "password", "salt", 4096, 20);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "4b007901b765489abead49d926f721d065a429c1");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha1/passwordPASSWORDpassword/saltSALTsaltSALTsaltSALTsaltSALTsalt/4096/25": function(test) {
            var promise = helpers.PBKDF2("sha1",
                                         "passwordPASSWORDpassword",
                                         "saltSALTsaltSALTsaltSALTsaltSALTsalt",
                                         4096,
                                         25);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "3d2eec4fe41c849b80c8d83662c0e44a8b291a964cf2f07038");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha1/pass\\0word/sa\\0lt/4096/16": function(test) {
            helpers.PBKDF2("sha1",
                           "pass\u0000word",
                           "sa\u0000lt",
                           4096,
                           16).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "56fa6aa75548099dcc37d7f03425e0c3");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test implicit keylength": function(test) {
            helpers.PBKDF2("sha1", "password", "salt", 1).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "0c60c80f961f0e71f3a9b524af6012062fe037a6");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test failure (bad PRF)" : function(test) {
            test.throws(function() {
                helpers.PBKDF2("haha", "password", "salt", 1, 20);
            }, Error, "invalid PRF");
            test.throws(function() {
                helpers.PBKDF2(new Date(), "password", "salt", 1, 20);
            }, Error, "invalid PRF");
            test.throws(function() {
                helpers.PBKDF2(null, "password", "salt", 1, 20);
            }, Error, "invalid PRF");
            test.done();
        },
        "test failure (bad iterations)" : function(test) {
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", "blah", 20);
            }, Error, "iterations must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", "1", 20);
            }, Error, "iterations must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", new Date(), 20);
            }, Error, "iterations must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", null, 20);
            }, Error, "iterations must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", 0, 20);
            }, Error, "iterations must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", -1, 20);
            }, Error, "iterations must be a positive integer");
            test.done();
        },
        "test failure (bad iterations)" : function(test) {
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", 1, "blah");
            }, Error, "key length must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", 1, "20");
            }, Error, "key length must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", 1, new Date());
            }, Error, "key length must be a positive integer");
            test.throws(function() {
                helpers.PBKDF2("sha1", "password", "salt", 1, -1);
            }, Error, "key length must be a positive integer");
            test.done();
        }
    }
}

tutils.run(module);
