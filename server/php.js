/**
 * php.js - Every php related features
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */
const os = require('os');
const path = require('path');
const fs = require('fs');
const http = require('https');
const tarGz = require('node-targz');
const properties = require("./lib/properties.js");
// const fs_utils = require("./js/fs-utils.js");
const PHP_VERSION = "7.0.3";

/**
 * Sets main.js app exports
 * 
 * @param {any} app 
 */
function setApp(app) {
    exports.app = app;
}
exports.setApp = setApp;

/**
 * Defines php.
 */
function define() {
    // PHP
    try {
        fs.accessSync(exports.app.phpFolder);
        try { // Windows
            fs.accessSync(path.join(exports.app.phpFolder, "bin", "php")); // Windows
            exports.phpExecutale = path.join(exports.app.phpFolder, "bin", "php", "php.exe");
        } catch (e) { // Linux & MacOS
            exports.phpExecutale = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php");
        }
    } catch (e) { // No PHP
        downloadPHP();
    }
}
exports.define = define;

/**
 * Downloads php.
 */
function downloadPHP() {
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
    snackbar("Downloading PHP v" + PHP_VERSION + "...");
    exports.download('https://bintray.com/pocketmine/PocketMine/download_file?file_path=PHP_' + PHP_VERSION + '_' + arch + '_' + osName + '.tar.gz',
        path.join(exports.app.appFolder, "php.tar.gz"),
        function(err) {
            console.log("Finished downloading")
            if (err) {
                snackbar("An internet connection is required to download PHP. You may not be able to use your servers until then.");
                fs.unlink(exports.app.phpFolder);
                console.error(err);
            }
            tarGz.decompress({
                source: path.join(exports.app.appFolder, "php.tar.gz"),
                destination: exports.app.phpFolder
            }, function() {
                try { // Windows
                    fs.accessSync(path.join(exports.app.phpFolder, "bin", "php")); // Windows
                    exports.phpExecutale = path.join(exports.app.phpFolder, "bin", "php", "php.exe");
                } catch (e) { // Linux & MacOS
                    exports.phpExecutale = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php");
                }
                fs.unlink(path.join(exports.app.appFolder, "php.tar.gz"));
                snackbar("Successfully downloaded PHP 7.0.3.");
            });
        });
}

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
function snackbar(error) {
    exports.app.mainWindow.webContents.executeJavaScript("window.main.snackbar('" + error + "');");
}
exports.snackbar = snackbar;