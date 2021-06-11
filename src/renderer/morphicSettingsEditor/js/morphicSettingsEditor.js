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
            "prepareModelForRender.getInfoFromCatalog": "gpii.psp.morphicSettingsEditor.qss.prepareQSSModel"
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
                args: ["{that}"]
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
            columns: ".fl-quickSetStrip-main-buttonList, .fl-quickSetStrip-more, .flc-buttonCatalog-buttonList"
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
                args: ["{arguments}.0", "{arguments}.1", "{arguments}.2", "{that}"]
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
                        items: "{morphicSettingsEditor}.model.buttonList",
                        buttonCatalog: "{morphicSettingsEditor}.model.buttonCatalog"
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
                        items: {
                            func: "{that}.refreshView"
                        },
                        buttonList: {
                            func: "{that}.refreshView"
                        },
                        morePanelList: {
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

    /**
     *
     * @param {*} that
     * @param {*} mse
     * @returns
     */
      fluid.defaults("gpii.psp.morphicSettingsEditor.buttonCatalog", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            // "button:": ".flc-buttonCatalog-buttonContainer-button",
            button: ".fl-qss-button",
            buttonLabel: ".flc-buttonCatalog-btnLabel",
            // buttonTag: ".flc-buttonCatalog-btnTag",
            buttonDescription: ".flc-buttonCatalog-btnDescription"
            // buttonAddButtonToQSS: ".flc-buttonCatalog-btnAddToQSS",
            // buttonAddButtonToMorePanel: ".flc-buttonCatalog-btnAddToMorePanel"
        },
        repeatingSelectors: ["button"],
        resources: {
            template: {
                resourceText: // "<div class=\"flc-buttonCatalog-buttonContainer-button\">" +
                                "<div class=\"fl-qss-button\">" +
                                "<span class=\"flc-buttonCatalog-btnLabel fl-buttonCatalog-btnLabel\"></span>" +
                                "<div class=\"flc-buttonCatalog-btnDescription\"></div>" +
                                "</div>" // +
                                // "</span></div><div class=\"flc-buttonCatalog-buttonContainer-content\">" +
                                // "<div class=\"flc-buttonCatalog-btnTag\"></div>" +
                                // "<div class=\"flc-buttonCatalog-btnDescription\"></div>" +
                                // "<div class=\"flc-buttonCatalog-btnAddToQSS\" role=\"button\"></div>" +
                                // "<div class=\"flc-buttonCatalog-btnAddToMorePanel\" role=\"button\"></div>" +
                                // "</div></div>"
            }
        },
        renderOnInit: true,

        rendererFnOptions: {
          noexpand: true  
        },

        listeners: {
            "prepareModelForRender.prepareButtonCatalog": "gpii.psp.morphicSettingsEditor.buttonCatalog.prepareButtonCatalogModel"
        },

        invokers: {
            produceTree: {
                funcName: "gpii.psp.morphicSettingsEditor.buttonCatalog.produceTree",
                args: ["{that}"]
            }
        }

        // invokers: {
        //     addButtonToQSS: {
        //         funcName: "gpii.psp.morphicSettingsEditor.addButtonToQSS",
        //         args: ["{arguments}.0", "{morphicSettingsEditor}", "{that}"]
        //     },
        //     addButtonToMorePanel: {
        //         funcName: "gpii.psp.morphicSettingsEditor.addButtonToMorePanel",
        //         args: ["{arguments}.0", "{morphicSettingsEditor}", "{that}"]
        //     }
        // },

        // protoTree: {
        //     expander: {
        //         type: "fluid.renderer.repeat",
        //         repeatID: "button",
        //         controlledBy: "buttons",
        //         pathAs: "item",
        //         tree: {
        //             expander: {
        //                 type: "fluid.renderer.condition",
        //                 condition: "{item}.isAddable",
        //                 trueTree: {
        //                     "button:": {
        //                         decorators: [{
        //                             type: "addClass",
        //                             classes: "caquita"
        //                         }]
        //                     },
        //                     buttonLabel:  "${{item}.title}" //,
        //                     // buttonDescription: "${{item}.description}",
        //                     // buttonAddButtonToQSS: {
        //                     //     value: "Add to Morphic Bar",
        //                     //     decorators: [
        //                     //         {
        //                     //             type: "attrs",
        //                     //             attributes: {
        //                     //                 buttonId: "{item}.id"
        //                     //             }
        //                     //         },
        //                     //         {
        //                     //             type: "jQuery", func: "click", args: [{myobData: "${{item}.myobData}"}, "{that}.addButtonToQSS"]
        //                     //         }
        //                     //     ]
        //                     // },
        //                     // buttonAddButtonToMorePanel: {
        //                     //     value: "Add to More Panel",
        //                     //     decorators: [
        //                     //         {
        //                     //             type: "attrs",
        //                     //             attributes: {
        //                     //                 buttonId: "{item}.id"
        //                     //             }
        //                     //         },
        //                     //         { type: "jQuery", func: "click", args: [{myobData: "${{item}.myobData}"}, "{that}.addButtonToMorePanel"] }
        //                     //     ]
        //                     // }
        //                 } //,
        //                 // falseTree: {
        //                 //     button: {
        //                 //         decorators: [{
        //                 //             type: "addClass",
        //                 //             classes: "{item}.buttonType"
        //                 //         }]
        //                 //     },
        //                 //     buttonLabel: "${{item}.title}",
        //                 //     buttonTag: "${{item}.tag}",
        //                 //     buttonDescription: "${{item}.description}"
        //                 // }
        //             }
        //         }
        //     }
        // }
    });

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

    gpii.psp.morphicSettingsEditor.qss.prepareQSSModel = function(model, applier, that) {

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

                // return null;
            });

            // console.log("BUTTONS", buttons);
            var newButtons = buttons.filter(function(button) { return button; });
            var totalButtons = buttons.length,
                separators = buttons.filter(function(button) { return ((typeof(button) === "object") && ((button.id === "separator-visible") || (button.id === "separator")))}).length,
                numberButtons = totalButtons - separators,
                status = { qssButtonsFull: (numberButtons >= 8), qssSeparatorsFull: (separators >= 3)};
            
            if (that.container.hasClass("fl-quickSetStrip-more")) {
                if (totalButtons >= 24) { applier.change("isFull", true); } else { applier.change("isFull", false); }
            } else {
                if (totalButtons >= 8) { applier.change("isFull", true); } else { applier.change("isFull", false); }
            }
                
            applier.change("buttons", newButtons);
        // var flattenedItems = fluid.flatten(that.model.items);
        // var items = flattenedItems.map((item, index) => {
        //     var buttonObject = gpii.psp.morphicSettingsEditor.getButtonInfo(allModels.buttonCatalog, item) || {};
        //     buttonObject.isAddable = true;
        //     buttonObject.isAddableText = "";
        //     buttonObject.tag = "";
        //     buttonObject.buttonIndex = index;

        //     switch (item) {
        //         case "||":
        //         case "separator-visible":
        //         case "separator":
        //             buttonObject.buttonType = "fl-qss-separator";
        //             break;
        //         case "grid":
        //             buttonObject.buttonType = "fl-qss-emptyBtn";
        //             break;
        //         case "grid-visible":
        //             buttonObject.buttonType = "fl-qss-emptyBtn-colored";
        //             break;
        //         case "morphic":
        //         case "service-more":
        //         case "service-undo":
        //         case "service-save":
        //         case "service-saved-settings":
        //         case "service-reset-all":
        //         case "service-close":
        //             // buttonObject.buttonType = "fl-qss-closeButton";
        //             return;
        //         default:
        //             if (that.typeName === "gpii.psp.morphicSettingsEditor.qss") {
        //                 buttonObject.buttonType = "fl-qss-button-movable";
        //             }
        //             break;
        //     };


        //     if (!ELEMENTS.includes(item)) {
        //         if (gpii.psp.morphicSettingsEditor.isButtonInList(item, allModels.buttonList)) {
        //             buttonObject.tag = "In QuickStrip";
        //             buttonObject.isAddable = false;
        //         };

        //         if (gpii.psp.morphicSettingsEditor.isButtonInList(item, fluid.flatten(allModels.morePanelList))) {
        //             buttonObject.tag = "In More Panel";
        //             buttonObject.isAddable = false;
        //         };
        //     }

        //     return buttonObject;
        // });

        // if (that.typeName === "gpii.psp.morphicSettingsEditor.qss") {
        //     // var numberSeparators = that.model.buttonList.filter
        // }

        // that.applier.change("isFull", false);
        // that.applier.change("buttons", items);

    };

    /**
     * This function creates a protoTree for each button
     * @param {*} that - element that calls for the renderer tree
     * @param {*} mse - the overall morphic settings editor
     * @returns
     */
    gpii.psp.morphicSettingsEditor.qss.produceTree = function(that) {
        
        var buttonList = fluid.transform(that.model.buttons, function(button, index) {
            return {
                ID: "button:",
                decorators: [
                    { type: "addClass", classes: button.classes.join(" ") },
                    { type: "attrs", attributes: {"data-buttonId": button.id} },
                    { type: "jQuery", func: "keydown", args: function(e) { gpii.psp.morphicSettingsEditor.handleKeydown(e, that) }} //,
                    // { type: "jQuery", func: "contextmenu", args: function(e) { gpii.psp.morphicSettingsEditor.displayContextMenu(e); }}
                ],
                children: [{
                    ID: "buttonLabel",
                    value: button.title
                }]
            }
        });
        
        return buttonList;
    };

    gpii.psp.morphicSettingsEditor.buttonCatalog.produceTree = function(that) {
        
        var buttonList = fluid.transform(that.model.buttons, function(button, index) {
            return {
                ID: "button:",
                decorators: [
                    { type: "addClass", classes: button.classes.join(" ") },
                    { type: "attrs", attributes: {"data-buttonId": button.id} },
                    { type: "jQuery", func: "mouseenter", args: function(e) { e.currentTarget.lastElementChild.style.display = "block"; } },
                    { type: "jQuery", func: "mouseleave", args: function(e) { e.currentTarget.lastElementChild.style.display = "none"; }}
                    // { type: "jQuery", func: "keydown", args: function(e) { gpii.psp.morphicSettingsEditor.handleKeydown(e, that, mse, buttonCatalog) }},
                    // { type: "jQuery", func: "contextmenu", args: function(e) { gpii.psp.morphicSettingsEditor.displayContextMenu(e, that, mse, mse.contextMenu); }}
                ],
                children: [{
                    ID: "buttonLabel",
                    value: button.title
                }, {
                    ID: "buttonDescription",
                    value: button.description
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
    gpii.psp.morphicSettingsEditor.handleKeydown = function(e, that) {
        console.log("EVENT", e);
        console.log("THAT", that);

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

    // /**
    //  * Adds a button to the 'More' panel
    //  * @param {*} e - click event
    //  * @param {*} mse
    //  * @param {*} buttonCatalog
    //  */
    // gpii.psp.morphicSettingsEditor.addButtonToMorePanel = function(e, mse, buttonCatalog) {
    //     var morePanelList = fluid.flatten(mse.model.morePanelList);
    //     var buttonId = e.target.getAttribute("buttonid");
    //     var buttonToAdd = buttonId === "MakeYourOwn" ? e.data.myobData : buttonId;

    //     morePanelList.push(buttonToAdd);
    //     mse.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
    //     buttonCatalog.refreshView();
    // };

    // gpii.psp.morphicSettingsEditor.isButtonInList = function (button, list) {
    //     var togo = false;

    //     if (typeof(button) === "object") {
    //         togo = fluid.find_if(list, function (el) {
    //             return isDeepStrictEqual(el, button);
    //         });
    //     } else {
    //         togo = list.indexOf(button) !== -1;
    //     }

    //     return togo;
    // };

    gpii.psp.morphicSettingsEditor.buttonCatalog.prepareButtonCatalogModel = function(model, applier, that) {

        var qss = model.buttonList,
            morePanel = fluid.flatten(model.morePanelList);
        
        var buttons = fluid.transform(model.items, function(item, index) {
            var nb = {
                classes: []
            };

            // If it is a custom button
            if (item.hasOwnProperty('buttonID')) {
                nb.classes.push("fl-qss-button-movable");
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
            
            if ((!(STATIC_BUTTONS.includes(nb.id))) && (nb.classes.includes("fl-qss-button-movable"))) {
                return nb;
            }
            
        });

        // console.log("BUTTONS", buttons.filter(function(button) { return button; }));
        
        applier.change("buttons", buttons.filter(function(button) { return button; }));
    };

    gpii.psp.morphicSettingsEditor.displayContextMenu = function(event) {
        // console.log("### At displayContextMenu", that.typeName);
        console.log("event", event);
        var cm = $("#qssContextMenu"),
            cmTop = event.currentTarget.getBoundingClientRect().y + 40,
            cmLeft = event.currentTarget.getBoundingClientRect().x - 180;
        
        cm.css({
            "opacity": 1,
            "visibility": "visible",
            "top": cmTop,
            "left": cmLeft
        });

        console.log("CM", cm);

        cm.bind('keydown', function(e) { console.log("huhuhu")} );
        
        // // console.log(event)
        // contextMenu.applier.change("caller", that.typeName);
        // if (mse.activeItem) {
        //     $(document.body).bind("click", function(e) { gpii.psp.morphicSettingsEditor.qss.hideContextMenu(contextMenu.container); });
        //     contextMenu.container.css("visibility", "visible");
        //     contextMenu.container.css("opacity", 1);
        //     contextMenu.container.css("top", mse.activeItem.getBoundingClientRect().y + 40);
        //     contextMenu.container.css("left", mse.activeItem.getBoundingClientRect().x - contextMenu.container.width() + 14);
        //     contextMenu.container.children()[0].focus();
        //     contextMenu.container.bind('keydown', gpii.psp.morphicSettingsEditor.contextMenuKeyDown);
        // }
    };

    gpii.psp.morphicSettingsEditor.contextMenuKeyDown = function(e) {
        var contextMenu = e.currentTarget;
        if (e.key == "Escape") {
            console.log("pressed escape");
            contextMenu.style.visibility = "hidden";
            contextMenu.style.opacity = 0;
        }
    }


    // gpii.psp.morphicSettingsEditor.getButtonInfo = function(buttonCatalog, buttonId) {

    //     let buttonObject = {};

    //     switch (typeof(buttonId)) {
    //         case "string":
    //             var button = fluid.find_if(buttonCatalog, function (el) {
    //                 return (el.id === buttonId)? true : false;
    //             });
    //             buttonObject = button ? {
    //                 id: buttonId,
    //                 title: button.title,
    //                 description: button.description }: null;
    //             break;
    //         case "object":
    //             buttonObject = {
    //                 id: buttonId.buttonId,
    //                 title: buttonId.buttonName,
    //                 description: buttonId.description,
    //                 myobData: buttonId
    //             };
    //             break;
    //         default:
    //             buttonObject = null;
    //             break;
    //     }

    //     return buttonObject;

    // };

    // gpii.psp.morphicSettingsEditor.findButtonIndexById = function(buttonId, buttonCollection) {
    //     var button = fluid.find_if(buttonCollection, function(el) {
    //         if (typeof(el) === "object") { return el.buttonId === buttonId; }
    //         if (typeof(el) === "string") { return el === buttonId; }
    //         return false;
    //     });
    //     return button? buttonCollection.indexOf(button) : -1;
    // }

    /**
     * This function updates the models after a button has moved.
     */
    gpii.psp.morphicSettingsEditor.updateModels = function (item, position, movables, that) {
        
        // QSS buttons
        var buttonList = that.model.buttonList;

        var qssButtons = buttonList.slice(0, buttonList.length - 7),
            qssStaticButtons = buttonList.slice(buttonList.length - 7, buttonList.length);

        console.log("QSS BUTTONS", qssButtons);

        // More Panel Buttons
        var morePanelList = fluid.flatten(that.model.morePanelList);

        // I AM USING SUPPORTEDBUTTONSLIST HERE, HAVE TO THINK WHAT WE WILL DO WHEN USER CLICKS MYOB
        // THIS FUNCTION REPLICATES WHAT gpii.morphicSettingsEditor.buttonCatalog.prepareButtonCatalogModel does
        var catalogButtons = fluid.transform(that.model.supportedButtonsList, function(button, index) {
            if ((!STATIC_BUTTONS.includes(button)) && (!(qssButtons.includes(button))) && (!(morePanelList.includes(button)))) { return button };
        }).filter(function(button) { return button; });

        console.log("CATALOG BUTTONS", catalogButtons);

        // Get the id of the item that has been moved
        var itemId = item.getAttribute("data-buttonId");

        // Then use the movables provided by afterMove, and create an array with all the ids
        var movableIds = fluid.transform(movables, function(movable, index) {
            return movable.getAttribute("data-buttonId");
        });
        // FIND THE CURRENT INDEX OF THE ITEM THAT HAS BEEN MOVED
        var newIndex = movableIds.indexOf(itemId);
        
        // Helper array that replicates the 'movables' provided, with buttons in their right format
        var allButtons = [...that.morePanel.model.buttons, ...that.qss.model.buttons, ...that.buttonCatalog.model.buttons];
        
        // FIND THE OLD INDEX, USING 
        var buttonInButtons = fluid.find_if(allButtons, function(button, index) {
            return button.id === itemId;
        });
        var oldIndex = allButtons.indexOf(buttonInButtons);

        // Here we are using the 'real' buttons
        var modelButtons = [...morePanelList, ...buttonList, ...catalogButtons];
        var b = modelButtons.splice(oldIndex, 1);
        modelButtons.splice(newIndex, 1, b[0]);

        var morePanelLength = $(".fl-quickSetStrip-more").children().length,
            qssLength = $(".fl-quickSetStrip-main-buttonList").children().length;

        // THE NEW MODELS!
        var newMorePanelList = gpii.psp.morphicSettingsEditor.buildRows(modelButtons.slice(0, morePanelLength));
        var newButtonList = (modelButtons.slice(morePanelLength, morePanelLength + qssLength)).concat(qssStaticButtons);

        that.applier.change("morePanelList", newMorePanelList);
        that.applier.change("buttonList", newButtonList);

        console.log("NEW MORE PANEL LIST", newMorePanelList);
        console.log("NEW BUTTON LIST", newButtonList);
        
        // that.applier.change("buttonList", newButtonList);
        // that.applier.change("morePanelList", newMorePanelList);

        // console.log("THA THAT", that);
        // console.log("MOVABLES", movables);
        // var geom = that.labeller.options.getGeometricInfo();
        // var { index, length, moduleIndex, moduleLength } = fluid.reorderer.indexRebaser(geom.elementIndexer(item));
        // console.log("INDEX", index, "LENGTH", length);

        // var geom = that.labeller.options.getGeometricInfo();
        // var { index, length, moduleIndex, moduleLength } = fluid.reorderer.indexRebaser(geom.elementIndexer(item));

        // var itemId = item.getAttribute("data-buttonid"),
        //     buttonList = that.model.buttonList,
        //     morePanelList = fluid.flatten(that.model.morePanelList),
        //     originIndexQSS = gpii.psp.morphicSettingsEditor.findButtonIndexById(itemId, buttonList),
        //     originIndexMorePanel = gpii.psp.morphicSettingsEditor.findButtonIndexById(itemId, morePanelList);

        // if (originIndexQSS !== -1) {
        //     var movableItem = buttonList.splice(originIndexQSS, 1)[0];
        //     if (moduleIndex === 2) {
        //         buttonList.splice(index - 1, 0, movableItem);
        //     } else {
        //         morePanelList.splice(index, 0, movableItem);
        //     }
        // };

        // if (originIndexMorePanel !== -1) {
        //     var movableItem = morePanelList.splice(originIndexMorePanel, 1)[0];
        //     if (moduleIndex === 1) {
        //         morePanelList.splice(index - 1, 0, movableItem);
        //     } else {
        //         buttonList.splice(index, 0, movableItem);
        //     };
        // };

        // that.applier.change("morePanelList", gpii.psp.morphicSettingsEditor.buildRows(morePanelList));
        // that.applier.change("buttonList", buttonList);

        // buttonCatalog.refreshView();
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
