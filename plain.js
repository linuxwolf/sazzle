/*!
 * plain.js - implementation of PLAIN mechanism
 */
var promised_io = require("promised-io");

var _promisedValue = function(config, prop, username) {
    var val = config[prop];
    if (typeof(val) === "function") {
        val = val(config, username);
    }
    return promised_io.whenPromise(val);
}

/**
 * client config properties:
 * - username : string || function(config) { return string || promise }
 *   + if missing, CONTINUE
 * - password : string || function(config, username) { return string || promise }
 *   + if missing, CONTINUE
 * - authzid : string || function(config, username) { return string || promise }
 *   + if missing, CONTINUE
 */

exports.client = {
    start: function(config) {
        var deferred = new promised_io.Deferred();

        _promisedValue(config, "username").then(function(usr) {
            var pwd = _promisedValue(config, "password", usr);
            var authz = _promisedValue(config, "authzid", usr);

            return promised_io.all(promised_io.whenPromise(usr),
                                   pwd,
                                   authz);
        }).then(function(factors) {
                    deferred.resolve(factors.join("\u0000"));
                },
                function(err) {
                    deferred.reject(err);
                });
        return deferred.promise;
    }
};

/**
 * server config properties:
 * - username : string || function(config) { return string || promise }
 *   + if missing, CONTINUE
 *   + if present, input value MUST match (or FAIL)
 * - password : string || function(config, username) { return string || promise }
 *   + if missing, CONTINUE
 *   + if present, input value MUST match (or FAIL)
 * - authzid  : string || function(config, username) { return string || promise }
 *   + if missing, SUCCEED
 *   + if present, check input value
 *                 + if missing, SUCCEED with config value
 *                 + if present, MUST match config value (or FAIL) 
 */

exports.server = {
    start: function(config, input) {
        if (!input) {
            return promised_io.when(null);
        }

        input = input.toString("binary").split("\u0000");
        var authz = input[0] || "",
            usr = input[1] || "",
            pwd = input[2] || "";
    }
}