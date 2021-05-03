/**
 * The Morphic User Settings widget
 *
 * Represents the QSS menu widget which is used for user configurable morphic settings
 * that have a list of predefined values.
 * Copyright 2021 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid */
"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    /**
     * Represents the QSS Morphic widget.
     */
    fluid.defaults("gpii.qssWidget.morphic", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        selectors: {
            // QuickStrip Settings
            alwaysUseChrome: ".flc-qssMorphicWidget-alwaysUseChrome",
            appBarQss: ".flc-qssMorphicWidget-appBarQss",
            closeQssOnClickOutside: ".flc-qssMorphicWidget-closeQssOnClickOutside",
            disableRestartWarning: ".flc-qssMorphicWidget-disableRestartWarning",
            tooltipDisplayDelay: ".flc-qssMorphicWidget-tooltipDisplayDelay",
            tooltipDisplayDelayIndicators: ".flc-qssTooltipDisplayDelayStepperWidget-indicators",
            scaleFactor: ".flc-qssMorphicWidget-scaleFactor",
            scaleFactorIndicators: ".flc-qssScaleFactorStepperWidget-indicators"
            // External interface
            //footerTip: ".flc-qssMorphicWidget-footerTip",
            //openEditorButton: ".flc-qssMorphicWidget-openEditorButton"
        },

        events: {
            onQssWidgetNotificationRequired: null,
            onQssWidgetSettingAltered: null,
            onQssOpenEditorRequested: null
        },

        enableRichText: true,

        model: {
            setting: {
                settings: {
                    alwaysUseChrome: {
                        value: false,
                        schema: {
                            title: null
                        }
                    },
                    appBarQss: {
                        value: true,
                        schema: {
                            title: null
                        }
                    },
                    closeQssOnClickOutside: {
                        value: false,
                        schema: {
                            title: null
                        }
                    },
                    disableRestartWarning: {
                        value: true,
                        schema: {
                            title: null
                        }
                    },
                    tooltipDisplayDelay: {
                        value: 500,
                        schema: {
                            title: null
                        }
                    },
                    scaleFactor: {
                        value: 1.2,
                        schema: {
                            title: null
                        }
                    }
                }
            },
            messages: {
                // something i18n
                footerTip: "{that}.model.setting.widget.footerTip"
            }
        },

        sounds: {},
        components: {
            alwaysUseChrome: {
                type: "gpii.qssWidget.morphicWidgetToggle",
                container: "{that}.dom.alwaysUseChrome",
                options: {
                    model: {
                        setting: "{morphic}.model.setting.settings.alwaysUseChrome"
                    }
                }
            },
            appBarQss: {
                type: "gpii.qssWidget.morphicWidgetToggle",
                container: "{that}.dom.appBarQss",
                options: {
                    model: {
                        setting: "{morphic}.model.setting.settings.appBarQss"
                    }
                }
            },
            closeQssOnClickOutside: {
                type: "gpii.qssWidget.morphicWidgetToggle",
                container: "{that}.dom.closeQssOnClickOutside",
                options: {
                    model: {
                        setting: "{morphic}.model.setting.settings.closeQssOnClickOutside"
                    }
                }
            },
            disableRestartWarning: {
                type: "gpii.qssWidget.morphicWidgetToggle",
                container: "{that}.dom.disableRestartWarning",
                options: {
                    model: {
                        setting: "{morphic}.model.setting.settings.disableRestartWarning"
                    }
                }
            },
            tooltipDisplayDelay: {
                type: "gpii.qssWidget.morphicWidgetTooltipDisplayDelay",
                container: "{that}.dom.tooltipDisplayDelay",
                options: {
                    sounds: {},
                    model: {
                        messages: "{tooltipDisplayDelay}.model.messages",
                        setting: "{morphic}.model.setting.settings.tooltipDisplayDelay",
                        value: "{morphic}.model.setting.settings.tooltipDisplayDelay.value"
                    },
                    events: {
                        onNotificationRequired: "{morphic}.events.onQssWidgetNotificationRequired"
                    },
                    components: {
                        indicators: {
                            type: "gpii.qssWidget.baseStepper.indicators",
                            container: "{morphic}.dom.tooltipDisplayDelayIndicators",
                            options: {
                                model: {
                                    setting: "{tooltipDisplayDelay}.model.setting"
                                }
                            }
                        }
                    }
                }
            },
            scaleFactor: {
                type: "gpii.qssWidget.morphicWidgetScaleFactor",
                container: "{that}.dom.scaleFactor",
                options: {
                    sounds: {},
                    model: {
                        messages: "{scaleFactor}.model.messages",
                        setting: "{morphic}.model.setting.settings.scaleFactor",
                        value: "{morphic}.model.setting.settings.scaleFactor.value"
                    },
                    events: {
                        onNotificationRequired: "{morphic}.events.onQssWidgetNotificationRequired"
                    },
                    components: {
                        indicators: {
                            type: "gpii.qssWidget.baseStepper.indicators",
                            container: "{morphic}.dom.scaleFactorIndicators",
                            options: {
                                model: {
                                    setting: "{scaleFactor}.model.setting"
                                }
                            }
                        }
                    }
                }
            },
            //openEditorButton: {
            //    type: "gpii.psp.widgets.button",
            //    container: "{that}.dom.openEditorButton",
            //    options: {
            //        model: {
            //            label: "{morphic}.model.messages.openEditorButtonLabel"
            //        },
            //        listeners: {
            //            onClick: {
            //                funcName: "gpii.qssWidget.morphic.openEditorActivated",
            //                args: [
            //                    "{morphic}",
            //                    "{channelNotifier}.events.onQssOpenEditorRequested"
            //                ]
            //            }
            //        }
            //    }
            //},
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        // Add events the main process to be notified for
                        onQssWidgetSettingAltered:       "{morphic}.events.onQssWidgetSettingAltered",
                        onQssWidgetNotificationRequired: "{morphic}.events.onQssWidgetNotificationRequired",
                        onQssOpenEditorRequested:        "{morphic}.events.onQssOpenEditorRequested",
                        onMetric: null,
                        onMetricState: null
                    }
                }
            }
        }
    });

    /**
     * Fire onQssOpenEditorRequested when the openEditorButton is pressed.
     * @param {Component} morphic - The `gpii.qssWidget.morphic` instance
     * @param {fluid.event} openEditorEvent - the onQssOpenEditorRequested event
     */
    gpii.qssWidget.morphic.openEditorActivated = function (morphic, openEditorEvent) {
        // fires the event that open the editor
        openEditorEvent.fire();
    };

    /**
     * Holder component for the QSS Morphic Tooltip Display Delay setting.
     */
    fluid.defaults("gpii.qssWidget.morphicWidgetTooltipDisplayDelay", {
        gradeNames: "gpii.qssWidget.baseStepper"
    });


    /**
     * Holder component for the QSS Morphic Scale Factor setting.
     */
    fluid.defaults("gpii.qssWidget.morphicWidgetScaleFactor", {
        gradeNames: "gpii.qssWidget.baseStepper"
    });

    /**
     * Represents the QSS Morphic toggle widget.
     */
    fluid.defaults("gpii.qssWidget.morphicWidgetToggle", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        selectors: {
            toggleButton: ".flc-toggleButton",
            settingTitle: ".flc-qssMorphicWidgetToggle-settingTitle"
        },

        enableRichText: true,

        model: {
            setting: {},
            value: "{that}.model.setting.value",
            messages: {
                settingTitle: "{that}.model.setting.schema.title"
            }
        },

        components: {
            toggleButton: {
                type: "gpii.psp.widgets.switch",
                container: "{that}.dom.toggleButton",
                options: {
                    model: {
                        enabled: "{morphicWidgetToggle}.model.value"
                    },
                    invokers: {
                        toggleModel: {
                            funcName: "gpii.qssWidget.morphicWidgetToggle.toggleModel",
                            args: ["{that}", "{morphicWidgetToggle}", "{channelNotifier}.events.onQssWidgetSettingAltered"]
                        }
                    }
                }
            }
        }
    });

    /**
     * Invoked whenever the user has activated the "switch" UI element (either
     * by clicking on it or pressing "Space" or "Enter"). What this function
     * does is to update model value and update settings.
     * @param {Component} that - The `gpii.psp.widgets.switch` instance.
     * @param {Component} toggleWidget - The `gpii.qssWidget.morphicWidgetToggle` instance.
     * @param {fluid.event} event - onQssWidgetSettingAltered event
     */
    gpii.qssWidget.morphicWidgetToggle.toggleModel = function (that, toggleWidget, event) {
        // Update the toggle UI
        toggleWidget.applier.change("value", !that.model.enabled, null, "fromWidget");

        // Fire the setting change
        event.fire(toggleWidget.model.setting);
    };


})(fluid);
