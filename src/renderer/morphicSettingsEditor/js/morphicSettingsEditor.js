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
                args: ["{arguments}.0", "{morphicSettingsEditor}", "{buttonCatalog}"]
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
                args: ["{that}", "{morphicSettingsEditor}"]
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
                args: ["{that}", "{morphicSettingsEditor}"]
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
            buttonCatalog: "{that}.options.buttonCatalog"
        },

        selectors: {
            openMYOBButton: ".flc-morphicSettingsEditor-myobButton",
            saveButton: ".flc-morphicSettingsEditor-saveButton",

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

            "onCreate.setModules": {
                funcName: "gpii.psp.morphicSettingsEditor.setModules",
                args: ["{that}"]
            },

            "afterMove.reorderButtons": {
                funcName: "gpii.psp.morphicSettingsEditor.updateModels",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{buttonCatalog}"]
            }
        },

        invokers: {
            addNewMYOB: {
                funcName: "gpii.psp.morphicSettingsEditor.addNewMYOB",
                args: ["{that}", "{arguments}.0"]
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
                    }
                }
            },

            morePanel: {
                type: "gpii.psp.morphicSettingsEditor.morePanel",
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

    gpii.psp.morphicSettingsEditor.addNewMYOB = function (that, button) {
        console.log("### at addNewMYOB - button: ", button);
        // TODO: Implement adding the created button
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
        renderOnInit: true,
        invokers: {
            produceTree: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.produceTree",
                args: ["{that}", "{morphicSettingsEditor}"]
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

    gpii.psp.morphicSettingsEditor.handleButtonKeydown = function(e, button, mse) {

        var buttonId = button.id;
        
        if ((e.key === "Backspace") || (e.key === "Delete")) {
            e.target.remove();

            if (button.tag === "In QuickStrip") {
                console.log("IN QSS", button.buttonIndex);
                var buttonList = mse.model.buttonList;
                buttonList.splice(button.buttonIndex, 1);
                mse.applier.change("buttonList", buttonList);
            };

            if (button.tag === "In More Panel") {
                var morePanelList = fluid.flatten(mse.model.morePanelList);
                morePanelList.splice(button.buttonIndex, 1);
                mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
            };
        };
    };

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
                args: ["{arguments}.0", "{morphicSettingsEditor}", "{buttonCatalog}"]
            },
            addButtonToMorePanel: {
                funcName: "gpii.psp.morphicSettingsEditor.addButtonToMorePanel",
                args: ["{arguments}.0", "{morphicSettingsEditor}", "{buttonCatalog}"]
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
                                    { type: "attrs",  attributes: { buttonId: "{item}.id" }}, 
                                    { type: "jQuery", func: "click", args: "{that}.addButtonToQSS" }
                                ]
                            },
                            buttonAddButtonToMorePanel: {
                                value: "Add to More Panel",
                                decorators: [
                                    { type: "attrs", attributes: { buttonId: "{item}.id" }},
                                    { type: "jQuery", func: "click", args: "{that}.addButtonToMorePanel" }
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


    gpii.psp.morphicSettingsEditor.handleKeydown = function(e, mse, buttonCatalog) {

        // var buttonId = button.id;
        var caller = e.target,
            activeItem = mse.activeItem;

        if (activeItem.hasAttribute("data-buttonid")) {
            var btnId = activeItem.getAttribute("data-buttonid");
            console.log(activeItem.parentElement.classList);
                /* inQSS = activeItem.parentElement.classList.indexOf("flc-quickSetStrip-main-buttonList") !== -1,
                inMorePanel = activeItem.parentElement.classList.indexOf("flc-quickSetStrip-more") !== -1;;
            console.log("In QSS", inQSS);
            console.log("In More Panel", inMorePanel); */
        };
        
        /* if ((e.key === "Backspace") || (e.key === "Delete")) {
            e.target.remove();

            if (button.tag === "In QuickStrip") {
                console.log("IN QSS", button.buttonIndex);
                var buttonList = mse.model.buttonList;
                buttonList.splice(button.buttonIndex, 1);
                mse.applier.change("buttonList", buttonList);
            };

            if (button.tag === "In More Panel") {
                var morePanelList = fluid.flatten(mse.model.morePanelList);
                morePanelList.splice(button.buttonIndex, 1);
                mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
            }; 
        };*/
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
                    { type: "addClass", classes: button.buttonType },
                    { type: "attrs", attributes: {"data-buttonId": button.id} },
                    { type: "jQuery", func: "keydown", args: function(e) { gpii.psp.morphicSettingsEditor.handleKeydown(e, mse, mse.model.buttonCatalog) }},
                    { type: "jQuery", func: "contextmenu", args: function(e) { gpii.psp.morphicSettingsEditor.displayContextMenu(mse, mse.contextMenu); }}
                ],
                children: [{
                    ID: "buttonLabel",
                    value: button.title
                }]
            }
        });
        return buttonList;
    };

   
    gpii.psp.morphicSettingsEditor.addButtonToQSS = function(e, mse, buttonCatalog) {
        var buttonList = mse.model.buttonList;
        buttonList.unshift(e.target.getAttribute("buttonid"));
        mse.applier.change("buttonList", buttonList);
        mse.qss.refreshView();
        buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.addButtonToMorePanel = function(e, mse, buttonCatalog) {
        var morePanelList = fluid.flatten(mse.model.morePanelList);
        morePanelList.unshift(e.target.getAttribute("buttonid"));
        mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
        mse.morePanel.refreshView();
        buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel = function(that, allModels) {

        var items = that.model.items.map((item, index) => {
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
                case "grid-visible":
                    buttonObject.buttonType = "fl-qss-emptyBtn";
                    break;
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

            if (allModels.buttonList.indexOf(item) !== -1) {
                buttonObject.tag = "In QuickStrip";
                buttonObject.isAddable = false;
            };
            if (fluid.flatten(allModels.morePanelList).indexOf(item) !== -1) {
                buttonObject.tag = "In More Panel";
                buttonObject.isAddable = false;
            };
            
            return buttonObject;
        });
        
        that.applier.change("isFull", false);
        that.applier.change("buttons", items);
    };

    gpii.psp.morphicSettingsEditor.displayContextMenu = function(that, contextMenu) {
        var pos = that.activeItem.getBoundingClientRect();
        $(document.body).bind("click", function(e) { gpii.psp.morphicSettingsEditor.qss.hideContextMenu(contextMenu.container); });
/*         var buttonModel = that.model;
        contextMenu.applier.change("caller", buttonModel); */
        contextMenu.container.css("visibility", "visible");
        contextMenu.container.css("opacity", 1);
        contextMenu.container.css("top", pos.y - 76);
        contextMenu.container.css("left", pos.x - 180);
        console.log("CONTAINEEEER", contextMenu.container);
        contextMenu.container.children()[0].focus();
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

        /**
     * This function updates the models after a button has moved.
     *
     * It uses the aria-label
     */
         gpii.psp.morphicSettingsEditor.updateModels = function (that, item, position, movables, buttonCatalog) {
    
            let models = [fluid.flatten(that.model.morePanelList), that.model.buttonList];
    
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
    
            // gpii.psp.morphicSettingsEditor.qss.setQSSWidth(that.qss.container, qssModel);
    
            buttonCatalog.refreshView();
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
    
        gpii.psp.morphicSettingsEditor.log = function(arg) {
            console.log("LOOOG", arg);
        };

    gpii.psp.morphicSettingsEditor.qss.removeButton = function(e, that, mse, buttonCatalog) {

        e.preventDefault();

        var activeItem = mse.activeItem,
            parentClass = activeItem.parentElement.classList,
            buttonId = activeItem.getAttribute("data-buttonid");

        console.log(activeItem.innerText);

        mse.instructions.applier.change("instruction", `You have deleted button '${activeItem.innerText}'`);
        mse.instructions.refreshView();

        // $(".flc-qss-instructions").text(`You have deleted the button '${activeItem.innerText}'`).show();
        
        // MODEL
        activeItem.remove();
        gpii.psp.morphicSettingsEditor.qss.hideContextMenu(that.container);

        buttonCatalog.applier.change("items", buttonCatalog.model.items);
        buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.qss.hideContextMenu = function(that) {
        $(document.body).unbind("click");
        that.css("visibility", "hidden");
        that.css("opacity", 0);
    };

})(fluid);
