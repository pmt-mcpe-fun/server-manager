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

// require('daemon-plus')(); // creates new child process, exists the parent

const path = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const http = require('http');
const ps = require('current-processes');
const ipcMain = electron.ipcMain;
const php = require("./server/php");
const server = require("./server/server");
exports.php = php;
exports.servers = {};

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
// Checking for already running processes and kill 'em
var stopped;
var startApp = function() {
    ps.get(function(err, processes) {
        var c = 0;
        processes.forEach(function(elem, key) {
            if (elem.name == "pocketmine-serv" || elem.name == "electron") {
                c++; // Snif
            }
        });
        if (c > 5) {
            fs.writeFileSync(path.join(os.homedir(), ".pocketmine", "rerun"), process.pid);
            app.exit(0);
            process.exit(0);
        } else {
            createWindow();
        }
    });
}

var this2 = this;

// Checking for updates
var updateAvailable = false;
var newData;
http.get("http://psm.mcpe.fun/versions.json",
    function(response) {
        var completeResponse = '';
        response.on('data', function(chunk) {
            completeResponse += chunk;
            console.log("Current res: " + completeResponse);
        });
        response.on('end', function() { // Here we have the final result
            console.log("Finished !" + completeResponse);
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
                if (exports.mainWindow instanceof BrowserWindow) {
                    exports.mainWindow.webContents.executeJavaScript(`var snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('#formError'));
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
                } else {
                    updateAvailable = true;
                }
            }
        });
    }
).on('error', function(e) { // An error occured. Do nothing
    console.log(`Got error: ${e.message}`);
});

// Creates the window
function createWindow() {
    console.log("Creating window");

    if (stopped) return;
    // Create the browser window.
    exports.mainWindow = new BrowserWindow({ width: 800, height: 600, title: "PocketMine Server Manager" });
    exports.mainWindow.webContents.app = this2;

    // and load the index.html of the app.
    exports.mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'assets', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // exports.mainWindow.webContents.openDevTools()
    // Emitted when the window is closed.
    exports.mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        exports.mainWindow = null
    });


    // When the app is launched, just download the app.
    exports.mainWindow.webContents.on("dom-ready", define)
    require('./assets/menus');
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', startApp);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    console.log(exports.servers);
    // Not killing process unitl used by force killing. Let servers running.
});


app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (exports.mainWindow === null) {
        createWindow();
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (exports.mainWindow === null) {
        createWindow();
    } else if (exports.mainWindow !== null) {
        if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
        exports.mainWindow.focus();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

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
            exports.servers[serverName] = new server.Server(serverName, php);
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
        }
        Server.log = obj.log;
        if (Server.settings !== obj.settings) {
            console.log(obj.settings);
            Server.settings = obj.settings;
            Server.save();
        }
        console.log(obj.commands);
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
    Object.keys(exports.servers).forEach(function(name) {
        var serv = exports.servers[name];
        if (!serv.save()) event.returnValue = false;
    })
});

// Defines everything when window loads
function define() {
    if (updateAvailable) {
        exports.mainWindow.webContents.executeJavaScript(`var snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('#formError'));
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
    console.log('Loaded !');
    // Defining php
    php.setApp(this.app);
    php.define();
    // Checking for servers;
    var servers = fs.readdirSync(exports.serverFolder);
    servers.forEach(function(folder) {
        exports.servers[folder] = new server.Server(folder, php);
    }, this);

    // Setting app clock (1 second based)
    setInterval(function() {
        // Listening to relaunch
        // if (stopped) process.kill(process.pid, "SIGKILL");
        if (fs.existsSync(path.join(os.homedir(), ".pocketmine", "rerun")) && fs.readFileSync(path.join(os.homedir(), ".pocketmine", "rerun")) !== process.pid) {
            if (fs.existsSync(path.join(os.homedir(), ".pocketmine", "rerun"))) fs.unlink(path.join(os.homedir(), ".pocketmine", "rerun"));
            if (exports.mainWindow === null) {
                createWindow();
            } else if (exports.mainWindow !== null) {
                if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
                exports.mainWindow.focus();
            }
        }
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
        })
    }, 2000);
    exports.mainWindow.show();
}