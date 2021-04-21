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
/*     fluid.defaults("gpii.psp.morphicSettingsEditor.qss.buttonPresenter", {
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
            onContextMenuHandler: null,
            onKeydown: null
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
            "onContextMenuHandler.displayContextMenu": {
                funcName: "gpii.psp.morphicSettingsEditor.qss.displayContextMenu",
                args: ["{that}", "{morphicSettingsEditor}.contextMenu"]
            },
            "onCreate.addKeydownHandler": {
                this: "{that}.container",
                method: "keydown",
                args: ["{that}.events.onKeydown.fire"]
            },
            "onKeydown.log": {
                funcName: "gpii.psp.morphicSettingsEditor.buttonKeydownHandler",
                args: ["{arguments}.0", "{that}", "{morphicSettingsEditor}"]
            }
        },

        renderOnInit: true,

        protoTree: {
            title: "${button.title}"
        }
    }); */
    
    gpii.psp.morphicSettingsEditor.buttonKeydownHandler = function(event, button, mse) {
        
        if ((event.key === "Backspace") || (event.key === "Delete")) {
            gpii.psp.morphicSettingsEditor.qss.removeButton(button.model.index, mse);
        }
    };

    gpii.psp.morphicSettingsEditor.displayContextMenu = function(that, contextMenu) {
        var pos = that.activeItem.getBoundingClientRect();
/*         var buttonModel = that.model;
        contextMenu.applier.change("caller", buttonModel); */
        contextMenu.container.css("visibility", "visible");
        contextMenu.container.css("opacity", 1);
        contextMenu.container.css("top", pos.y - 76);
        contextMenu.container.css("left", pos.x - 180);
        console.log("CONTAINEEEER", contextMenu.container);
        contextMenu.container.children()[0].focus();
    };

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

