/*!
 * test/utils.js - Testing-specific Utility Functions
 */

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