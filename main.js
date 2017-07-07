const electron = require('electron');
// Module to control application life.
const app = electron.app

require('daemon-plus')(); // creates new child process, exists the parent

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const ps = require('current-processes');

// Checking for already running processes and kill 'em
ps.get(function(err, processes) {
    var c = 0;
    processes.forEach(function(elem, key) {
        if (elem.name == "pocketmine-server-manager" || elem.name == "electron") {
            console.log(elem);
            c++; // Snif
        }
    });
    console.log(c)
    if (c > 3 /*Old Process*/ ) {
        fs.writeFileSync(path.join(os.homedir(), ".pocketmine", "rerun"));
        process.exit(0);
    }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600 })

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
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // Not killing process unitl used by force killing (soon tm). Let servers running.
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    } else {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.servers = {};

setInterval(function() {
    if (fs.existsSync(path.join(os.homedir(), ".pocketmine", "rerun"))) {
        if (mainWindow === null) {
            createWindow();
        } else {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
        if (fs.existsSync(path.join(os.homedir(), ".pocketmine", "rerun"))) fs.unlink(path.join(os.homedir(), ".pocketmine", "rerun"));
    }
}, 100)