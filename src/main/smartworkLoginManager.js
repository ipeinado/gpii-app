/**
 * The Smartwork login manager
 *
 * This component is responsible for keying the smartwork users into Morphic.
 *
 * The Smartwork credentials need to be used by different applications and
 * services running on the computer, we use the OS keyring to store/retrieve
 * such credentials.
 *
 * This component orchestrates the gpii keyIn process using the smartwork credentials
 * and eventually ask the users for the credentials at system startup.
 *
 * Copyright 2021 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion"),
    getUuid = require("uuid-by-string"),
    iconv = require("iconv-lite"),
    https = require("https"),
    keytar = require("keytar");

iconv.skipDecodeWarning = true;

var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.app.smartworkLoginManager", {
    gradeNames: "fluid.modelComponent",
    model: {
        username: null,
        password: null,
        gpiiKey: null
    },
    components: {
        keyring: {
            type: "gpii.keyring",
            options: {
                service: "smartwork"
            }
        }
    },
    events: {
        onCredentialsFound: null,
        onNoCredentialsFound: null,
        onLoginSucceeded: null,
        onLoginFailed: null,
        onLogoutSucceeded: null,
        onLogoutFailed: null
    },
    listeners: {
        "onCreate.checkCredentials": {
            funcName: "gpii.app.smartworkLoginManager.checkCredentials",
            args: [
                "{that}",
                "{keyring}",
                "{that}.events.onCredentialsFound",
                "{that}.events.onNoCredentialsFound"
            ]
        },
        "onLoginSucceeded.saveIntoKeyring": {
            func: "{keyring}.setPassword",
            args: ["{arguments}.0.username", "{arguments}.0.password"]
        }
    },
    invokers: {
        logIntoSmartwork: {
            funcName: "gpii.app.smartworkLoginManager.logIntoSmartwork",
            args: ["{that}", "{arguments}.0", "{that}.events.onLoginSucceeded", "{that}.events.onLoginFailed"]
        },
        logoutFromSmartwork: {
            funcName: "gpii.app.smartworkLoginManager.logoutFromSmartwork",
            args: ["{that}", "{that}.events.onLogoutSucceeded", "{that}.events.onLogoutFailed"]
        },
        generateGpiiKey: {
            funcName: "gpii.app.smartworkLoginManager.generateGpiiKey",
            args: ["{that}"]
        }
    }
});

gpii.app.smartworkLoginManager.checkCredentials = function (that, keyring, credentialsFound, noCredentialsFound) {
    var credentials = keyring.findCredentials();
    credentials.then(function (result) {
        if (!result) {
            // Couldn't find credentials, ask the user for credentials through morphic
            noCredentialsFound.fire();
        } else {
            // Found credentials, generate the uuid and trigger the keyIn process
            that.applier.change("username", result.account);
            that.applier.change("password", result.password);
            that.generateGpiiKey();
            credentialsFound.fire();
        }
    }, function (error) {
        fluid.fail("Failed while checking credentials - ", error);
    });
};

gpii.app.smartworkLoginManager.logIntoSmartwork = function (that, credentials, onLoginSucceeded, onLoginFailed) {
    var options = {
        hostname: "gsc.smartwork.gpii.net",
        port: 443,
        path: "/checkSmartworkAccount?username=" + credentials.username + "&password=" + credentials.password,
        method: "GET"
    };

    var req = https.request(options, function (res) {
        res.on("data", function (data) {
            var resolution = JSON.parse(data.toString());

            if (resolution.result === "ok") {
                that.applier.change("username", credentials.username);
                that.applier.change("password", credentials.password);
                that.generateGpiiKey();
                onLoginSucceeded.fire(credentials);
            } else {
                onLoginFailed.fire();
            }
        });
    });

    req.on("error", function (error) {
        fluid.log("There was an error while trying to authenticate, error was: ", error);
    });

    req.end()
};

gpii.app.smartworkLoginManager.logoutFromSmartwork = function (that, onLogoutSucceeded, onLogoutFailed) {
    that.keyring.deletePassword(that.model.username).then(function (/* result */) {
        that.applier.change("", {
          username: null,
          password: null,
          gpiiKey: null
        });
        onLogoutSucceeded.fire();
    }, function (error) {
        onLogoutFailed.fire();
    });
};

gpii.app.smartworkLoginManager.generateGpiiKey = function (that) {
    var gpiiKey = getUuid("".concat(that.model.username, that.model.password));
    that.applier.change("gpiiKey", gpiiKey);
    return gpiiKey;
};

fluid.defaults("gpii.keyring", {
    gradeNames: "fluid.component",
    service: null,
    invokers: {
        findCredentials: {
            funcName: "gpii.keyring.findCredentials",
            args: ["{that}.options.service"]
        },
        setPassword: {
            funcName: "gpii.keyring.setPassword",
            args: [
                "{that}.options.service",
                "{arguments}.0", // account
                "{arguments}.1"  // password
            ]
        },
        deletePassword: {
            funcName: "gpii.keyring.deletePassword",
            args: [
                "{that}.options.service",
                "{arguments}.0", // account
            ]
        }
    }
});

gpii.keyring.findCredentials = function (service) {
    var promise = fluid.promise();

    keytar.findCredentials(service).then(function (credentials) {
        // Keytar returns an array of credentials, just in case there more than
        // one account in a particular service. In case of Smartwork, this is not
        // likely to happen, but just in case, we always return the first one, which
        // corresponds to the last added credentials.
        //
        // Also, we have to deal with the way that different libraries handle the
        // password from the keyring, read this:
        //   https://github.com/r-lib/keyring/issues/85
        // For this reason, we need to handle the situation of Morphic
        // saving the password in a way that the python-keyring can retrieve.
        // TODO: Propose an alternative for this workaround. And if can't be
        // avoided, then explore the possibility to not use iconv.
        var togo;

        if (!credentials.length) {
            togo = false;
        } else {
            togo = {
                account: credentials[0].account,
                // Workaround for the keytar enconding mumbo jumbo
                password: iconv.decode(credentials[0].password, 'utf16le')
            };
        }

        promise.resolve(togo);
    }, function (error) {
        promise.reject(error);
    });

    return promise;
};

gpii.keyring.setPassword = function (service, account, password) {
    var promise = fluid.promise();

    // Workaround for the keytar enconding mumbo jumbo
    var bPass = Buffer.from(password, "utf16le");

    keytar.setPassword(service, account, bPass.toString()).then(function () {
        promise.resolve();
    }, function (error) {
        promise.reject(error);
    });

    return promise;
};

gpii.keyring.deletePassword = function (service, account) {
    var promise = fluid.promise();

    keytar.deletePassword(service, account).then(function (result) {
        // 'deletePassword' returns 'true' if deleted and 'false' if the account
        // couldn't be found in the keyring. There's no reason to reject but
        // we return the result anyway.
        promise.resolve(result);
    }, function (error) {
        promise.reject(error);
    });

    return promise;
};
