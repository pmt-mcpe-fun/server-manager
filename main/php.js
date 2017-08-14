/**
 * php.js - Every php related features
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const http = require('https');
const tarGz = require('node-targz');
const { URL } = require("url");
const properties = require("./lib/properties.js");
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
 * 
 * @param {Function} cb
 */
function define(cb) {
    // PHP
    if (fs.existsSync(exports.app.phpFolder)) {
        try { // Windows
            fs.accessSync(path.join(exports.app.phpFolder, "bin", "php")); // Windows
            exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php", "php.exe");
            cb.apply(exports.app);
        } catch (e) { // Linux & MacOS
            exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php");
            cb.apply(exports.app);
        }
        snackbar("Found php at " + exports.phpExecutable + "...");
    } else { // No PHP
        downloadPHP(cb);
    }
}
exports.define = define;

/**
 * Downloads php.
 * 
 * @param {Function} cb
 */
function downloadPHP(cb) {
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
    snackbar("Downloading PHP v" + PHP_VERSION + "...");
    exports.download('https://bintray.com/pocketmine/PocketMine/download_file?file_path=PHP_' + PHP_VERSION + '_' + arch + '_' + osName + '.tar.gz',
        path.join(exports.app.appFolder, "php.tar.gz"),
        function(err) {
            if (err) {
                snackbar("An internet connection is required to download PHP. You may not be able to use your servers until then.");
                fs.unlink(exports.app.phpFolder);
                console.error(err);
            }
            snackbar("Extracting PHP...");
            tarGz.decompress({
                source: path.join(exports.app.appFolder, "php.tar.gz"),
                destination: exports.app.phpFolder
            }, function(err) {
                if (!err) {
                    // Now we replace the "/PocketMine/" which is the default ~/.pocketmine/php AKA exports.app.phpFolder
                    const options = {
                        files: [
                            path.join(exports.app.phpFolder, "**", '*.*'),
                        ],
                        //Replacement to make (string or regex) 
                        from: /\/PocketMine\//g,
                        to: exports.app.phpFolder,
                    };
                    walk(exports.app.phpFolder);
                    try { // Windows
                        fs.accessSync(path.join(exports.app.phpFolder, "bin", "php")); // Windows
                        exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php", "php.exe");
                    } catch (e) { // Linux & MacOS
                        exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php");
                    }
                    fs.unlink(path.join(exports.app.appFolder, "php.tar.gz"));
                    snackbar("Successfully downloaded PHP " + PHP_VERSION + ".");
                    cb.apply(exports.app);
                } else {
                    console.log(err);
                    snackbar("Could not extract PHP " + PHP_VERSION);
                }
            });
        });
}

/**
 * Downloads a file
 * 
 * @param {String} urlStr
 * @param {String} dest 
 * @param {Function} cb 
 */
exports.download = function(urlStr, dest, cb) {
    var request = http.get(urlStr, function(response) {
        // check if response is success
        if (response.statusCode == 302) {
            exports.download(response.headers["location"], dest, cb);
            return;
        }
        var file = fs.createWriteStream(dest);
        response.pipe(file);
        response.on('end', function() {
            file.close(cb); // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

/**
 * Submits an message (during loading)
 * 
 * @param {String} error 
 */
function snackbar(error) {
    if (exports.app && exports.app.mainWindow) exports.app.mainWindow.webContents.executeJavaScript(`if(document.getElementById('currentThing')) document.getElementById('currentThing').innerHTML = "${error}"`);
}
exports.snackbar = snackbar;

/**
 * Replaces every /PocketMine to data dir.
 * 
 * @param {String} dir 
 */
var walk = function(dir) {
    var list = fs.readdirSync(dir)
    list.forEach(function(oldfile) {
        file = path.join(dir, oldfile);
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
            walk(file);
        } else {
            var contents = fs.readFileSync(file).toString();
            var newContents = contents.replace("/PocketMine", exports.app.phpFolder);
            if (contents !== newContents && oldfile !== "php" /*Preventing bin to be overwritten so broken*/ ) fs.writeFileSync(file, newContents);
        }
    })
}