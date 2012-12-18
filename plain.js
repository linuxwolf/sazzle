/*!
 * plain.js - implementation of PLAIN mechanism
 */
var q = require("q"),
    helpers = require("./lib/helpers.js");

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
    name: "PLAIN",
    stepStart: function(config) {
        var deferred = q.defer();

        return helpers.promisedValue(config, "username").
                then(function(usr) {
                    return q.all([
                        helpers.promisedValue(config, "authzid", usr),
                        q.resolve(usr),
                        helpers.promisedValue(config, "password", usr)
                    ]);
                }).
                then(function(factors) {
                        config.authPlain = {
                            username: factors[1],
                            authzid:  factors[0] || factors[1]
                        };
                        var data = factors.join("\u0000");
                        return q.resolve({
                            state:"verify",
                            data: new Buffer(data, "binary")
                        });
                     });
    },
    "stepVerify": function(config, input) {
        if (input) {
            return q.reject(new Error("unexpected data"));
        }
        return q.resolve({
            state:"complete",
            username: config.authPlain.username,
            authzid:  config.authPlain.authzid
        });
    }
};

/**
 * server config properties:
 * - username : string || function(config) { return string || promise }
 *   + if missing, CONTINUE
 *   + if present, input value MUST match (or FAIL)
 * - password : string || function(config, username) { return string || promise }
 *   + if missing, input value MUST be "" (or FAIL)
 *   + if present, input value MUST match (or FAIL)
 * - authzid  : string || function(config, username) { return string || promise }
 *   + if missing, SUCCEED
 *   + if present, check input value
 *                 + if missing, SUCCEED with config value
 *                 + if present, MUST match config value (or FAIL) 
 */

exports.server = {
    name: "PLAIN",
    stepStart: function(config, input) {
        if (!input) {
            return promised_io.when(null);
        }

        var deferred = q.defer();

        input = input.toString("binary").split("\u0000");
        var authz = input[0] || "",
            usr = input[1] || "",
            pwd = input[2] || "";

        return helpers.promisedValue(config, "username").
                then(function(cfgUsr) {
                    cfgUsr = cfgUsr || usr;
                    return q.all([
                        q.resolve(cfgUsr),
                        helpers.promisedValue(config, "password", cfgUsr),
                        helpers.promisedValue(config, "authzid", cfgUsr)
                    ]);
                }).then(function(factors) {
                    if (    (factors[0] !== usr) ||
                            (factors[1] !== pwd) ||
                            (authz && factors[2] !== authz)) {
                        return q.reject(new Error("not authorized"));
                    }

                    authz = factors[2] || authz || usr;
                    return q.resolve({
                        username: usr,
                        authzid:  authz,
                        state:    "complete"
                    })
                });
    }
}
