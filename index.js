/*!
 * sasl/index.js - Main Implementation
 *
 * Pure JavaScript implementation of SASL framework for node.js
 */

var $ = require("cloneextend"),
    util = require("util"),
    promised_io = require("promised-io");

// helper functions
function __makeArray(candidate) {
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
function __isBuffer(data) {
    return (data instanceof Buffer);
}
function __rejectPromise(ex) {
    var deferred = new promised_io.Deferred();
    deferred.reject(ex);
    return deferred.promise;
}


// Client-side implementation
function SASLClient(mech, config) {
    this._mech = mech;

    Object.defineProperty(this, "mechanism", {
        value: mech.name,
        enumerable: true
    });
    Object.defineProperty(this, "config", {
        value: config
    });

    var started;
    Object.defineProperty(this, "started", {
        get: function() { return started; },
        set: function(val) { started = !!val; },
        enumerable: true
    });

    Object.defineProperty(this, "completed", {
        get: function() { return (config.state === "complete"); },
        set: function(val) { completed = !!val; }
    });

    // first state is 'start'
    config.state = "start";
}
SASLClient.prototype.step = function(input, encoding) {
    // normalize input as a Buffer
    if (typeof(input) === "string") {
        encoding = encoding || "base64";
        input = new Buffer(input, encoding);
    } else if (!input) {
        input = null;
    } else {
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
            promise = __rejectPromise(ex);
        }
    } else {
        config.state = "complete";
        promise = __rejectPromise(new Error("invalid state"));
    }

    return promise;
}

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
    avail = __makeArray(avail);
    config = $.clone(config || {});

    var client = null,
        mech = null;
    this.enabled.every(function(mech) {
        mech = this.available[mech];
        if (!mech) { return true; }
        if (!mech.init(config)) { return true; }

        client = new SASLClient(mech, config);
        return false;
    }, this);

    return client;
};

// setup "globals"
exports.SASLClientFactory = SASLClientFactory;
exports.client = new SASLClientFactory();