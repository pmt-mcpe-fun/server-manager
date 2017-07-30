/**
 * main.js - JS file requirered everywhere
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const app = require('electron').remote;
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('https');
const tarGz = require('node-targz');
const properties = require("./lib/properties.js");
const fs_utils = require("./lib/fs-utils.js");
const server = require("./lib/server.js");
const ps = require('current-processes');
const ipcRenderer = require('electron').ipcRenderer;


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
    if (ipcRenderer.sendSync("save")) {
        console.log("Getting processes...");
        ps.get(function(err, processes) {
            console.log('Got processes !');
            processes.forEach(function(elem, key) {
                if (elem.name.indexOf("pocketmine-serv") > 0 || elem.name == "electron") {
                    console.log("Killing ", elem.pid, process.pid);
                    if (elem.pid !== process.pid) {
                        process.kill(elem.pid, "SIGKILL");
                    }
                }
            });
            app.app.exit(0);
        });
    } else {
        snackbar("Please stop all your servers before exiting the app !");
    }
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
        multiline: error.indexOf(os.EOL) > 0,
        actionOnBottom: error.indexOf(os.EOL) > 0,
        timeout: error.length * 100
    });
}
exports.snackbar = snackbar;



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
    var serverPath = path.join(ipcRenderer.sendSync("getVar", "serverFolder"), name);
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
                    "server-port": port,
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
                        if (!fs.existsSync(path.join(ipcRenderer.sendSync("getVar", "pharsFolder"), version + ".phar"))) {
                            var data = JSON.parse(fs.readFileSync(path.join(ipcRenderer.sendSync("getVar", "appFolder"), "versions.json")));
                            console.log("Sucessfully getted list. Heading torwards to: " + data[version]);
                            console.log(serverPath);
                            exports.download(data[version], // Getting the phar for our version
                                path.join(ipcRenderer.sendSync("getVar", "pharsFolder"), version + ".phar"),
                                function(err) {
                                    if (err) {
                                        snackbar("Could not download latest Jenkins phar." + os.EOL + "Are you connected to the internet?");
                                        console.log("Could not get " + data[version]);
                                        fs_utils.rmdir(serverPath);
                                        console.error(err);
                                    } else {
                                        fs.readFile(path.join(ipcRenderer.sendSync("getVar", "pharsFolder"), version + ".phar"), function(err, data) {
                                            if (!err) {
                                                snackbar("Sucessfully created server " + name + "!");
                                                console.log("Finished !")
                                                fs.writeFile(path.join(serverPath, "PocketMine-MP.phar"), data.toString());
                                            } else {
                                                snackbar("An error occured while creating the server.");
                                                console.error(err);
                                            }
                                        })
                                    }
                                });
                        } else {
                            fs.readFile(path.join(ipcRenderer.sendSync("getVar", "pharsFolder"), version + ".phar"), function(err, data) {
                                if (!err) {
                                    snackbar("Sucessfully created server " + name + "!");
                                    console.log("Finished !")
                                    fs.writeFile(path.join(serverPath, "PocketMine-MP.phar"), data.toString());
                                } else {
                                    snackbar("An error occured while creating the server.");
                                    console.error(err);
                                }
                            })
                        }
                    }
                });
            } catch (e) {
                snackbar("Could not create server's folders." + os.EOL + "Do you have perms on your home folder?");
                fs_utils.rmdir(serverPath);
                console.error(e.message);
            }
        } else {
            snackbar("Could not create server's folder." + os.EOL + "Are you sure a server with that name doesn't exists already?");
            console.error(err.message);
        }
    });
}

/**
 * Removes a server from the list
 */
exports.removeServer = function(serverName) {
    server.getServer(serverName, function(srv) {
        if (srv.isStarted) {
            snackbar("Cannot delete a started server !");
        } else {
            fs_utils.rmdir(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), serverName))
        }
    })
}