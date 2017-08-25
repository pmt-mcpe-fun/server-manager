/**
 * IPC.js - All interactions between renderer process and main
 */
module.exports = function(app) {

    const ipcMain = require("electron").ipcMain;
    const MenuItem = require("electron").MenuItem;
    const fs = require('fs');
    const path = require('path');


    /**
     * Gets an app variable (sync)
     * 
     * @param {*} event
     * @param {String} varN
     */
    ipcMain.on('getVar', function(event, varN) {
        if (app[varN]) {
            event.returnValue = app[varN];
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
        if (!app.servers[serverName]) {
            if (fs.existsSync(path.join(app.serverFolder, serverName))) {
                app.servers[serverName] = new app.server.Server(serverName, app.php, app);
            }
        } else {
            if (!fs.existsSync(path.join(app.serverFolder, serverName))) { // Server has been deleted
                app.servers[serverName].settings = {};
                delete app.servers[serverName];
            }
        }
        if (app.servers[serverName]) {
            var serv = new app.server.ServerExportable();
            serv.import(app.servers[serverName]);
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
                app.tray.removeStopServer(Server.name);
            }
            if (Server.settings !== obj.settings) {
                Server.settings = obj.settings;
                Server.save();
            }
            obj.commands.forEach(function(cmd) {
                Server.inputCommand(cmd);
            }, obj);
        }
        export2(serverR, app.servers[serverR.name]);
    });

    /**
     * Clears log (async)
     * 
     * @param {*} event
     * @param {String} serverName
     * @return {Boolean}
     */
    ipcMain.on("clearLog", function(event, serverName) {
        app.servers[serverName].log = "";
        event.sender.send("clearLogSucess");
    });


    /**
     * Saves server (sync)
     * 
     * @param {*} event
     * @return {Boolean}
     */
    ipcMain.on("save", function(event) {
        event.returnValue = true;
        Object.keys(app.servers).forEach(function(name) {
            var serv = app.servers[name];
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
        app.mainWindow.webContents.executeJavaScript("window.close();", true, function() {});
        app.tray.tray.destroy();
        require("electron").app.exit();
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
        if (app.tray.trayMenu) {
            app.tray.trayMenu.items[2].submenu.append(new MenuItem({
                label: name,
                type: "normal",
                id: `view${name}`,
                click: function() {
                    if (!app.mainWindow) createWindow();
                    app.mainWindow.webContents.executeJavaScript(`document.getElementById('frame').contentWindow.location = 'serverInfos.html#${name}'`, function() {
                        if (app.mainWindow.isMinimized()) app.mainWindow.restore();
                        app.mainWindow.focus();
                    });
                }
            }));
            app.tray.trayMenu.items[0].submenu.append(new MenuItem({
                label: name,
                type: "normal",
                id: `stopped${name}`,
                click: function() {
                    app.servers[name].start();
                    app.tray.removeStopServer(name);
                }
            }));
        }
        if (app.tray.tray) app.tray.tray.setContextMenu(app.tray.trayMenu);
    });
}