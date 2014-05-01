/*!
 * test/test-factory.js - SASL Factory Tests
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
    helpers = require("../lib/helpers.js");

module.exports = {
    "test MakeArray": function(test) {
        var input, result;
        
        result = helpers.makeArray();
        test.equal(result, null);
        
        input = null;
        result = helpers.makeArray(input);
        test.equal(result, null);
        
        input = 1;
        result = helpers.makeArray(input);
        test.deepEqual(result, [input]);
        
        input = [1, "two", 3.0];
        result = helpers.makeArray(input);
        test.deepEqual(result, input);
        
        test.done();
    },
    "test clone": function(test) {
        var input, result;
        
        result = helpers.clone();
        test.equal(result, null);
        
        input = null;
        result = helpers.clone(input);
        test.equal(result, null);
        
        input = "value";
        result = helpers.clone(input);
        test.equal(result, input);
        
        input = 42;
        result = helpers.clone(input);
        test.equal(result, input);
        
        input = true;
        result = helpers.clone(input);
        test.equal(result, input);
        
        input = [1, "two", 3.0];
        result = helpers.clone(input);
        test.deepEqual(result, input);
        
        input = new Date();
        result = helpers.clone(input);
        test.deepEqual(result, input);
        
        input = /some test/;
        result = helpers.clone(input);
        test.ok(result instanceof RegExp);
        test.deepEqual(result, input);
        
        input = /some test/i;
        result = helpers.clone(input);
        test.ok(result instanceof RegExp);
        test.deepEqual(result, input);
        
        input = /some test/g;
        result = helpers.clone(input);
        test.ok(result instanceof RegExp);
        test.deepEqual(result, input);
        
        input = /some test/m;
        result = helpers.clone(input);
        test.ok(result instanceof RegExp);
        test.deepEqual(result, input);
        
        input = /some test/gim;
        result = helpers.clone(input);
        test.ok(result instanceof RegExp);
        test.deepEqual(result, input);
        
        input = /some test/m;
        input.lastIndex = 10;
        result = helpers.clone(input);
        test.ok(result instanceof RegExp);
        test.deepEqual(result, input);

        test.done();
    },
    "test extend": function(test) {
        var input, orig, expected, result;
        
        result = helpers.extend();
        test.deepEqual(result, {});
        
        input = { "a":1, "b":2.0, "c":"three" };
        result = helpers.extend(null, input);
        test.deepEqual(result, input);
        
        orig = {
            "a":1,
            "b":2.0,
            "c":"three"
        };
        input = {
            "a":undefined,
            "b":"two",
            "d":4.0
        };
        result = helpers.extend(orig, input);
        expected = {
            "b":"two",
            "c":"three",
            "d":4.0
        };
        test.deepEqual(result, expected);
        
        test.done();
    },
    "test XOR": function(test) {
        var s1, s2, result, expected;
        
        s1 = new Buffer("aaaaaaaa", "hex");
        s2 = new Buffer("f0f0f0f0", "hex");
        result = helpers.XOR(s1, s2);
        test.equal(result.toString("hex"), "5a5a5a5a");
        
        s1 = new Buffer("aaaaaaaa", "hex").toString("binary");
        s2 = new Buffer("f0f0f0f0", "hex").toString("binary");
        result = helpers.XOR(s1, s2);
        test.equal(result.toString("hex"), "5a5a5a5a");
        
        s1 = new Buffer("aaaaaaaa", "hex");
        s2 = new Buffer("f0f0f0f0", "hex").toString("binary");
        result = helpers.XOR(s1, s2);
        test.equal(result.toString("hex"), "5a5a5a5a");
        
        s1 = new Buffer("aaaaaaaa", "hex").toString("binary");
        s2 = new Buffer("f0f0f0f0", "hex");
        result = helpers.XOR(s1, s2);
        test.equal(result.toString("hex"), "5a5a5a5a");
        
        test.done();
    },
    "test XOR (bad input)": function(test) {
        test.throws(function() {
            var s1, s2;
            s1 = new Date();
            s2 = "abcd";
            var result = helpers.XOR(s1, s2);
        }, Error);

        test.throws(function() {
            var s1, s2;
            s1 = "efgh";
            s2 = new Date();
            var result = helpers.XOR(s1, s2);
        }, Error);

        test.done();
    }
}

