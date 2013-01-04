/*!
 * test/index.js - Full Test Suite
 */

module.exports = {
    "session" : require("./test-session.js"),
    "factory" : require("./test-factory.js"),
    "PLAIN mechanism" : require("./test-PLAIN.js"),
    "SCRAM-SHA1 mechanism" : require("./test-SCRAM-SHA1.js")
}
