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
const http = require("https");
const {execSync, spawn} = require('child_process');
const { URL } = require("url");
const properties = require("./lib/properties.js");
const CHECK_PHP = "7.2";
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
        } catch (e) { // Linux & MacOS
            exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php");
        }
        snackbar("Found php at " + exports.phpExecutable + "...");
        // Updating php if needed?
        var ver = /^PHP (\d\.\d)/.exec(execSync(exports.phpExecutable + " -v"))[1];
        if(ver !== CHECK_PHP){
            snackbar("Updating PHP to "+ CHECK_PHP + "...");
            downloadPHP(cb);
        } else {
            cb.apply(exports.app);
        }

    } else { // No PHP
        snackbar("Downloading PHP " + CHECK_PHP + "...");
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
    fs.mkdir(exports.app.phpFolder, function(){
        var osName;
        switch (os.platform()) {
            // Windows binaries
            case "win32":
                exports.download("https://psm.mcpe.fun/download/PHP/getbinary.ps1",
                    path.join(exports.app.phpFolder, "compile.ps1"), () => {
                        snackbar("Compiling PHP...");
                        var comp = spawn("PowerShell.exe",
                            ["-File", path.join(exports.app.phpFolder, "compile.ps1")],
                            {cwd:exports.app.phpFolder}
                        );
                        comp.stdout.on('data', exports.logCompile);
                        comp.stderr.on('data', exports.logCompile);
                        comp.on("close",(code) => {
                            if(code !== 0){
                                snackbar("Could not compile PHP: " + code + ". For more informations, look at " + path.join(exports.app.phpFolder, "install.log"));
                            } else {
                                snackbar("Finished compiling PHP!");
                                exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php", "php.exe");
                                cb.apply(exports.app);
                            }
                        })
                    })
                break;
            // Linux and MacOS binaries
            default:
                exports.download("https://psm.mcpe.fun/download/PHP/compile.sh",
                    path.join(exports.app.phpFolder, "compile.sh"), () => {
                        snackbar("Compiling PHP...");
                        var comp = spawn("bash",
                            [path.join(exports.app.phpFolder, "compile.sh")],
                            {cwd:exports.app.phpFolder}
                        );
                        comp.stdout.on('data', exports.logCompile);
                        comp.stderr.on('data', exports.logCompile);
                        comp.on("close",(code) => {
                            if(code !== 0){
                                snackbar("Could not compile PHP: " + code + ". For more informations, look at " + path.join(exports.app.phpFolder, "install.log"));
                            } else {
                                snackbar("Finished compiling PHP!");
                                exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php");
                                cb.apply(exports.app);
                            }
                        })
                    }
                )
                break;
        }
    });
}


/**
 * Logs compileing data
 *
 * @param {Buffer} data
 */
var currentCmp = "";
exports.logCompile = (data) => {
    console.log(data.toString());
    var cmp = /^(\[\w+\])/.exec(data.toString());
    if(cmp && cmp[1]) {
        currentCmp = cmp[1];
        snackbar("Compiling PHP...<br>" + data.toString());
    } else {
        snackbar("Compiling PHP...<br>" + currentCmp + data.toString());
    }
    if(data.toString().includes("[ERROR]")) {
        snackbar("Could not compile PHP: <br>" + data.toString() + ".<br> For more informations, look at " + path.join(exports.app.phpFolder, "install.log"));
    }
}

/**
 * Downloads a file
 *
 * @param {String} urlStr
 * @param {String} dest
 * @param {Function} cb
 */
exports.download = function(urlStr, dest, cb) {
    var res;
    var request = http.get(urlStr, function(response) {
        // check if response is success
        if (response.statusCode == 302) {
            exports.download(response.headers["location"], dest, cb);
            response.resume();
            return;
        }
        res = response;
        var file = fs.createWriteStream(dest);
        response.pipe(file);
        response.on('end', function() {
            file.close(cb); // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        if (res) res.resume();
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
        console.log(err);
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
