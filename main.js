const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

require('daemon-plus')(); // creates new child process, exists the parent

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
        mainWindow.webContents.executeJavaScript("window.close();");
        stopped = true;
        app.exit(0);
        process.exit(0);
    }
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
// process.exit(0);

function createWindow() {
    console.log("Creating window");

    if (stopped) return;
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600 });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'assets', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });


    // When the app is launched, just download the app.
    mainWindow.on("did-finish-load", function() {
        mainWindow.webContents.send('ping', this);
        php.setApp(this);
        php.define();

    })
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
    if (mainWindow === null) {
        createWindow();
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    } else if (mainWindow !== null) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
exports.servers = {};

// Listening to relaunch
setInterval(function() {
    // if (stopped) process.kill(process.pid, "SIGKILL");
    if (fs.existsSync(path.join(os.homedir(), ".pocketmine", "rerun")) && fs.readFileSync(path.join(os.homedir(), ".pocketmine", "rerun")) !== process.pid) {
        if (fs.existsSync(path.join(os.homedir(), ".pocketmine", "rerun"))) fs.unlink(path.join(os.homedir(), ".pocketmine", "rerun"));
        if (mainWindow === null) {
            createWindow();
        } else if (mainWindow !== null) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    }
}, 1000);



// Listeners for app

// Gets a main porcess variable
ipcMain.on('getVar', function(event, varN) {
    if (exports[varN]) {
        event.returnValue = exports[varN];
    } else {
        event.returnValue = null;
    }
});
// Returns the servers (async)
ipcMain.on('getServer', function(event, varN) {
    if (exports.servers[varN]) {
        var serv = new server.ServerExportable();
        serv.import(exports.servers[varN]);
        event.sender.send("sendServer", serv);
    } // Return nothing otherwise
});