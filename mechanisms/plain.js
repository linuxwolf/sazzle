/*!
 * plain.js - implementation of PLAIN mechanism
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
    helpers = require("../lib/helpers.js"),
    pbkdf2 = require("../lib/pbkdf2.js").pbkdf2;

/**
 * client config properties:
 * - username : string || function(config) { return string || promise }
 *   + if missing, CONTINUE
 * - authzid : string || function(config, username) { return string || promise }
 *   + if missing, CONTINUE
 * - password : string || function(config, username) { return string || promise }
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
        if (input && input.length) {
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
 * - authenticate : function(config, username, password) { return boolean || promise }
 *   + if missing, CONTINUE
 *   + if present, true == SUCCEED, false == FAIL
 * - password : string || function(config, username) { return string || promise }
 *   + if missing, password == "" and CONTINUE (see below)
 * - prf : string || function(config, username) { return string || promise }
 *   + if missing, prf == "sha1" and CONTINUE
 * - salt : string || function(config, username)
 *   + if missing, salt == predetermined value and CONTINUE
 * - iterations : number || function(config, username) { return number || promise }
 *   + if missing, iterations == 4096 and CONTINUE
 * - derivedKey : string || function(confing, username) { return string || promise }
 *   + if missing, derivedKey == PBKDF2(prf, password, salt, iterations, len(prf))
 *   + compared against client-supplied password by computing derivedKey
 * - authorize : function(config, username, authzid) { return boolean || promise }
 *   + if missing, then
 *      + if authzid missing, SUCCEED
 *      + if authzid matches username, SUCCEED
 *      + else FAIL
 *   + if present; true == SUCCEED, false == FAIL
 */
exports.server = {
    name: "PLAIN",
    stepStart: function(config, input) {
        var fields = config.authPlain = {};

        input = input.toString("binary");
        if (input.length === 0) {
            if (!fields.serverFirst && config.serverFirst) {
                fields.serverFirst = true;
                return q.resolve({
                    state:"start",
                    data:null
                });
            } else {
                return q.reject(new Error("client data required"));
            }
        }

        var deferred = q.defer();

        input = input.split("\u0000");
        var authzid = input[0] || "",
            usr = input[1] || "",
            pwd = input[2] || "";

        return helpers.promisedValue(config, "username").
                then(function(cfgUsr) {
                    if (cfgUsr && usr !== cfgUsr) {
                        return q.reject(new Error("not authorized"));
                    }
                    fields.username = usr;
                    var authn = config.authenticate;
                    if ("function" === typeof(authn)) {
                        return authn(config, usr, pwd);
                    } else {
                        return q.all([
                            helpers.promisedValue(config, "password", usr),
                            helpers.promisedValue(config, "prf", usr),
                            helpers.promisedValue(config, "salt", usr),
                            helpers.promisedValue(config, "iterations", usr)
                        ]).then(function(factors) {
                            var cfgPwd = factors[0];

                            fields.prf = factors[1] || helpers.DEFAULT_PRF;
                            fields.salt = factors[2] || helpers.DEFAULT_SALT;
                            fields.iterations = factors[3] ||
                                                helpers.DEFAULT_ITERATIONS;

                            if (!config.derivedKey) {
                                return q.resolve([pwd, cfgPwd]);
                            }

                            return q.all([
                                pbkdf2(fields.prf)(pwd,
                                                   fields.salt,
                                                   fields.iterations),
                                helpers.promisedValue(config,
                                                      "derivedKey",
                                                      usr,
                                                      fields.prf,
                                                      fields.salt,
                                                      fields.iterations)
                            ]);
                        }).then(function(crypted) {
                            if (crypted[0] !== crypted[1]) {
                                return q.reject(new Error("not authorized"));
                            }
                    
                            var authz = config.authorize;
                            if          (typeof(authz) === "function") {
                                authz = authz(config, usr, authzid);
                            } else if   (authz == null) {
                                authz = !authzid || (usr === authzid);
                            }

                            return q.resolve(authz);
                        });
                    }
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
