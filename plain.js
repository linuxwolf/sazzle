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
 * - authorize : function(config, username, authzid) { return boolean || promise }
 *   + if missing, then
 *      + if authzid missing, SUCCEED
 *      + if authzid matches username, SUCCEED
 *      + else FAIL
 *   + if present; true == SUCCEED, false == FAIL
 */

var __doAuthorize = function(config, username, authzid) {
    if (!authzid || (username === authzid)) {
        return q.resolve(authzid || username);
    } else {
        return q.reject(new Error("not authorized"));
    }
}

exports.server = {
    name: "PLAIN",
    stepStart: function(config, input) {
        if (!input) {
            return promised_io.when(null);
        }

        var deferred = q.defer();

        input = input.toString("binary").split("\u0000");
        var authzid = input[0] || "",
            usr = input[1] || "",
            pwd = input[2] || "";

        return helpers.promisedValue(config, "username").
                then(function(cfgUsr) {
                    cfgUsr = cfgUsr || usr;
                    return q.all([
                        q.resolve(cfgUsr),
                        helpers.promisedValue(config, "password", cfgUsr),
                    ]);
                }).then(function(factors) {
                    if (    (factors[0] !== usr) ||
                            (factors[1] !== pwd)) {
                        return q.reject(new Error("not authorized"));
                    }

                    var authz = config.authorize;
                    if          (typeof(authz) === "function") {
                        authz = authz(config, usr, authzid);
                    } else if   (authz == null) {
                        authz = !authzid || (usr === authzid);
                    }

                    return q.resolve(authz);
                }).then(function(result) {
                    if (result) {
                        return q.resolve({
                            state:"complete",
                            username:usr,
                            authzid:authzid || usr
                        })
                    } else {
                        return q.reject(new Error("not authorized"));
                    }
                });
    }
}
