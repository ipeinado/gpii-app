/**
 * Initializes the Make Your Own Button editor
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

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");
    var electron = require("electron");
    var windowInitialParams = electron.remote.getCurrentWindow().params;

    // TODO: Add i18n support

    jQuery(function () {
        gpii.makeYourOwnButtonEditor(".fl-dialog", {});
    });

})(fluid);