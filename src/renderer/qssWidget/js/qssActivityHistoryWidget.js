/**
 * The QSS Activity History widget
 *
 * Represents the QSS menu widget which is used for adjust activity history settings.
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
     * Represents the QSS activityHistory widget.
     */
    fluid.defaults("gpii.qssWidget.activityHistory", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        selectors: {
            collectionEnabled: ".flc-qssActivityHistoryWidget-collectionEnabled",
            cloudSyncEnabled: ".flc-qssActivityHistoryWidget-cloudSyncEnabled"
        },

        events: {
            onQssWidgetNotificationRequired: null,
            onQssWidgetSettingAltered: null
        },

        enableRichText: true,

        model: {
            setting: {
                settings: {
                    collectionEnabled: {
                        value: false,
                        schema: {
                            title: null
                        }
                    },
                    cloudSyncEnabled: {
                        value: false,
                        schema: {
                            title: null
                        }
                    }
                }
            },
            messages: {
                // something i18n
            }
        },

        sounds: {},

        components: {
            collectionEnabled: {
                type: "gpii.qssWidget.activityHistoryWidgetToggle",
                container: "{that}.dom.collectionEnabled",
                options: {
                    model: {
                        setting: "{activityHistory}.model.setting.settings.collectionEnabled"
                    }
                }
            },
            cloudSyncEnabled: {
                type: "gpii.qssWidget.activityHistoryWidgetToggle",
                container: "{that}.dom.cloudSyncEnabled",
                options: {
                    model: {
                        setting: "{activityHistory}.model.setting.settings.cloudSyncEnabled"
                    }
                }
            },
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        // Add events the main process to be notified for
                        onQssWidgetSettingAltered:       "{activityHistory}.events.onQssWidgetSettingAltered",
                        onQssWidgetNotificationRequired: "{activityHistory}.events.onQssWidgetNotificationRequired",
                        onMetric: null,
                        onMetricState: null
                    }
                }
            }
        }
    });

    /**
     * Represents the QSS activityHistory toggle widget.
     */
    fluid.defaults("gpii.qssWidget.activityHistoryWidgetToggle", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        selectors: {
            toggleButton: ".flc-toggleButton",
            settingTitle: ".flc-qssActivityHistoryWidgetToggle-settingTitle"
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
                    model: {},
                    modelRelay: {
                        "enabled": {
                            target: "enabled",
                            singleTransform: {
                                type: "fluid.transforms.valueMapper",
                                defaultInput: "{activityHistoryWidgetToggle}.model.value",
                                match: [{
                                    inputValue: "{activityHistoryWidgetToggle}.model.setting.schema.mapOff",
                                    outputValue: false
                                }, {
                                    inputValue: "{activityHistoryWidgetToggle}.model.setting.schema.mapOn",
                                    outputValue: true
                                }]
                            }
                        }
                    },
                    invokers: {
                        toggleModel: {
                            funcName: "gpii.qssWidget.activityHistoryWidgetToggle.toggleModel",
                            args: ["{that}", "{activityHistoryWidgetToggle}", "{channelNotifier}.events.onQssWidgetSettingAltered"]
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
     * @param {Component} toggleWidget - The `gpii.qssWidget.activityHistoryWidgetToggle` instance.
     * @param {fluid.event} event - onQssWidgetSettingAltered event
     */
    gpii.qssWidget.activityHistoryWidgetToggle.toggleModel = function (that, toggleWidget, event) {
        if (toggleWidget.model.setting.schema.mapOff || toggleWidget.model.setting.schema.mapOn) {
            if (that.model.enabled) {
                toggleWidget.applier.change("value", toggleWidget.model.setting.schema.mapOff, null, "fromWidget");
            } else {
                toggleWidget.applier.change("value", toggleWidget.model.setting.schema.mapOn, null, "fromWidget");
            }
        } else {
            toggleWidget.applier.change("value", !that.model.enabled, null, "fromWidget");
        }

        event.fire(toggleWidget.model.setting);
    };

})(fluid);
