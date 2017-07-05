/**
 * main.js - JS file requirered everywhere
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

if (top) {
    require = top.window.require;
}
const path = require('path');
const fs = require('fs');
const os = require('os');
const properties = require("./js/properties.js");
const ListenerTracker = require("./js/interceptListener.js");

exports.inputs = {};
exports.selects = [];


// Defining servers folder location
exports.appFolder = path.join(os.homedir(), '.pocketmine');
exports.serverFolder = path.join(exports.appFolder, "servers");
exports.phpFolder = path.join(exports.appFolder, "bin");
try {
    fs.accessSync(exports.serverFolder);
} catch (e) { // No .pocketmine folder
    fs.mkdirSync(exports.appFolder);
    fs.mkdirSync(exports.serverFolder);
    fs.mkdirSync(exports.phpFolder);
    // TODO: Download PHP binaries for correct OS.
}

/**
 * Downloads and creates a pocketmine server.
 * 
 * @param {String} name
 * @param {Int} port
 * @param {Float} version
 */
exports.createPMServer = function(name, port, version) {
    // Create servers pathes:
    var serverPath = path.join(exports.serverFolder, name);
    fs.mkdir(serverPath, function(err) {
        if (!err) {
            try {
                fs.mkdirSync(path.join(serverPath, "plugins"));
                fs.mkdirSync(path.join(serverPath, "players"));
                fs.mkdirSync(path.join(serverPath, "worlds"));
                fs.mkdirSync(path.join(serverPath, "resource_packs"));
            } catch (e) {
                snackbar("Could not create server's folders.\nDo you have perms on your home folder?");
                console.error(e.message);
            }
        } else {
            snackbar("Could not create server's folder.\nAre you sure a server with that name doesn't exists already?");
            console.error(err.message);
        }
    });
}

window.addEventListener("load", function(event) {

    // Making inputs working
    document.querySelectorAll('.mdc-textfield').forEach(function(elem) {
        exports.inputs[elem.id] = new mdc.textfield.MDCTextfield(elem, /* foundation */ undefined, (el) => {
            // do something with el...
            return new mdc.ripple.MDCRipple(el);
        });
    });
    document.querySelectorAll('.mdc-select').forEach(function(elem) {
        exports.selects.push(new mdc.select.MDCSelect(elem));
    });
});

/**
 * Creates a snackbar
 * 
 * @param {String} error 
 */
function snackbar(error) {
    var snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('#formError'));
    snackbar.show({
        message: error,
        actionText: "Dismiss",
        actionHandler: function() {},
        multiline: error.indexOf("\n") > 0,
        actionOnBottom: error.indexOf("\n") > 0
    });
    addServerDialog.show();
}