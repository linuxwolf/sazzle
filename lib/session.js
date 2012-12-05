/*!
 * session.js - SASL session
 */

var promised_io = require("promised-io"),
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
 * @property {Object} config The configuration object
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

    Object.defineProperty(this, "_mech", {
        value: mech
    });
    this._mech = mech;
    Object.defineProperty(this, "mechanism", {
        value: mech.name,
        enumerable: true
    });

    config = helpers.clone(config || {});
    Object.defineProperty(this, "config", {
        value: config
    });

    Object.defineProperty(this, "completed", {
        get: function() { return (config.state === "complete"); },
        set: function(val) { completed = !!val; },
        enumerable: true
    });

    // first state is 'start'
    config.state = "start";
}
/**
 * <p>Performs the next step of the authentication session.</p>
 *
 * @param {Buffer|String} [input] The input data
 * @param {String} [encoding] The encoding of {input}, if it is a string
 */
SASLSession.prototype.step = function(input, encoding) {
    // normalize input as a Buffer
    if (typeof(input) === "string") {
        encoding = encoding || "base64";
        input = new Buffer(input, encoding);
    } else if (!input) {
        input = null;
    } else if (!helpers.isBuffer(input)) {
        throw new TypeError("input must be a Buffer or null");
    }

    var config = this.config,
        state = __stateMethod(config.state),
        output,
        promise;
    try {
        if (typeof(this._mech[state]) === "function") {
            output = this._mech[state](this.config, input);
        } else {
            throw new Error("invalid state");
        }

        var deferred = new promised_io.Deferred();
        promised_io.whenPromise(output,
                                function(output) {
                                    deferred.resolve(output);
                                },
                                function(err) {
                                    config.state = "complete";
                                    deferred.reject(err);
                                });
        promise = deferred.promise;
    } catch (ex) {
        promise = helpers.rejectPromise(ex);
    }

    return promise;
}

exports.SASLSession = SASLSession;
