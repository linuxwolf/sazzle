/*!
 * test/utils.js - Testing-specific Utility Functions
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

exports.unexpectedPass = function(test) {
    return (function() {
        test.fail("unexpected success");
        test.done();
    });
};
exports.unexpectedFail = function(test) {
    return (function(err) {
        test.fail(err && err.message);
        test.done();
    });
};


 exports.run = function(context) {
    if (require.main !== context) {
        return;
    }

    var reporter = require("nodeunit").reporters.default;
    var tests = [
        require("path").relative(process.cwd(), context.filename)
    ];
    console.log("%j", tests);
    reporter.run(tests);
 }
