/*!
 * helpers.js - Utility methods and properties
 */

var promised_io = require("promised-io");

// helper functions
exports.makeArray = function(candidate) {
    var output;

    if (!candidate) {
        otuput = [];
    } else if (candidate instanceof Array) {
        output = candidate;
    } else if ("length" in candidate) {
        output = Array.prototype.slice.call(candidate);
    } else {
        output = [candidate];
    }
}
exports.isBuffer = function(data) {
    return (data instanceof Buffer);
}
exports.rejectPromise = function(ex) {
    var deferred = new promised_io.Deferred();
    deferred.reject(ex);
    return deferred.promise;
}


