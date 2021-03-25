/**
 * The Morphic Settings Editor dialog
 *
 * Represents the Morphic Settings Editor dialog.
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
     * Grade creates to be used for rendering the QSS strip and `More panel` buttons.
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor.repeaterInList", {
        gradeNames: ["gpii.psp.repeater"],

        dynamicContainerMarkup: {
            container: "<div class=\"%containerClass fl-focusable\">" +
                       "</div>",
            containerClassPrefix: "fl-qss-button"
        },

        markup: "<span class=\"flc-qss-btnLabel fl-qss-btnLabel\"></span>",

        invokers: {
            getHandlerType: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.getHandlerType",
                args: ["that", "{arguments}.0"]
            }
        }
    });

    fluid.defaults("gpii.psp.morphicSettingsEditor.qss.buttonPresenter", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            item: ""
        },
        selectors: {
            title: ".flc-qss-btnLabel"
        },
        listeners: {
            "onCreate.displayTitle": "{that}.displayTitle"
        },
        invokers: {
            displayTitle: {
                this: "{that}.dom.title",
                method: "text",
                args: ["{that}.model.item"]
            }
        }
    });

    fluid.defaults("gpii.psp.morphicSettingsEditor.qss.separatorButtonPresenter", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            item: ""
        },
        listeners: {
            "onCreate.addClasses": "{that}.addClasses"
        },
        invokers: {
            addClasses: {
                this: "{that}.container",
                method: "addClass",
                args: ["fl-qss-separator"]
            }
        }
    });

    gpii.psp.morphicSettingsEditor.qss.filterSettings = function (morphicSettingsEditor, settings) {
        var newSettings = [];
        fluid.each(settings, function(item, key) {
            var buttonName = "";
            if (typeof(item) === "object" ) {
                if (item.hasOwnProperty("buttonName")) {
                    buttonName = item["buttonName"];
                }
            }
            if (typeof(item) === "string") {
                buttonName = morphicSettingsEditor.getButtonTitle(item) || item;
            }
            newSettings.push(buttonName);
        });
        return newSettings;
    };

    gpii.psp.morphicSettingsEditor.qss.getHandlerType = function (that, setting) {
        if ((typeof(setting) === "string") && (setting === "||")) {
            return "gpii.psp.morphicSettingsEditor.qss.separatorButtonPresenter";
        } else {
            return "gpii.psp.morphicSettingsEditor.qss.buttonPresenter";
        }
    };

    gpii.psp.morphicSettingsEditor.afterButtonMove = function (item, position, movables) {
        console.log("## afterButtonMove - movables: ", movables);
    };

    gpii.psp.morphicSettingsEditor.testFunction = function (variables) {
        console.log("## testFunction - variables: ", variables);
    };

    /**
     * Represents the controller for the settings editor.
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor", {
        gradeNames: ["fluid.reorderer", "fluid.viewComponent"],

        layoutHandler: "fluid.moduleLayoutHandler",

        model: {
            // buttonList, morePanelList and supportedButtonsList are arrays of
            // button ids
            buttonList: "{that}.options.buttonList",
            morePanelList: "{that}.options.morePanelList",
            // supportedButtonsList may include buttons that are already part of the
            // buttonList or the morePanelList.
            // TODO: We must ensure we don't show duplicated buttons to the users
            // when moving among the main quickstrip or the more panel.
            supportedButtonsList: "{that}.options.supportedButtonsList",

            messages: {
                // translatable strings go here
            },

            // Button catalog as an array. Each button has the following information
            // { id: "button-name", description: "full description", title: "Button title" }
            //
            // The id correspond to the same ids that are provided in buttonList,
            // morePanelList and supportedButtonsList.
            //
            // It can be extended to provide more information.
            buttonCatalog: "{that}.options.buttonCatalog"
        },

        selectors: {
            openMYOBButton: ".flc-morphicSettingsEditor-myobButton",
            buttonList: ".flc-quickSetStrip-main",
            morePanelList: ".flc-quickSetStrip-more-button-grid",
            movables: ".fl-qss-button",
            dropTargets: ["{that}.dom.buttonList", "{that}.dom.morePanelList"],
            modules: ".fl-qss-button",
            columns: ".flc-quickSetStrip-main,.flc-quickSetStrip-more-button-grid"
        },

        events: {
            onOpenMYOBDialog: null
        },

        listeners: {
            "onCreate.addMYOBClickHandler": {
                this: "{that}.dom.openMYOBButton",
                method: "click",
                args: "{that}.events.onOpenMYOBDialog.fire"
            },
            // TODO: Useful to debug work on opening myobDialog and passing a buttonDef,
            // remove when that's implemented.
            // "onOpenMYOBDialog.debug": {
            //     funcName: "console.log",
            //     args: ["#### onOpenMYOBDialog fired, args: ", "{arguments}.0"]
            // },
            "onOpenMYOBDialog.notifyMainProcess": {
                funcName: "{channelNotifier}.events.onOpenMYOBDialog.fire",
                args: ["{arguments}.0"]
            },

            "afterMove.reorderButtons": "gpii.psp.morphicSettingsEditor.afterButtonMove"
        },

        invokers: {
            getButtonTitle: {
                funcName: "gpii.psp.morphicSettingsEditor.getButtonTitle",
                args: ["{that}.model.buttonCatalog", "{arguments}.0"]
            }
        },

        components: {
            qss: {
                type: "gpii.psp.morphicSettingsEditor.repeaterInList",
                container: "{that}.dom.buttonList",
                options: {
                    model: {
                        items: {
                            expander: {
                                func: "gpii.psp.morphicSettingsEditor.qss.filterSettings",
                                args: ["{morphicSettingsEditor}", "{morphicSettingsEditor}.model.buttonList"]
                            }
                        }
                    },
                    handlerType: " gpii.psp.morphicSettingsEditor.qss.getHandlerType"
                }
            },
            morePanel: {
                type: "gpii.psp.morphicSettingsEditor.repeaterInList",
                container: "{that}.dom.morePanelList",
                options: {
                    model: {
                        items: {
                            expander: {
                                func: "gpii.psp.morphicSettingsEditor.qss.filterSettings",
                                args: ["{morphicSettingsEditor}", "{morphicSettingsEditor}.model.morePanelList"]
                            }
                        }
                    },
                    handlerType: " gpii.psp.morphicSettingsEditor.qss.getHandlerType"
                }
            },
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onOpenMYOBDialog: null
                    }
                }
            }
        }

    });

    gpii.psp.morphicSettingsEditor.getButtonTitle = function (buttonCatalog, buttonId) {
        var button = fluid.find_if(buttonCatalog, function (el) {
            return (el.id === buttonId)? true : false;
        });

        return button? button.title: null
    };

})(fluid);
