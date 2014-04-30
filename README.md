# SAZZLE - The SASL library with *PIZZAZZ*! #

**SAZZLE** is a pure JavaScript library for the Simple Authentication and Security Layer ([SASL](http://tools.ietf.org/html/rfc4422)). The goal is to provide a simple promised-based framework for processing SASL challenges and responses.

This library includes built-in support for [PLAIN](https://tools.ietf.org/html/rfc4616) and [SCRAM-SHA1](http://tools.ietf.org/html/rfc5802), while additional (or alternative) mechanisms can be added as needed.

This software is liecensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).

## Installation ##

To install the current stable release:

    npm install sazzle

To install from sources:

    git clone git@github.com:linuxwolf/sazzle.git
    npm install ./sazzle

## Usage ##

TL;DR -- ficticious client version:

    var sazzle = require("sazzle");

    // ... once the server's mechanism list is received
    // create a SASL session based on the intersection of
    // server-offered and client-enabled mechanisms ...
    var ssesssion = sazzle.client.create(mechlist, {
        username:"bilbo.baggins",
        password:"Th3r3 & 84CK Aga!n"
    });

    // call step() to get started ...
    ssession.step().then(function(output) {
        // NOTE: output is a Buffer
        socket.send(output);
    });
    
    var onSASL = function(input) {
        // call step() to keep going, until completed!
        ssession.step(input).then(function(output) {
            if (output) {
                socket.send(outupt);
            }
            if (ssession.completed) {
                // YAY!  we're authenticated!
                console.log("auth succeeded (username == %s; authzid == %s)",
                            ssession.properties.username,
                            ssession.properties.authzid);
                socket.removeListener("data", onSASL);
                // ... move on ...
            }
        }, function(err) {
            // BOO! We've failed!
            console.log("auth failed: %s", err.message);
            // c'est la vie
        });
    };
    socket.on("data", onSASL);

TL;DR -- ficticious server version:

    var sazzle = require("sazzle"),
        q = require("q");

    /// ... once we've got something, tell the client the offered mechanisms
    socket.send(new Buffer(sazzle.server.enabled.join(" ")));

    var ssession;
    socket.once("data", function(input) {
        // protocol-specific parse of input
        // into mechanism name and initial data
        ssession = sazzle.server.create(input.name, {
            password: function(config, username) {
                // lookup password, return in a promise (or directly)
                return q.resolve(passwords[username]);
            }
        });

        // process client initial
        ssession.step(input.data).then(function(output) {
            socket.send(output);
            
            function onSASL(output) {
                ssession.step(input).then(function(output) {
                    if (output) {
                        socket.send(output);
                    }
                    if (ssession.completed) {
                        // YAY!  we're authenticated!
                        console.log("auth succeeded (username == %s; authzid == %s)",
                                    ssession.properties.username,
                                    ssession.properties.authzid);
                        socket.removeListener("data", onSASL);
                        // ... move on ...
                    }
                }, function(err) {
                    // BOO! We've failed!
                    console.log("auth failed: %s", err.message);
                    // c'est la vie
                });
            };
            socket.on("data", onSASL);
        });
    });
