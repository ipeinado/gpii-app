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

const { Console } = require("console");
const { sep } = require("path");

(function (fluid) {
    var isDeepStrictEqual = require("util").isDeepStrictEqual;
    var gpii = fluid.registerNamespace("gpii");

    const ELEMENTS = [
      "|",
      "||",
      "separator",
      "separator-visible",
      "-",
      "x",
      "grid",
      "grid-visible"
    ];

    const STATIC_BUTTONS = [
      "morphic",
      "service-more",
      "service-undo",
      "service-save",
      "service-saved-settings",
      "service-reset-all",
      "service-close"
    ];

    /**
     * Renderer component for the context menu (for each button)
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor.contextMenu", {
        gradeNames: "fluid.rendererComponent",
        model: {
            caller: null
        },
        selectors: {
            removeLink: ".mor-buttonContextMenu-item-remove"
        },
        renderOnInit: true,
        listeners: {
            // Use the Keyboard Accessibility Plugin to ensure that the container is in the tab order
            "onCreate.makeTabbable": {
                listener: "fluid.tabbable",
                args: ["{that}.container"]
            }
        },

        invokers: {
            removeButtonClickHandler: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.removeButton",
                args: ["{arguments}.0", "{that}", "{morphicSettingsEditor}", "{buttonCatalog}"]
            },
            removeButtonBlurHandler: {
                funcName: "gpii.psp.morphicSettingsEditor.log",
                args: ["{that}"]
            },
            removeButtonKeydownHandler: {
                funcName: "gpii.psp.morphicSettingsEditor.handleKeydown",
                args: ["{arguments}.0", "{that}", "{morphicSettingsEditor}", "{buttonCatalog}"]
            }
        },

        protoTree: {
            removeLink: {
                value: "${actions.remove}",
                decorators: [
                    { type: "jQuery", func: "click", args: ["{that}.removeButtonClickHandler"] },
                    { type: "jQyery", func: "blur", args: ["{that}.removeButtonBlurHandler"] },
                    { type: "jQuery", func: "keydown", args: ["{that}.removeButtonKeydownHandler"] }
                ]
            }
        }
    });

    /**
     * Renderer component to display the QSS
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor.qss", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            button: ".fl-qss-button",
            buttonLabel: ".fl-qss-btnLabel"
        },

        repeatingSelectors: ["button"],

        listeners: {
            "prepareModelForRender.getInfoFromCatalog": {
                funcName: "gpii.psp.morphicSettingsEditor.qss.prepareQSSModel",
                args: ["{arguments}.0", "{arguments}.1", "{arguments}.2", "{morphicSettingsEditor}"]
            },
            "onCreate.addSortableListener": {
                funcName: "gpii.psp.morphicSettingsEditor.addSortableListener",
                args: ["{that}", "{morphicSettingsEditor}"]
            }
        },
        renderOnInit: true,
        rendererOptions: {
            autoBind: true
        },
        rendererFnOptions: {
            noexpand: true
        },
        invokers: {
            produceTree: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.produceTree",
                args: ["{that}", "{morphicSettingsEditor}"]
            }
        },

        resources: {
            template: {
                resourceText: "<div class=\"fl-qss-button\"><span class=\"fl-qss-btnLabel\"></span></div>"
            }
        }
    });

    /**
     * Represents the controller for the whole settings editor.
     */
     fluid.defaults("gpii.psp.morphicSettingsEditor", {
        gradeNames: ["fluid.rendererComponent"],

        // layoutHandler: "fluid.moduleLayoutHandler",

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
                instruction: 'Hola manolito'
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
            saveButton: ".flc-morphicSettingsEditor-saveButton",

            instructions: ".flc-qss-instructions",

            buttonList: ".fl-quickSetStrip-main-buttonList",
            morePanelList: ".fl-quickSetStrip-more",
            qssContextMenu: ".mor-buttonContextMenu",

            buttonCatalog: ".flc-buttonCatalog-buttonList",
            // movables: ".fl-qss-button-movable",
            // dropTargets: ["{that}.dom.morePanelList", "{that}.dom.buttonCatalog"],
            // modules: ".fl-qss-button-movable",
            // lockedModules: ".module-locked",
            // columns: ".fl-quickSetStrip-main-buttonList, .fl-quickSetStrip-more, .flc-buttonCatalog-buttonList"
        },

        events: {
            onOpenMYOBDialog: null,
            onMYOBCreated: null,

            onSaveButtonClicked: null,

            onBeginMove: null,
            afterMove: null
        },

        listeners: {
            /* "onCreate.addClickHandler": {
                this: "{that}.container",
                method: "click",
                args: ["{that}.mseClickHandler"]
            }, */

            "onCreate.addMYOBClickHandler": {
                this: "{that}.dom.openMYOBButton",
                method: "click",
                args: "{that}.events.onOpenMYOBDialog.fire"
            },
            "onCreate.addSaveButtonClickHandler": {
                this: "{that}.dom.saveButton",
                method: "click",
                args: "{that}.events.onSaveButtonClicked.fire"
            },
            "onCreate.disableSaveButton": {
                this: "{that}.dom.saveButton",
                method: "attr",
                args: [{disabled: true}]
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

            "onSaveButtonClicked.notifyMainProcess": {
                funcName: "{channelNotifier}.events.onSaveButtonClicked.fire",
                args: ["{that}.model.buttonList", "{that}.model.morePanelList"]
            },

            // "afterMove.reorderButtons": {
            //     funcName: "gpii.psp.morphicSettingsEditor.updateModels",
            //     args: ["{arguments}.0", "{arguments}.1", "{arguments}.2", "{that}"]
            // },

            // "afterMove.enableSaveButton": {
            //     this: "{that}.dom.saveButton",
            //     method: ["attr"],
            //     args: [{disabled: false}]
            // }
        },

        invokers: {
            addNewMYOB: {
                funcName: "gpii.psp.morphicSettingsEditor.addNewMYOB",
                args: ["{that}", "{arguments}.0", "{buttonCatalog}", "{morphicSettingsEditor}"]
            },
            mseClickHandler: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.hideContextMenu",
                args: ["{that}.dom.qssContextMenu"]
            }
        },


        components: {

            instructions: {
                type: "fluid.rendererComponent",
                container: "{that}.dom.instructions",
                options: {
                    model: {
                        messages: "{morphicSettingsEditor}.model.messages"
                    },
                    modelListeners: {
                        messages: {
                            funcName: "{that}.refreshView"
                        }
                    },
                    selectors: {
                        instructionText: ".flc-qss-instructions-text"
                    },
                    renderOnInit: true,
                    protoTree: {
                        'instructionText': "${messages.instruction}"
                    }
                }
            },

            qss: {
                type: "gpii.psp.morphicSettingsEditor.qss",
                container: "{that}.dom.buttonList",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.buttonList",
                        buttonCatalog: "{morphicSettingsEditor}.model.buttonCatalog"
                    },
                    modelListeners: {
                        items: {
                            func: "{that}.refreshView"
                        }
                    }
                }
            },

            morePanel: {
                type: "gpii.psp.morphicSettingsEditor.qss",
                container: "{that}.dom.morePanelList",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.morePanelList",
                        buttonCatalog: "{morphicSettingsEditor}.model.buttonCatalog"
                    },
                    modelListeners: {
                        items: {
                            func: "{that}.refreshView"
                        }
                    }
                }
            },

            buttonCatalog: {
                type: "gpii.psp.morphicSettingsEditor.buttonCatalog",
                container: "{that}.dom.buttonCatalog",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.buttonCatalog",
                        buttonList: "{morphicSettingsEditor}.model.buttonList",
                        morePanelList: "{morphicSettingsEditor}.model.morePanelList"
                    },
                    modelListeners: {
                        items: { func: "{that}.refreshView" },
                        buttonList: { func: "{that}.refreshView" },
                        morePanelList: { func: "{that}.refreshView" }
                    }
                }
            },

            contextMenu: {
                type: "gpii.psp.morphicSettingsEditor.contextMenu",
                container: "{morphicSettingsEditor}.dom.qssContextMenu",
                options: {
                    model: {
                        actions: {
                            remove: "Remove button from QSS"
                        }
                    }
                }
            },

            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onOpenMYOBDialog: null,
                        onSaveButtonClicked: null
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

    /**
     * Renderer Component for the Button Catalogue
     */
     fluid.defaults("gpii.psp.morphicSettingsEditor.buttonCatalog", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            "button:": ".flc-buttonCatalog-buttonContainer-button",
            button: ".fl-qss-button",
            buttonLabel: ".flc-buttonCatalog-btnLabel",
            buttonTag: ".flc-buttonCatalog-btnTag",
            buttonDescription: ".flc-buttonCatalog-btnDescription",
            buttonAddButtonToQSS: ".flc-buttonCatalog-btnAddToQSS",
            buttonAddButtonToMorePanel: ".flc-buttonCatalog-btnAddToMorePanel"
        },

        resources: {
            template: {
                resourceText: "<div class=\"flc-buttonCatalog-buttonContainer-button\">" +
                              "<div class=\"flc-buttonCatalog-buttonContainer-button-container\">" +
                              "<div class=\"fl-qss-button\"><span class=\"flc-buttonCatalog-btnLabel\"></span></div>" +
                              "</div>" +
                              "<div class=\"flc-buttonCatalog-buttonContainer-content\">" +
                              "<div class=\"flc-buttonCatalog-btnTag\"></div>" +
                              "<div class=\"flc-buttonCatalog-btnDescription\"></div>" +
                              "<div class=\"flc-buttonCatalog-btnAddToQSS\" role=\"button\"></div>" +
                              "<div class=\"flc-buttonCatalog-btnAddToMorePanel\" role=\"button\"></div>" +
                              "</div>" + // flc-buttonCatalog-buttonContainer-content
                              "</div>" // flc-buttonCatalog-buttonContainer-button
            }
        },
        renderOnInit: true,

        rendererOptions: {
            autoBind: true
        },

        listeners: {
            "prepareModelForRender.prepareButtonCatalog": "gpii.psp.morphicSettingsEditor.buttonCatalog.prepareButtonCatalogModel"
        },

        invokers: {
            addButtonToQSS: {
                funcName: "gpii.psp.morphicSettingsEditor.addButton",
                args: ["{arguments}.0", "{morphicSettingsEditor}"]
            }
        },

        protoTree: {
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "button:",
                controlledBy: "buttons",
                pathAs: "button",
                tree: {
                    expander: {
                        type: "fluid.renderer.condition",
                        condition: "${{button}.inPanel}",
                        trueTree: {
                            button: {
                                decorators: [
                                    { type: "addClass", classes: "${{button}.classes}" },
                                    { attrs: { "data-buttonid": "${{button}.buttonId}" }}
                                ]
                            },
                            buttonTag: {
                                value: "${{button}.panel}"
                            },  
                            buttonLabel: {
                                value: "${{button}.title}"
                            },
                            buttonDescription: {
                                value: "${{button}.description}"
                            },
                        },
                        falseTree: {
                            button: {
                                decorators: [
                                    { type: "addClass", classes: "${{button}.classes}" },
                                    { attrs: { "data-buttonid": "${{button}.buttonId}" }}
                                ]
                            },
                            buttonLabel: {
                                value: "${{button}.title}"
                            },
                            buttonDescription: {
                                value: "${{button}.description}"
                            },
                            buttonAddButtonToQSS: {
                                value: "Add to QSS",
                                decorators: [
                                    { attrs: { "data-buttonid": "${{button}.id}" }},
                                    { type: "jQuery", func: "click", args: "{that}.addButtonToQSS" }
                                ]
                            },
                            buttonAddButtonToMorePanel: {
                                value: "Add to More Panel",
                                decorators: [
                                    { attrs: { "data-buttonid": "${{button}.id}" }},
                                    { type: "jQuery", func: "click", args: "{that}.addButtonToQSS" }
                                ]
                            }
                        }
                    }
                }
            }
        }
    });


    /**
     * Creates a 'buttons' model in MSE with a common structure for display
     * @param { object } model 
     * @param { applier } applier 
     * @param { gpii.morphicSettn } that 
     * @param {*} mse 
     */
    gpii.psp.morphicSettingsEditor.qss.prepareQSSModel = function(model, applier, that, mse) {
        
        if (that.container.hasClass("fl-quickSetStrip-more")) {
            var items = fluid.flatten(model.items);
        } else {
            var items = model.items;
        }
    
        var buttonCatalog = model.buttonCatalog,
            buttons = fluid.transform(items, function(button, index) {
                var nb = {};
                    
                if ((typeof(button) === 'string') && (!STATIC_BUTTONS.includes(button))) {
                    var b = fluid.find_if(buttonCatalog, function(bc) {
                        return (bc.id === button);
                    });
    
                    if (b) {
                        nb.id = b.id;
                        nb.title = b.title;
    
                        nb.classes = ["fl-qss-button-movable"];
                            
                    } else {
                        if (button === "||") {
                            nb.id = "separator-visible";
                            nb.classes = ["fl-qss-button-movable", "fl-qss-separator"]
                        }
                    }
                    return nb;
                };
    
                if (typeof(button) === 'object') {
                    nb.id = gpii.psp.morphicSettingsEditor.string_to_slug(button.buttonName);
                    nb.title = button.buttonName;
                    nb.classes = ["fl-qss-button-movable"];
    
                    return nb;
                }
            });
    
            var newButtons = buttons.filter(function(button) { return button; });
            console.log(newButtons);
            // var totalButtons = buttons.length,
            //     separators = buttons.filter(function(button) { return ((typeof(button) === "object") && ((button.id === "separator-visible") || (button.id === "separator")))}).length,
            //     numberButtons = totalButtons - separators,
            //     status = { qssButtonsFull: (numberButtons >= 8), qssSeparatorsFull: (separators >= 3)};
                
            // if (that.container.hasClass("fl-quickSetStrip-more")) {
            //     if (totalButtons > 24) { 
            //         applier.change("isFull", true); 
            //     } else { 
            //         applier.change("isFull", false); 
            //     }
            // } else {
            //     if (totalButtons > 8) { 
            //         applier.change("isFull", true);
            //     } else { 
            //         applier.change("isFull", false);    
            //     }
            // }
                    
            applier.change("buttons", newButtons);     
        };
    
    /**
     * This function creates a protoTree for each button
     * @param {*} that - element that calls for the renderer tree
     * @param {*} mse - the overall morphic settings editor
     * @returns
     */
     gpii.psp.morphicSettingsEditor.qss.produceTree = function(that, mse) {
        
        var buttonList = fluid.transform(that.model.buttons, function(button, index) {
            return {
                ID: "button:",
                decorators: [
                    { type: "addClass", classes: button.classes.join(" ") },
                    { type: "attrs", attributes: {"data-buttonId": button.id, "draggable": "true" } },
                    { type: "jQuery", func: "keydown", args: function(e) { gpii.psp.morphicSettingsEditor.handleKeydown(e, that) }},
                    { type: "jQuery", func: "contextmenu", args: function(e) { gpii.psp.morphicSettingsEditor.displayContextMenu(e, button, mse); }}
                ],
                children: [{
                    ID: "buttonLabel",
                    value: button.title
                }]
            }
        });
        
        return buttonList;
    };

    // This function is triggered after a button is moved and update the models
    gpii.psp.morphicSettingsEditor.addSortableListener = function(that, mse) {
        // console.log("ADD SORTABLE LISTENER!!!!", that);
        that.container.sortable({
            connectWith: [".sortable"],
            placeholder: "fl-reorderer-dropMarker",
            update: function(event, ui) {
                // console.log(event.target.className);
                // console.log("EVENT")

                // Get the models from the editor
                var buttonList = mse.model.buttonList,
                    morePanelList = fluid.flatten(mse.model.morePanelList),
                    originModel,
                    destinationModel,
                    originIsButtonList,
                    destinationIsButtonList,
                    originIsMorePanel,
                    destinationIsMorePanel;

                // Establish the destination panel using event.target
                if (event.target.className.split(" ").includes("fl-quickSetStrip-main-buttonList")) {
                    destinationModel = buttonList;
                    destinationIsButtonList = true;
                };

                if (event.target.className.split(" ").includes('fl-quickSetStrip-more')) {
                    // console.log("TARGET IS MORE PANEL");
                    destinationModel = morePanelList;
                    destinationIsMorePanel = true;
                };

                // Establish origin of button moved using uisender;
                if (ui.sender) {
                    console.log("SENDER", ui.sender);
                    if (ui.sender[0].className.split(" ").includes("fl-quickSetStrip-main-buttonList")) {
                        originModel = buttonList;
                        originIsButtonList = true;
                    }

                    if (ui.sender[0].className.split(" ").includes("fl-quickSetStrip-more")) {
                        // console.log("ORIGIN IS MORE BUTTON LIST");
                        originModel = morePanelList;
                        originIsMorePanel = true;
                    }
                } else {
                    originModel = destinationModel;
                    originIsButtonList = destinationIsButtonList;
                    originIsMorePanel = destinationIsMorePanel;
                }

                // Get destinatin index using sortable("toArray") 
                var buttonId = $(ui.item).data("buttonid"),
                    destinationIndex = $(this).sortable("toArray", { attribute: "data-buttonid" }).indexOf(buttonId);
                
                // Get origin index by finding it in the originModel
                var originButtonName = "";
                var originButton = fluid.find_if(originModel, function(button, index) {
                    if (typeof(button) === "object") { originButtonName = button.buttonName; return gpii.psp.morphicSettingsEditor.string_to_slug(button.buttonName) === buttonId; }
                    if (typeof(button) === "string") { originButtonName = button; return button === buttonId; }                
                }),
                    originIndex = originModel.indexOf(originButton);

                // Swap indices
                if ((originIndex !== -1) && (destinationIndex !== -1)) {
                    if (originModel === destinationModel) {
                        [originModel[originIndex], originModel[destinationIndex]] = [originModel[destinationIndex], originModel[originIndex]];
                        if (originIsButtonList) { 
                            mse.applier.change("buttonList", originModel);
                            mse.instructions.applier.change("messages", Object.assign(mse.model.messages, { instruction: `You have moved the button "${originButtonName}" from position ${originIndex} to position ${destinationIndex}of the QuickStrip`}));
                        }
                        if (originIsMorePanel) { 
                            mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(originModel)); 
                            mse.instructions.applier.change("messages", Object.assign(mse.model.messages, { instruction: `You have moved the button "${originButtonName}" from position ${originIndex} to position ${destinationIndex} of the 'More' panel`}));
                        }
                    } else {
                        originModel.splice(originIndex, 1);
                        destinationModel.splice(destinationIndex, 0, originButton);

                        if (originIsButtonList) { mse.applier.change("buttonList", originModel); }
                        if (originIsMorePanel) { mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(originModel)); }
                        if (destinationIsButtonList) { 
                            mse.applier.change("buttonList", destinationModel); 
                            mse.instructions.applier.change("messages", Object.assign(mse.model.messages, { instruction: `You have moved the button "${originButtonName}" from position ${originIndex} of the 'More' panel to position ${destinationIndex} of the QuickStrip`}));
                        }
                        if (destinationIsMorePanel) { 
                            mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(destinationModel));
                            mse.instructions.applier.change("messages", Object.assign(mse.model.messages, { instruction: `You have moved the button "${originButtonName}" from position ${originIndex} of the QuickStrip to position ${destinationIndex} of the 'More' panel`}));
                        }
                    }
                }

                mse.buttonCatalog.refreshView();
            }
        });
    }

    

    gpii.psp.morphicSettingsEditor.addNewMYOB = function (that, button, buttonCatalog, mse) {
        var b = Object.assign(button, { title: button.buttonName });
        var catalog = buttonCatalog.model.items;
        catalog.unshift(b);
        mse.applier.change("buttonCatalog", catalog);
        buttonCatalog.applier.change("items", catalog);
        buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.log = function(message) {
        console.log("LOOOOOOOG:", message);
    };

    gpii.psp.morphicSettingsEditor.addButton = function(event, mse) {
        event.preventDefault();

        var panel = event.target.className,
            buttonId = event.target.getAttribute("data-buttonid"),
            buttonList = mse.model.buttonList,
            morePanelList = fluid.flatten(mse.model.morePanelList),
            button = fluid.find_if(mse.model.buttonCatalog, function(button, index) {
                return button.id === buttonId; 
            });
  
        if (panel === "flc-buttonCatalog-btnAddToQSS") {
            buttonList.push(buttonId);
            mse.applier.change("buttonList", buttonList);
            mse.qss.applier.change("items", buttonList);
            console.log("THE MODEEEEEL", mse.model);
            mse.instructions.applier.change("messages", Object.assign(mse.model.messages, { instruction: `You have added button "${button.title}" to the QuickStrip`}));
        }

        if (panel === "flc-buttonCatalog-btnAddToMorePanel") {
            morePanelList.push(buttonId);
            mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
        }

        mse.buttonCatalog.refreshView();
    };

    /**
     * Keydown handler for buttons in the QSS or the 'More' panel
     * @param {*} e - click event
     * @param {*} that - caller (i.e., the QSS of the 'More' panel)
     * @param {*} mse - the overall Settings Editor
     * @param {*} buttonCatalog - the button catalog renderer (for refreshing)
     */
    gpii.psp.morphicSettingsEditor.handleKeydown = function(e, that) {
        // console.log("EVENT", e);
        // console.log("THAT", that);

        if ((e.key === "Backspace") || (e.key === "Delete")) {
            gpii.psp.morphicSettingsEditor.qss.removeButton(e, that, mse, buttonCatalog);
        }
    };

    /**
     * Creates a 'buttons' model in button catalog with a common structure
     * @param {gpii.psp.morphicSettingsEditor.model} model 
     * @param {gpii.psp.morphicSettingsEditor.applier} applier 
     * @param {*} that 
     */
    gpii.psp.morphicSettingsEditor.buttonCatalog.prepareButtonCatalogModel = function(model, applier, that) {

        var qss = model.buttonList,
            morePanel = fluid.flatten(model.morePanelList);
        
        var buttons = fluid.transform(model.items, function(item, index) {
            var nb = {
                inPanel: false,
                classes: []
            };

            // If it is a custom button
            if (item.hasOwnProperty('buttonID')) {
                // nb.classes.push("fl-qss-button-movable");
                nb.id = gpii.psp.morphicSettingsEditor.string_to_slug(item.buttonName);
                nb.title = item.buttonName;
                nb.description = item.popupText;

                if (!((qss.includes(item)) || (morePanel.includes(item)))) {
                    nb.classes.push("fl-qss-button-movable");
                }
                
            } else { // It comes from the catalog
                nb.id = item.id;
                nb.title = item.title;
                nb.description = item.description;
                
                if (!((qss.includes(nb.id)) || (morePanel.includes(nb.id)))) {
                    nb.classes.push("fl-qss-button-movable");
                } else {
                    nb.inPanel = true;
                    if (qss.includes(nb.id)) { nb.panel = "In QSS"; }
                    if (morePanel.includes(nb.id)) { nb.panel = "In More Panel"; }
                }

                if (nb.id === "separator") {
                    nb.classes.push("fl-qss-separator");
                }

                if (nb.id === "separator-visible") {
                    nb.classes.push("fl-qss-separator", "visible");
                }

                if (nb.id === "grid") {
                    nb.classes.push("fl-qss-emptyBtn");
                }

                if (nb.id === "grid-visible") {
                    nb.classes.push("fl-qss-emptyBtn-colored");
                }
            }
            
            if ((!(STATIC_BUTTONS.includes(nb.id)))) {
                return nb;
            }
            
        });

        // console.log("BUTTONS", buttons.filter(function(button) { return button; }));
        
        applier.change("buttons", buttons.filter(function(button) { return button; }));
    };

    gpii.psp.morphicSettingsEditor.displayContextMenu = function(e, button, mse) {
        
        mse.contextMenu.applier.change("caller", button);
        
        var cm = $("#qssContextMenu"),
            cmTop = e.currentTarget.getBoundingClientRect().y + 40,
            cmLeft = e.currentTarget.getBoundingClientRect().x - 180;
        
        cm.css({
            "opacity": 1,
            "visibility": "visible",
            "top": cmTop,
            "left": cmLeft
        });
    };

    gpii.psp.morphicSettingsEditor.contextMenuKeyDown = function(e) {
        var contextMenu = e.currentTarget;
        if (e.key == "Escape") {
            console.log("pressed escape");
            contextMenu.style.visibility = "hidden";
            contextMenu.style.opacity = 0;
        }
    }

    /**
      * buildRows creates three rows of 8 buttons from an array of buttons
      */
    gpii.psp.morphicSettingsEditor.buildRows = function(items) {
        var allItems = Array(24 - items.length).fill(undefined).concat(items);
        return [
            allItems.slice(0, 8).filter(fluid.isValue),
            allItems.slice(8, 16).filter(fluid.isValue),
            allItems.slice(16, 24).filter(fluid.isValue)
        ];
    };

    gpii.psp.morphicSettingsEditor.qss.removeButton = function(e, caller, mse, buttonCatalog) {
        
        var activeItem = mse.contextMenu.model.caller,
            buttonList = mse.model.buttonList,
            morePanelList = fluid.flatten(mse.model.morePanelList),
            buttonName = "";

        var buttonInQSS = fluid.find_if(buttonList, function(button, index) {
            if (typeof(button) === "object") { return button.buttonName === activeItem.title };
            if (typeof(button) === "string") { return button === activeItem.id };
        });

        var buttonInMorePanel = fluid.find_if(morePanelList, function(button, index) {
            if (typeof(button) === "object") { return button.buttonName === activeItem.title };
            if (typeof(button) === "string") { return button === activeItem.id };
        });

        if (buttonInQSS) {
            var index = buttonList.indexOf(buttonInQSS),
                nbl = buttonList.splice(index, 1);
            mse.applier.change("buttonList", buttonList);
            mse.qss.applier.change("items", buttonList);
            mse.instructions.applier.change("messages", Object.assign(mse.model.messages, { instruction: `You have removed button "${activeItem.title}" from the QuickStrip`}));
        };

        if (buttonInMorePanel) {
            var index = morePanelList.indexOf(buttonInMorePanel),
                mpl = morePanelList.splice(index, 1);
            mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
            mse.instructions.applier.change("messages", Object.assign(mse.model.messages, { instruction: `You have removed button "${activeItem.title}" from the 'More' Panel`}));
            
        };

        buttonCatalog.refreshView();

        mse.contextMenu.container.css({
            opacity: 0,
            visibility: "hidden"
        });
    };

    gpii.psp.morphicSettingsEditor.qss.hideContextMenu = function(that) {
        $(document.body).unbind("click");
        that.css("visibility", "hidden");
        that.css("opacity", 0);
    };

    /**
     * HELPER FUNCTIONS
     */

    /**
     * Converts a string to a slug (no funny characters, no spaces)
     * @param {string} str 
     * @returns {string}
     */
     gpii.psp.morphicSettingsEditor.string_to_slug = function(str) {
        str = str.replace(/^\s+|\s+$/g, ""); // trim
        str = str.toLowerCase();
      
        // remove accents, swap ñ for n, etc
        var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to = "aaaaaaeeeeiiiioooouuuunc------";
      
        for (var i = 0, l = from.length; i < l; i++) {
          str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
        }
      
        str = str
          .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
          .replace(/\s+/g, "-") // collapse whitespace and replace by -
          .replace(/-+/g, "-") // collapse dashes
          .replace(/^-+/, "") // trim - from start of text
          .replace(/-+$/, ""); // trim - from end of text
      
        return str;
      }

})(fluid);
