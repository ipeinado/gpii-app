/**
 * The Smartwork login dialog
 *
 * Represents the Smartwork login dialog.
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
     * Represents the controller for the settings editor.
     */
    fluid.defaults("gpii.smartworkLogin", {
        gradeNames: ["fluid.viewComponent", "gpii.binder.bindOnCreate"],

        // Provided from main process through index.js
        smartworkCredentials: null,

        model: {
            credentials: {
                username: null,
                password: null
            },

            // Translatable strings
            messages: {
                loginSuccess: "Login succeeded",
                loginFail: "Invalid Credentials",
                logoutWarning: "When logging out, the Smartwork credentials will be removed from " +
                               "your system and you will be keyed out from Morphic",
                logoutSuccess: "Successfully removed Smartwork credentials from the system"
            }
        },

        selectors: {
            usernameInput: ".flc-username",
            passwordInput: ".flc-password",
            loginButton: ".flc-loginBtn",
            logoutButton: ".flc-logoutBtn",
            feedbackLabel: ".flc-feedbackLabel",
            progressRing: ".progress-ring"
        },

        bindings: {
            // selector  :  model
            usernameInput: "credentials.username",
            passwordInput: "credentials.password"
        },

        styles: {
            loginSuccess: "alert-success",
            loginFailed: "alert-danger",
            logoutWarning: "alert-warning"
        },

        events: {
            onLoginClick: null,
            onLogoutClick: null
        },

        invokers: {
            // TODO: i18n
            setupButtons: {
                funcName: "gpii.smartworkLogin.setupButtons",
                args: ["{that}"]
            },

            showLoginButton: {
                this: "{that}.dom.loginButton",
                method: "show"
            },
            hideLoginButton: {
                this: "{that}.dom.loginButton",
                method: "hide"
            },
            showLogoutButton: {
                this: "{that}.dom.logoutButton",
                method: "show"
            },
            hideLogoutButton: {
                this: "{that}.dom.logoutButton",
                method: "hide"
            },

            showSuccessLabel: {
                this: "{that}.dom.feedbackLabel",
                method: "text",
                args: "{arguments}.0"
            },
            showFailureLabel: {
                this: "{that}.dom.feedbackLabel",
                method: "text",
                args: "{that}.model.messages.loginFail"
            },
            showLogoutWarning: {
                this: "{that}.dom.feedbackLabel",
                method: "text",
                args: "{that}.model.messages.logoutWarning"
            },
            applyWarningStyle: {
                this: "{that}.dom.feedbackLabel",
                method: "addClass",
                args: "alert-warning"
            },
            removeWarningStyle: {
                this: "{that}.dom.feedbackLabel",
                method: "removeClass",
                args: "alert-warning"
            },

            toggleProgressRing: {
                this: "{smartworkLogin}.dom.progressRing",
                method: "toggle",
                args: ["slow"]
            }
        },

        components: {
            channelListener: {
                type: "gpii.psp.channelListener",
                options: {
                    events: {
                        onLoginSucceeded: null,
                        onLoginFailed: null,
                        onLogoutSucceeded: null,
                        onLogoutFailed: null
                    },
                    listeners: {
                        // TODO: Refactor these listeners in a decent way
                        onLoginSucceeded: [{
                            func: "{smartworkLogin}.toggleProgressRing"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "removeClass",
                            args: "alert-danger"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "addClass",
                            args: "alert-success"
                        }, {
                            func: "{smartworkLogin}.showSuccessLabel",
                            args: "{smartworkLogin}.model.messages.loginSuccess"
                        }, {
                            func: "{smartworkLogin}.channelNotifier.events.onDestroyRequest.fire",
                            args: 5000
                        }],

                        onLoginFailed: [{
                            func: "{smartworkLogin}.toggleProgressRing"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "removeClass",
                            args: "alert-success"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "addClass",
                            args: "alert-danger"
                        }, {
                            func: "{smartworkLogin}.showFailureLabel"
                        }],

                        onLogoutSucceeded: [{
                            func: "{smartworkLogin}.toggleProgressRing"
                          }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "addClass",
                            args: "alert-success"
                        }, {
                            func: "{smartworkLogin}.showSuccessLabel",
                            args: "{smartworkLogin}.model.messages.logoutSuccess"
                        }, {
                            func: "{smartworkLogin}.channelNotifier.events.onDestroyRequest.fire",
                            args: 5000
                        }]
                    }
                }
            },
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onSmartworkLoginRequest: null,
                        onSmartworkLogoutRequest: null,
                        onDestroyRequest: null
                    }
                }
            }
        },

        // TODO: Do it properly and KISS
        listeners: {
            "onCreate.addLoginClickHandler": {
                "this": "{that}.dom.loginButton",
                method: "click",
                args: ["{that}.events.onLoginClick.fire"]
            },
            "onCreate.addLogoutClickHandler": {
                "this": "{that}.dom.logoutButton",
                method: "click",
                args: ["{that}.events.onLogoutClick.fire"]
            },
            "onCreate.hideProgressRing": {
                this: "{that}.dom.progressRing",
                method: "hide"
            },

            "onCreate.setupButtons": "{that}.setupButtons",

            "onLoginClick.notifiyMainProcess": {
                funcName: "{that}.channelNotifier.events.onSmartworkLoginRequest.fire",
                args: ["{that}.model.credentials"]
            },
            "onLoginClick.clearFeedbackLabel": {
                this: "{that}.dom.feedbackLabel",
                method: "empty"
            },
            "onLoginClick.toggleProgressRing": {
                func: "{smartworkLogin}.toggleProgressRing"
            },

            "onLogoutClick.clearFeedbackLabel": {
                this: "{that}.dom.feedbackLabel",
                method: "empty"
            },
            "onLogoutClick.removeWarningStyle": {
                func: "{that}.removeWarningStyle"
            },
            "onLogoutClick.toggleProgressRing": {
                func: "{smartworkLogin}.toggleProgressRing"
            },
            "onLogoutClick.notifiyMainProcess": {
                funcName: "{that}.channelNotifier.events.onSmartworkLogoutRequest.fire"
            },
        }
    });

    gpii.smartworkLogin.setupButtons = function (that) {
        var isLoggedIntoSmartwork = that.options.smartworkCredentials;

        if (isLoggedIntoSmartwork) {
            that.hideLoginButton();
            that.showLogoutWarning();
            that.applyWarningStyle();
            that.showLogoutButton();
            that.applier.change(["credentials", "username"], isLoggedIntoSmartwork);
            that.applier.change(["credentials", "password"], isLoggedIntoSmartwork);
        } else {
            that.showLoginButton();
            that.hideLogoutButton();
        }

    };

})(fluid);
