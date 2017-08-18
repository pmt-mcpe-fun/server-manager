/**
 * main.js - NodeJS script that runs the app.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const termColors = require("./assets/js/lib/formatingCodes.js");

// Outputing message of usage if no gui is specified. I know, it's a little hard to read...
if (process.argv.indexOf("--no-gui") !== -1) {
    console.log(`${termColors.COLOR_YELLOW}You are running PocketMine Server Manager in ${termColors.FORMAT_ITALIC}"no gui mode"${termColors.FORMAT_RESET}${termColors.COLOR_YELLOW}.
This means ${termColors.FORMAT_ITALIC}no${termColors.FORMAT_RESET}${termColors.COLOR_YELLOW} window will be showed and everything will be done using commands.
${termColors.COLOR_GREEN}${termColors.FORMAT_BOLD}Launch a server:${termColors.FORMAT_RESET}${termColors.COLOR_ORANGE} ${process.argv[0]} --start <server name>
${termColors.COLOR_GREEN}${termColors.FORMAT_BOLD}Stop a server:${termColors.FORMAT_RESET}${termColors.COLOR_ORANGE} ${process.argv[0]} --stop <server name>
${termColors.COLOR_GREEN}${termColors.FORMAT_BOLD}Launch a GUI with server infos:${termColors.FORMAT_RESET}${termColors.COLOR_ORANGE} ${process.argv[0]} --view <server name>
${termColors.COLOR_GREEN}${termColors.FORMAT_BOLD}Launch the GUI:${termColors.FORMAT_RESET}${termColors.COLOR_ORANGE} ${process.argv[0]} --launch-gui
${termColors.COLOR_GREEN}${termColors.FORMAT_BOLD}Launch the GUI with os windows:${termColors.FORMAT_RESET}${termColors.COLOR_ORANGE} ${process.argv[0]} --launch-gui-os-win
${termColors.COLOR_GREEN}${termColors.FORMAT_BOLD}Quit the GUI:${termColors.FORMAT_RESET}${termColors.COLOR_ORANGE} ${process.argv[0]} --quit-gui
${termColors.COLOR_GREEN}${termColors.FORMAT_BOLD}Quit app:${termColors.FORMAT_RESET}${termColors.COLOR_ORANGE} ${process.argv[0]} --quit${termColors.FORMAT_RESET}`);
}

require('daemon-plus')(); // creates new child process, exists the parent

if (process.env.XDG_CURRENT_DESKTOP == "Unity:Unity7") process.env.XDG_CURRENT_DESKTOP = "Unity"; // Fixing tray with Ubuntu 17.04

const path = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const http = require('http');
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const php = require("./main/php");
const server = require("./main/server");
const tray = require("./main/tray");
exports.tray = tray;
exports.php = php;
exports.servers = {};

var viewPage;
// Single instance, Windows Jump list & command line relaunching.
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    var start = false;
    var stop = false;
    var view = false;
    commandLine.forEach(function(cmd) {
        switch (cmd) {
            case "--start":
                start = true;
                break;
            case "--stop":
                stop = true;
                break;
            case "--view":
                view = true;
                break;
            case "--quit":
                setTimeout(app.quit, 100); // Wait so no relaunch
                break;
            case "--relaunch":
                app.quit(); // Relaunches the app.
                break;
            case "--launch-gui":
                if (exports.mainWindow) {
                    exports.mainWindow.webContents.executeJavaScript("window.close();", true, function() {
                        createWindow(true);
                    });
                } else {
                    createWindow(true);
                }
                break;
            case "--launch-gui-os-win":
                if (exports.mainWindow) {
                    exports.mainWindow.webContents.executeJavaScript("window.close();", true, function() {
                        createWindow(true, true);
                    });
                } else {
                    createWindow(true, true);
                }
                break;
            case "--quit-gui":
                if (exports.mainWindow) exports.mainWindow.webContents.executeJavaScript("window.close();", true);
                if (tray.tray) tray.tray.destroy();
                break;
            default:
                if (start) {
                    exports.servers[cmd].start();
                    if (tray.tray) tray.removeStopServer(cmd);
                    start = false;
                }
                if (stop) {
                    exports.servers[cmd].stop();
                    if (tray.tray) tray.removeStartServer(cmd);
                    stop = false;
                }
                if (view) {
                    if (exports.mainWindow === null) {
                        exports.createWindow(true);
                    }
                    viewPage = "serverInfos#" + cmd
                }
                break;
        }
    });
});
if (shouldQuit) {
    app.quit();
}


// Making folders
exports.appFolder = path.join(os.homedir(), ".pocketmine");
exports.serverFolder = path.join(exports.appFolder, "servers");
exports.phpFolder = path.join(exports.appFolder, "php");
exports.pharsFolder = path.join(os.homedir(), ".cache", "PSM");
try {
    fs.accessSync(exports.appFolder);
} catch (e) { // No .pocketmine folder
    fs.mkdirSync(exports.appFolder);
    fs.mkdirSync(exports.serverFolder);
}
try {
    fs.accessSync(path.join(os.homedir(), ".cache"));
} catch (e) {
    fs.mkdirSync(path.join(os.homedir(), ".cache"));
}
try {
    fs.accessSync(exports.pharsFolder);
} catch (e) {
    fs.mkdirSync(exports.pharsFolder);
}

var this2 = this;

// Creates the window
function createWindow(forceLaunch = false, forceFrame = false) {
    if (process.argv.indexOf("--no-gui") == -1 || forceLaunch) {
        // Create the browser window.
        var framed = process.argv.indexOf("--use-os-windows") !== -1 || forceFrame;
        exports.mainWindow = new BrowserWindow({ width: 800, height: 600, title: "PocketMine Server Manager", frame: framed, icon: path.join(__dirname, "assets", "icons", "icon.png") });
        exports.mainWindow.webContents.app = this2;

        // and load the index.html of the app.
        exports.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'assets', !defined ? 'loading.html' : 'index.html'),
            protocol: 'file:',
            slashes: true
        }))

        exports.mainWindow.on('closed', function() {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            exports.mainWindow = null
        });


        // When the app is launched, just download the app.
        exports.mainWindow.webContents.on("did-finish-load", define)
        require('./main/menus');
        if (!tray.tray) tray.addTray(php);
    } else {
        delete process.argv[process.argv.indexOf("--no-gui")]; // Remove the arg, we don't need it anymore.
        setTimeout(function() { define() }, 1000); // Defining the rest of variables b4 calling this.
    }
}
exports.createWindow = createWindow;


app.on('ready', function() { createWindow() });

app.on('window-all-closed', function() {
    // Not killing process unitl used by force killing. Let servers running.
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (exports.mainWindow === null) {
        createWindow();
    }
    if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
    exports.mainWindow.focus();
});

// Listeners for app
/**
 * Gets an app variable (sync)
 * 
 * @param {*} event
 * @param {String} varN
 */
