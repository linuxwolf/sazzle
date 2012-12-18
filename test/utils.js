/*!
 * test/utils.js - Testing-specific Utility Functions
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
