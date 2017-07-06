/**
 * main.js - JS file requirered everywhere
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

// Starting script
if (top) {
    require = top.window.require;
}
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('https');
const tarGz = require('node-targz');
const properties = require("./js/properties.js");
const fs_utils = require("./js/fs-utils.js");

const PHP_VERSION = "7.0.3";

exports.inputs = {};
exports.selects = [];


/**
 * Downloads a file
 * 
 * @param {String} url 
 * @param {String} dest 
 * @param {Function} cb 
 */
exports.download = function(url, dest, cb) {
    var request = http.get(url, function(response) {
        // check if response is success
        if (response.statusCode == 302) {
            exports.download(response.headers["location"], dest, cb);
            return;
        }
        var file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb); // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

/**
 * Submits an error
 * 
 * @param {String} error 
 */
exports.snackbar = function(error) {
    var snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('#formError'));
    snackbar.show({
        message: error,
        actionText: "Dismiss",
        actionHandler: function() {},
        multiline: error.indexOf("\n") > 0,
        actionOnBottom: error.indexOf("\n") > 0
    });
}




// Defining servers folder location
exports.appFolder = path.join(os.homedir(), '.pocketmine');
exports.serverFolder = path.join(exports.appFolder, "servers");
exports.phpFolder = path.join(exports.appFolder, "php");
try {
    fs.accessSync(exports.serverFolder);
} catch (e) { // No .pocketmine folder
    fs.mkdirSync(exports.appFolder);
    fs.mkdirSync(exports.serverFolder);
}
window.addEventListener("load", function() {
    // PHP
    try {
        fs.accessSync(exports.phpFolder);
        try { // Windows
            fs.accessSync(path.join(exports.phpFolder, "bin", "php")); // Windows
            exports.phpExecutale = path.join(exports.phpFolder, "bin", "php", "php.exe");
        } catch (e) { // Linux & MacOS
            exports.phpExecutale = path.join(exports.phpFolder, "bin", "php7", "bin", "php");
        }
    } catch (e) { // No PHP
        var arch;
        switch (os.arch()) {
            case "x64":
            case "amd64":
            case "arm64":
                arch = "x86-64";
                break;
            default:
                arch = "x86";
                break;
        }
        var osName;
        switch (os.platform()) {
            case "win32":
                osName = "Windows";
                if (arch == "x86-64") arch = "x64";
                break;
            case "darwin":
                osName = "MacOS";
                break;
            default:
                osName = "Linux";
                break;
        }
        console.log('Downloading PHP_' + PHP_VERSION + '_' + arch + '_' + osName + '.tar.gz...');
        exports.snackbar("Downloading PHP v" + PHP_VERSION + "...");
        exports.download('https://bintray.com/pocketmine/PocketMine/download_file?file_path=PHP_' + PHP_VERSION + '_' + arch + '_' + osName + '.tar.gz',
            path.join(exports.appFolder, "php.tar.gz"),
            function(err) {
                console.log("Finished downloading")
                if (err) {
                    exports.snackbar("An internet connection is required to download PHP. You may not be able to use your servers until then.");
                    fs.unlink(exports.phpFolder);
                    console.error(err);
                }
                tarGz.decompress({
                    source: path.join(exports.appFolder, "php.tar.gz"),
                    destination: exports.phpFolder
                }, function() {
                    try { // Windows
                        fs.accessSync(path.join(exports.phpFolder, "bin", "php")); // Windows
                        exports.phpExecutale = path.join(exports.phpFolder, "bin", "php", "php.exe");
                    } catch (e) { // Linux & MacOS
                        exports.phpExecutale = path.join(exports.phpFolder, "bin", "php7", "bin", "php");
                    }
                    exports.snackbar("Successfully downloaded PHP 7.0.3.");
                });
            });
    }
});



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
 * Creates a server
 * 
 * @param {String} name 
 * @param {Integer} port 
 * @param {Integer} version 
 */
exports.createServer = function(name, port, version) {

}