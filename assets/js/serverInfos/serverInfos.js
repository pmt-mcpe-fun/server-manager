/**
 * window.serverInfos.js - Server Infos js file
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */


if (top) require = top.require;
const path = require('path');
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const os = require('os');
const properties = require("./js/properties.js");
const main = require('./js/main.js');
const serverF = require('./js/server.js');

var queuing = false; // TODO: Find a better var name.
var first = 1;

function define(serverR) {
    window.server = serverR;
    document.getElementById("serverName").innerHTML = window.server.name;
    document.getElementById("started?").innerHTML = window.server.isStarted ? "play_arrow" : "stop";
    document.getElementById("consoleContent").innerHTML = window.server.log.replace(/&/gim, "&amp;").replace(/</gim, "&lt;").replace(/>/gim, "&gt;").replace(/\n/gim, "<br>");
    if (first > 0) {
        document.querySelector(".console").scrollTop = 10000000; // Should not have a that long console pixels.
        document.getElementById("consoleContent").scrollTop = 10000000; // Should not have a that long console pixels.
        first--;
    }
}
document.getElementById("startServer").addEventListener("click", function(event) {
    window.server.start();
    queuing = true;
    first = 3;
});
document.getElementById("stopServer").addEventListener("click", function(event) {
    window.server.stop();
    queuing = true;
    first = 3;
});
document.getElementById("commandEnter").addEventListener("keypress", function() {
    if (event.keyCode == 13) {
        window.server.commands.push(this.value);
        this.value = "";
        queuing = true;
        first = 3; //Scroll to bottom when received text
    }
})
setInterval(function() {
    if (queuing) {
        ipcRenderer.send("setServer", window.server);
        queuing = false;
    }
    serverF.getServer(location.hash.substr(1), define);
}, 500);