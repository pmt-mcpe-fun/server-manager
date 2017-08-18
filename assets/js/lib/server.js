/**
 * server.js - Renderer side Server instance
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
const ipcRenderer = require('electron').ipcRenderer;

/**
 * Server instance
 * 
 * @param {String} name
 * @param {Function} cb
 */

var cbs = {};
var servers = {}

// When we receive the server
ipcRenderer.on("sendServer", function(event, server) {
    servers[server.name].isStarted = server.isStarted;
    servers[server.name].players = server.players;
    servers[server.name].log = server.log;
    servers[server.name].settings = server.settings;
    servers[server.name].windows = server.windows;
    servers[server.name].actions = server.actions;
    servers[server.name].levels = server.levels;
    servers[server.name].generators = server.generators;
    servers[server.name].plugins = server.plugins;
    cbs[server.name](servers[server.name]);
});

// Real server instance.
var Server = function(name) {
    this.name = name;
    this.isStarted = false;
    this.players = [];
    this.log = "";
    this.commands = [];
    this.settings = [];
    this.windows = [];
    this.players = {};
    this.levels = {};
    this.plugins = {};
    this.generators = {};

    this.start = function() {
        this.isStarted = true;
    };
    this.stop = function() {
        this.commands.push("stop");
    };
    this.insertCommand = function(cmd) {
        this.commands.push(cmd);
    }
    this.send = function() {
        exports.setServer(this);
    }
}

/**
 * Gets a server
 * 
 * @param {String} name
 * @param {Function} cb
 */
exports.getServer = function(name, cb) {
    // Saving callback
    cbs[name] = cb;
    ipcRenderer.send("getServer", name);

    servers[name] = new Server(name);
}

/**
 * Exports a server
 * 
 * @param {Server} server
 */
exports.setServer = function(server) {
    ipcRenderer.send("setServer", server);
}