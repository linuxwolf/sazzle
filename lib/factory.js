/*!
 * factory.js - Client- and Server-specific Factories
 */

var $ = require("cloneextend"),
    helpers = require("./helpers.js"),
    session = require("./session.js");

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
 * <p>Registers a client mechanism in this factory.</p>
 *
 * @param {Object} mech The mechanism descriptor
 * @param {Boolean} [enable] <tt>true</tt> If the mechanism should be
 *                  enabled immediately
 * @return {SASLClientFactory} This client factory
 * @throws {Error} If {mech} does not describe a SASL mechanism
 */
SASLClientFactory.prototype.register = function(mech, enable) {
    if (!mech) {
        throw new Error("mech is expected to define a mechanism");
    }

    mech = $.clone(mech);
    if (!mech.name || typeof(mech.name) !== "string") {
        throw new Error("mech must have a name");
    }
    if (typeof(mech.init) !== "function") {
        if (!mech.init) {
            mech.init = function(config) { return true; };
        } else {
            throw new Error("mech.init must be a function");
        }
    }
    if (!mech.stepStart || typeof(mech.stepStart) !== "function") {
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
 * <p>Creates a new SASL client session with the given offered mechanisms.</p>
 *
 * @param {String[]|String} offered The offered mechanism names
 * @param {Object} [config] The session configuration
 * @return {SASLSession} A new client-oriented session, or null if no
 *         offered mechanisms are suitable
 */
SASLClientFactory.prototype.create = function(offered, config) {
    offered = helpers.makeArray(offered);
    config = $.clone(config || {});

    var client = null,
        mech = null;
    this.enabled.every(function(mech) {
        mech = this.offeredable[mech];
        if (!mech) { return true; }
        if (!mech.init(config)) { return true; }

        client = new session.SASLSession(mech, config);
        return false;
    }, this);

    return client;
};
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
 * <p>Registers a server mechanism in this factory.</p>
 *
 * @param {Object} mech The mechanism descriptor
 * @param {Boolean} [enable] <tt>true</tt> If the mechanism should be
 *                  enabled immediately
 * @return {SASLClientFactory} This client factory
 * @throws {Error} If {mech} does not describe a SASL mechanism
 */
SASLServerFactory.prototype.register = function(mech, enable) {
    if (!mech) {
        throw new Error("mech is expected to define a mechanism");
    }

    mech = $.clone(mech);
    if (!mech.name || typeof(mech.name) !== "string") {
        throw new Error("mech must have a name");
    }
    if (typeof(mech.init) !== "function") {
        if (!mech.init) {
            mech.init = function(config) { return true; };
        } else {
            throw new Error("mech.init must be a function");
        }
    }
    if (!mech.stepStart || typeof(mech.stepStart) !== "function") {
        throw new Error("mech.stepStart must be a function");
    }

    mech.name = mech.name.toUpperCase();
    this.available[mech.name] = mech;
    if (enable) {
        this.enabled.unshift(mech.name);
    }
};
/**
 * <p>Creates a new SASL server session with the given offered mechanisms.</p>
 *
 * @param {String[]|String} offered The offered mechanism names
 * @param {Object} [config] The session configuration
 * @return {SASLSession} A new server-oriented session, or null if no
 *         offered mechanisms are suitable
 */
SASLServerFactory.prototype.create = function(offered, config) {
    config = $.clone(config || {});

    var server = null,
        mech = null;

    if (this.enabled.indexOf(mech) !== -1) {
        return null;
    }
    mech = this.offeredable[mech];
    if (!mech || !mech.init(config)) {
        return null;
    }

    server = new session.SASLSession(mech, config);
    return server;
};
exports.SASLServerFactory = SASLServerFactory;
