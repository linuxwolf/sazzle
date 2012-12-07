/*!
 * plain.js - implementation of PLAIN mechanism
 */
var promised_io = require("promised-io"),
    helpers = require("./lib/helpers.js");

var _promisedValue = function(config, prop, username) {
    var val = config[prop];
    if (typeof(val) === "function") {
        try {
            val = val(config, username);
        } catch (ex) {
            return helpers.rejectPromise(ex);
        }
    }
    return promised_io.whenPromise(val || "");
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
    name: "PLAIN",
    stepStart: function(config) {
        var deferred = new promised_io.Deferred();

        promised_io.seq([
            function() { return _promisedValue(config, "username"); },
            function(usr) {
                return promised_io.all(
                    _promisedValue(config, "authzid", usr),
                    promised_io.whenPromise(usr),
                    _promisedValue(config, "password", usr)
                );
            }
        ]).then( function(factors) {
                config.authPlain = {
                    username: factors[1],
                    authzid:  factors[0] || factors[1]
                };
                var data = factors.join("\u0000");
                deferred.resolve({
                    state:"verify",
                    data: new Buffer(data, "binary")
                });
            },
            function(err) {
                deferred.reject(err);
            }
        );
        return deferred.promise;
    },
    "stepVerify": function(config, input) {
        var deferred = new promised_io.Deferred();

        if (input) {
            deferred.reject(new Error("unexpected data"));
        } else {
            deferred.resolve({
                state:"complete",
                username: config.authPlain.username,
                authzid:  config.authPlain.authzid
            });
        }

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
    name: "PLAIN",
    stepStart: function(config, input) {
        if (!input) {
            return promised_io.when(null);
        }

        var deferred = new promised_io.Deferred();
        var handled = false;

        input = input.toString("binary").split("\u0000");
        var authz = input[0] || "",
            usr = input[1] || "",
            pwd = input[2] || "";

        promised_io.seq([
            function() { return _promisedValue(config, "username"); },
            function(cfgUser) {
                cfgUser = cfgUser || usr;
                return promised_io.all(promised_io.whenPromise(cfgUser),
                                       _promisedValue(config, "password", cfgUser),
                                       _promisedValue(config, "authzid", cfgUser));
            }
        ]).then(function(factors) {
                if (    (factors[0] !== usr) ||
                        (factors[1] !== pwd) ||
                        (authz && factors[2] !== authz)) {
                    deferred.reject(new Error("not authorized"));
                    return;
                }

                authz = factors[2] || authz || usr;
                deferred.resolve({
                    username: usr,
                    authzid:  authz,
                    state:    "complete"
                })
            }, function(err) {
                !handled && deferred.reject(err);
                handled = true;
            }
        );

        return deferred.promise;
    }
}