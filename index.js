/*!
 * index.js - Main Implementation
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

var helpers = require("./lib/helpers.js"),
    session = require("./lib/session.js"),
    factory = require("./lib/factory.js");

/**
 * @namespace
 *
 * @description
 * The collection of classes and global objects for SAZZLE.
 */
var sazzle = module.exports = {};

// expose PBKDF2
sazzle.PBKDF2 = require("./pbkdf2").pbkdf2;

// setup client factory
sazzle.SASLClientFactory = factory.SASLClientFactory;
/**
 * Default factory for creating SASL clients.
 *
 * @type {SASLClientFactory}
 */
sazzle.client = new factory.SASLClientFactory();

// setup server factory
sazzle.SASLServerFactory = factory.SASLServerFactory;
/**
 * Default factory for creating SASL servers.
 *
 * @type {SASLServerFactory}
 */
sazzle.server = new factory.SASLServerFactory();

// setup factory defaults
var mechs = [
    require("./mechanisms/plain.js"),
    require("./mechanisms/scram-sha1.js")
];

mechs.forEach(function(m) {
    m.client && exports.client.register(m.client, true);
    m.server && exports.server.register(m.server, true);
});
