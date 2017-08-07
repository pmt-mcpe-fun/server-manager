/**
 * main.js - NodeJS script that runs the app.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// Outputing message of usage if no gui is specified
if (process.argv.indexOf("--no-gui") !== -1) console.log(`You are running PocketMine Server Manager in "no gui mode".
This means no window will be showed and everything will be done using commands.
Launch a server: ${process.argv[0]} --start <server name>
Stop a server: ${process.argv[0]} --stop <server name>
Launch a GUI with server infos: ${process.argv[0]} --view <server name>
Launch the GUI with server infos: ${process.argv[0]} --launch-gui`);

// require('daemon-plus')(); // creates new child process, exists the parent

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
    commandLine.forEach(function (cmd) {
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
            default:
                if (start) {
                    exports.servers[cmd].start();
                    tray.removeStopServer(cmd);
                    start = false;
                }
                if (stop) {
                    exports.servers[cmd].stop();
                    tray.removeStartServer(cmd);
                    stop = false;
                }
                if (view) {
                    if (exports.mainWindow === null) {
                        createWindow(true);
                    }
                    viewPage = "serverInfos#" + cmd
                }
                break;
        }
    });
    if (process.argv.length < 3) {
        if (exports.mainWindow === null) {
            createWindow(true);
        }
        if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
        exports.mainWindow.focus();
    }
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

// Checking for updates
var updateAvailable = false;
var newData;

/**
 * Checks for updates
 * 
 * @param {Function} cb
 */

function checkForUpdates(cb) {
    php.snackbar("Looking for updates...");
    http.get("http://psm.mcpe.fun/versions.json",
        function (response) {
            var completeResponse = '';
            response.on('data', function (chunk) {
                completeResponse += chunk;
            });
            response.on('end', function () { // Here we have the final result
                try {
                    var data = JSON.parse(fs.readFileSync(path.join(exports.appFolder, "versions.json")));
                } catch (e) {
                    var data = {};
                }
                try {
                    newData = JSON.parse(completeResponse);
                } catch (e) {
                    newData = {};
                }
                if (!fs.existsSync(path.join(exports.appFolder, "versions.json")) || (Object.keys(newData) !== Object.keys(data) && Object.keys(newData).length > 0)) { // New version out for PMMP soft & no timeout
                    fs.writeFileSync(path.join(exports.appFolder, "versions.json"), completeResponse);
                }
                if (newData.version !== data.version) { // New app version is out
                    updateAvailable = true;
                } else {
                    php.snackbar("No updates found...");
                }
                cb();
            });
        }
    ).on('error', function (e) { // An error occured. Do nothing exepct cb
        console.log(`Got error: ${e.message}`);
        cb();
    });
}

// Creates the window
function createWindow(forceLaunch = false) {
    if (process.argv.indexOf("--no-gui") == -1 || forceLaunch) {
        // Create the browser window.
        var framed = process.argv.indexOf("--use-os-windows") !== -1;
        exports.mainWindow = new BrowserWindow({ width: 800, height: 600, title: "PocketMine Server Manager", frame: framed, icon: path.join(__dirname, "assets", "icons", "icon.png") });
        exports.mainWindow.webContents.app = this2;

        // and load the index.html of the app.
        exports.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'assets', !defined ? 'loading.html' : 'index.html'),
            protocol: 'file:',
            slashes: true
        }))

        exports.mainWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            exports.mainWindow = null
        });


        // When the app is launched, just download the app.
        exports.mainWindow.webContents.on("did-finish-load", define)
        require('./main/menus');
    } else {
        delete process.argv[process.argv.indexOf("--no-gui")]; // Remove the arg, we don't need it anymore.
        setTimeout(function () { define() }, 1000); // Defining the rest of variables b4 calling this.
    }
}


app.on('ready', function () { createWindow() });

app.on('window-all-closed', function () {
    // Not killing process unitl used by force killing. Let servers running.
});

