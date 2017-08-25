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
                    walk(exports.app.phpFolder);
                    try { // Windows
                        fs.accessSync(path.join(exports.app.phpFolder, "bin", "php")); // Windows
                        exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php", "php.exe");
                        exports.phpIni = path.join(exports.app.phpFolder, "bin", "php", "php.ini");
                        exports.phpPath = path.join(exports.app.phpFolder, "bin", "php");
                    } catch (e) { // Linux & MacOS & Android
                        exports.phpExecutable = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php");
                        exports.phpIni = path.join(exports.app.phpFolder, "bin", "php7", "bin", "php.ini");
                        exports.phpPath = path.join(exports.app.phpFolder, "bin", "php7");
                    }
                    /**
                     * PHP.ini replacements, due to extensions locations... WHY???
                     */
                    fs.readFile(exports.phpIni, function(err, data) {
                        if (err) {
                            console.log(err);
                            snackbar("Could not read php.ini. Are youu sure that you can read files in your home directory?");
                        } else {
                            var properties = data.toString().split(os.EOL);
                            if (os.platform() !== "win32") properties.push("extension_dir=" + path.join(exports.phpPath, "lib"));
                            properties.forEach(function(line, index) {
                                var lineData = line.split("=");
                                if (lineData[0] == "zend_extension") {
                                    switch (lineData[1]) {
                                        case "opcache.so":
                                            fs.renameSync(path.join(exports.phpPath, "lib", "php", "extensions",
                                                    fs.readdirSync(path.join(exports.phpPath, "lib", "php", "extensions"))[0], "opcache.so"),
                                                path.join(exports.phpPath, "lib", "opcache.so"));
                                            break;
                                    }
                                } else if (lineData[0] == "extension") {
                                    switch (lineData[1]) {
                                        case "php_pthreads.dll":
                                            properties[index] = "extension=php_pthreadsVC2.dll";
                                            break;
                                    }
                                }
                            });
                            fs.writeFile(exports.phpIni, properties.join(os.EOL), function(err) {
                                if (err) {
                                    console.log(err);
                                    snackbar("Could not read php.ini. Are youu sure that you can read files in your home directory?");
                                } else {
                                    fs.unlink(path.join(exports.app.appFolder, "php.tar.gz"));
                                    snackbar("Successfully downloaded PHP " + PHP_VERSION + ".");
                                    cb.apply(exports.app);
                                }
                            })
                        }
                    })
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
            var newContents = contents.replace(/\/PocketMine/g, exports.app.phpFolder);
            if (contents !== newContents &&
                oldfile !== "php" &&
                oldfile.split(".")[oldfile.split(".").length - 1] !== "exe" &&
                oldfile.split(".")[oldfile.split(".").length - 1] !== "dll" &&
                oldfile.split(".")[oldfile.split(".").length - 1] !== "so"
                /*Preventing bin to be overwritten so broken*/
            ) fs.writeFileSync(file, newContents);
        }
    })
}