/**
 * updater.js - Auto updater for the app.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */


const http = require('http');
const fs = require('fs');
const path = require('path');
const { dialog, shell, app } = require('electron')
const rq = require('electron-require');
const version = rq.lib('version.js')


/**
 * @typedef {Object} VersionData
 * @property {Object} pharsVersion
 * @property {String} appVersion
 * @property {String} fileVersion
 */



var updateAvailable;
var newData;
var oldDataString;
var phpLib = undefined;
/**
 * Checks for updates
 * 
 * @param {php.js}
 * @param {Function} cb
 */
function checkForUpdates(php, cb) {
    phpLib = php;
    php.snackbar("Looking for updates...");
    var res;
    http.get("http://psm.mcpe.fun/versions.json",
        function(response) {
            var completeResponse = '';
            res = response;
            response.on('data', function(chunk) {
                completeResponse += chunk;
            });
            response.on('end', function() { // Here we have the final result
                var data;
                try {
                    oldDataString = fs.readFileSync(path.join(php.app.appFolder, "versions.json"));
                    data = JSON.parse(oldDataString);
                } catch (e) {
                    data = {};
                }
                try {
                    newData = JSON.parse(completeResponse);
                } catch (e) {
                    newData = {};
                }
                if (!fs.existsSync(path.join(php.app.appFolder, "versions.json"))) {
                    fs.writeFileSync(path.join(php.app.appFolder, "versions.json"), completeResponse);
                } else if (version.compare(newData.fileVersion, data.fileVersion) == version.VERSION_FIRST_SUPERIOR) {
                    fs.writeFileSync(path.join(php.app.appFolder, "versions.json"), completeResponse);
                    applyUpdates(data, newData);
                }
                if (version.compare(newData.appVersion, app.getVersion())) applyUpdates(data, newData);
                cb.apply(php.app);
            });
        }
    ).on('error', function(e) { // An error occured. Do nothing exepct cb
        if (res) res.resume();
        console.log(`Got error: ${e.message}`);
        cb.apply(php.app);
    });
}
exports.checkForUpdates = checkForUpdates;

/**
 * Applies new version update
 * 
 * @param {VersionData} oldData 
 * @param {VersionData} newData 
 */
function applyUpdates(oldData, newData) {
    try {
        var php = phpLib
        if (newData.pharsVersion !== oldData.pharsVersion) {
            Object.keys(oldData.pharsVersion).forEach(function(key) {
                if (
                    (fs.existsSync(path.join(php.app.pharsFolder, key + ".phar")) &&
                        newData.pharsVersion[key] !== oldData.pharsVersion[key]) ||
                    !newData.pharsVersion[key]
                ) {
                    fs.unlink(path.join(php.app.pharsFolder, key + ".phar"));
                }
            });
        }
        if (newData.appVersion !== oldData.appVersion) {
            var buttonClicked = dialog.showMessageBox(php.app.mainWindow, {
                title: "Update available !",
                type: "info",
                message: "A new PocketMine Server Manager version came out (" + newData.appVersion + "). Would you like to update it?",
                buttons: [
                    "Update",
                    "View changelog",
                    "Cancel"
                ],
                icon: path.join(__dirname, "..", "assets", "icons", "icon.png")
            });
            switch (buttonClicked) {
                case 0:
                    shell.openExternal("https://psm.mcpe.fun/download");
                    app.exit();
                    break;
                case 1:
                    shell.openExternal("https://psm.mcpe.fun/changelog");
                    break;
                case 2:
                    fs.writeFileSync(path.join(php.app.appFolder, "versions.json"), oldDataString);
                    break;
            }
        }
    } catch (e) {
        // Version file is invalid. Do not trigger error and let the file be replaced.
        console.log(e);
    }
}