/*!
 * factory.js - Client- and Server-specific Factories
 */

var $ = require("cloneextend"),
    helpers = require("./helpers.js"),
    session = require("./session.js");

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
                enabled = mechs;
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
SASLClientFactory.prototype.register = function(mech) {
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
    if (!mech.start || typeof(mech.start) !== "function") {
        throw new Error("mech.start must be a function");
    }

    mech.name = mech.name.toUpperCase();
    this.available[mech.name] = mech;
};
SASLClientFactory.prototype.create = function(avail, config) {
    avail = helpers.makeArray(avail);
    config = $.clone(config || {});

    var client = null,
        mech = null;
    this.enabled.every(function(mech) {
        mech = this.available[mech];
        if (!mech) { return true; }
        if (!mech.init(config)) { return true; }

        client = new session.SASLSession(mech, config);
        return false;
    }, this);

    return client;
};
exports.SASLClientFactory = SASLClientFactory;

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
                enabled = mechs;
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

SASLServerFactory.prototype.register = function(mech) {
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
    if (!mech.start || typeof(mech.start) !== "function") {
        throw new Error("mech.start must be a function");
    }

    mech.name = mech.name.toUpperCase();
    this.available[mech.name] = mech;
};
SASLServerFactory.prototype.create = function(avail, config) {
    config = $.clone(config || {});

    var server = null,
        mech = null;

    if (this.enabled.indexOf(mech) !== -1) {
        return null;
    }
    mech = this.available[mech];
    if (!mech || !mech.init(config)) {
        return null;
    }

    server = new session.SASLSession(mech, config);
    return server;
};
exports.SASLServerFactory = SASLServerFactory;
