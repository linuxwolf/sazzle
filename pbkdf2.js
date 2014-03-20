/*!
 * pbkdf2.js - Algorithm-agile implementation of PBKDF2
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
var crypto = require("crypto"),
    q = require("q"),
    helpers = require("./lib/helpers.js");

var PRF_LENGTHS = {
    "SHA1" : 20,
    "SHA224" : 28,
    "SHA256" : 32,
    "SHA384" : 48,
    "SHA512" : 64
}
var __INT = function(value) {
    var output = new Array(4);
    output[0] = String.fromCharCode((value >>> 24) & 0xff);
    output[1] = String.fromCharCode((value >>> 16) & 0xff);
    output[2] = String.fromCharCode((value >>> 8) & 0xff);
    output[3] = String.fromCharCode(value & 0xff);

    return output.join("");
}
var BATCH_ITERATIONS = 8192;
var PBKDF2 = {};

exports.pbkdf2 = function(prf) {
    // normalize prf
    prf = String(prf).toUpperCase().replace(/\-/g, "");

    // quick succeed
    var fn = PBKDF2[prf];
    if (fn) {
        return fn;
    }

    // validate PRF
    var hLen = PRF_LENGTHS[prf];
    if (!hLen) {
        throw new Error("invalid PRF");
    }

    fn = PBKDF2[prf] = (function(password, salt, iters, keylen) {
        if (typeof(iters) !== "number" || iters < 1) {
            throw new Error("iterations must be a positive integer");
        }
        if (!keylen) {
            keylen = hLen;
        } else if (typeof(keylen) !== "number" || keylen < 1) {
            throw new Error("key length must be a positive integer");
        }

        password = password || "";
        salt = salt || "";

        var deferred = q.defer();
        var maxBlocks = Math.ceil(keylen / hLen);
        var blocks = [];
        var calcBlock = function(bdata) {
            if (bdata) {
                blocks.push(bdata);
            }
            if (blocks.length === maxBlocks) {
                var result = blocks.join("").substring(0, keylen);
                deferred.resolve(result);
                return;
            }

            var U = "",
                cidx = 0,
                cdeferred = q.defer();
            var calcIterations = function(hash) {
                var limit = Math.min(iters - cidx, BATCH_ITERATIONS);
                for (var count = 0;count < limit; count++) {
                    hash = crypto.createHmac(prf, password).
                                  update(hash).
                                  digest("binary");
                    U = helpers.XOR(U, hash);
                }
                cidx += count;

                if (cidx === iters) {
                    cdeferred.resolve(U.toString("binary"));
                    return;
                }

                return q.resolve(hash).then(calcIterations);
            }
            calcIterations(salt + __INT(blocks.length + 1));

            return cdeferred.promise.then(calcBlock);
        }

        calcBlock();

        return deferred.promise;
    });
    
    return fn;
}
