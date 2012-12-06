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
    config.state = props.state = "start";

    // define step
    this.step = function(input, encoding) {
        // normalize input as a Buffer
        if (typeof(input) === "string") {
            encoding = encoding || "base64";
            input = new Buffer(input, encoding);
        } else if (!input) {
            input = null;
        } else if (!helpers.isBuffer(input)) {
            throw new TypeError("input must be a Buffer or null");
        }

        var state = __stateMethod(props.state),
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
                      promised_io.whenPromise(output);
        } catch (ex) {
            promise = helpers.rejectPromise(ex);
        }

        var deferred = new promised_io.Deferred();
        promise.then(function(out) {
            props.state = config.state || props.state;
            deferred.resolve(out);
        }, function(err) {
            props.state = config.state = "complete";
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
SASLSession.prototype.step = function(input, encoding) {
    throw new Error("not implemented");
}

exports.SASLSession = SASLSession;
