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
                funcName: "gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel",
                args: ["{that}", "{morphicSettingsEditor}.model"]
            }
        },
        renderOnInit: true,
        invokers: {
            produceTree: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.produceTree",
                args: ["{that}", "{morphicSettingsEditor}", "{buttonCatalog}"]
            }
        },
        rendererOptions: {
            noexpand: true,
            autoBind: true
        },
        resources: {
            template: {
                resourceText: "<div class=\"fl-qss-button fl-qss-button-movable\"><span class=\"fl-qss-btnLabel\"></span></div>"
            }
        }
    });

    /**
     * Renderer component that displays the `More` panel
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor.morePanel", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            button: ".fl-qss-button",
            buttonLabel: ".fl-qss-btnLabel"
        },
        repeatingSelectors: ["button"],
        listeners: {
            "prepareModelForRender.getInfoFromCatalog": {
                funcName: "gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel",
                args: ["{that}", "{morphicSettingsEditor}.model"]
            }
        },
        renderOnInit: true,
        invokers: {
            produceTree: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.produceTree",
                args: ["{that}", "{morphicSettingsEditor}", "{buttonCatalog}"]
            }
        },
        rendererFnOptions: {
            noexpand: true
        },
        resources: {
            template: {
                resourceText: "<div class=\"fl-qss-button fl-qss-button-movable\"><span class=\"fl-qss-btnLabel\"></span></div>"
            }
        }
    });

    /**
     * Represents the controller for the whole settings editor.
     */
    fluid.defaults("gpii.psp.morphicSettingsEditor", {
        gradeNames: ["fluid.rendererComponent", "fluid.reorderer"],

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

        modelListeners: {
            buttonList: {
                func: "{that}.refreshView"
            }
        },

        selectors: {
            openMYOBButton: ".flc-morphicSettingsEditor-myobButton",
            saveButton: ".flc-morphicSettingsEditor-saveButton",

            instructions: ".flc-qss-instructions",

            buttonList: ".fl-quickSetStrip-main-buttonList",
            morePanelList: ".fl-quickSetStrip-more",
            qssContextMenu: ".mor-buttonContextMenu",

            buttonCatalog: ".flc-buttonCatalog-buttonList",
            movables: ".fl-qss-button-movable",
            dropTargets: ["{that}.dom.morePanelList", "{that}.dom.buttonCatalog"],
            modules: ".fl-qss-button-movable",
            lockedModules: ".module-locked",
            columns: ".fl-quickSetStrip-main-buttonList, .fl-quickSetStrip-more"
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

            "afterMove.reorderButtons": {
                funcName: "gpii.psp.morphicSettingsEditor.updateModels",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{buttonCatalog}"]
            },

            "afterMove.enableSaveButton": {
                this: "{that}.dom.saveButton",
                method: ["attr"],
                args: [{disabled: false}]
            }
        },

        invokers: {
            addNewMYOB: {
                funcName: "gpii.psp.morphicSettingsEditor.addNewMYOB",
                args: ["{that}", "{arguments}.0", "{buttonCatalog}"]
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
                        instruction: "You can drag and drop buttons to change their position. To remove a button, select it and: (i) click the 'Delete' button or right-click for displaying the menu."
                    },
                    selectors: {
                        instructionText: ".flc-qss-instructions-text"
                    },
                    renderOnInit: true,
                    protoTree: {
                        instructionText: "${instruction}"
                    }
                }
            },

            qss: {
                type: "gpii.psp.morphicSettingsEditor.qss",
                container: "{that}.dom.buttonList",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.buttonList"
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
                        items: "{morphicSettingsEditor}.model.morePanelList"
                    },
                    modelListeners: {
                        items: {
                            func: "{that}.refreshView"
                        }
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

    gpii.psp.morphicSettingsEditor.refreshView = function(that, mse) {
        console.log(that);
    };

    gpii.psp.morphicSettingsEditor.addNewMYOB = function (that, button, buttonCatalog) {
        var catalog = buttonCatalog.model.items;
        catalog.unshift(button);
        buttonCatalog.applier.change("items", catalog);
        buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.log = function(message) {
        console.log("LOOOOOOOG:", message);
    };

    fluid.defaults("gpii.psp.morphicSettingsEditor.qss", {
        gradeNames: ["fluid.rendererComponent"],

        selectors: {
            button: ".fl-qss-button",
            buttonLabel: ".fl-qss-btnLabel"
        },
        repeatingSelectors: ["button"],
        listeners: {
            "prepareModelForRender.getInfoFromCatalog": {
                funcName: "gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel",
                args: ["{that}", "{morphicSettingsEditor}.model"]
            }
        },
        rendererOptions: {
            autoBind: true
        },
        rendererFnOptions: {
            noexpand: true
        },
        renderOnInit: true,
        invokers: {
            produceTree: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.produceTree",
                args: ["{that}", "{morphicSettingsEditor}", "{buttonCatalog}"]
            }
        },
        resources: {
            template: {
                resourceText: "<div class=\"fl-qss-button fl-qss-button-movable\"><span class=\"fl-qss-btnLabel\"></span></div>"
            }
        }
    });

    /**
     *
     * @param {*} that
     * @param {*} mse
     * @returns
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
                                "<div class=\"fl-qss-button\">" +
                                "<span class=\"flc-buttonCatalog-btnLabel fl-buttonCatalog-btnLabel\">" +
                                "</span></div><div class=\"flc-buttonCatalog-buttonContainer-content\">" +
                                "<div class=\"flc-buttonCatalog-btnTag\"></div>" +
                                "<div class=\"flc-buttonCatalog-btnDescription\"></div>" +
                                "<div class=\"flc-buttonCatalog-btnAddToQSS\" role=\"button\"></div>" +
                                "<div class=\"flc-buttonCatalog-btnAddToMorePanel\" role=\"button\"></div>" +
                                "</div></div>"
            }
        },
        renderOnInit: true,
        listeners: {
            "prepareModelForRender.getInfoFromCatalog": {
                funcName: "gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel",
                args: ["{that}", "{morphicSettingsEditor}.model"]
            }
        },

        invokers: {
            addButtonToQSS: {
                funcName: "gpii.psp.morphicSettingsEditor.addButtonToQSS",
                args: ["{arguments}.0", "{morphicSettingsEditor}", "{that}"]
            },
            addButtonToMorePanel: {
                funcName: "gpii.psp.morphicSettingsEditor.addButtonToMorePanel",
                args: ["{arguments}.0", "{morphicSettingsEditor}", "{that}"]
            }
        },

        protoTree: {
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "button:",
                controlledBy: "buttons",
                pathAs: "item",
                tree: {
                    expander: {
                        type: "fluid.renderer.condition",
                        condition: "{item}.isAddable",
                        trueTree: {
                            button: {
                                decorators: [{
                                    type: "addClass",
                                    classes: "{item}.buttonType"
                                }]
                            },
                            buttonLabel:  "${{item}.title}",
                            buttonDescription: "${{item}.description}",
                            buttonAddButtonToQSS: {
                                value: "Add to Morphic Bar",
                                decorators: [
                                    {
                                        type: "attrs",
                                        attributes: {
                                            buttonId: "{item}.id"
                                        }
                                    },
                                    {
                                        type: "jQuery", func: "click", args: [{myobData: "${{item}.myobData}"}, "{that}.addButtonToQSS"]
                                    }
                                ]
                            },
                            buttonAddButtonToMorePanel: {
                                value: "Add to More Panel",
                                decorators: [
                                    {
                                        type: "attrs",
                                        attributes: {
                                            buttonId: "{item}.id"
                                        }
                                    },
                                    { type: "jQuery", func: "click", args: [{myobData: "${{item}.myobData}"}, "{that}.addButtonToMorePanel"] }
                                ]
                            }
                        },
                        falseTree: {
                            button: {
                                decorators: [{
                                    type: "addClass",
                                    classes: "{item}.buttonType"
                                }]
                            },
                            buttonLabel: "${{item}.title}",
                            buttonTag: "${{item}.tag}",
                            buttonDescription: "${{item}.description}"
                        }
                    }
                }
            }
        }
    });

    /**
     * This function creates a protoTree for each button
     * @param {*} that - element that calls for the renderer tree
     * @param {*} mse - the overall morphic settings editor
     * @returns
     */
    gpii.psp.morphicSettingsEditor.qss.produceTree = function(that, mse, buttonCatalog) {
        var buttonList = fluid.transform(that.model.buttons, function(button, index) {
            return {
                ID: "button:",
                decorators: [
                    { type: "addClass", classes: button.buttonType },
                    { type: "attrs", attributes: {"data-buttonId": button.id} },
                    { type: "jQuery", func: "keydown", args: function(e) { gpii.psp.morphicSettingsEditor.handleKeydown(e, that, mse, buttonCatalog) }},
                    { type: "jQuery", func: "contextmenu", args: function(e) { gpii.psp.morphicSettingsEditor.displayContextMenu(that, mse, mse.contextMenu); }}
                ],
                children: [{
                    ID: "buttonLabel",
                    value: button.title
                }]
            }
        });
        return buttonList;
    };

    /**
     * Keydown handler for buttons in the QSS or the 'More' panel
     * @param {*} e - click event
     * @param {*} that - caller (i.e., the QSS of the 'More' panel)
     * @param {*} mse - the overall Settings Editor
     * @param {*} buttonCatalog - the button catalog renderer (for refreshing)
     */
    gpii.psp.morphicSettingsEditor.handleKeydown = function(e, that, mse, buttonCatalog) {

        if ((e.key === "Backspace") || (e.key === "Delete")) {
            gpii.psp.morphicSettingsEditor.qss.removeButton(e, that, mse, buttonCatalog);
        }
    };

    /**
     * Adds a button to the QuickStrip
     * @param {} e - event
     * @param {*} mse - overall Morphic Settings Editor
     * @param {*} buttonCatalog - button catalog
     */
    gpii.psp.morphicSettingsEditor.addButtonToQSS = function(e, mse, buttonCatalog) {

/*         var button = $("<div class=\"cucu\"></div>");
        button.text(e.target.getAttribute("buttonId"));

        $(".flc-myChoices").append(button); */
        var bl = [...mse.model.buttonList];
        var buttonId = e.target.getAttribute("buttonid");
        var buttonToAdd = buttonId === "MakeYourOwn" ? e.data.myobData : buttonId;

        bl.unshift(buttonToAdd);
        mse.applier.change("buttonList", bl);
        buttonCatalog.refreshView();

/*         buttonList.unshift(e.target.getAttribute("buttonid"));
        mse.applier.change("buttonList", buttonList);
        buttonCatalog.refreshView(); */
    };

    /**
     * Adds a button to the 'More' panel
     * @param {*} e - click event
     * @param {*} mse
     * @param {*} buttonCatalog
     */
    gpii.psp.morphicSettingsEditor.addButtonToMorePanel = function(e, mse, buttonCatalog) {
        var morePanelList = fluid.flatten(mse.model.morePanelList);
        var buttonId = e.target.getAttribute("buttonid");
        var buttonToAdd = buttonId === "MakeYourOwn" ? e.data.myobData : buttonId;

        morePanelList.push(buttonToAdd);
        mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
        buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.isButtonInList = function (button, list) {
        var togo = false;

        if (typeof(button) === "object") {
            togo = fluid.find_if(list, function (el) {
                return isDeepStrictEqual(el, button);
            });
        } else {
            togo = list.indexOf(button) !== -1;
        }

        return togo;
    };

    gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel = function(that, allModels) {
        var flattenedItems = fluid.flatten(that.model.items);
        var items = flattenedItems.map((item, index) => {
            var buttonObject = gpii.psp.morphicSettingsEditor.getButtonInfo(allModels.buttonCatalog, item) || {};
            buttonObject.isAddable = true;
            buttonObject.isAddableText = "";
            buttonObject.tag = "";
            buttonObject.buttonIndex = index;

            switch (item) {
                case "||":
                case "separator-visible":
                case "separator":
                    buttonObject.buttonType = "fl-qss-separator";
                    break;
                case "grid":
                    buttonObject.buttonType = "fl-qss-emptyBtn";
                    break;
                case "grid-visible":
                    buttonObject.buttonType = "fl-qss-emptyBtn-colored";
                    break;
                case "morphic":
                case "service-more":
                case "service-undo":
                case "service-save":
                case "service-saved-settings":
                case "service-reset-all":
                case "service-close":
                    // buttonObject.buttonType = "fl-qss-closeButton";
                    return;
                default:
                    if (that.typeName === "gpii.psp.morphicSettingsEditor.qss") {
                        buttonObject.buttonType = "fl-qss-button-movable";
                    }
                    break;
            };


            if (!ELEMENTS.includes(item)) {
                if (gpii.psp.morphicSettingsEditor.isButtonInList(item, allModels.buttonList)) {
                    buttonObject.tag = "In QuickStrip";
                    buttonObject.isAddable = false;
                };

                if (gpii.psp.morphicSettingsEditor.isButtonInList(item, fluid.flatten(allModels.morePanelList))) {
                    buttonObject.tag = "In More Panel";
                    buttonObject.isAddable = false;
                };
            }

            return buttonObject;
        });

        if (that.typeName === "gpii.psp.morphicSettingsEditor.qss") {
            // var numberSeparators = that.model.buttonList.filter
        }

        that.applier.change("isFull", false);
        that.applier.change("buttons", items);
    };

    gpii.psp.morphicSettingsEditor.displayContextMenu = function(that, mse, contextMenu) {
        console.log("### At displayContextMenu", that.typeName);
        contextMenu.applier.change("caller", that.typeName);
        if (mse.activeItem) {
            var pos = mse.activeItem.getBoundingClientRect();
            $(document.body).bind("click", function(e) { gpii.psp.morphicSettingsEditor.qss.hideContextMenu(contextMenu.container); });
            contextMenu.container.css("visibility", "visible");
            contextMenu.container.css("opacity", 1);
            contextMenu.container.css("top", pos.y - 76);
            contextMenu.container.css("left", pos.x - 180);
            contextMenu.container.children()[0].focus();
        }
    };


    gpii.psp.morphicSettingsEditor.getButtonInfo = function(buttonCatalog, buttonId) {

        let buttonObject = {};

        switch (typeof(buttonId)) {
            case "string":
                var button = fluid.find_if(buttonCatalog, function (el) {
                    return (el.id === buttonId)? true : false;
                });
                buttonObject = button ? {
                    id: buttonId,
                    title: button.title,
                    description: button.description }: null;
                break;
            case "object":
                buttonObject = {
                    id: buttonId.buttonId,
                    title: buttonId.buttonName,
                    description: buttonId.description,
                    myobData: buttonId
                };
                break;
            default:
                buttonObject = null;
                break;
        }

        return buttonObject;

    };

    gpii.psp.morphicSettingsEditor.findButtonIndexById = function(buttonId, buttonCollection) {
        var button = fluid.find_if(buttonCollection, function(el) {
            if (typeof(el) === "object") { return el.buttonId === buttonId; }
            if (typeof(el) === "string") { return el === buttonId; }
            return false;
        });
        return button? buttonCollection.indexOf(button) : -1;
    }

    /**
     * This function updates the models after a button has moved.
     */
    gpii.psp.morphicSettingsEditor.updateModels = function (that, item, position, movables, buttonCatalog) {

        var geom = that.labeller.options.getGeometricInfo();
        var { index, length, moduleIndex, moduleLength } = fluid.reorderer.indexRebaser(geom.elementIndexer(item));

        var itemId = item.getAttribute("data-buttonid"),
            buttonList = that.model.buttonList,
            morePanelList = fluid.flatten(that.model.morePanelList),
            originIndexQSS = gpii.psp.morphicSettingsEditor.findButtonIndexById(itemId, buttonList),
            originIndexMorePanel = gpii.psp.morphicSettingsEditor.findButtonIndexById(itemId, morePanelList);

        if (originIndexQSS !== -1) {
            var movableItem = buttonList.splice(originIndexQSS, 1)[0];
            if (moduleIndex === 2) {
                buttonList.splice(index - 1, 0, movableItem);
            } else {
                morePanelList.splice(index, 0, movableItem);
            }
        };

        if (originIndexMorePanel !== -1) {
            var movableItem = morePanelList.splice(originIndexMorePanel, 1)[0];
            if (moduleIndex === 1) {
                morePanelList.splice(index - 1, 0, movableItem);
            } else {
                buttonList.splice(index, 0, movableItem);
            };
        };

        that.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
        that.applier.change("buttonList", buttonList);

        buttonCatalog.refreshView();
    };

    /**
      * This function is the opposite to the previous one, and returns an
      * three arrays of arrays from an unique array
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
        e.preventDefault();

        //console.log("BUTTON CATALOG", buttonCatalog);

        var activeItem = mse.activeItem,
            buttonId = activeItem.getAttribute("data-buttonid");

        if ((caller.typeName === "gpii.psp.morphicSettingsEditor.qss") ||
            ((caller.typeName === "gpii.psp.morphicSettingsEditor.contextMenu") && (caller.model.caller === "gpii.psp.morphicSettingsEditor.qss"))) {
            var buttonList = mse.model.buttonList;
            var buttonIndex = gpii.psp.morphicSettingsEditor.findButtonIndexById(buttonId, buttonList);
            buttonList.splice(buttonIndex, 1);
            mse.applier.change("buttonList", buttonList);
        };

        if ((caller.typeName === "gpii.psp.morphicSettingsEditor.morePanel") ||
           ((caller.typeName === "gpii.psp.morphicSettingsEditor.contextMenu") && (caller.model.caller === "gpii.psp.morphicSettingsEditor.morePanel"))) {
            var morePanelList = fluid.flatten(mse.model.morePanelList);
            var buttonIndex = gpii.psp.morphicSettingsEditor.findButtonIndexById(buttonId, morePanelList);
            morePanelList.splice(buttonIndex, 1);
            mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList))
        };

        activeItem.remove();

        mse.instructions.applier.change("instruction", `You have deleted button '${activeItem.innerText}'`);
        mse.instructions.refreshView();

        // MODEL
        activeItem.remove();

        if (caller.typeName === "gpii.psp.morphicSettingsEditor.contextMenu") {
            gpii.psp.morphicSettingsEditor.qss.hideContextMenu(caller.container);
        }

        // buttonCatalog.applier.change("items", buttonCatalog.model.items);
        buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.qss.hideContextMenu = function(that) {
        $(document.body).unbind("click");
        that.css("visibility", "hidden");
        that.css("opacity", 0);
    };

})(fluid);
