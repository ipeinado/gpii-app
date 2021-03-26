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
    fluid.defaults("gpii.morphicSettingsEditor.repeaterInList", {
        gradeNames: ["gpii.psp.repeater"],

        model: {
            items: []
        },

        dynamicContainerMarkup: {
            container: "<div class=\"%containerClass fl-focusable\">" +
                       "</div>",
            containerClassPrefix: "fl-qss-button"
        },

        markup: "<span class=\"flc-qss-btnLabel fl-qss-btnLabel\"></span>",

        invokers: {
            getHandlerType: {
                funcName: "gpii.morphicSettingsEditor.qss.getHandlerType",
                args: ["that", "{arguments}.0"]
            }
        }
    });

    fluid.defaults("gpii.morphicSettingsEditor.morePanel.rowRenderer", {
        gradeNames: ["gpii.morphicSettingsEditor.repeaterInList"],

        model: {
            items: "{that}.model.item"
        }
    });

    fluid.defaults("gpii.morphicSettingsEditor.qss.buttonPresenter", {
        gradeNames: ["fluid.viewComponent"],

        model: {
            item: {},
        },

        modelRelay: {
            target: "{that}.model.items"
        },

        modelRelay: {
            source: "item",
            target: "label",
            singleTransform: {
                type: "gpii.morphicSettingsEditor.qss.filterSettings"
            }
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
                args: ["{that}.model.label"]
            }
        }
    });

    fluid.defaults("gpii.morphicSettingsEditor.qss.separatorButtonPresenter", {
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

    fluid.defaults("gpii.morphicSettingsEditor.qss.emptyButtonPresenter", {
        gradeNames: "fluid.viewComponent",
        listeners: {
            "onCreate.addClasses": "{that}.addClasses"
        },
        invokers: {
            addClasses: {
                this: "{that}.container",
                method: "addClass",
                args: ["fl-qss-emptyBtn"]
            }
        }
    });

    fluid.defaults("gpii.morphicSettingsEditor.buttonCatalog.buttonPresenter", {
        gradeNames: "fluid.rendererComponent",
        selectors: {
            buttonLabel: ".flc-buttonCatalog-btnLabel",
            buttonTag: ".flc-buttonCatalog-btnTag",
            buttonDescription: ".flc-buttonCatalog-btnDescription"
        },
        model: {
            item: {
                label: "",
                tag: "",
                description: ""
            }
        },
        renderOnInit: true,
        protoTree: {
            buttonLabel: "${item.label}",
            buttonTag: "${item.tag}",
            buttonDescription: "${item.description}"
        }
    });

    gpii.morphicSettingsEditor.qss.filterSettings = function (button) {
        let buttonName = "";
        if (typeof(button) === 'object' ) {
            if (button.hasOwnProperty('buttonName')) {
                buttonName = button['buttonName'];
            }
        }
        if (typeof(button) === 'string') {
            buttonName = button;
        }
        return buttonName;
    };

    gpii.morphicSettingsEditor.qss.getHandlerType = function (that, setting) {
        if ((typeof(setting) === "string") && (setting === "||")) {
             return "gpii.morphicSettingsEditor.qss.separatorButtonPresenter";
        } else if ((typeof(setting) === "string") && (setting === "")) {
            return "gpii.morphicSettingsEditor.qss.emptyButtonPresenter";
        } else {
            return "gpii.morphicSettingsEditor.qss.buttonPresenter";
        } 
    };

    gpii.morphicSettingsEditor.afterButtonMove = function (that, item, position, movables) {
        let models = [that.model.morePanelList, that.model.buttonList];

        console.log("BEFORE:", models);
        
        const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
        const [index1, length1, column1, totalCols, index2, length2, column2, totalCols2] = [...item.getAttribute("aria-label").match(NUMERIC_REGEXP).map(Number)];

        if (column1 === column2) {
            [models[column1][index1], models[column1][index2]] = [models[column1][index2], models[column1][index1]]
        } else {
            models[column2][index2] = models[column1][index1]
            models[column1].splice(index1);
        };

        const [qssModel, morePanelModel] = [...models];
        console.log("AFTER QSSMODEL", qssModel);
        console.log("ATER MORE PANEL MODEL", morePanelModel);
    };

    gpii.morphicSettingsEditor.updateModels = function(item, position) {
        console.log("ON MOOOOOVE ITEM:", item);
    }

    gpii.morphicSettingsEditor.fillRow = function(items) {
        var itemsArray = items.map(itemArray => {
            let fullRow = Array(8).fill("");
            if (itemArray) {
                fullRow = fullRow.map((item, index) => itemArray[index] ? itemArray[index] : item);
            }
            return fullRow;
        });
        
        return itemsArray;
    };

    /**
     * Represents the controller for the settings editor.
     */
    fluid.defaults("gpii.morphicSettingsEditor", {
        gradeNames: ["fluid.reorderer", "fluid.viewComponent"],

        layoutHandler: "fluid.moduleLayoutHandler",

        model: {
            buttonList: "{that}.options.buttonList",
            morePanelList: "{that}.options.morePanelList",
            // supportedButtonsList may include buttons that are already part of the
            // buttonList or the morePanelList.
            // TODO: We must ensure we don't show duplicated buttons to the users
            // when moving among the main quickstrip or the more panel.
            supportedButtonsList: "{that}.options.supportedButtonsList"
        },

        selectors: {
            openMYOBButton: ".flc-morphicSettingsEditor-myobButton",
            buttonList: ".flc-quickSetStrip-main",
            morePanelList: ".flc-quickSetStrip-more-button-grid",
            buttonCatalog: ".flc-buttonCatalog-buttonList",
            movables: ".fl-qss-button",
            dropTargets: ["{that}.dom.buttonList", "{that}.dom.morePanelList"],
            modules: ".fl-qss-button",
            columns: ".flc-quickSetStrip-main, .flc-quickSetStrip-more-button-grid, .flc-buttonCatalog-buttonContainer"
        },

        events: {
            onOpenMYOBDialog: null,
            afterMove: null
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

            "onMove.updateModels": {
                funcName: "gpii.morphicSettingsEditor.updateModels"
            },

            "afterMove.reorderButtons": {
                funcName: "gpii.morphicSettingsEditor.afterButtonMove",
                args: ["{morphicSettingsEditor}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            }
        },

        components: {
            qss: {
                type: "gpii.morphicSettingsEditor.repeaterInList",
                container: "{that}.dom.buttonList",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.buttonList"
                    }
                }
            },
            
            morePanel: {
                type: "gpii.psp.repeater",
                container: "{that}.dom.morePanelList",
                options: {
                    model: {
                        items: {
                            expander: {
                                funcName: "gpii.morphicSettingsEditor.fillRow",
                                args: "{morphicSettingsEditor}.model.morePanelList"
                            }
                        }
                    },
                    dynamicContainerMarkup: {
                        container: "<div id=\"%containerClass\" class=\"fl-quickSetStrip-more-row\"></div>",
                        containerClassPrefix: "flc-qss-more-row-%id"
                    },
                    handlerType: "gpii.morphicSettingsEditor.morePanel.rowRenderer"
                }
            },

            buttonCatalog: {
                type: "gpii.psp.repeater",
                container: "{that}.dom.buttonCatalog",
                options: {
                    model: {
                        items: [
                           {label: "test 1", tag: "website", description: "example description for button 1"},
                           {label: "test 2", tag: "application", description: "example description for button 2"}
                        ]
                    },
                    dynamicContainerMarkup: {
                        container: "<div class=\"%containerClass\"></div>",
                        containerClassPrefix: "flc-buttonCatalog-buttonContainer"
                    },
                    markup: "<div class=\"flc-buttonCatalog-buttonContainer-button\">" + 
                            "<div class=\"fl-qss-button fl-focusable\">" + 
                            "<span class=\"flc-buttonCatalog-btnLabel fl-buttonCatalog-btnLabel\">" + 
                            "</span></div></div><div class=\"flc-buttonCatalog-buttonContainer-content\">" + 
                            "<div class=\"flc-buttonCatalog-btnTag\"></div>" + 
                            "<div class=\"flc-buttonCatalog-btnDescription\"></div></div>",
                    handlerType: "gpii.morphicSettingsEditor.buttonCatalog.buttonPresenter"
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

})(fluid);
