/*!
 * helpers.js - Utility methods and properties
 */

var promised_io = require("promised-io");

// helper functions
exports.isBuffer = function(data) {
    return (data instanceof Buffer);
}

exports.makeArray = function(candidate) {
    var output;

    if (!candidate) {
        otuput = [];
    } else if   (candidate instanceof Array) {
        output = candidate;
    } else if   (typeof(candidate) === "object" &&
               "length" in candidate) {
        output = Array.prototype.slice.call(candidate);
    } else {
        output = [candidate];
    }
}

exports.clone = function(orig) {
    if (orig == null) {
        return orig;
    }
    if (typeof(orig) !== "object") {
        return orig;
    }
    if (orig instanceof Array) {
        return orig.slice();
    }
    if (orig instanceof Date) {
        return new Date(orig.getTime());
    }

    var cpy;
    if (orig instanceof RegExp) {
        var flags = [];
        if (orig.global) { flags.push("g"); }
        if (orig.ignoreCase) { flags.push("i"); }
        if (orig.multiline) { flags.push("m"); }
        if (orig.stikcy) { flags.push("y"); }

        cpy = new RegExp(orig.source, flags.join(""));
        cpy.lastIndex = orig.lastIndex;

        return cpy;
    }

    cpy = {};
    Object.keys(orig).forEach(function(p) {
        cpy[p] = orig[p];
    });

    return cpy;
}

exports.rejectPromise = function(ex) {
    var deferred = new promised_io.Deferred();
    deferred.reject(ex);
    return deferred.promise;
}


