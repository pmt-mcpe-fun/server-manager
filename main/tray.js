/**
 * tray.js - Everything about the app tray
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const electron = require('electron');
const os = require("os");
const path = require("path");
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const Tray = electron.Tray;
const ipcMain = electron.ipcMain;
const app = electron.app;

var php;
/**
 * Adds the app tray
 */
function addTray(phpFromApp) {
    if (!php) php = phpFromApp;
    // Adding tray icon
    exports.tray = new Tray(path.join(__dirname, "..", "assets", "icons", os.platform == "win32" ? "icon.png" : "icon.png")); // TODO: Create black and white icon
    if (os.platform() == "darwin") app.dock.setIcon(path.join(__dirname, "..", "assets", "icons", os.platform == "win32" ? "icon.png" : "icon.png"));
    exports.trayMenu = Menu.buildFromTemplate([
        { label: 'Start server', type: 'submenu', submenu: [] },
        { label: 'Stop server', type: 'submenu', submenu: [] },
        { label: 'View server', type: 'submenu', submenu: [] },
        { type: 'separator' },
        {
            label: 'Show window',
            click: function() {
                if (php.app.mainWindow === null) {
                    createWindow();
                } else if (php.app.mainWindow !== null) {
                    if (php.app.mainWindow.isMinimized()) php.app.mainWindow.restore();
                    php.app.mainWindow.focus();
                }
            }
        },
        {
            label: 'Exit PSM',
            type: 'normal',
            click: function() {
                if (php.app.mainWindow) php.app.mainWindow.webContents.executeJavaScript("window.close();", true, function() {});
                app.exit();
                process.exit();
            }
        }
    ]);
    exports.tray.setToolTip('PocketMine Server Manager');
    exports.tray.setContextMenu(exports.trayMenu);
    if (os.platform() == "darwin") app.dock.setMenu(exports.trayMenu); // MacOSX Dock
}
exports.addTray = addTray;


/**
 * Removes a server from started list on tray
 * 
 * @param {String} name 
 */
function removeStartServer(name) {
    var stoppedItems = exports.trayMenu.items[0].submenu.items.clone();
    var startedItems = exports.trayMenu.items[1].submenu.items.clone();
    var viewingItems = exports.trayMenu.items[2].submenu.items.clone(); // All the servers.
    startedItems.forEach(function(item, index) {
        if (item.label == name) {
            delete startedItems[index];
        }
    })
    stoppedItems.push(new MenuItem({
        label: name,
        type: "normal",
        id: `stopped${name}`,
        click: function() {
            php.app.servers[name].start();
            removeStopServer(name);
        }
    }));
    exports.tray.destroy();
    // setTimeout(function() {
    addTray(php);
    stoppedItems.forEach(function(elem) {
        exports.trayMenu.items[0].submenu.append(elem);
    });
    startedItems.forEach(function(elem) {
        exports.trayMenu.items[1].submenu.append(elem);
    });
    viewingItems.forEach(function(elem) {
        exports.trayMenu.items[2].submenu.append(elem);
    });
    exports.tray.setContextMenu(exports.trayMenu);
    // }, 100);
    exports.tray.setContextMenu(exports.trayMenu);
}
exports.removeStartServer = removeStartServer;

/**
 * Removes a server from stopped list on tray
 * 
 * @param {String} name 
 */
function removeStopServer(name) {
    var stoppedItems = exports.trayMenu.items[0].submenu.items.clone();
    var startedItems = exports.trayMenu.items[1].submenu.items.clone();
    var viewingItems = exports.trayMenu.items[2].submenu.items.clone(); // All the servers.
    stoppedItems.forEach(function(item, index) {
        if (item.label == name) {
            delete stoppedItems[index];
        }
    })
    startedItems.push(new MenuItem({
        label: name,
        type: "normal",
        id: `started${name}`,
        click: function() {
            php.app.servers[name].inputCommand("stop");
            removeStartServer(name);
        }
    }));
    exports.tray.destroy();
    // setTimeout(function() {
    addTray(php);
    stoppedItems.forEach(function(elem) {
        exports.trayMenu.items[0].submenu.append(elem);
    });
    startedItems.forEach(function(elem) {
        exports.trayMenu.items[1].submenu.append(elem);
    });
    viewingItems.forEach(function(elem) {
        exports.trayMenu.items[2].submenu.append(elem);
    });
    exports.tray.setContextMenu(exports.trayMenu);
    // }, 100);
}
exports.removeStopServer = removeStopServer;

/**
 * When a server gets deleted removing this from tray
 */
ipcMain.on("deleteServer", function(event, serverName) {
    var stoppedItems = exports.trayMenu.items[0].submenu.items.clone();
    var startedItems = exports.trayMenu.items[1].submenu.items.clone();
    var viewingItems = exports.trayMenu.items[2].submenu.items.clone(); // All the servers.
    startedItems.forEach(function(item, index) {
        if (item.label == name) {
            delete startedItems[index];
        }
    });
    stoppedItems.forEach(function(item, index) {
        if (item.label == name) {
            delete stoppedItems[index];
        }
    });
    viewingItems.forEach(function(item, index) {
        if (item.label == name) {
            delete viewingItems[index];
        }
    });
    exports.tray.destroy();
    // setTimeout(function() {
    addTray(php);
    stoppedItems.forEach(function(elem) {
        exports.trayMenu.items[0].submenu.append(elem);
    });
    startedItems.forEach(function(elem) {
        exports.trayMenu.items[1].submenu.append(elem);
    });
    viewingItems.forEach(function(elem) {
        exports.trayMenu.items[2].submenu.append(elem);
    });
    exports.tray.setContextMenu(exports.trayMenu);
    // }, 100);
})

// Adding prototypes
/**
 * Clones an array
 * 
 * return {Array}
 */
Array.prototype.clone = function() {
    var ret = [];
    var i = this.length;
    while (i--) ret[i] = this[i];
    return ret;
}