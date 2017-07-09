/**
 * server.js - Renderer side Server instance
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
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
    console.log("Rereceived " + server.name);
    servers[server.name].isStarted = server.isStarted;
    servers[server.name].players = server.players;
    servers[server.name].log = server.log;
    servers[server.name].commands = [];
    cbs[server.name](servers[server.name]);
});

exports.Server = function(name, cb) {
    // Saving callback
    cbs[name] = cb;
    ipcRenderer.send("getServer", name);

    servers[name] = {
        name: name,
        start: function() {
            this.isStarted = true;
        },
        stop: function() {
            this.commands.push("stop");
        }
    };
}