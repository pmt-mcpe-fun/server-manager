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

/**
 * Adds the app tray
 */
function addTray(php) {
    // Adding tray icon
    php.snackbar("Adding tray...");
    exports.tray = new Tray(path.join(__dirname, "..", "assets", "icons", os.platform == "win32" ? "icon.png" : "icon.png")); // TODO: Create black and white icon
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
                php.app.mainWindow.webContents.executeJavaScript("window.close();", true, function() {});
                php.app.app.exit();
                // process.exit();
            }
        }
    ]);
    exports.tray.setToolTip('PocketMine Server Manager');
    exports.tray.setContextMenu(exports.trayMenu);
}
exports.addTray = addTray;


/**
 * Removes a server from started list on tray
 * 
 * @param {String} name 
 */
function removeStartServer(name) {
    var startedItems = exports.trayMenu.items[0].submenu.items.clone();
    var stopedItems = exports.trayMenu.items[1].submenu.items.clone();
    var viewingItems = exports.trayMenu.items[2].submenu.items.clone(); // All the servers.
    delete startedItems[`started${name}`];
    stopedItems[`stopped${name}`] = new MenuItem({
        label: name,
        type: "normal",
        id: `stopped${name}`,
        click: function() {
            exports.servers[name].start();
            removeStopServer(name);
        }
    });
    exports.tray.destroy();
    addTray();
    startedItems.forEach(function(elem) {
        exports.trayMenu.items[0].append(elem);
    });
    stopedItems.forEach(function(elem) {
        exports.trayMenu.items[1].append(elem);
    });
    viewingItems.forEach(function(elem) {
        exports.trayMenu.items[2].append(elem);
    });
    exports.tray.setContextMenu(exports.trayMenu);
}
exports.removeStartServer = removeStartServer;

/**
 * Removes a server from stopped list on tray
 * 
 * @param {String} name 
 */
function removeStopServer(name) {
    var startedItems = exports.trayMenu.items[0].submenu.items.clone();
    var stoppedItems = exports.trayMenu.items[1].submenu.items.clone();
    var viewingItems = exports.trayMenu.items[2].submenu.items.clone(); // All the servers.
    delete stoppedItems[`stopped${name}`];
    startedItems[`started${name}`] = new MenuItem({
        label: name,
        type: "normal",
        id: `started${name}`,
        click: function() {
            exports.servers[name].start();
            removeStartServer(name);
        }
    });
    exports.tray.destroy();
    addTray();
    startedItems.forEach(function(elem) {
        exports.trayMenu.items[0].append(elem);
    });
    stopedItems.forEach(function(elem) {
        exports.trayMenu.items[1].append(elem);
    });
    viewingItems.forEach(function(elem) {
        exports.trayMenu.items[2].append(elem);
    });
    exports.tray.setContextMenu(exports.trayMenu);
}
exports.removeStopServer = removeStopServer;

/**
 * When a server gets deleted removing this from tray
 */
ipcMain.on("deleteServer", function(event, serverName) {
    var startedItems = exports.trayMenu.items[0].submenu.items.clone();
    var stoppedItems = exports.trayMenu.items[1].submenu.items.clone();
    var viewingItems = exports.trayMenu.items[2].submenu.items.clone(); // All the servers.
    delete startedItems[`stopped${name}`];
    delete stoppedItems[`stopped${name}`];
    delete viewingItems[`stopped${name}`];
    exports.tray.destroy();
    addTray();
    startedItems.forEach(function(elem) {
        exports.trayMenu.items[0].append(elem);
    });
    stopedItems.forEach(function(elem) {
        exports.trayMenu.items[1].append(elem);
    });
    viewingItems.forEach(function(elem) {
        exports.trayMenu.items[2].append(elem);
    });
    exports.tray.setContextMenu(exports.trayMenu);
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