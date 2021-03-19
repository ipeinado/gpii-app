/**
 * Morphic Settings editor
 *
 * Introduces a component that uses an Electron BrowserWindow to represent an "Advanced Settings editor" dialog.
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
require("./makeYourOwnButtonDialog.js")

var gpii = fluid.registerNamespace("gpii");

/**
 * Component that represents the dialog
 */
fluid.defaults("gpii.app.morphicSettingsEditor", {
    gradeNames: ["gpii.app.dialog", "gpii.app.centeredDialog"],

    buttonList: null,
    morePanelList: null,
    supportedButtonsList: null,

    config: {
        fileSuffixPath: "morphicSettingsEditor/index.html",
        attrs: {
            width: 600,
            height: 400,
            alwaysOnTop: true,
            frame: true,
            resizable: true,
            transparent: false, // needs to be false to enable resizing and maximizing
            movable: true,
            minimizable: true,
            maximizable: true,
            autoHideMenuBar: true,
            titleBarStyle: "default",
        },
        params: {
            buttonList: "{that}.options.buttonList",
            morePanelList: "{that}.options.morePanelList",
            supportedButtonsList: "{that}.options.supportedButtonsList"
        }
    },

    events: {
        onOpenMYOBDialog: null,
        onMYOBCreated: null
    },

    listeners: {
        "onCreate.show": {
            func: "{that}.show"
        },
        "onCreate.debug": {
            funcName: "gpii.app.morphicSettingsEditor.debug",
            args: "{that}"
        },

        "onMYOBCreated.debug": {
            funcName: "console.log",
            args: ["### morphicSettingsEditor - MYOB Created: ", "{arguments}.0"]
        },

        "onMYOBCreated.destroyMYOBDialog": {
            funcName: "gpii.app.morphicSettingsEditor.destroyMYOBDialog",
            args: "{that}"
        }
    },

    components: {
        myobDialog: {
            type: "gpii.app.makeYourOwnButtonDialog",
            createOnEvent: "onOpenMYOBDialog",
            options: {
                listeners: {
                    "onButtonCreated.propagate": "{morphicSettingsEditor}.events.onMYOBCreated.fire"
                }
            }
            //
            // When providing the buttonsDef option, the dialog will take the data
            // so the user can edit the button
            //
            // options: {
            //     buttonDef: {
            //         "buttonId": "MakeYourOwn",
            //         "buttonName": "Launch Notepad",
            //         "buttonType": "APP",
            //         "buttonData": "C:\\Windows\\system32\\notepad.exe",
            //         "fullScreen": true,
            //         "popupText": "<p>Launch the Notepad application.</p>",
            //         "description": "The full description of the button..."
            //     }
            // }
        },
        channelListener: {
            type: "gpii.app.channelListener",
            options: {
                events: {
                    onOpenMYOBDialog: null
                },
                listeners: {
                    "onOpenMYOBDialog.propagate": {
                        func: "{morphicSettingsEditor}.events.onOpenMYOBDialog.fire"
                    }
                }
            }
        }
    }
});

gpii.app.morphicSettingsEditor.debug = function (that) {
    that.dialog.webContents.once("dom-ready", function () {
        console.log("#### it worked - supportedButtonsList: ", that.options.supportedButtonsList);
    });
};

gpii.app.morphicSettingsEditor.destroyMYOBDialog = function (that) {
    that.myobDialog.destroy();
};