ipcMain.on('getVar', function(event, varN) {
    if (exports[varN]) {
        event.returnValue = exports[varN];
    } else if (this2[varN]) {
        event.returnValue = this2[varN];
    } else {
        event.returnValue = null;
    }
});
/**
 * Sends a server by it's name (async)
 * 
 * @param {*} event
 * @param {String} serverName
 */
ipcMain.on('getServer', function(event, serverName) {
    if (!exports.servers[serverName]) {
        if (fs.existsSync(path.join(exports.serverFolder, serverName))) {
            exports.servers[serverName] = new server.Server(serverName, php, this2);
        }
    } else {
        if (!fs.existsSync(path.join(exports.serverFolder, serverName))) { // Server has been deleted
            exports.servers[serverName].settings = {};
            delete exports.servers[serverName];
        }
    }
    if (exports.servers[serverName]) {
        var serv = new server.ServerExportable();
        serv.import(exports.servers[serverName]);
        event.sender.send("sendServer", serv);
    }
});
/**
 * Sets back the server (async)
 * 
 * @param {*} event
 * @param {{}} serverR
 */
ipcMain.on("setServer", function(event, serverR) {
    var export2 = function(obj, Server) {
        if (obj.isStarted &&
            !Server.isStarted) {
            Server.start();
            tray.removeStopServer(Server.name);
        }
        if (Server.settings !== obj.settings) {
            Server.settings = obj.settings;
            Server.save();
        }
        obj.commands.forEach(function(cmd) {
            Server.inputCommand(cmd);
        }, obj);
    }
    export2(serverR, exports.servers[serverR.name]);
});
/**
 * Saves server (sync)
 * 
 * @param {*} event
 * @return {Boolean}
 */
