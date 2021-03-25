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
require("./makeYourOwnButtonDialog.js");
require("../common/utils.js");

var gpii = fluid.registerNamespace("gpii");

/**
 * Component that represents the dialog
 */
fluid.defaults("gpii.app.morphicSettingsEditor", {
    gradeNames: ["gpii.app.dialog", "gpii.app.centeredDialog"],

    buttonList: null,
    morePanelList: null,
    supportedButtonsList: null,
    buttonCatalog: null,

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
            supportedButtonsList: "{that}.options.supportedButtonsList",
            buttonCatalog: "{buttonCatalog}.model.buttonCatalog"
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
            // so the user can edit the button.
            // We can add a new component of type gpii.app.makeYourOwnButtonDialog
            // and adding the buttonDef data to the options block
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
        },
        buttonCatalog: {
            type: "gpii.app.buttonCatalog",
            options: {
                supportedButtonsList: "{morphicSettingsEditor}.options.supportedButtonsList"
            }
        }

    }
});

gpii.app.morphicSettingsEditor.debug = function (that) {
    that.dialog.webContents.once("dom-ready", function () {
        console.log("#### morphicSettingsEditor.debug - supportedButtonsList: ", that.options.supportedButtonsList);
    });
};

gpii.app.morphicSettingsEditor.destroyMYOBDialog = function (that) {
    that.myobDialog.destroy();
};

// This component provides a button catalog that is used to present the buttons
// to the user in the morphic settings editor.
//
fluid.defaults("gpii.app.buttonCatalog", {
    gradeNames: ["fluid.modelComponent"],

    supportedButtonsList: [],

    model: {
        translatedSettingsMessages: "{messageBundles}.model.messages.gpii_app_qss_settings",
        catalog: []
    },
    components: {
        messageBundles: {
            type: "gpii.app.messageBundles"
        }
    },

    listeners: {
        "onCreate.generateCatalog": {
            funcName: "gpii.app.buttonCatalog.generateCatalog",
            args: ["{that}", "{that}.options.supportedButtonsList"]
        }
    }
});

gpii.app.buttonCatalog.generateCatalog = function (that, buttonList) {
    var catalog = [];

    fluid.each(buttonList, function (buttonId) {
        var messageKey = gpii.app.getSupportedButtonMessageKey(buttonId);
        var messages = that.model.translatedSettingsMessages[messageKey];

        var button = {
            id: buttonId,
            description: messages.description,
            title: messages.title
        };

        catalog.push(button);
    });

    that.applier.change("buttonCatalog", catalog);
};
