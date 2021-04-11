/**
 * The morphic QuickStrip settings holder component
 *
 * Component that holds a model of all the user configurable settings of the
 * Morphic QuickStrip.
 *
 * Copyright 2020 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

/**
 * @module qssUserSettings
 * Keeps a model of the user-configurable settings and is the central point
 * from where the settings are propagated through the different components.
 */
fluid.defaults("gpii.app.qssUserSettings", {
    gradeNames: ["fluid.modelComponent"],
    model: {
        settings: {
            scaleFactor: null,
            closeQssOnClickOutside: null,
            tooltipDisplayDelay: null,
            alwaysUseChrome: null,
            appBarQss: null,
            disableRestartWarning: null,
            openQssShortcut: null,
            buttonList: null,
            morePanelList: null
        }
    }
});