/*     gpii.psp.morphicSettingsEditor.qss.setClasses = function(button) {

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
    }; */

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

        console.log("THAAAAT", that);

        // gpii.psp.morphicSettingsEditor.qss.setQSSWidth(that.qss.container, qssModel);

        that.buttonCatalog.refreshView();
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

    gpii.psp.morphicSettingsEditor.setModules = function(that) {
        console.log("SETTING MODULES", that);
        var numItemsQSS = that.model.buttonList.length
                          - that.model.buttonList.filter(item => item === "||").length
                          - 3;
        if (numItemsQSS > 8) {
           // document.querySelector(".flc-quickSetStrip-main").classList.add("module-locked");
           that.options.columns = ".flc-quickSetStrip-more"
        }
    };

    fluid.defaults("gpii.psp.morphicSettingsEditor.contextMenu", {
        gradeNames: "fluid.rendererComponent",
        model: {
            caller: null
        },
        selectors: {
            removeLink: ".mor-buttonContextMenu-item-remove"
        },
        members: {
            removeLink: "{that}.dom.removeLink"
        },
        events: {
            onRemoveClick: null,
            onBlur: null,
            onKeydown: null
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
                args: ["{arguments}.0", "{that}", "{morphicSettingsEditor}"]
            },
            removeButtonBlurHandler: {
                funcName: "gpii.psp.morphicSettingsEditor.log",
                args: ["{that}"]
            },
            removeButtonKeydownHandler: {
                funcName: "gpii.psp.morphicSettingsEditor.qss.handleKeydown",
                args: ["{arguments}.0", "{that}"]
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

    gpii.psp.morphicSettingsEditor.onMove = function(item) {
        console.log("ON MOVE ITEM:", item);
    };

    gpii.psp.morphicSettingsEditor.qss.handleKeydown = function(e, contextMenu) {
        console.log("JANDLE KEY DOWN", e);
        if (e.keyCode === 27) {
            contextMenu.container[0].style.visibility = "hidden";
            contextMenu.container[0].style.opacity = 0;
        }
    };

    gpii.psp.morphicSettingsEditor.feedback = function(message) {
        var instructionContainer = document.getElementsByClassName("flc-qss-instructions")[0];
        instructionContainer.removeClass("hidden");
    };

    gpii.psp.morphicSettingsEditor.qss.removeButton = function(e, that, mse) {
        
        console.log("MSEEEE", mse);

        e.preventDefault();

        var activeItem = mse.activeItem,
            parentClass = activeItem.parentElement.classList,
            buttonId = activeItem.getAttribute("data-buttonid");
        
        // MODEL
        activeItem.remove();
        gpii.psp.morphicSettingsEditor.qss.hideContextMenu(that.container);

        mse.buttonCatalog.refresh();
    };

    gpii.psp.morphicSettingsEditor.qss.hideContextMenu = function(that) {
        that.css("visibility", "hidden");
        that.css("opacity", 0);
    };

/*     gpii.psp.morphicSettingsEditor.qss.removeButton = function(itemIndex, settingsEditor) {
        var buttonList = settingsEditor.model.buttonList;
        buttonList.splice(itemIndex, 1);
        settingsEditor.applier.change("buttonList", buttonList);
        settingsEditor.activeItem.remove();
        settingsEditor.contextMenu.container.css("visibility", "hidden");
        settingsEditor.contextMenu.container.css("opacity", 0);
        
        settingsEditor.buttonCatalog.refreshView();
    }; */

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
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
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
/*             qss: {
                type: "gpii.psp.morphicSettingsEditor.repeaterInList",
                container: "{that}.dom.buttonList",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.buttonList"
                    },
                    listeners: {
                        "onCreate.setWidth": {
                            funcName: "gpii.psp.morphicSettingsEditor.qss.setQSSWidth",
                            args: ["{that}", "{morphicSettingsEditor}.model.buttonList"]
                        }
                    }
                }
            }, */

            qss: {
                type: "gpii.psp.morphicSettingsEditor.qss",
                container: "{that}.dom.buttonList",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.buttonList"
                    }/* ,
                    listeners: {
                        "onCreate.setWidth": {
                            funcName: "gpii.psp.morphicSettingsEditor.qss.setQSSWidth",
                            args: ["{that}.container", "{morphicSettingsEditor}.model.buttonList"]
                        }
                    } */
                }
            },

            morePanel: {
                type: "gpii.psp.morphicSettingsEditor.qss",
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
                    },
                    listeners: {
                        "onRemoveClick.removeButton": {
                            funcName: "gpii.psp.morphicSettingsEditor.qss.removeButton",
                            args: ["{arguments}.0", "{that}.model.caller.index", "{morphicSettingsEditor}"]
                        }
                    }
                }
            },

            buttonCatalog: {
                type: "gpii.psp.morphicSettingsEditor.buttonCatalog",
                container: "{that}.dom.buttonCatalog",
                options: {
                    model: {
                        items: "{morphicSettingsEditor}.model.supportedButtonsList"
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
    gpii.psp.morphicSettingsEditor.qss.produceTree = function(that, mse) {
        var buttonList = fluid.transform(that.model.buttons, function(button, index) {
            return {
                ID: "button:",
                decorators: [
                    { type: "addClass", classes: button.buttonType },
                    { type: "attrs", attributes: {"data-buttonId": button.id} },
                    { type: "jQuery", func: "keydown", args: function(e) { gpii.psp.morphicSettingsEditor.handleButtonKeydown(e, button, mse) }},
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

/*     fluid.defaults("gpii.psp.morphicSettingsEditor.morePanel", {
        gradeNames: "fluid.rendererComponent",
        selectors: {
            button: ".fl-qss-button",
            buttonLabel:  ".fl-qss-btnLabel"
        },
        repeatingSelectors: ["button"],
        listeners: {
            "prepareModelForRender.getInfoFromCatalog": {
                funcName: "gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel",
                args: ["{that}", "{morphicSettingsEditor}.model"]
            }
        },
        renderOnInit: true,
        protoTree: {
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "button",
                controlledBy: "buttons",
                pathAs: "buttonItem",
                tree: {
                    buttonLabel: "${{buttonItem}.title}"
                }
            }
        },
        resources: {
            template: {
                resourceText: "<div class=\"fl-qss-button fl-qss-button-movable\"><span class=\"fl-qss-btnLabel\"></span></div>"
            }
        }
    }); */

/*     gpii.defaults("gpii.psp.morphicSettingsEditor.button", {
        gradeNames: "fluid.rendererComponent",

        selectors: {
            label: ".flc-test-btnLabel"
        },

        resources: {
            template: {
                resourceText: "<p class=\"flc-test-btnLabel\"></p>"
            }
        },

        protoTree: {
            label: "${button}.title"
        }
    }); */


    /**
     * Renderer component to present the list of buttons.
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
                args: ["{arguments}.0", "{morphicSettingsEditor}"]
            },
            addButtonToMorePanel: {
                funcName: "gpii.psp.morphicSettingsEditor.addButtonToMorePanel",
                args: ["{arguments}.0", "{morphicSettingsEditor}"]
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

    gpii.psp.morphicSettingsEditor.addButtonToQSS = function(e, mse) {
        console.log("MSEEEE", mse);
        var buttonList = mse.model.buttonList;
        buttonList.unshift(e.target.getAttribute("buttonid"));
        mse.applier.change("buttonList", buttonList);
        mse.qss.produceTree();
        mse.buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.addButtonToMorePanel = function(e, mse) {
        console.log("MSEEEE", mse);
        var morePanelList = fluid.flatten(mse.model.morePanelList);
        morePanelList.unshift(e.target.getAttribute("buttonid"));
        mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
        mse.morePanel.produceTree();
        mse.buttonCatalog.refreshView();
    };

    gpii.psp.morphicSettingsEditor.prepareButtonCatalogModel = function(that, allModels) {

        console.log("THAAAAT", that);
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

})(fluid);
