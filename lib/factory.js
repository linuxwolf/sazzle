/*!
 * factory.js - Client- and Server-specific Factories
 *
 * Copyright (c) 2013-2014 Matthew A. Miller
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

var util = require("util"),
    helpers = require("./helpers.js"),
    SASLSession = require("./session.js").SASLSession;

/**
 * @class
 * Abstract base for all factories.
 *
 * @memberof sazzle
 * @property {String[]} enabled List of enabled mechanisms, in preference
 *           order
 * @property {Object} available map of available mechanisms, keyed by name
 */
function SASLFactory() {
    var enabled = [];
    Object.defineProperty(this, "enabled", {
        get: function() {
            return enabled;
        },
        set: function(mechs) {
            if (typeof(mechs) === "string") {
                enabled = [mechs];
            } else if (mechs instanceof Array) {
                enabled = mechs.slice();
            } else if (!mechs) {
                enabled = [];
            }
        },
        enumerable: true
    });

    var avail = {};
    Object.defineProperty(this, "available", {
        get: function() {
            return avail;
        },
        enumerable: false
    });
}

SASLFactory.prototype = helpers.extend(SASLFactory.prototype,
                                       /** @lends sazzle.SASLFactory# */ {
    /**
     * <p>Registers a mechanism in this factory.</p>
     *
     * <p>The argument {mech} defines the operations for this session. It
     * contains the name of the mechanism, optionally a property for a
     * session intializer function, and a property for each step in the
     * process.</p>
     *
     * <p>The session initializer is expected to take one argument:</p>
     *
     * <ol>
     * <li>an Object representing the initial user-provided configuration.</li>
     * </ol>
     *
     * <p>It returns {true} if the mechanism is ready to use, or {false} if
     * the mechanism cannot be used.</p>
     *
     * <p>The step functions are named "step&lt;step-name&gt;",
     * camel-cased. Each step function is expected to take two arguments:</p>
     *
     * <ol>
     * <li>an Object representating the mechanism configuration</li>
     * <li>a Buffer containing octets from the remote endpoint</li>
     * </ol>
     *
     * <p>The function returns either an Object or a Promise. The Object
     * is expected to have the following:</p>
     *
     * <dl>
     * <dt>"state"</dt>
     * <dd>the next step in the mechanism</dd>
     * <dt>"data" (optional)</dt>
     * <dd>the Buffer of octets to send to the remote endpoint</dd>
     * </dl>
     *
     * <p>Additionally, it can have other properties that are to be exposed
     * out to the user (via {@link sazzle.SASLSession#properties}).</p>
     *
     * @param {Object} mech The mechanism descriptor
     * @param {String} mech.name The name of the mechanism
     * @param {Function} [mech.init] The session initializer for the mechanism
     * @param {Function} mech.stepStart The first processing step
     * @param {Boolean} [enable] <tt>true</tt> If the mechanism should be
     *                  enabled immediately (as most-preferred)
     * @return {SASLFactory} This factory
     * @throws {TypeError} If {mech} does not describe a SASL mechanism
     */
    register: function(mech, enable) {
        if (!mech || typeof(mech) !== "object") {
            throw new TypeError("mech must be an object");
        }

        mech = helpers.clone(mech);
        if (!mech.name || typeof(mech.name) !== "string") {
            throw new TypeError("mech.name must be a non-empty string");
        }
        if (typeof(mech.init) !== "function") {
            if (!mech.init) {
                mech.init = function(config) { return true; };
            } else {
                throw new TypeError("mech.init must be a function");
            }
        }
        if (typeof(mech.stepStart) !== "function") {
            throw new TypeError("mech.stepStart must be a function");
        }

        mech.name = mech.name.toUpperCase();
        this.available[mech.name] = mech;
        if (enable) {
            this.enabled.unshift(mech.name);
        }

        return this;
    },
    /**
     * <p>Creates a new SASL session with the given offered mechanisms. This
     * method uses the intersection of {@link #enabled} and {offered} mechanisms,
     * in the declared order, to determine how to create the session.</p>
     *
     * <p>If the mechanism defines a "init" method, it is called with a shallow
     * copy of {config}.</p>
     *
     * @param {String|String[]} offered The offered mechanism name or names (in
     *        no particular order)
     * @param {Object} [config] The session configuration
     * @return {SASLSession} A new server-oriented session, or null if no
     *         offered mechanisms are suitable
     */
    create: function(offered, config) {
        offered = helpers.makeArray(offered);

        var session = null,
            mech = null,
            self = this;

        self.enabled.every(function(mech) {
            if (offered.indexOf(mech) === -1) { return true; }

            mech = self.available[mech];
            if (!mech) { return true; }

            config = helpers.clone(config || {});
            if (!mech.init(config)) { return true; }

            session = new SASLSession(mech, config);
            return false;
        }, this);

        return session;
    }
});

/**
 * @class
 * <p>Class used to manage and create client-oriented SASL sessions.</p>
 *
 * @extends sazzle.SASLFactory
 *
 * @description
 * <p>Creates a new, empty, SASLClientFactory.</p>
 *
 */
function SASLClientFactory() {
    if (!(this instanceof SASLClientFactory)) {
        return new SASLClientFactory();
    }

    SASLFactory.call(this);
}
util.inherits(SASLClientFactory, SASLFactory);
exports.SASLClientFactory = SASLClientFactory;

/**
 * @class
 * <p>Class used to manage and create serer-oriented SASL server sessions.</p>
 *
 * @extends sazzle.SASLFactory
 *
 * @description
 * <p>Creates a new, empty, SASLServerFactory.</p>
 *
 */
function SASLServerFactory() {
    if (!(this instanceof SASLServerFactory)) {
        return new SASLServerFactory();
    }

    SASLFactory.call(this);
}
util.inherits(SASLServerFactory, SASLFactory);
exports.SASLServerFactory = SASLServerFactory;
