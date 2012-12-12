/*!
 * scram-sha1.js - implementation of SCRAM-SHA1 mechanism
 */

var crypto = require("crypto"),
    promised_io = require("promised-io"),
    helpers = require("./lib/helpers.js");

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

var PTN_FIELD = /([^\=]+)\=(.+)/g;

exports.client = {
    name: "SCRAM-SHA1",
    stepStart: function(config) {
        var deferred = new promised_io.Deferred();
        promised_io.seq([
            function() { return helpers.promisedValue(config, "username"); },
            function(usr) {
                return promised_io.all(
                    promised_io.whenPromise(usr),
                    helpers.promisedValue(config, "nonce"),
                    helpers.promisedValue(config, "authzid", usr)
                );
            }
        ]).then(function(factors) {
                var info = config.authScram = {};
                info.username = factors[0];
                info.nonce = factors[1];
                info.authzid = factors[2];
                info.binding = [
                    "n",
                    (info.authzid ? "a=" + info.authzid : ""),
                    ""
                ].join(",");

                if (!info.nonce) {
                    info.nonce = crypto.randomBytes(24).
                                        toString("base64");
                }

                var data = [
                    "n=" + info.username,
                    "r=" + info.nonce
                ].join(",");
                info.messages = [data];

                data = info.binding + data;

                deferred.resolve({
                    state:"auth",
                    data:data
                });
            },
            function(err) {
                deferred.reject(err);
            }
        );

        return deferred.promise;
    },
    stepAuth: function(config, input) {
        input = input.toString("binary");

        var info = config.authScram;
        var deferred = new promised_io.Deferred();
        helpers.promisedValue(config, "password", info.username).
        then(function(pwd) {
            // store server-first-message
            info.messages.push(input);

            // finish calculating binding
            info.binding = new Buffer(info.binding, "binary").
                           toString("base64");

            var nonce = info.nonce;
            delete info.nonce;

            // deconstruct input
            var fields = ["r", "s", "i"],
                extra = [];
            input = input.split(",");
            input.forEach(function(f) {
                f = PTN_FIELD.exec(f);

                var fIdx = fields.indexOf(f[1]);
                if (fIdx !== -1) {
                    fields.splice(fIdx, 1);
                }
                switch(f[1]) {
                    case "r":
                        info.nonce = f[2];
                        break;
                    case "s":
                        info.salt = new Buffer(f[2], "base64").
                                      toString("binary");
                        break;
                    case "i":
                        info.iterations = parseInt(f[2]);
                        break;
                    default:
                        extra.push(f[1]);
                        break;
                }
            });

            // validate all mandatory fields are processed
            if (fields.length) {
                var err = new Error("missing fields");
                err.fields = fields;
                deferred.reject(err);
                return;
            }
            // validate no extra fields
            if (extra.length) {
                var err = new Error("extra fields");
                err.fields = extra;
                deferred.reject(err);
                return;
            }
            // validate server nonce starts with client nonce
            if (info.nonce.substring(0, nonce.length) !== nonce) {
                deferred.reject(new Error("nonce mismatch"));
                return;
            }
            // validate iterations is greater than 0
            if (isNaN(info.iterations) || info.iterations <= 0) {
                deferred.reject(new Error("invalid iteration"));
                return;
            }

            // (start to) construct client-final-message
            var message = [
                "c=" + info.binding,
                "r=" + info.nonce
            ];
            // store client-final-message-without-proof
            info.messages.push(message.join(","));

            // calculate SaltedPassword, ClientKey, ClientSig, ClientProof
            var key, proof, sig;
            pwd = calcSaltedPwd(pwd, info.salt, info.iterations);
            key = calcClientKey(pwd);
            sig = calcClientSig(key, info.messages.join(","));
            proof = calcClientProof(key, sig);

            // store SaltedPassword for verify
            info.password = pwd;

            message.push("p=" + proof);
            deferred.resolve({
                state:"verify",
                data:message.join(",")
            })
        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    },
    stepVerify: function(config, input) {
        input = input.toString("binary");

        var info = config.authScram;
        var deferred = new promised_io.Deferred();

        promised_io.whenPromise(input).
        then(function(input) {
            // deconstruct input
            var verification;
            input = input.split(",");
            input.forEach(function(f) {
                f = PTN_FIELD.exec(f);

                switch(f[1]) {
                    case "v":
                        verification = new Buffer(f[2], "base64").
                                       toString("binary");
                        break;
                }
            });

            // validate non-empty verification
            if (!verification) {
                deferred.reject(new Error("missing verification"));
                return;
            }

            // Calculate ServerKey, ServerSignature
            var key, sig;
            key = calcServerKey(info.password);
            sig = calcServerSig(key, info.messages.join(","));

            if (verification !== sig) {
                deferred.reject(new Error("verification failed"));
            } else {
                deferred.resolve({
                    state:"complete",
                    username:info.username,
                    authzid:info.authzid || info.username
                });
            }
        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
};
exports.server = {
    name:"SCRAM-SHA1",
    stepStart: function(config, input) {
        input = input.toString("binary");

        var deferred = new promised_io.Deferred();
        promised_io.seq([
            function() { return helpers.promisedValue(config, "username"); },
            function(usr) {
                return promised_io.all(
                    promised_io.whenPromise(usr),
                    helpers.promisedValue(config, "nonce"),
                    helpers.promisedValue(config, "iterations", usr),
                    helpers.promisedValue(config, "salt", usr)
                );
            }
        ]).then(function(factors) {
            var info = config.authScram = {};
            var cfgUsr = factors[0],
                cfgNonce = factors[1],
                cfgItrs = factors[2],
                cfgSalt = factors[3];

            // deconstruct input
            input = input.split(",");

            // input[0] == binding request
            if (input[0] !== "n") {
                deferred.reject(new Error("channel binding not supported"));
                return;
            }

            input = input.slice(1);
            input.forEach(function(f, i) {
                f = PTN_FIELD.exec(f);
                if (!f) {
                    return;
                }

                switch(f[1]) {
                    case "n":
                        info.username = f[2];
                        break;
                    case "r":
                        info.nonce = f[2];
                        break;
                    case "a":
                        info.authzid = f[2];
                        break;
                }
            });

            // validate username
            if (cfgUsr && cfgUsr !== info.username) {
                deferred.reject(new Error("invalid username"));
                return;
            }

            // remember messages
            info.messages = [];
            // recalculate client-first-message-bare
            info.messages.push([
                "n=" + info.username,
                "r=" + info.nonce
            ].join(","));

            // calculate nonce/salt/iterations
            if (!cfgNonce) {
                cfgNonce = crypto.randomBytes(24).
                                  toString("base64");
            }
            info.nonce = info.nonce + cfgNonce;

            if (!cfgSalt) {
                cfgSalt = crypto.randomBytes(16).
                                 toString("binary");
            }
            info.salt = cfgSalt;

            if (!cfgItrs) {
                cfgItrs = 4096;
            }
            info.iterations = cfgItrs;

            // pre-calculate binding
            info.binding = [
                "n",
                info.authzid ? "a=" + info.authzid : "",
                ""
            ].join(",");
            info.binding = new Buffer(info.binding, "binary").
                           toString("base64");

            var data = [
                "r=" + info.nonce,
                "s=" + new Buffer(info.salt, "binary").toString("base64"),
                "i=" + info.iterations
            ].join(",");

            // remember server-first-message
            info.messages.push(data);

            deferred.resolve({
                state:"auth",
                data:data
            });
        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    },
    stepAuth: function(config, input) {
        var info = config.authScram;
        input = input.toString("binary");

        promised_io.all(
            helpers.promisedValue(config, "password", info.username),
            helpers.promisedValue(config, "authzid", info.username)
        ).then(function(factors) {
            var cfgPwd = factors[0],
                cfgAuthzid = factors[1],
                cfgBinding = info.binding,
                cfgNonce = info.nonce;
            var usrProof;

            // remove pre-conceived notions
            delete info.binding;
            delete info.nonce;

            // deconstruct input
            input = input.toString("binary").
                          split(",");
            input.forEach(function(f) {
                f = PTN_FIELD.exec(f);

                switch(f[1]) {
                    case "c":
                        info.binding = f[2];
                        break;
                    case "r":
                        info.nonce = f[2];
                        break;
                    case "p":
                        usrProof = f[2];
                        break;
                }
            });

            // validate binding/nonce
            if (info.binding !== cfgBinding) {
                deferred.reject(new Error("invalid binding"));
                return;
            }
            if (info.nonce !== cfgNonce) {
                deferred.reject(new Error("invalid nonce"));
                return;
            }

            // recalculate client-final-message-without-proof
            info.messages.push([
                "c=" + info.binding,
                "r=" + info.nonce
            ].join(","));

            // calculate proof
            var pwd, key, sig, proof;
            pwd = calcSaltedPwd(cfgPwd,
                                info.salt,
                                info.iterations);
            key = calcClientKey(pwd);
            sig = calcClientSig(key, info.messages.join(","));
            proof = calcClientProof(key, sig);
            if (proof !== usrProof) {
                deferred.reject(new Error("not authorized"));
                return;
            }

            // validate authzid
            if (    cfgAuthzid &&
                    info.authzid &&
                    cfgAuthzid !== info.authzid) {
                deferred.reject(new Error("not authorized"));
                return;
            }

            // calculate ServerSignature
            key = calcServerKey(pwd);
            sig = calcServerSig(key, info.messages.join(","));

            var data = "v=" + new Buffer(sig, "binary").toString("base64");
            deferred.resolve({
                state:"complete",
                data:data,
                username:info.username,
                authzid:cfgAuthzid || info.authzid || info.username
            });
        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
};
