/*!
 * session.js - SASL session
 */

var helpers = require("./helpers.js");

/**
 * @class
 * <p>Represents a single SASL authentication session.</p>
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

    this._mech = mech;
    Object.defineProperty(this, "mechanism", {
        value: mech.name,
        enumerable: true
    });
    Object.defineProperty(this, "config", {
        value: config
    });

    Object.defineProperty(this, "completed", {
        get: function() { return (config.state === "complete"); },
        set: function(val) { completed = !!val; }
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
        state = config.state,
        output,
        promise;
    if (state in this._mech) {
        try {
            output = this._mech[state](this.config, input);
            promise = promised_io.whenPromise(output);
        } catch (ex) {
            config.state = "complete";
            promise = helpers.rejectPromise(ex);
        }
    } else {
        // no function == invalid state
        config.state = "complete";
        promise = helpers.rejectPromise(new Error("invalid state"));
    }

    return promise;
}

exports.SASLSession = SASLSession;
