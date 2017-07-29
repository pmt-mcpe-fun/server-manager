/**
 * server.js - Server instance
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const { spawn } = require('child_process');
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require("os");
const properties = require('./lib/properties');

/**
 * Server class
 * 
 * @param {String} name
 * @param {{}} php
 */
exports.Server = function(name, php) {

    this.name = name;
    this.folder = path.join(php.app.serverFolder, name);
    this.isStarted = false;
    this.players = {};
    this.log = "";
    this.php = php;
    this.changed = false;
    this.settings = properties.parseProperties(fs.readFileSync(path.join(this.folder, "server.properties")).toString());
    this.windows = [];
    this.players = {};
    this.levels = {};
    this.plugins = {};

    /**
     * Starts the server
     */
    this.start = function() {
        if (this.isStarted) return; // DO NOT CREATE IT TWO TIMES !
        this.log += "[PMS] Starting server " + this.name + "..." + os.EOL;
        this.proc = spawn(php.phpExecutable, [path.join(this.folder, "PocketMine-MP.phar"), "enable-ansi"], { cwd: this.folder });
        this.isStarted = true;
        var this2 = this;

        this.proc.stdout.on('data', (dataFull) => {
            var dataLines = dataFull.toString().split(os.EOL);
            dataLines.forEach(function(dataStr) {
                try {
                    data = JSON.parse(dataStr);
                    if (Object.keys(data).length < 1) {
                        this2.log += JSON.stringify(data);
                        return;
                    }
                    switch (Object.keys(data)[0]) { // API
                        case "psmplayers":
                            this2.players = data["psmplayers"];
                            break;
                        case "psmlevels":
                            this2.levels = data["levels"];
                            break;
                        case "psmplugins":
                            this2.plugins = data["psmplugins"];
                            break;
                        case "psmActions":
                            this2.actions = data["psmActions"];
                            break;
                        case "psmnotification":
                            break;
                        case "psmwindow":
                            var options = data["psmwindow"];
                            var winOptions = {};
                            winOptions.width = options.width ? option.width : 800;
                            winOptions.height = options.height ? options.height : 600;
                            winOptions.title = options.title ? options.title : "PocketMine Server Manager";
                            if (php.app && php.app.mainWindow) winOptions.parent = php.app.mainWindow;
                            this.windows.push(new BrowserWindow(winOptions)); // Keep reference to the window.
                            var winId = this.windows.length - 1;
                            this.windows[winId].id = winId;
                            this.windows[winId].server = this;
                            this.windows[winId].on('closed', function() {
                                delete this.server.windows[this.windId];
                            });
                            break;
                        default:
                            this2.log += JSON.stringify(data);
                            break;
                    }
                } catch (e) {
                    // If couldn't succed, that means that this was not JSON so not meant to be used by PSM.
                    if (dataStr.length !== 0) this2.log += dataStr + os.EOL;
                }
            });
        });

        // this.proc.stderr.on('data', (data) => {
        //     this.log += data;
        // });

        this.proc.on('exit', (code) => {
            try {
                this.log += "[PMS] Server stopped.";
                this.isStarted = false;
                fs.writeFileSync(path.join(this.folder, "server.properties"), properties.emitProperties(this.settings));
            } catch (e) {}
        });
    }

    /**
     * Inputs a command
     * 
     * @param {String} Command
     */
    this.inputCommand = function(Command) {
        try {
            this.proc.stdin.write(Command + os.EOL);
            this.log += "> " + Command + os.EOL;
        } catch (e) { // Process has ended
            this.isStarted = false;
        }
    };

    /**
     * Stops the server
     */
    this.stop = function() {
        this.inputCommand("stop");
    }

    /**
     * Saves the server properties
     * 
     * @return {Boolean}
     */
    this.save = function() {
        if (this.isStarted) {
            return false;
        }
        fs.writeFileSync(path.join(this.folder, "server.properties"), properties.emitProperties(this.settings));
        return true;
    }


    this.refresh = function() {
        try {
            if (this.isStarted) {
                this.proc.stdin.write("getplayersforpsmsolongcommandthatimsurewontbefound\n"); // If they find this command without going into the code Idk how they did.
                this.proc.stdin.write("getloadedlevelsforpsmthatsasuperlongcommandthatibetyoucannotenterwithoutcopypaste\n"); // Haha !
                this.proc.stdin.write("getplugins4psmthatwillbejavascriptobjectencodedjsonbutnomanagement\n"); // Always JSON
                this.proc.stdin.write("getactions4psmplzdontusethiscommandiknowitshardtoresistbutdontwhatdidijustsaidokwateveryoulostafewsecondsofyourlife\n"); // If they use this command, they're stupid !
            }
        } catch (e) {
            // Socket closed.
        }
    }
}


/**
 * Creates a version of the server exportable to the process
 */
exports.ServerExportable = function() {

    /**
     * Import server instance 
     * 
     * @param {Server} server
     */
    this.import = function(Server) {
        this.name = Server.name;
        this.isStarted = Server.isStarted;
        this.players = Server.players;
        this.log = Server.log;
        this.commands = [];
        this.players = Server.players;
        this.levels = Server.levels;
        this.plugins = Server.plugins;
        this.windows = Server.windows;
        this.actions = Server.actions;
        this.settings = Server.settings
    }
}