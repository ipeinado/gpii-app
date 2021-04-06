/**
 * Smartwork login BrowserWindow Dialog
 *
 * Introduces a component that uses an Electron BrowserWindow to represent an "About" dialog.
 * Copyright 2021 RtF-I
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
var electron = require("electron");

require("./basic/dialog.js");

var gpii = fluid.registerNamespace("gpii");

/**
 * Component that represents the Smartwork login dialog
 */
fluid.defaults("gpii.app.smartworkLoginDialog", {
    gradeNames: ["gpii.app.dialog", "gpii.app.centeredDialog"],
    config: {
        fileSuffixPath: "smartworkLogin/index.html",
        attrs: {
            width: 600,
            height: 500,
            alwaysOnTop: true,
            frame: true,
            resizable: true,
            transparent: false, // needs to be false to enable resizing and maximizing
            movable: true,
            minimizable: true,
            maximizable: true,
            titleBarStyle: "default"
        },
        params: {
            smartworkCredentials: "{that}.options.smartworkCredentials"
        }
    },
    events: {
        // Login events
        onSmartworkLoginRequestArrived: null,
        onLoginSucceeded: null,
        onLoginFailed: null,
        // Logout events
        onSmartworkLogoutRequestArrived: null,
        onLogoutSucceeded: null,
        onLogoutFailed: null,
        // other
        onDestroyRequest: null
    },
    components: {
        channelListener: {
            type: "gpii.app.channelListener",
            options: {
                events: {
                    onSmartworkLoginRequest: null,
                    onSmartworkLogoutRequest: null,
                    onDestroyRequest: null
                },
                listeners: {
                    onSmartworkLoginRequest: {
                        funcName: "{smartworkLoginDialog}.events.onSmartworkLoginRequestArrived.fire",
                        args: ["{arguments}.0"]
                    },
                    onSmartworkLogoutRequest: {
                        funcName: "{smartworkLoginDialog}.events.onSmartworkLogoutRequestArrived.fire"
                    },
                    onDestroyRequest: {
                        funcName: "{smartworkLoginDialog}.events.onDestroyRequest.fire",
                        args: "{arguments}.0"
                    }
                }
            }
        },
        channelNotifier: {
            type: "gpii.app.channelNotifier",
            options: {
                events: {
                    onLoginSucceeded: null,
                    onLoginFailed: null,
                    onLogoutSucceeded: null,
                    onLogoutFailed: null
                }
            }
        }
    },
    listeners: {
        "onCreate.show": {
            func: "{that}.show"
        },
        "onCreate.removeMenu": {
            funcName: "gpii.app.smartworkLoginDialog.removeWindowMenu",
            args: "{that}"
        },
        "onDestroyRequest.destroyDialog": {
            funcName: "gpii.app.smartworkLoginDialog.destroyDialog",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

gpii.app.smartworkLoginDialog.removeWindowMenu = function (that) {
    // Comment this out to enable toggling devTools
    that.dialog.removeMenu();
};

gpii.app.smartworkLoginDialog.destroyDialog = function (that, delayToClose) {
    var closeDelay = delayToClose || 1000;
    setTimeout(that.destroy, closeDelay);
};
