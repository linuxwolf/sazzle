/*!
 * scram-sha1.js - implementation of SCRAM-SHA1 mechanism
 */

var crypto = require("crypto"),
    q = require("q"),
    helpers = require("./lib/helpers.js");

// helpers
var _XOR = function(s1, s2, encoding) {
    var len = Math.max(s1.length, s2.length),
        out = new Buffer(len);
    for (var idx = 0; idx < len; idx++) {
        out[idx] = s1.charCodeAt(idx) ^ s2.charCodeAt(idx);
    }

    return out.toString(encoding || "binary");
}
var calcSaltedPwd = function(pwd, salt, itrs) {
    var U;

    // calculate U1
    U = salt + "\u0000\u0000\u0000\u0001";
    U = crypto.createHmac("sha1", pwd).
               update(U).
               digest("binary");

    for (var idx = 1; idx < itrs; idx++) {
        U = _XOR(U, crypto.createHmac("sha1", pwd).
                           update(U).
                           digest("binary"));
    }

    return U;
}
var calcClientKey = function(spwd) {
    return crypto.createHmac("sha1", spwd).
                  update("Client Key").
                  digest("binary");
}
var calcClientSig = function(key, msg) {
    // calculate StoredKey
    key = crypto.createHash("sha1").
                 update(key).
                 digest("binary");

    return crypto.createHmac("sha1", key).
                  update(msg).
                  digest("binary");
}
var calcClientProof = function(key, sig) {
    return _XOR(key, sig, "base64");
}
var calcServerKey = function(spwd) {
    return crypto.createHmac("sha1", spwd).
                  update("Server Key").
                  digest("binary");
}
var calcServerSig = function(key, msg) {
    return crypto.createHmac("sha1", key).
                  update(msg).
                  digest("binary");
}

// fields parsing
var PTN_FIELD = /^([^\=]+)\=(.+)$/;

var __parseServerFields = function(fields, input, expected, allowed) {
    var unexpected = [];
    expected = (expected || []).slice();
    allowed = (allowed || []).slice();

    try {
        input.forEach(function(f) {
            f = PTN_FIELD.exec(f);
            if (!f) {
                throw new Error("invalid field");
            }

            var pos;
            pos = expected.indexOf(f[1]);
            if (pos !== -1) {
                expected.splice(pos, 1);
            }
            pos = allowed.indexOf(f[1]);
            if (pos !== -1) {
                allowed.splice(pos, 1);
            }
            switch (f[1]) {
                case "i":   // iterations
                    fields["iterations"] = parseInt(f[2]);
                    break;
                case "r":   // nonce
                    fields["nonce"] = f[2];
                    break;
                case "s":   // salt
                    fields["salt"] = new Buffer(f[2], "base64").
                                     toString("binary");
                    break;
                case "v":   // verification 
                    fields["verification"] = new Buffer(f[2], "base64").
                                             toString("binary");
                    break;
                default:
                    unexpected.push(f[1]);
                    break;
            }

        });
    } catch (ex) {
        return q.reject(ex);
    }

    if          (unexpected.length) {
        var err = new Error("unexpected fields");
        err.fields = unexpected;
        return q.reject(err);
    } else if   (expected.length) {
        var err = new Error("missing fields");
        err.fields = expected;
        return q.reject(err);
    } else {
        return q.resolve(fields);
    }
};
var __parseClientFields = function(fields, input, expected, allowed) {
    var unexpected = [];
    expected = (expected || []).slice();
    allowed = (allowed || []).slice();

    try {
        input.forEach(function(f) {
            if (!f) {
                return;
            }

            f = PTN_FIELD.exec(f);
            if (!f) {
                throw new Error("invalid field");
            }

            var pos;
            pos = expected.indexOf(f[1]);
            if (pos !== -1) {
                expected.splice(pos, 1);
            }
            pos = allowed.indexOf(f[1]);
            if (pos !== -1) {
                allowed.splice(pos, 1);
            }
            switch (f[1]) {
                case "a":   // authorization id
                    fields["authzid"] = f[2];
                    break;
                case "c":   // channel binding
                    fields["binding"] = f[2];
                    break;
                case "n":   // username
                    fields["username"] = f[2];
                    break;
                case "p":   // (client) proof
                    fields["proof"] = f[2];
                    break;
                case "r":   // nonce
                    fields["nonce"] = f[2];
                    break;
                default:
                    unexpected.push(f[1]);
                    break;
            }

        });
    } catch (ex) {
        return q.reject(ex);
    }

    if          (unexpected.length) {
        var err = new Error("unexpected fields");
        err.fields = unexpected;
        return q.reject(err);
    } else if   (expected.length) {
        var err = new Error("missing fields");
        err.fields = expected;
        return q.reject(err);
    } else {
        return q.resolve(fields);
    }
};