ipcMain.on("save", function(event) {
    event.returnValue = true;
    Object.keys(exports.servers).forEach(function(name) {
        var serv = exports.servers[name];
        if (!serv.save()) event.returnValue = false;
    })
});

/**
 * Closes the app (sync)
 * 
 * @param {*} event
 * @return {Boolean}
 */
ipcMain.on("close", function(event) {
    exports.mainWindow.webContents.executeJavaScript("window.close();", true, function() {});
    tray.tray.destroy();
    app.exit();
    process.exit();
    event.returnValue = "";
});

/**
 * Adds a server
 * 
 * @param {*} event
 * @return {Boolean}
 */
ipcMain.on("addServer", function(event, name) {
    if (exports.mainWindow) {
        tray.trayMenu.items[2].submenu.append(new MenuItem({
            label: name,
            type: "normal",
            id: `view${name}`,
            click: function() {
                if (!exports.mainWindow) createWindow();
                exports.mainWindow.webContents.executeJavaScript(`document.getElementById('frame').contentWindow.location = 'serverInfos.html#${name}'`, function() {
                    if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
                    exports.mainWindow.focus();
                });
            }
        }));
        tray.trayMenu.items[0].submenu.append(new MenuItem({
            label: name,
            type: "normal",
            id: `stopped${name}`,
            click: function() {
                php.app.servers[name].start();
                tray.removeStopServer(name);
            }
        }));
    }
    if (exports.mainWindow) tray.tray.setContextMenu(tray.trayMenu);
});

// Defines everything when window loads
var defined = false;

function define() {
    if (defined) {
        if (viewPage) {
            exports.mainWindow.webContents.executeJavaScript(`document.getElementById('frame').contentWindow.location = '${viewPage}'`, function() {
                if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
                exports.mainWindow.focus();
            });
            viewPage = undefined;
        }
        if (process.argv.indexOf("--use-os-windows") !== -1)
            exports.mainWindow.webContents.executeJavaScript(`
        document.querySelectorAll(".windowButton").forEach(function(elem){
            elem.remove();
        });`);
    }
    if (!defined) {
        php.setApp(this2);
        require("./main/updater.js").checkForUpdates(php, function() {
            // Defining php
            php.snackbar("Looking for php...");
            php.define(function() {
                // Checking for servers;
                php.snackbar("Looking for servers...");
                var servers = fs.readdirSync(exports.serverFolder);
                servers.forEach(function(folder) {
                    exports.servers[folder] = new server.Server(folder, php, exports);
                    if (exports.mainWindow) {
                        tray.trayMenu.items[0].submenu.append(new MenuItem({
                            label: folder,
                            type: "normal",
                            id: `stopped${folder}`,
                            click: function() {
                                exports.servers[folder].start();
                                tray.removeStopServer(folder);
                            }
                        }));
                        tray.trayMenu.items[2].submenu.append(new MenuItem({
                            label: folder,
                            type: "normal",
                            id: `view${folder}`,
                            click: function() {
                                if (!exports.mainWindow) createWindow();
                                exports.mainWindow.webContents.executeJavaScript(`document.getElementById('frame').contentWindow.location = 'serverInfos.html#${folder}'`, function() {
                                    if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
                                    exports.mainWindow.focus();
                                });
                            }
                        }));
                    }
                }, this);
                if (exports.mainWindow) tray.tray.setContextMenu(tray.trayMenu);
                // Setting app clock (1 second based)
                setInterval(function() {
                    // IPC Refreshing
                    ipcMain.main = this;
                    // Servers refreshing
                    var name;
                    Object.keys(exports.servers).forEach(function(name) {
                        var server = exports.servers[name];
                        if (server.changed) {
                            server.changed = false;
                            var serv = new server.ServerExportable();
                            serv.import(server);
                            event.sender.send("sendServer", serv);
                        }
                    })
                    Object.keys(exports.servers).forEach(function(key) {
                        var serv = exports.servers[key];
                        serv.refresh();
                    });
                }, 2000);
                php.snackbar("Done !");
                // Redirects user to the main page
                if (exports.mainWindow) exports.mainWindow.webContents.loadURL(url.format({
                    pathname: path.join(__dirname, 'assets', 'index.html'),
                    protocol: 'file:',
                    slashes: true
                }));
            });
        });
        defined = true;
    }
}