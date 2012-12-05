/*!
 * sasl/index.js - Main Implementation
 *
 * Pure JavaScript implementation of SASL framework for node.js
 */

var session = require("./lib/session.js"),
    factory = require("./lib/factory.js");

// setup client factory
exports.SASLClientFactory = factory.SASLClientFactory;
exports.client = new factory.SASLClientFactory();

// setup server factory
exports.SASLServerFactory = factory.SASLServerFactory;
exports.server = new factory.SASLServerFactory();

// setup factory defaults
var mechs = [
    require("./plain.js")
];

mechs.forEach(function(m) {
    exports.client.register(m.client);
    exports.server.register(m.server);
});