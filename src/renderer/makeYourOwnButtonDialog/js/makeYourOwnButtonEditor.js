/**
 * The Make Your Own Button editor dialog
 *
 * Represents the MYOB Editor dialog.
 * Copyright 2021 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    /**
     * Represents the controller for the settings editor.
     */
    fluid.defaults("gpii.psp.makeYourOwnButtonEditor", {
        gradeNames: ["fluid.viewComponent", "gpii.binder.bindOnCreate"],

        model: {
            // messages are in message bundle, look for gpii_psp_makeYourOwnButtonEditor
            // group of strings.
            messages: {
                // button name
                nameLabel: null,
                namePlaceholder: null,

                // button type
                typeLabel: null,
                typeOptionWeb: null,
                typeOptionApp: null,

                // button data
                dataLabelWeb: null,
                dataLabelApp: null,
                dataPlaceholderWeb: null,
                dataPlaceholderApp: null,

                // button popup
                popupLabel: null,
                popupPlaceholder: null,

                // button description
                descriptionLabel: null,
                descriptionPlaceholder: null,

                // save button
                saveButtonLabel: null
            },

            buttonDef: {
                buttonId: "MakeYourOwn",
                buttonName: null,
                buttonType: "WEB",
                buttonData: null,
                popupText: null,
                description: null,
                fullScreen: false // TODO: Add into UI
            }
        },

        selectors: {
            // label of the preview button
            btnPreviewLabel:     ".flc-myobEditor-btnPreviewLabel",

            // button name
            nameLabel:          ".flc-myobEditor-nameLabel",
            nameInput:          ".flc-myobEditor-nameInput",

            // button type
            typeLabel:          ".flc-myobEditor-typeLabel",
            typeInput:          ".flc-myobEditor-typeInput",
            typeOptionWeb:      ".flc-myobEditor-typeOptionWeb",
            typeOptionApp:      ".flc-myobEditor-typeOptionApp",

            // button data
            // * can be either WEB or APP
            // * labels needs to be updated when the selection changes
            dataLabel:          ".flc-myobEditor-dataLabel",
            dataInput:          ".flc-myobEditor-dataInput",

            // button popup text
            popupLabel:         ".flc-myobEditor-popupLabel",
            popupInput:         ".flc-myobEditor-popupInput",

            // button description
            descriptionLabel:   ".flc-myobEditor-descriptionLabel",
            descriptionInput:   ".flc-myobEditor-descriptionInput",

            // save button
            saveButton:         ".flc-myobEditor-saveButton"
        },

        bindings: {
            // selector : model
            nameInput: "buttonDef.buttonName",
            typeInput: "buttonDef.buttonType",
            dataInput: "buttonDef.buttonData",
            popupInput: "buttonDef.popupText",
            descriptionInput: "buttonDef.description"
        },

        modelListeners: {
            // UI message initialization with i18n support
            "messages.nameLabel": {
                this: "{that}.dom.nameLabel",
                method: "text",
                args: "{that}.model.messages.nameLabel"
            },
            "messages.namePlaceholder": {
                this: "{that}.dom.nameInput",
                method: "attr",
                args: ["placeholder", "{that}.model.messages.namePlaceholder"]
            },
            "messages.typeLabel": {
                this: "{that}.dom.typeLabel",
                method: "text",
                args: "{that}.model.messages.typeLabel"
            },
            "messages.typeOptionWeb": {
                this: "{that}.dom.typeOptionWeb",
                method: "text",
                args: "{that}.model.messages.typeOptionWeb"
            },
            "messages.typeOptionApp": {
                this: "{that}.dom.typeOptionApp",
                method: "text",
                args: "{that}.model.messages.typeOptionApp"
            },
            "messages.dataLabelWeb": {
                this: "{that}.dom.dataLabel",
                method: "text",
                args: "{that}.model.messages.dataLabelWeb"
            },
            "messages.dataPlaceholderWeb": {
                this: "{that}.dom.dataInput",
                method: "attr",
                args: ["placeholder", "{that}.model.messages.dataPlaceholderWeb"]
            },
            "messages.popupLabel": {
                this: "{that}.dom.popupLabel",
                method: "text",
                args: "{that}.model.messages.popupLabel"
            },
            "messages.popupPlaceholder": {
                this: "{that}.dom.popupInput",
                method: "attr",
                args: ["placeholder", "{that}.model.messages.popupPlaceholder"]
            },
            "messages.descriptionLabel": {
                this: "{that}.dom.descriptionLabel",
                method: "text",
                args: "{that}.model.messages.descriptionLabel"
            },
            "messages.descriptionPlaceholder": {
                this: "{that}.dom.descriptionInput",
                method: "attr",
                args: ["placeholder", "{that}.model.messages.descriptionPlaceholder"]
            },
            "messages.saveButtonLabel": {
                this: "{that}.dom.saveButton",
                method: "text",
                args: "{that}.model.messages.saveButtonLabel"
            },

            // Button type switch
            "buttonDef.buttonType": {
                funcName: "gpii.psp.makeYourOwnButtonEditor.switchType",
                args: ["{that}", "{change}.value"]
            },

            // Button name update - that updates button preview
            "buttonDef.buttonName": {
                this: "{that}.dom.btnPreviewLabel",
                method: "text",
                args: "{that}.model.buttonDef.buttonName"
            }
        },

        events: {
            onSaveClick: null,
            onButtonCreated: null
        },

        listeners: {
            "onCreate.setupButtonDef": {
                funcName: "gpii.psp.makeYourOwnButtonEditor.setupButtonDef",
                args: "{that}"
            },
            "onCreate.addSaveClickHandler": {
                this: "{that}.dom.saveButton",
                method: "click",
                args: "{that}.events.onSaveClick.fire"
            },
            "onSaveClick.notifyMainProcess": {
                func: "{channelNotifier}.events.onButtonCreated.fire",
                args: "{that}.model.buttonDef"
            }
        },

        components: {
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onButtonCreated: null
                    }
                }
            }
        }

    });

    gpii.psp.makeYourOwnButtonEditor.switchType = function (that, type) {
        var typeLabelStr = (type === "WEB")?
            that.model.messages.dataLabelWeb:
            that.model.messages.dataLabelApp;

        var typePlaceholderStr = (type === "WEB")?
            that.model.messages.dataPlaceholderWeb:
            that.model.messages.dataPlaceholderApp;

        var dataLabelEl = gpii.psp.widgetGradeToSelectorName(that.dom, "gpii.psp.makeYourOwnButtonEditor.dataLabel");
        var dataInputEl = gpii.psp.widgetGradeToSelectorName(that.dom, "gpii.psp.makeYourOwnButtonEditor.dataInput");

        dataLabelEl.text(typeLabelStr);
        dataInputEl.attr("placeholder", typePlaceholderStr);
    };

    gpii.psp.makeYourOwnButtonEditor.setupButtonDef = function (that) {
        if (that.options.buttonDef) {
            that.applier.change("buttonDef", that.options.buttonDef);
        };
    };

})(fluid);
