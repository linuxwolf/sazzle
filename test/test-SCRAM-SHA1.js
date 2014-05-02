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
    SCRAM = require("../mechanisms/scram-sha1.js");

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
        },
        "test success (with authzid)" : function(test) {
            var config = {
                state:"start",
                username:"bilbo.baggins",
                password:"! 84G3nd",
                nonce:"clientnonce",
                authzid: "bilbo.baggins@hobbiton.example"
            };
            var mech = SCRAM.client;

            var promise = mech.stepStart(config);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.equal(out.data.toString("binary"),
                           "n,a=bilbo.baggins@hobbiton.example,n=bilbo.baggins,r=clientnonce");

                var input = "r=clientnonceservernonce,s=c2FsdA==,i=1024";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(function(out) {
                test.equal(out.state, "verify");
                test.equal(out.data.toString("binary"),
                           "c=bixhPWJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSw=,r=clientnonceservernonce,p=vnnC8WQXSnyNlkX5am52mxPfFdk=");

                var input = "v=65KZKX41ok12CpriU5KdPHi8l98=";
                promise = mech.stepVerify(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins@hobbiton.example");
                test.done();
            }).fail(tutils.unexpectedFail(test));
        },
        "test success (username callback)": function(test) {
            var config = {
                state:"start",
                username: function(cfg) {
                    test.strictEqual(cfg, config);
                    return "bilbo.baggins";
                },
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
        },
        "test success (username value)" : function(test) {
            var config = {
                state:"start",
                username: "bilbo.baggins",
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
        },
        "test success (username callback)" : function(test) {
            var config = {
                state:"start",
                username: function(cfg) {
                    test.strictEqual(cfg, config);
                    return "bilbo.baggins"
                },
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
        },
        "test success (username promise)" : function(test) {
            var config = {
                state:"start",
                username: function(cfg) {
                    test.strictEqual(cfg, config);
                    return q.resolve("bilbo.baggins");
                },
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
        },
        "test success (password callback)" : function(test) {
            var config = {
                state:"start",
                password: function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.equal(user, "bilbo.baggins");
                    return "! 84G3nd";
                },
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
        },
        "test success (password promise)" : function(test) {
            var config = {
                state:"start",
                password: function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.equal(user, "bilbo.baggins");
                    return q.resolve("! 84G3nd");
                },
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
        },
        "test success (nonce callback)" : function(test) {
            var config = {
                state:"start",
                password: "! 84G3nd",
                nonce: function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(user, "bilbo.baggins");
                    
                    return "servernonce";
                },
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
        },
        "test success (nonce promise)" : function(test) {
            var config = {
                state:"start",
                password: "! 84G3nd",
                nonce: function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(user, "bilbo.baggins");
                    
                    return q.resolve("servernonce");
                },
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
        },
        "test success (implicit nonce)": function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                salt:"salt",
                iterations:1024
            };
            
            var mech = SCRAM.server;
            
            var promise = mech.stepStart(config, new Buffer("n,,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.ok(out.data);
                
                var nonce = /r=clientnonce([^,]+)/.exec(out.data.toString("binary"));
                test.ok(nonce);
                test.equal(typeof(nonce[1]), "string");
                test.ok(nonce[1]);
                
                test.done();
            }).fail(tutils.unexpectedFail(test));
            
            // TODO: validate calculations?
        },
        "test success (salt callback)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(user, "bilbo.baggins");
                    
                    return "salt";
                },
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
        },
        "test success (salt promise)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(user, "bilbo.baggins");
                    
                    return q.resolve("salt");
                },
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
        },
        "test success (implicit salt)": function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                iterations:1024
            };
            
            var mech = SCRAM.server;
            
            var promise = mech.stepStart(config, new Buffer("n,,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.ok(out.data);
                
                var salt = /s=([^,]+)/.exec(out.data.toString("binary"));
                test.ok(salt);
                test.equal(typeof(salt[1]), "string");
                test.ok(salt[1]);
                
                test.done();
            }).fail(tutils.unexpectedFail(test));
            
            // TODO: validate calculations?
        },
        "test success (iterations callback)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(user, "bilbo.baggins");
                    
                    return 1024;
                }
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
        },
        "test success (iterations promise)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:function(cfg, user) {
                    test.strictEqual(cfg, config);
                    test.strictEqual(user, "bilbo.baggins");
                    
                    return q.resolve(1024);
                }
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
        },
        "test success (implicit iterations)": function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt"
            };
            
            var mech = SCRAM.server;
            
            var promise = mech.stepStart(config, new Buffer("n,,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.ok(out.data);
                
                var iters = /i=(\d+)/.exec(out.data.toString("binary"));
                test.ok(iters);
                iters = parseInt(iters[1]);
                test.ok(!isNaN(iters));
                test.ok(0 < iters);
                
                test.done();
            }).fail(tutils.unexpectedFail(test));
            
            // TODO: validate calculations?
        },
        "test success (with authorize callback)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:1024,
                authorize: function(cfg, usr, authzid) {
                    test.strictEqual(cfg, config);
                    test.equal(usr, "bilbo.baggins");
                    test.equal(authzid, "bilbo.baggins@hobbiton.example");
                    return true;
                }
            }
            var mech = SCRAM.server;

            var promise = mech.stepStart(config, new Buffer("n,a=bilbo.baggins@hobbiton.example,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.equal(out.data.toString("binary"),
                           "r=clientnonceservernonce,s=c2FsdA==,i=1024");

                var input = "c=bixhPWJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSw=,r=clientnonceservernonce,p=vnnC8WQXSnyNlkX5am52mxPfFdk=";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(function(out) {
                test.equal(out.state, "complete");
                test.equal(out.data.toString("binary"),
                           "v=65KZKX41ok12CpriU5KdPHi8l98=");
                test.equal(out.username, "bilbo.baggins");
                test.equal(out.authzid, "bilbo.baggins@hobbiton.example");
                test.done();
            }).fail(tutils.unexpectedFail(test));
        },
        "test success (client-provided user)" : function(test) {
            var config = {
                state:"start",
                password: function(cfg, usr) {
                    test.equals(usr, "bilbo.baggins");
                    
                    return "! 84G3nd";
                },
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
        },
        "test failure (want channel binding)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:1024
            }
            var mech = SCRAM.server;

            var promise = mech.stepStart(config, new Buffer("y,,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(tutils.unexpectedPass(test), function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "channel binding not supported");
                test.done();
            });
        },
        "test failure (username mismatch)" : function(test) {
            var config = {
                state:"start",
                username:"frodo.baggins",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:1024
            }
            var mech = SCRAM.server;

            var promise = mech.stepStart(config, new Buffer("n,,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(tutils.unexpectedPass(test),
                         function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "invalid username");
                test.done();
            });
        },
        "test failure (bad channel binding)" : function(test) {
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

                var input = "c=blahblah,r=clientnonceservernonce,p=+5Y3mMN7N9y6xHNE5n7tGZL49eA=";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(tutils.unexpectedPass(test),
                    function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "invalid binding");
                test.done();
            });
        },
        "test failure (bad nonce)" : function(test) {
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

                var input = "c=biws,r=wrongwrongwrongwrong,p=+5Y3mMN7N9y6xHNE5n7tGZL49eA=";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(tutils.unexpectedPass(test),
                    function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "invalid nonce");
                test.done();
            });
        },
        "test failure (bad proof)" : function(test) {
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

                var input = "c=biws,r=clientnonceservernonce,p=+5Y3mMN7Nevileviln7tGZL49eA=";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(tutils.unexpectedPass(test),
                    function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "not authorized");
                test.done();
            });
        },
        "test failure (authorize callback rejects)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:1024,
                authorize: function(cfg, usr, authzid) {
                    test.strictEqual(cfg, config);
                    test.equal(usr, "bilbo.baggins");
                    test.equal(authzid, "bilbo.baggins@hobbiton.example");
                    return false;
                }
            }
            var mech = SCRAM.server;

            var promise = mech.stepStart(config, new Buffer("n,a=bilbo.baggins@hobbiton.example,n=bilbo.baggins,r=clientnonce", "binary"));
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(out) {
                test.equal(out.state, "auth");
                test.equal(out.data.toString("binary"),
                           "r=clientnonceservernonce,s=c2FsdA==,i=1024");

                var input = "c=bixhPWJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSw=,r=clientnonceservernonce,p=vnnC8WQXSnyNlkX5am52mxPfFdk=";
                promise = mech.stepAuth(config, new Buffer(input, "binary"));
                test.ok(promise);
                test.equal(typeof(promise.then), "function");

                return promise;
            }).then(tutils.unexpectedPass(test),
                    function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "not authorized");
                test.done();
            });
        },
        "test failure (bad authorize callback)" : function(test) {
            var config = {
                state:"start",
                password:"! 84G3nd",
                nonce:"servernonce",
                salt:"salt",
                iterations:1024,
                authorize: "bilbo.baggins"
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
            }).then(tutils.unexpectedPass(test),
                    function(err) {
                test.ok(err instanceof Error);
                test.equal(err.message, "bad internal authzid");
                test.done();
            });
        }
    }
}

tutils.run(module);
