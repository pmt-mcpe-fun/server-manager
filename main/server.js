/**
 * server.js - Server instance
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const { spawn } = require('child_process');
const { BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require("os");
const notifier = require('node-notifier');
const properties = require('./lib/properties');

/**
 * Server class
 * 
 * @param {String} name
 * @param {{}} php
 * @param {{}} app
 */
exports.Server = function(name, php, app) {

    this.name = name;
    this.folder = path.join(app.serverFolder, name);
    this.isStarted = false;
    this.generators = {};
    this.players = {};
    this.log = "";
    this.php = php;
    this.changed = false;
    this.settings = properties.parseProperties(fs.readFileSync(path.join(this.folder, "server.properties")).toString());
    this.windows = [];
    this.players = {};
    this.levels = {};
    this.plugins = {};
    this.actions = {
        "playerActions": {},
        "levelActions": {},
        "pluginsActions": {},
        "pluginsSpecificActions": {},
    };

    /**
     * Starts the server
     */
    this.start = function() {
        if (this.isStarted) return; // DO NOT CREATE IT TWO TIMES !
        this.log += "[PMS] Starting server " + this.name + "..." + os.EOL;
        this.proc = spawn(php.phpExecutable, [path.join(this.folder, "PocketMine-MP.phar"), "--enable-ansi"], { cwd: this.folder });
        this.isStarted = true;
        var this2 = this;

        this.proc.stdout.on('data', (dataFull) => {
            var dataM = findJSON(dataFull.toString());
            var JSONs = dataM[1];
            if (dataM[0].length > 0) this2.log += dataM[0] + os.EOL;
            JSONs.forEach(function(data) {
                switch (Object.keys(data)[0]) { // API
                    case "psmplayers":
                        this2.players = data["psmplayers"];
                        break;
                    case "psmlevels":
                        this2.levels = data["psmlevels"];
                        break;
                    case "psmplugins":
                        this2.plugins = data["psmplugins"];
                        console.log(data);
                        break;
                    case "psmActions":
                        this2.actions = data["psmActions"];
                        break;
                    case "psmgenerators":
                        this2.generators = data["psmgenerators"];
                        break;
                    case "psmnotification":
                        data["psmnotification"].wait = true;
                        data["psmnotification"].sound = true;
                        notifier.notify(data["psmnotification"], function(err, response, metadata) {
                            if (!err) {
                                this2.proc.stdin.write(data["psmnotification"].callback.replace(/\%b/gim, data.activationValue) + os.EOL);
                            }
                        });
                        break;
                    case "psmwindow":
                        var options = data["psmwindow"];
                        var winOptions = {};
                        winOptions.width = options.width ? option.width : 800;
                        winOptions.height = options.height ? options.height : 600;
                        winOptions.title = options.title ? options.title : "PocketMine Server Manager";
                        if (app && app.mainWindow) winOptions.parent = app.mainWindow;
                        this2.windows.push(new BrowserWindow(winOptions)); // Keep reference to the window.
                        var winId = this2.windows.length - 1;
                        this2.windows[winId].id = winId;
                        this2.windows[winId].server = this2;
                        this2.windows[winId].on('closed', function() {
                            delete this2.windows[this2.windId];
                        });
                        break;
                    default:
                        this2.log += JSON.stringify(data);
                        break;
                }
            });
        });

        this.proc.on('exit', (code) => {
            try {
                this.log += "[PMS] Server stopped." + os.EOL;
                this.isStarted = false;
                php.app.tray.removeStartServer(this.name);
                fs.writeFileSync(path.join(this.folder, "server.properties"), properties.emitProperties(this.settings));
            } catch (e) {
                console.log(e);
            }
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
                this.proc.stdin.write("psmcoreactplugin getplayersforpsmsolongcommandthatimsurewontbefound" + os.EOL); // If they find this command without going into the code Idk how they did.
                this.proc.stdin.write("psmcoreactplugin getloadedlevelsforpsmthatsasuperlongcommandthatibetyoucannotenterwithoutcopypaste" + os.EOL); // Haha !
                this.proc.stdin.write("psmcoreactplugin getplugins4psmthatwillbejavascriptobjectencodedjsonbutnomanagement" + os.EOL); // Always JSON
                this.proc.stdin.write("psmcoreactplugin getactions4psmplzdontusethiscommandiknowitshardtoresistbutdontwhatdidijustsaidokwateveryoulostafewsecondsofyourlife" + os.EOL); // If they use this command, they're stupid !
                this.proc.stdin.write("psmcoreactplugin getlevelsgeneratorsfourpsmniceviewcheater" + os.EOL); // Nice job !
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
        this.generators = Server.generators;
        this.settings = Server.settings
    }
}

/**
 * Finds JSON in a text and outputs it.
 * 
 * @param {String} text 
 */

function findJSON(text) {
    var JSONs = [];
    var noJSON = "";
    /*text.split(os.EOL).forEach(function(line) {
        if (!parsingJSON) {
            if (line.substr(line.length - 1, 1) == "{") { // Starting JSON Object
                openedCurles += 1;
                parsingJSON = true;
                currentJSON += "{";
                startedBy = "{";
            } else if (line.substr(line.length - 1, 1) == "[") { // Starting JSON Array
                openedBrackets += 1;
                parsingJSON = true;
                currentJSON += "[";
                startedBy = "[";
            } else {
                noJSON += line + os.EOL;
            }
        }
        if (parsingJSON) {
            line.split().forEach(function(char) {
                switch (char) {
                    case "{":
                        openedCurles++;
                        if (!parsingJSON) {
                            openedCurles += 1;
                            parsingJSON = true;
                            currentJSON += "{";
                            startedBy = "{";
                        }
                        break;
                    case "}":
                        if (parsingJSON) openedCurles--;
                        break;
                    case "[":
                        openedBrackets++;
                        if (!parsingJSON) {
                            openedBrackets += 1;
                            parsingJSON = true;
                            currentJSON += "[";
                            startedBy = "[";
                        }
                        break;
                    case "]":
                        if (parsingJSON) openedBrackets--;
                        break;
                }
                currentJSON += char;
                if (openedCurles == 0 && openedBrackets == 0) {
                    if (parsingJSON) {
                        parsingJSON = false;
                        JSONs.push(JSON.parse(currentJSON));
                    }
                }
            })
        }
    })*/
    try {
        var texts = text.split("}{");
        if (texts.length > 1) { // Multiple JSONs
            texts.forEach(function(maybeJSON, index) {
                if (index !== 0) maybeJSON = "{" + maybeJSON;
                if (index !== texts.length - 1) maybeJSON += "}";
                try {
                    JSONs.push(JSON.parse(maybeJSON.replace(/\r|\n/g, "")));
                } catch (e) {
                    if (maybeJSON.length > 0 && !maybeJSON.match(/(\r|\n)+/gm)) {
                        noJSON += maybeJSON.replace(/(\r|\n)+/gm, "$1");
                    }
                }
            });
        } else {
            JSONs.push(JSON.parse(text.replace(/\r|\n/, "")));
        }
    } catch (e) {
        noJSON = text.replace(/(\r|\n)+/gm, "$1");
    }
    return [noJSON, JSONs];
}