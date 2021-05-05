/**
 * Initializes the Morphic Settings Editor
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

    /**
     * Wrapper that enables translations for the `gpii.makeYourOwnButtonEditor` component.
     */
    fluid.defaults("gpii.psp.translatedMorphicSettingsEditor", {
        gradeNames: ["gpii.psp.messageBundles", "fluid.viewComponent"],
        components: {
            morphicSettingsEditor: {
                type: "gpii.psp.morphicSettingsEditor",
                container: "{translatedMorphicSettingsEditor}.container",
                options: {
                    model: {
                        buttonList: windowInitialParams.buttonList,
                        morePanelList: windowInitialParams.morePanelList,
                        supportedButtonsList: windowInitialParams.supportedButtonsList,
                        buttonCatalog: windowInitialParams.buttonCatalog
                    }
                }
            },

            buttonCatalog: {
                type: "gpii.psp.morphicSettingsEditor.buttonCatalog",
                container: ".flc-buttonCatalog-buttonList",
                options: {
                    model: {
                        items: windowInitialParams.supportedButtonsList
                    }
                }
            }
        }
    });

    jQuery(function () {
        gpii.psp.translatedMorphicSettingsEditor(".fl-dialog");
    });

    jQuery(document).ready(function() {
        jQuery(".fl-dialog").unbind("focus");
    });
})(fluid);
