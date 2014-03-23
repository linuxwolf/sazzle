/*!
 * session.js - SASL session
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
    helpers = require("./helpers.js");

var __stateMethod = function(state) {
    return "step" + state.substring(0, 1).toUpperCase() + state.substring(1);
}

/**
 * @class
 * <p>Represents a single SASL authentication session.</p>
 *
 * <p><strong>NOTE:</strong> This construction should not be called directly.
 * Instead, use {@link SASLClientFactory.create}.</p>
 *
 * @property {String} mechanism The name of the mechanism
 * @property {Object} properties The session properties
 * @property {Boolean} completed <tt>true</tt> if this session is done
 *
 * @description
 * <p>Creates a new SASLSession with the given mechanism and
 * configuration.</p>
 *
 * @param {Object} mech The mechanism descriptor
 * @param {Object} config The configuration map
 */
function SASLSession(mech, config) {
    if (!(this instanceof SASLSession)) {
        return new SASLSession(mech, config);
    }

    // prepare configuration
    config = helpers.clone(config || {});

    // setup instance properties
    Object.defineProperty(this, "mechanism", {
        value: mech.name,
        enumerable: true
    });

    var props = {};
    Object.defineProperty(this, "properties", {
        value: props
    });

    Object.defineProperty(this, "completed", {
        get: function() { return (config.state === "complete"); },
        enumerable: true
    });

    // first state is 'start'
    config.state = "start";

    // define step
    this.step = function(input, encoding) {
        // normalize input as a Buffer
        if (typeof(input) === "string") {
            encoding = encoding || "base64";
            input = new Buffer(input, encoding);
        } else if (!input) {
            input = null;
        } else if (!helpers.isBuffer(input)) {
            throw new TypeError("invalid input");
        }

        var state = __stateMethod(config.state),
            output,
            promise;
        try {
            if (typeof(mech[state]) === "function") {
                output = mech[state](config, input);
            } else {
                throw new Error("invalid state");
            }

            promise = (output && typeof(output.then) === "function") ?
                      output :
                      q.resolve(output);
        } catch (ex) {
            promise = q.reject(ex);
        }

        var deferred = q.defer();
        promise.then(function(out) {
            var data = out.data;
            config.state = out.state || config.state;
            Object.keys(out).forEach(function(p) {
                if (p === "data" || p === "state") {
                    return;
                }
                props[p] = out[p];
            })
            deferred.resolve(data);
        }, function(err) {
            config.state = "complete";
            deferred.reject(err);
        });

        return deferred.promise;
    }
}
/**
 * <p>Performs the next step of the authentication session.</p>
 *
 * @param {Buffer|String} [input] The input data
 * @param {String} [encoding] The encoding of {input}, if it is a string
 */
SASLSession.prototype.step = /* istanbul ignore next */ function(input, encoding) {
    /* istanbul ignore next */
    throw new Error("not implemented");
}

exports.SASLSession = SASLSession;
