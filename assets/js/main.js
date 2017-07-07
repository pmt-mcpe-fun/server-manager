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
const ps = require('current-processes');

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
 * Exits the app.
 * 
 */
exports.exit = function() {
    ps.get(function(err, processes) {
        var c = 0;
        processes.forEach(function(elem, key) {
            if (elem.name == "pocketmine-server-manager" || elem.name == "electron") {
                if (elem.pid !== process.pid) {
                    process.kill(elem.pid, "SIGKILL");
                }
            }
        });
    });
}

/**
 * Submits an error
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
        actionOnBottom: error.indexOf("\n") > 0,
        timeout: error.length * 100
    });
}
exports.snackbar = snackbar;




// Defining servers folder location
exports.appFolder = path.join(os.homedir(), '.pocketmine');
exports.serverFolder = path.join(exports.appFolder, "servers");
exports.phpFolder = path.join(exports.appFolder, "php");
exports.phpExecutale = null;
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
                    fs.unlink(path.join(exports.appFolder, "php.tar.gz"));
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
 * Downloads and creates a pocketmine server.
 * 
 * @param {String} name
 * @param {Int} port
 * @param {Float} version
 */

exports.createPMServer = function(name, port, version) {
    // Create servers pathes:
    var serverPath = path.join(exports.serverFolder, name);
    exports.snackbar("Creating server " + name + "...");
    fs.mkdir(serverPath, function(err) {
        if (!err) {
            try {
                fs.mkdirSync(path.join(serverPath, "plugins"));
                fs.mkdirSync(path.join(serverPath, "players"));
                fs.mkdirSync(path.join(serverPath, "worlds"));
                fs.mkdirSync(path.join(serverPath, "resource_packs"));
                fs.writeFile(path.join(serverPath, "server.properties"), properties.emitProperties({
                    motd: name,
                    "server-port": 19132,
                    "white-list": "off",
                    "announce-player-achievements": "on",
                    "spawn-protection": 16,
                    "max-players": 20,
                    "allow-flight": "off",
                    "spawn-animals": "on",
                    "spawn-mobs": "on",
                    gamemode: 0,
                    "force-gamemode": "off",
                    hardcore: "off",
                    pvp: "on",
                    difficulty: 1,
                    "generator-settings": "",
                    "level-name": "world",
                    "level-seed": "",
                    "level-type": "DEFAULT",
                    "enable-query": "on",
                    "enable-rcon": "off",
                    "rcon.password": (Date.now() * Math.random() * os.freemem() / 1000).toString(16), // What a password !
                    "auto-save": "on",
                    "view-distance": 8,
                    "online-mode": "off",
                    "server-ip": "0.0.0.0"
                }), function(err) {
                    if (err) {
                        snackbar("Could not create server's properties file.");
                        fs_utils.rmdir(serverPath);
                        console.error(err);
                    } else {
                        http.get("https://jenkins.pmmp.io/job/PocketMine-MP/lastSuccessfulBuild/api/json?pretty=true&tree=url,artifacts[fileName],number,timestamp",
                            function(response) {
                                var completeResponse = '';
                                response.on('data', function(chunk) {
                                    completeResponse += chunk;
                                });
                                response.on('end', function(chunk) { // Here we have the final result
                                    var data = JSON.parse(completeResponse);
                                    exports.download("https://jenkins.pmmp.io/job/PocketMine-MP/lastSuccessfulBuild/artifact/" + data.artifacts[0].fileName,
                                        path.join(serverPath, "PocketMine-MP.phar"),
                                        function(err) {
                                            if (err) {
                                                snackbar("Could not download latest Jenkins phar.\nAre you connected to the internet?");
                                                fs_utils.rmdir(serverPath);
                                                console.error(err);
                                            } else {
                                                snackbar("Sucessfully created server " + name + "!");
                                            }
                                        });
                                });
                            })
                    }
                });
            } catch (e) {
                snackbar("Could not create server's folders.\nDo you have perms on your home folder?");
                fs_utils.rmdir(serverPath);
                console.error(e.message);
            }
        } else {
            snackbar("Could not create server's folder.\nAre you sure a server with that name doesn't exists already?");
            console.error(err.message);
        }
    });
}