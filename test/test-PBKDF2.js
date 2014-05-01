/*!
 * test/test-PBKDF2.js - testing PBKDF2
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
    pbkdf2 = require("../lib/pbkdf2.js").pbkdf2,
    tutils = require("./utils.js");

module.exports = {
    "test implicit keylength": function(test) {
        pbkdf2("sha1")("password", "salt", 1).
                then(function(dk) {
                    dk = new Buffer(dk, "binary").toString("hex");
                    test.equal(dk, "0c60c80f961f0e71f3a9b524af6012062fe037a6");
                }).fin(function() {
                    test.done();
                });
    },
    "test failure (bad PRF)" : function(test) {
        test.throws(function() {
            pbkdf2("haha")("password", "salt", 1, 20);
        }, Error, "invalid PRF");
        test.throws(function() {
            pbkdf2(new Date())("password", "salt", 1, 20);
        }, Error, "invalid PRF");
        test.throws(function() {
            pbkdf2(null)("password", "salt", 1, 20);
        }, Error, "invalid PRF");
        test.done();
    },
    "test failure (bad iterations)" : function(test) {
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", "blah", 20);
        }, Error, "iterations must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", "1", 20);
        }, Error, "iterations must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", new Date(), 20);
        }, Error, "iterations must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", null, 20);
        }, Error, "iterations must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", 0, 20);
        }, Error, "iterations must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", -1, 20);
        }, Error, "iterations must be a positive integer");
        test.done();
    },
    "test failure (bad keylength)" : function(test) {
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", 1, "blah");
        }, Error, "key length must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", 1, "20");
        }, Error, "key length must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", 1, new Date());
        }, Error, "key length must be a positive integer");
        test.throws(function() {
            pbkdf2("sha1")("password", "salt", 1, -1);
        }, Error, "key length must be a positive integer");
        test.done();
    },
    "SHA1": {
        "test sha1/password/salt/1/20": function(test) {
            var promise = pbkdf2("sha1")("password", "salt", 1, 20);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "0c60c80f961f0e71f3a9b524af6012062fe037a6");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha1/password/salt/2/20" : function(test) {
            var promise = pbkdf2("sha1")("password", "salt", 2, 20);
            test.ok(promise);
            test.equal(typeof(promise.then), "function");
            promise.then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha1/password/salt/4096/20" : function(test) {
            var promise = pbkdf2("sha1")("password", "salt", 4096, 20);
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
            var promise = pbkdf2("sha1")("passwordPASSWORDpassword",
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
            pbkdf2("sha1")("pass\u0000word",
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
        "test sha1/pass\\0word/sa\\0lt/10000/16": function(test) {
            pbkdf2("sha1")("pass\u0000word",
                           "sa\u0000lt",
                           10000,
                           16).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "85f29aba68f6f90c23962a00d2050110");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha1/pass\\0word//4096/16": function(test) {
            pbkdf2("sha1")("pass\u0000word",
                           "",
                           4096,
                           16).
                   then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "70d2de40626ec25b534f51e4d4b651d3");
                   }).fin(function() {
                        test.done();
                   });
        },
        "test sha1//sa\\0lt/4096/16": function(test) {
            pbkdf2("sha1")("",
                           "sa\u0000lt",
                           4096,
                           16).
                   then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "215194efe96d656ce10aeb91023d97f3");
                   }).fin(function() {
                        test.done();
                   });
        }
    },
    "SHA256": {
        "test sha256/password/salt/1/32" : function(test) {
            pbkdf2("sha256")("password", "salt", 1, 32).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha256/password/salt/2/32" : function(test) {
            pbkdf2("sha256")("password", "salt", 2, 32).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha256/password/salt/4096/32" : function(test) {
            pbkdf2("sha256")("password", "salt", 4096, 32).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha256/passwordPASSWORDpassword/saltSALTsaltSALTsaltSALTsaltSALTsalt/4096/40" : function(test) {
            pbkdf2("sha256")("passwordPASSWORDpassword",
                             "saltSALTsaltSALTsaltSALTsaltSALTsalt",
                             4096,
                             40).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c4e2a1fb8dd53e1c635518c7dac47e9");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha256/pass\\0word/sa\\0lt/4096/16" : function(test) {
            pbkdf2("sha256")("pass\0word",
                             "sa\0lt",
                             4096,
                             16).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "89b69d0516f829893c696226650a8687");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha256/pass\\0word/sa\\0lt/10000/16" : function(test) {
            pbkdf2("sha256")("pass\0word",
                             "sa\0lt",
                             10000,
                             16).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "0859b685652f3e1995c34f8812e556e5");
                    }).fin(function() {
                        test.done();
                    });
        },
        "test sha256/pass\\0word//4096/16" : function(test) {
            pbkdf2("sha256")("pass\0word",
                             "",
                             4096,
                             16).
                    then(function(dk) {
                        dk = new Buffer(dk, "binary").toString("hex");
                        test.equal(dk, "656bbff8db07958b1cfe178016a04d62");
                    }).fin(function() {
                        test.done();
                    });
        }
    }
}
/**
Input:
  P = "pass\0word" (9 octets)
  S = "sa\0lt" (5 octets)
  c = 4096
  dkLen = 16

Output:
  DK = 89 b6 9d 05 16 f8 29 89
       3c 69 62 26 65 0a 86 87 (16 octets)
//*/

tutils.run(module);
