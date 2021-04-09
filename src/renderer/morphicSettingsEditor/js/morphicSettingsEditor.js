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
            container: "<div class=\"%containerClass fl-qss-button-movable fl-focusable\">" +
                       "</div>",
            containerClassPrefix: "fl-qss-button"
        },

        markup: "<span class=\"flc-qss-btnLabel fl-qss-btnLabel\"></span>",

        handlerType: "gpii.psp.morphicSettingsEditor.qss.buttonPresenter"
    });

    /**
     * HandlerType grade for regular buttons in both the QSS and the 'More' panel
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor.qss.buttonPresenter", {
        gradeNames: ["fluid.rendererComponent"],

        modelRelay: {
            target: "button",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.psp.morphicSettingsEditor.getButtonInfo",
                args: ["{morphicSettingsEditor}.model.buttonCatalog", "{that}.model.item"]
            }
        },

        selectors: {
            title: ".flc-qss-btnLabel"
        },

        decorators: {
            identify: "{that}.item.id"
        },

        events: {
            onContextMenuHandler: null
        },

        listeners: {
            "onCreate.setClasses": {
                funcName: "gpii.psp.morphicSettingsEditor.qss.setClasses",
                args: ["{that}"]
            },
            "onCreate.addContextMenuHandler": {
                this: "{that}.container",
                method: "contextmenu",
                args: ["{that}.events.onContextMenuHandler.fire"]
            },
            "onContextMenuHandler.displayContextMenu": "{that}.displayContextMenu"
        },

        renderOnInit: true,

        protoTree: {
            title: "${button.title}"
        },

        invokers: {
            /**
             * Infrastructure to start building the context menu with actions
             */
            displayContextMenu: {
                this: "console",
                method: "log",
                args: ["CONTEXT MENUING"]
            }
        }
    });

    fluid.defaults("gpii.psp.morphicSettingsEditor.qss.separatorButtonPresenter", {
        gradeNames: ["fluid.viewComponent"],
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

    /**
     * Handler type for displaying a button in the button catalog
     */

    fluid.defaults("gpii.psp.morphicSettingsEditor.buttonCatalog.buttonPresenter", {
        gradeNames: "fluid.rendererComponent",
        selectors: {
            button: ".flc-qss-button",
            buttonLabel: ".flc-buttonCatalog-btnLabel",
            buttonTag: ".flc-buttonCatalog-btnTag",
            buttonDescription: ".flc-buttonCatalog-btnDescription"
        },
        model: {
            tag: ""
        },
        modelRelay: {
            target: "button",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.psp.morphicSettingsEditor.getButtonInfo",
                args: ["{morphicSettingsEditor}.model.buttonCatalog", "{that}.model.item"]
            }
        },
        renderOnInit: true,

        listeners: {
            "onCreate.setClasses": {
                funcName: "gpii.psp.morphicSettingsEditor.qss.setClasses",
                args: ["{that}"]
            },
            "onCreate.addTags": {
                funcName: "gpii.psp.morphicSettingsEditor.buttonCatalog.addTags",
                args: ["{morphicSettingsEditor}.model.buttonList", "{morphicSettingsEditor}.model.morePanelList", "{that}"]
            }

        },
        protoTree: {
            buttonLabel: "${button.title}",
            buttonTag: "${tag}",
            buttonDescription: "${button.description}"
        },

        invokers: {
            logThat: {
                funcName: "gpii.psp.morphicSettingsEditor.log",
                args: ["{that}"]
            }
        }
    });

    /**
     *
     * @param button
     * Utility function to add classes to the botton depending on the id of the button.
     * Information about the type of button should probably be provided in the button
     * (i.e. type: "separator" or type: "fl-button-small") instead of being calculated
     */

    gpii.psp.morphicSettingsEditor.qss.setClasses = function(button) {

        var qssButton = button.container.hasClass("fl-qss-button") ? button.container : button.container.find(".fl-qss-button");

        if (typeof(button.model.item) === "string") {
            switch (button.model.item) {
                case "||":
                case "separator-visible":
                case "separator":
                    qssButton.addClass("fl-qss-separator");
                    break;
                case "grid":
                case "grid-visible":
                    qssButton.addClass("fl-qss-emptyBtn");
                    break;
                case "service-undo":
                case "service-save":
                case "service-saved-settings":
                case "service-reset-all":
                    qssButton.addClass("fl-qss-button-small");
                    break;
                case "service-close":
                    qssButton.addClass("fl-more-closeButton");
                    qssButton.addClass("fl-qss-closeButton");
                    break;
                default:
                    break;
            }
        }
    };

    /**
     *
     * @param {*} qssButtons
     * @param {*} morePanelButtons
     * @param {*} button
     * Add tags to the buttons in the button catalog, depending whether thay are part of any button holder.
     */

    gpii.psp.morphicSettingsEditor.buttonCatalog.addTags = function(qssButtons, morePanelButtons, button) {

        let id = button.model.item,
            tag;

        if (qssButtons.indexOf(id) !== -1) {
            tag = "In QSS";
            button.container.find(".fl-qss-button").removeClass("fl-qss-button-movable");
        };

        if (fluid.flatten(morePanelButtons).indexOf(id) !== -1) {
            tag = "In More Panel";
            button.container.find(".fl-qss-button").removeClass("fl-qss-button-movable");
        };

        button.applier.change("tag", tag);
    };

    /**
     * This function updates the models after a button has moved.
     *
     * It uses the aria-label
     */
    gpii.psp.morphicSettingsEditor.updateModels = function (that, item, position, movables) {
        let models = [fluid.flatten(that.model.morePanelList), that.model.buttonList];
        /* console.log("MORE PANEL MODEL:", gpii.psp.morphicSettingsEditor.buildRows(morePanelModel));
        console.log("QSS MODEL:", qssModel);

        console.log("GEOMETRIC INFO:", that.layoutHandler.getGeometricInfo());

        let morePanel = that.layoutHandler.getGeometricInfo()['extents'][0]['elements'],
            qss = that.layoutHandler.getGeometricInfo()['extents'][1]['elements'];

        console.log("MOVED MAP:", that.movedMap); */

        /**
         * Get geometric values:
         *  index is the new position index
         *  length is the number of elements in the destination module
         *  moduleIndex is the index of the module (1 for 'more' panel, 2 for qss, 3 for button catalog)
         *  moduleLength is the number of modules in the container (should be 3)
         */
        //  var geom = that.layoutHandler.getGeometricInfo();
        // var { index, length, moduleIndex, moduleLength } = fluid.reorderer.indexRebaser(geom.elementIndexer(item));

/*         console.log("BUTTON CATALOG", that);
        var button = fluid.each(that.model.buttonCatalog, function(btn, inx) {
            return (btn.title === item.innerText) ? btn.id : "";
        });

        switch (moduleIndex) {
            case 1:
                // The destination is the 'more' panel
                console.log("DESTINATION IS MORE PANEL", that.model.morePanelList);
                break;
            case 2:
                // The destination is the qss
                console.log("DESTINATION IS QSS", that.model.buttonList);
                break;
            case 3:
                console.log("DESTINATION IS BUTTON CATALOG");
                break;
            default:
                break;
        }; */

        const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
        const [index1, length1, column1, totalCols, index2, length2, column2, totalCols2] = [...item.getAttribute("aria-label").match(NUMERIC_REGEXP).map(Number)];

        if (column1 === column2) {
            [models[column1 - 1][index1 - 1], models[column1 - 1][index2 - 1]] = [models[column1 - 1][index2 - 1], models[column1 - 1][index1 - 1]]
        } else {
            models[column2 - 1][index2 - 1] = models[column1 - 1][index1 - 1]

            if (column1 !== 3) {
                models[column1 - 1].splice(index1 - 1, 1);
            }

        };

        const morePanelModel = [models[0].splice(0, 8), models[0].splice(0, 8), models[0]]
        const qssModel = models[1];

        that.applier.change("morePanelList", morePanelModel);
        that.applier.change("buttonList", qssModel);

        console.log("THATTTTT", that);
        that.dom.refresh(that.buttonCatalog);
    };

    /**
     * This function is the opposite to the previous one, and returns an
     * three arrays of arrays from an unique array
     */
    gpii.psp.morphicSettingsEditor.buildRows = function(items) {
        let allItems = Array(24 - items.length).fill(undefined).concat(items);
        return [
            allItems.slice(0, 8).filter(fluid.isValue),
            allItems.slice(8, 16).filter(fluid.isValue),
            allItems.slice(16, 24).filter(fluid.isValue)
        ];
    };

    gpii.psp.morphicSettingsEditor.toggleQss = function(that, newValues) {
        var numberNonSeparators = newValues.length - newValues.filter(item => item === "||").length;
/*         if (numberNonSeparators >= 11) {
            that.options.selectors.columns = ".flc-quickSetStrip-more-button-grid, .flc-buttonCatalog-buttonContainer"
        } else {
            that.options.selectors.columns = ".flc-quickSetStrip-main, .flc-quickSetStrip-more-button-grid, .flc-buttonCatalog-buttonContainer";
        }; */
        console.log(that);
/*         that.applier.change("editorHistory", that.model.editorHistory.push(newValues));
        console.log("TOGGLE QSS:", that.model.editorHistory); */
    };

    gpii.psp.morphicSettingsEditor.log = function(arg) {
        console.log("LOOOG", arg);
    };

    gpii.psp.morphicSettingsEditor.setModules = function(that) {
        console.log("ON CREATE MORHICSETTINGSEDITOR", that);

        var numItemsQSS = that.model.buttonList.length
                          - that.model.buttonList.filter(item => item === "||").length
                          - 3;
        if (numItemsQSS > 8) {
           // document.querySelector(".flc-quickSetStrip-main").classList.add("module-locked");
           that.options.selectors.columns = ".flc-quickSetStrip-more-button-grid, .flc-buttonCatalog-buttonList"
        }
    };

    /**
     * Represents the controller for the settings editor.
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor", {
        gradeNames: ["fluid.viewComponent", "fluid.reorderer"],

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
            buttonCatalog: "{that}.options.buttonCatalog",
            editorHistory: []
        },

        selectors: {
            openMYOBButton: ".flc-morphicSettingsEditor-myobButton",
            buttonList: ".flc-quickSetStrip-main",
            morePanelList: ".flc-quickSetStrip-more-button-grid",
            buttonCatalog: ".flc-buttonCatalog-buttonList",
            movables: ".fl-qss-button-movable",
            dropTargets: ["{that}.dom.morePanelList", "{that}.dom.buttonCatalog"],
            modules: ".fl-qss-button-movable",
            lockedModules: ".module-locked",
            columns: ".flc-quickSetStrip-main, .flc-quickSetStrip-more-button-grid, .flc-buttonCatalog-buttonList"
        },

        events: {
            onOpenMYOBDialog: null,
            onMYOBCreated: null,
            afterMove: null,
            onMove: null
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

            "onCreate.setModules": {
                funcName: "gpii.psp.morphicSettingsEditor.setModules",
                args: ["{that}"]
            },

            "afterMove.reorderButtons": {
                funcName: "gpii.psp.morphicSettingsEditor.updateModels",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            }
        },

        invokers: {
            addNewMYOB: {
                funcName: "gpii.psp.morphicSettingsEditor.addNewMYOB",
                args: ["{that}", "{arguments}.0"]
            }
        },

        components: {
            qss: {
                type: "gpii.psp.morphicSettingsEditor.repeaterInList",
                container: "{that}.dom.buttonList",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.buttonList"
                    }
                }
            },

            morePanel: {
                type: "gpii.psp.morphicSettingsEditor.repeaterInList",
                container: "{that}.dom.morePanelList",
                options: {
                    model: {
                        items: {
                            expander: {
                                func: "fluid.flatten",
                                args: "{morphicSettingsEditor}.model.morePanelList"
                            }
                        }
                    }
                }
            },

            buttonCatalog: {
                type: "gpii.psp.repeater",
                container: "{that}.dom.buttonCatalog",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.supportedButtonsList"
                    },
                    dynamicContainerMarkup: {
                        container: "<div class=\"%containerClass\"></div>",
                        containerClassPrefix: "flc-buttonCatalog-buttonContainer"
                    },
                    markup: "<div class=\"flc-buttonCatalog-buttonContainer-button\">" +
                            "<div class=\"fl-qss-button fl-qss-button-movable fl-focusable\">" +
                            "<span class=\"flc-buttonCatalog-btnLabel fl-buttonCatalog-btnLabel\">" +
                            "</span></div></div><div class=\"flc-buttonCatalog-buttonContainer-content\">" +
                            "<div class=\"flc-buttonCatalog-btnTag\"></div>" +
                            "<div class=\"flc-buttonCatalog-btnDescription\"></div></div>",
                    handlerType: "gpii.psp.morphicSettingsEditor.buttonCatalog.buttonPresenter"
                }
            },

            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onOpenMYOBDialog: null
                    }
                }
            },
            channelListener: {
                type: "gpii.psp.channelListener",
                options: {
                    events: {
                        onMYOBCreated: null
                    },
                    listeners: {
                        "onMYOBCreated.debug": {
                            func: "{morphicSettingsEditor}.addNewMYOB",
                            args: "{arguments}.0"
                        }
                    }
                }
            }
        }

    });

    gpii.psp.morphicSettingsEditor.addNewMYOB = function (that, button) {
        console.log("### at addNewMYOB - button: ", button);
        // TODO: Implement adding the created button
    };

    // TODO: Merge these two functions into one
    gpii.psp.morphicSettingsEditor.getButtonTitle = function (buttonCatalog, buttonId) {
        var button = fluid.find_if(buttonCatalog, function (el) {
            return (el.id === buttonId)? true : false;
        });

        return button? button.title: null
    };

    gpii.psp.morphicSettingsEditor.getButtonDescription = function (buttonCatalog, buttonId) {
        var button = fluid.find_if(buttonCatalog, function (el) {
            return (el.id === buttonId)? true : false;
        });

        return button? button.description: null
    };

    gpii.psp.morphicSettingsEditor.getButtonInfo = function(buttonCatalog, buttonId) {

        let buttonObject = {};

        switch (typeof(buttonId)) {
            case "string":
                console.log("STRING", buttonId);
                var button = fluid.find_if(buttonCatalog, function (el) {
                    return (el.id === buttonId)? true : false;
                });
                buttonObject = button ? {
                    id: buttonId,
                    title: button.title,
                    description: button.description }: null;
                break;
            case "object":
                console.log("OBJECT", buttonId);
                buttonObject = {
                    id: buttonId.buttonId,
                    title: buttonId.buttonName,
                    type: buttonId.buttonType,
                    description: buttonId.buttonText
                };
                break;
            default:
                buttonObject = null;
                break;
        }

        return buttonObject;

    };

})(fluid);
