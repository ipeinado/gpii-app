/**
 * The websockets settingsHandler connector
 *
 * Component that manages the connection with the GPII websockets settingsHandler.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
 * Copyright 2020 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

/**
 * @module settingsHandlerConnector
 * Responsible for creation and housekeeping of the connection to the websockets
 * settingsHandler.
 */
fluid.defaults("gpii.app.settingsHandlerConnector", {
    gradeNames: ["gpii.app.ws", "fluid.modelComponent"],
    solutionId: "net.gpii.morphic",
    model: {
        settings: null,
        settingsSnapshot: null
    },
    events: {
        newSettingsArrived: null
    },
    listeners: {
        "onCreate.connect": "{that}.connect",
        "onConnected.setup": {
            func: "{that}.setup",
            priority: "after:connect"
        },
        "onMessageReceived.handleRawChannelMessage": "{that}.handleRawChannelMessage"
    },
    invokers: {
        handleRawChannelMessage: {
            funcName: "gpii.app.settingsHandlerConnector.handleRawChannelMessage",
            args: ["{that}", "{arguments}.0"] // message
        },
        setup: {
            funcName: "gpii.app.settingsHandlerConnector.setup",
            args: ["{that}", "{that}.options.solutionId"]
        }
    }
});

/**
 * Responsible for parsing messages from the GPII socket connection. Currently messages use
 * the format of changeApplier with the path, value and type.
 * @param {Object} settingsHandlerConnector - The `gpii.app.settingsHandlerConnector` instance
 * @param {Object} message - The received PSP Channel message
 */
gpii.app.settingsHandlerConnector.handleRawChannelMessage = function (that, message) {
    // Connection to the websockets settingsHandler was succeeded
    if (message.type === "connectionSucceeded") {
        fluid.log("settingsHandlerConnector - Established connection with the GPII");
    // Core has received current Morphic settings - not in use right now
    } else if (message.type === "changeSettingsReceived") {
        fluid.log("settingsHandlerConnector - core received current Morphic settings");
    // The settings have changed and core is telling us about it
    } else if (message.type === "onSettingsChanged") {
        var equal = fluid.model.diff(message.payload, that.model.settings);
        if (!equal) {
            // The user has keyed-in and we need to create a snapshot and apply
            // the incoming settings
            if (message.payload) {
                that.applier.change("settingsSnapshot", that.model.settings);
                that.applier.change("settings", message.payload, null, "settingsHandler.update");
            // The user has keyed out and we need to restore the snapshot
            } else {
                that.applier.change("settings", that.model.settingsSnapshot, null, "settingsHandler.update");
                that.applier.change("settingsSnapshot", message.payload);
            }
            that.events.newSettingsArrived.fire(that.model.settings);
        }
    } else {
        fluid.log("settingsHandlerConnector - Received unhandled message: ", message);
    }
};

gpii.app.settingsHandlerConnector.setup = function (that, solutionId) {
    fluid.log("settingsHandlerConnector - Connected, identifying as", solutionId);
    that.send({ type: "connect", payload: {solutionId: solutionId }});
};

gpii.app.settingsHandlerConnector.qssUserSettingsChanged = function (that, change) {
    that.applier.change("settings", change.value, null, "settingsHandler.init");
};