/**
 * client config properties:
 * - username : string || function(config) { return string || promise }
 *   + if missing, CONTINUE
 * - nonce : string || function(config, username) { return string || promise }
 *   + if missing, generate random then CONTINUE
 * - authzid : string || function(config, username) { return string || promise }
 *   + if missing, CONTINUE
 * - password : string || function(config, username) { return string || promise }
 *   + if missing, CONTINUE
 */

exports.client = {
    name: "SCRAM-SHA1",
    stepStart: function(config) {
        return helpers.promisedValue(config, "username").
               then(function(usr) {
                    return q.all([
                        q.resolve(usr),
                        helpers.promisedValue(config, "nonce"),
                        helpers.promisedValue(config, "authzid", usr)
                    ]);
               }).
               then(function(factors) {
                    var fields = config.authScram = {};
                    fields.username = factors[0];
                    fields.nonce = factors[1];
                    fields.authzid = factors[2];
                    fields.binding = [
                        "n",
                        (fields.authzid ? "a=" + fields.authzid : ""),
                        ""
                    ].join(",");

                    if (!fields.nonce) {
                        fields.nonce = crypto.randomBytes(24).
                                              toString("base64");
                    }

                    var data = [
                        "n=" + fields.username,
                        "r=" + fields.nonce
                    ].join(",");
                    fields.messages = [data];

                    data = fields.binding + data;

                    return q.resolve({
                        state:"auth",
                        data:data
                    });
               });
    },
    stepAuth: function(config, input) {
        input = input.toString("binary").
                split(",");

        var fields = config.authScram;
        var nonce = fields.nonce;
        delete fields.nonce;

        return q.all([
            __parseServerFields(fields, input,  ["r", "s", "i"]),
            helpers.promisedValue(config, "password", fields.username)
        ]).then(function(factors) {
            var fields = factors[0];
            var pwd = factors[1];

            // store server-first-message
            fields.messages.push(input.join(","));

            // finish calculating binding
            fields.binding = new Buffer(fields.binding, "binary").
                             toString("base64");

            // validate server nonce starts with client nonce
            if (fields.nonce.substring(0, nonce.length) !== nonce) {
                return q.reject(new Error("nonce mismatch"));
            }

            // validate iterations is greater than 0
            if (isNaN(fields.iterations) || fields.iterations <= 0) {
                return q.reject(new Error("invalid iteration"));
            }

            // (start to) construct client-final-message
            var message = [
                "c=" + fields.binding,
                "r=" + fields.nonce
            ];
            // store client-final-message-without-proof
            fields.messages.push(message.join(","));

            // calculate SaltedPassword, ClientKey, ClientSig, ClientProof
            var key, proof, sig;
            pwd = calcSaltedPwd(pwd, fields.salt, fields.iterations);
            key = calcClientKey(pwd);
            sig = calcClientSig(key, fields.messages.join(","));
            proof = calcClientProof(key, sig);

            // store SaltedPassword for verify
            fields.password = pwd;

            message.push("p=" + proof);
            return q.resolve({
                state:"verify",
                data:message.join(",")
            });
        });
    },
    stepVerify: function(config, input) {
        input = input.toString("binary").
                split(",");

        var fields = config.authScram;
        return __parseServerFields(fields, input, ["v"]).
               then(function(fields) {
                    // validate non-empty verification
                    if (!fields.verification) {
                        return q.reject(new Error("missing verification"));
                    }

                    // Calculate ServerKey, ServerSignature
                    var key, sig;
                    key = calcServerKey(fields.password);
                    sig = calcServerSig(key, fields.messages.join(","));

                    if (fields.verification !== sig) {
                        return q.reject(new Error("verification failed"));
                    } else {
                        return q.resolve({
                            state:"complete",
                            username:fields.username,
                            authzid:fields.authzid || fields.username
                        });
                    }
               });

        return deferred.promise;
    }
};

