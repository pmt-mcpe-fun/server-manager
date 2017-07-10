const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// require('daemon-plus')(); // creates new child process, exists the parent

const path = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const ps = require('current-processes');
const ipcMain = electron.ipcMain;
const php = require("./server/php");
const server = require("./server/server");
exports.php = php;

// Making folder
exports.appFolder = path.join(os.homedir(), ".pocketmine");
exports.serverFolder = path.join(exports.appFolder, "servers");
exports.phpFolder = path.join(exports.appFolder, "php");
try {
    fs.accessSync(exports.appFolder);
} catch (e) { // No .pocketmine folder
    fs.mkdirSync(exports.appFolder);
    fs.mkdirSync(exports.serverFolder);
}

// Checking for already running processes and kill 'em
var stopped = false;
ps.get(function(err, processes) {
    var c = 0;
    processes.forEach(function(elem, key) {
        if (elem.name == "pocketmine-serv" || elem.name == "electron") {
            console.log(elem.pid);
            c++; // Snif
        }
    });
    if (c > 3) {
        fs.writeFileSync(path.join(os.homedir(), ".pocketmine", "rerun"), process.pid);
        exports.mainWindow.webContents.executeJavaScript("window.close();");
        stopped = true;
        app.exit(0);
        process.exit(0);
    }
});

var this2 = this;

function createWindow() {
    console.log("Creating window");

    if (stopped) return;
    // Create the browser window.
    exports.mainWindow = new BrowserWindow({ width: 800, height: 600 });
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
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // Not killing process unitl used by force killing (soon tm). Let servers running.
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
// Gets a main porcess variable
ipcMain.on('getVar', function(event, varN) {
    if (exports[varN]) {
        event.returnValue = exports[varN];
    } else {
        event.returnValue = null;
    }
});
// Returns the servers
ipcMain.on('getServer', function(event, serverName) {
    if (!exports.servers[serverName]) {
        if (fs.existsSync(path.join(exports.serverFolder, serverName))) {
            exports.servers[serverName] = new server.Server(serverName, php);
        }
    } else {
        if (!fs.existsSync(path.join(exports.serverFolder, serverName))) { // Server has been deleted
            exports.servers[serverName] = undefined;
        }
    }
    if (exports.servers[serverName]) {
        var serv = new server.ServerExportable();
        serv.import(exports.servers[serverName]);
        event.sender.send("sendServer", serv);
    }
});

// Defines everything when server loads
function define() {
    console.log('Loaded !');
    // Defining php
    php.setApp(this.app);
    php.define();
    // Defining servers
    exports.servers = {};
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
    }, 1000);
}