app.on('activate', function () {
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
ipcMain.on('getVar', function (event, varN) {
    if (exports[varN]) {
        event.returnValue = exports[varN];
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
ipcMain.on('getServer', function (event, serverName) {
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
ipcMain.on("setServer", function (event, serverR) {
    var export2 = function (obj, Server) {
        if (obj.isStarted &&
            !Server.isStarted) {
            Server.start();
            tray.removeStopServer(Server.name);
        }
        if (Server.settings !== obj.settings) {
            Server.settings = obj.settings;
            Server.save();
        }
        obj.commands.forEach(function (cmd) {
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
ipcMain.on("save", function (event) {
    event.returnValue = true;
    Object.keys(exports.servers).forEach(function (name) {
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
ipcMain.on("close", function (event) {
    exports.mainWindow.webContents.executeJavaScript("window.close();", true, function () { });
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
ipcMain.on("addServer", function (event, name) {
    if (exports.mainWindow) {
        tray.trayMenu.items[2].submenu.append(new MenuItem({
            label: name,
            type: "normal",
            id: `view${name}`,
            click: function () {
                if (!exports.mainWindow) createWindow();
                exports.mainWindow.webContents.executeJavaScript(`document.getElementById('frame').contentWindow.location = 'serverInfos.html#${name}'`, function () {
                    if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
                    exports.mainWindow.focus();
                });
            }
        }));
        tray.trayMenu.items[0].submenu.push(new MenuItem({
            label: name,
            type: "normal",
            id: `stopped${name}`,
            click: function () {
                php.app.servers[name].start();
                removeStopServer(name);
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
            exports.mainWindow.webContents.executeJavaScript(`document.getElementById('frame').contentWindow.location = '${viewPage}'`, function () {
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
        checkForUpdates(function () {
            if (updateAvailable) {
                if (exports.mainWindow) exports.mainWindow.webContents.executeJavaScript(`var snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('#formError'));
                snackbar.show({
    	            message: 'A new version is out (` + newData.version + `).Do you want to download it ? ',
                    actionText: "Download",
                    actionHandler: function() {
		        		require('electron').shell.openExternal('https://psm.mcpe.fun/download');
		        	},
                    multiline: true,
                    actionOnBottom: true,
                    timeout: 1000000000
                });`);
            }
            // Defining php
            php.snackbar("Looking for php...");
            php.define(function () {
                // Checking for servers;
                php.snackbar("Looking for servers...");
                var servers = fs.readdirSync(exports.serverFolder);
                if (exports.mainWindow) tray.addTray(php);
                servers.forEach(function (folder) {
                    exports.servers[folder] = new server.Server(folder, php, exports);
                    if (exports.mainWindow) {
                        tray.trayMenu.items[0].submenu.append(new MenuItem({
                            label: folder,
                            type: "normal",
                            id: `stopped${folder}`,
                            click: function () {
                                exports.servers[folder].start();
                                tray.removeStopServer(folder);
                            }
                        }));
                        tray.trayMenu.items[2].submenu.append(new MenuItem({
                            label: folder,
                            type: "normal",
                            id: `view${folder}`,
                            click: function () {
                                if (!exports.mainWindow) createWindow();
                                exports.mainWindow.webContents.executeJavaScript(`document.getElementById('frame').contentWindow.location = 'serverInfos.html#${folder}'`, function () {
                                    if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
                                    exports.mainWindow.focus();
                                });
                            }
                        }));
                    }
                }, this);
                if (exports.mainWindow) tray.tray.setContextMenu(tray.trayMenu);
                // Setting app clock (1 second based)
                setInterval(function () {
                    // IPC Refreshing
                    ipcMain.main = this;
                    // Servers refreshing
                    var name;
                    Object.keys(exports.servers).forEach(function (name) {
                        var server = exports.servers[name];
                        if (server.changed) {
                            server.changed = false;
                            var serv = new server.ServerExportable();
                            serv.import(server);
                            event.sender.send("sendServer", serv);
                        }
                    })
                    Object.keys(exports.servers).forEach(function (key) {
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