/**
 * server config properties:
 * - username : string || function(config) { return string || promise }
 *   + if missing, CONTINUE
 *   + if present, input value MUST match (or FAIL)
 * - nonce : string || function(config, username) { return string || promise }
 *   + if missing, generate random then CONTINUE
 * - iterations : integer || function(config, username) { return integer || promise }
 *   + if missing, default to 4096 then CONTINUE
 * - salt : string || function(config, username) { return string || promise }
 *   + if missing, generate random then CONTINUE
 *   !! NOTE: string is expected to be binary, NOT base64
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
exports.server = {
    name:"SCRAM-SHA1",
    stepStart: function(config, input) {
        // deconstruct input
        input = input.toString("binary").
                      split(",");

        // input[0] == binding request
        if (input[0] !== "n") {
            return q.reject(new Error("channel binding not supported"));
        }
        input.splice(0, 1);

        var fields = config.authScram = {};
        return q.all([
            __parseClientFields(fields, input, ["n", "r"], ["a"]),
            helpers.promisedValue(config, "username")
        ]).then(function(factors) {
            var cfgUsr = factors[1];
            return q.all([
                q.resolve(cfgUsr),
                helpers.promisedValue(config, "nonce"),
                helpers.promisedValue(config, "iterations", cfgUsr),
                helpers.promisedValue(config, "salt", cfgUsr)
            ]);
       }).then(function(factors) {
            var usr = factors[0],
                nonce = factors[1],
                itrs = factors[2],
                salt = factors[3];

            if (usr && usr !== fields.username) {
                return q.reject(new Error("invalid username"));
            }

            // remember messages
            fields.messages = [];
            // recalculate client-first-message-bare
            fields.messages.push([
                "n=" + fields.username,
                "r=" + fields.nonce
            ].join(","));

            // calculate nonce/salt/iterations
            if (!nonce) {
                nonce = crypto.randomBytes(24).
                               toString("base64");
            }
            fields.nonce = fields.nonce + nonce;

            if (!salt) {
                salt = crypto.randomBytes(16).
                              toString("binary");
            }
            fields.salt = salt;

            if (!itrs) {
                itrs = 4096;
            }
            fields.iterations = itrs;

            // pre-calculate binding
            fields.binding = [
                "n",
                fields.authzid ? "a=" + fields.authzid : "",
                ""
            ].join(",");
            fields.binding = new Buffer(fields.binding, "binary").
                             toString("base64");

            // generate & remember server-first-message
            var data = [
                "r=" + fields.nonce,
                "s=" + new Buffer(fields.salt, "binary").toString("base64"),
                "i=" + fields.iterations
            ].join(",");

            // remember server-first-message
            fields.messages.push(data);

            return q.resolve({
                state:"auth",
                data:data
            });
       });
    },
    stepAuth: function(config, input) {
        var fields = config.authScram;
        input = input.toString("binary").
                split(",");

        var binding = fields.binding,
            nonce = fields.nonce;

        // remove pre-conceived notions
        delete fields.binding;
        delete fields.nonce;

        return q.all([
            __parseClientFields(fields, input, ["c", "r", "p"]),
            helpers.promisedValue(config, "password", fields.username)
        ]).then(function(factors) {
            var fields = factors[0],
                pwd = factors[1],
                binding = fields.binding,
                nonce = fields.nonce;
            var usrProof = fields.proof;

            // validate binding/nonce
            if (fields.binding !== binding) {
                return q.reject(new Error("invalid binding"));
            }
            if (fields.nonce !== nonce) {
                return q.reject(new Error("invalid nonce"));
            }

            // recalculate client-final-message-without-proof
            fields.messages.push([
                "c=" + fields.binding,
                "r=" + fields.nonce
            ].join(","));

            // calculate proof
            var key,
                sig,
                proof;
            pwd = calcSaltedPwd(pwd,
                                fields.salt,
                                fields.iterations);
            key = calcClientKey(pwd);
            sig = calcClientSig(key, fields.messages.join(","));
            proof = calcClientProof(key, sig);
            if (proof !== usrProof) {
                return q.reject(new Error("not authorized"));
            }

            // calculate ServerSignature
            key = calcServerKey(pwd);
            sig = calcServerSig(key, fields.messages.join(","));
            fields.verification = sig;

            var authz = config.authorize;
            if          (typeof(authz) === "function") {
                authz = authz(config, usr, fields.authzid);
            } else if   (authz == null) {
                authz = !fields.authzid || (usr === fields.authzid);
            }

            return q.resolve(authz);
        }).then(function(result) {
            if (!result) {
                return q.reject(new Error("not authorized"));
            }

            var data = "v=" + new Buffer(fields.verification, "binary").
                       toString("base64");
            return q.resolve({
                state:"complete",
                data:data,
                username:fields.username,
                authzid:fields.authzid || fields.username
            });
        });
    }
};
