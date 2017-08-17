/**
 * main.js - JS file requirered everywhere
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const app = require('electron').remote;
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('https');
const tarGz = require('node-targz');
const mdc = require("material-components-web/dist/material-components-web");
const rq = require('electron-require');
const { URL } = require('url');

const properties = rq.lib("properties.js");
const fs_utils = rq.lib("fs-utils.js");
const server = rq.lib("server.js");
const ipcRenderer = rq.electron("ipcRenderer");


exports.inputs = {};
exports.selects = [];

/**
 * Downloads a file
 * 
 * @param {String} urlStr
 * @param {String} dest 
 * @param {Function} cb 
 */
exports.download = function(urlStr, dest, cb) {
    var options = {
        headers: {
            "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester"
        }
    }
    var data = "";
    var url = new URL(urlStr);
    options.hostname = url.hostname;
    options.path = url.pathname;
    var request = http.get(options, function(response) {
        // check if response is success
        if (response.statusCode == 302 || response.statusCode == 301) {
            exports.download(response.headers["location"], dest, cb);
            return;
        }
        response.on("data", function(chunk) {
            data += chunk.toString("binary");
        })
        response.on('end', function() {
            fs.writeFile(dest, data);
            cb();
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
        ipcRenderer.sendSync("close");
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
                        exports.changePhar(version, name);
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
            ipcRenderer.send("deleteServer", serverName);
            fs_utils.rmdir(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), serverName))
        }
    })
}


/**
 * Adds/changes a phar between versions.
 * 
 * @param {Number} version
 * @param {String} serverPath
 * @param {Boolean} [serverCreation]
 */
exports.changePhar = function(version, name, serverCreation = true) {
    var serverPath = path.join(ipcRenderer.sendSync("getVar", "appFolder"), "servers", name);
    if (!fs.existsSync(path.join(ipcRenderer.sendSync("getVar", "pharsFolder"), version + ".phar"))) {
        var data = JSON.parse(fs.readFileSync(path.join(ipcRenderer.sendSync("getVar", "appFolder"), "versions.json")));
        console.log(data.pharsVersion, version, data.pharsVersion[version]);
        exports.download(data.pharsVersion[version], // Getting the phar for our version
            path.join(ipcRenderer.sendSync("getVar", "pharsFolder"), version + ".phar"),
            function(err) {
                if (err) {
                    snackbar("Could not download latest Jenkins phar." + os.EOL + "Are you connected to the internet?");
                    fs_utils.rmdir(serverPath);
                    console.error(err);
                } else {
                    fs.readFile(path.join(ipcRenderer.sendSync("getVar", "pharsFolder"), version + ".phar"), function(err, data) {
                        if (!err) {
                            fs.writeFile(path.join(serverPath, "PocketMine-MP.phar"), data.toString("binary"), function(err) {
                                if (err) {
                                    snackbar("An error occured while creating the server.");
                                    console.error(err);
                                } else {
                                    snackbar(serverCreation ? "Sucessfully created server " + name + "!" : "Updated phar version to " + version + ".");
                                    ipcRenderer.send("addServer", name);
                                }
                            });
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
                fs.writeFile(path.join(serverPath, "PocketMine-MP.phar"), data.toString("binary"), function(err) {
                    if (err) {
                        snackbar("An error occured while creating the server.");
                        console.error(err);
                    } else {
                        snackbar(serverCreation ? "Sucessfully created server " + name + "!" : "Updated phar version to " + version + ".");
                        ipcRenderer.send("addServer", name);
                    }
                });
            } else {
                snackbar("An error occured while creating the server.");
                console.error(err);
            }
        })
    }
}