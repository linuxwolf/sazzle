/*!
 * factory.js - Client- and Server-specific Factories
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

var util = require("util"),
    helpers = require("./helpers.js"),
    session = require("./session.js");

function SASLFactory() {
    if (!(this instanceof SASLFactory)) {
        return new SASLFactory();
    }

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
/**
 * <p>Registers a mechanism in this factory.</p>
 *
 * @param {Object} mech The mechanism descriptor
 * @param {Boolean} [enable] <tt>true</tt> If the mechanism should be
 *                  enabled immediately (as most-preferred)
 * @return {SASLClientFactory} This factory
 * @throws {Error} If {mech} does not describe a SASL mechanism
 */
SASLFactory.prototype.register = function(mech, enable) {
    if (!mech || typeof(mech) !== "object") {
        throw new Error("mech must be an object");
    }

    mech = helpers.clone(mech);
    if (!mech.name || typeof(mech.name) !== "string") {
        throw new Error("mech.name must be a non-empty string");
    }
    if (typeof(mech.init) !== "function") {
        if (!mech.init) {
            mech.init = function(config) { return true; };
        } else {
            throw new Error("mech.init must be a function");
        }
    }
    if (typeof(mech.stepStart) !== "function") {
        throw new Error("mech.stepStart must be a function");
    }

    mech.name = mech.name.toUpperCase();
    this.available[mech.name] = mech;
    if (enable) {
        this.enabled.unshift(mech.name);
    }

    return this;
};
/**
 * <p>Creates a new SASL session with the given offered mechanisms. This
 * method uses the intersection of {@link #enabled} and {offered} mechanisms,
 * in the declared order, to determine how to create the session.</p>
 *
 * <p>If the mechanism defines a "init" method, it is called with a shallow
 * copy of {config}.</p>
 *
 * @param {String} offered The offered mechanism name
 * @param {Object} [config] The session configuration
 * @return {SASLSession} A new server-oriented session, or null if no
 *         offered mechanisms are suitable
 */
SASLFactory.prototype.create = function(offered, config) {
    offered = helpers.makeArray(offered);

    var client = null,
        mech = null,
        self = this;
    offered = helpers.makeArray(offered);
    offered.every(function(mech) {
        if (self.enabled.indexOf(mech) === -1) { return true; }
        if (!(mech = self.available[mech])) { return true; }
        config = helpers.clone(config || {});
        if (!mech.init(config)) { return true; }

        client = new session.SASLSession(mech, config);
        return false;
    }, this);

    return client;
};

/**
 * @class
 * <p>Class used to manage and create client-oriented SASL sessions.</p>
 *
 * @property {String[]} enabled The list of enabled mechanisms, in preference
 *                      order
 * @property {Object} available The collection of available mechanisms
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
 * @property {String[]} enabled The list of enabled mechanisms, in preference
 *                      order
 * @property {Object} available The collection of available mechanisms
 *
 * @description
 * <p>Creates a new, empty, SASLServerFactory.</p>
 *
 */
function SASLServerFactory() {
    if (!(this instanceof SASLServerFactory)) {
        return new SASLServerFactory();
    }

    if (!(this instanceof SASLClientFactory)) {
        return new SASLClientFactory();
    }

    SASLFactory.call(this);
}
util.inherits(SASLServerFactory, SASLFactory);
exports.SASLServerFactory = SASLServerFactory;
