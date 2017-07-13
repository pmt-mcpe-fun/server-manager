/**
 * serverInfos.js - Server Infos js file
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */


if (top) require = top.require;
const path = require('path');
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const os = require('os');
const properties = require("./js/properties.js");
const main = require('./js/main.js');
const serverF = require('./js/server.js');

window.addEventListener("load", function () {
    document.querySelectorAll(".mdc-textfield").forEach(function (elem) {
        new mdc.textfield.MDCTextfield(elem);
    });
});

var server;
var queuing = false; // TODO: Find a better var name.

function define(serverR) {
    console.log(serverR);
    server = serverR;
    document.getElementById("serverName").innerHTML = server.name;
    document.getElementById("started?").innerHTML = server.isStarted ? "play_arrow" : "stop";
    document.getElementById("consoleContent").innerHTML = server.log.replace(/&/gim, "&amp;").replace(/</gim, "&lt;").replace(/>/gim, "&gt;").replace(/\n/gim, "<br>");
}


document.getElementById("startServer").addEventListener("click", function (event) {
    server.start();
    queuing = true;
});
document.getElementById("stopServer").addEventListener("click", function (event) {
    server.stop();
    queuing = true;
});
document.getElementById("EditServerPropertiesBtn").addEventListener("click", function (event) {
    document.getElementById("editServerDialog").MDCDialog.show();
});
document.getElementById("commandEnter").addEventListener("keypress", function(){
    if(event.keyCode == 13){
        server.commands.push(this.value);
        this.value = "";
        queuing = true;
    }
})

setInterval(function () {
    if (queuing) {
        ipcRenderer.send("setServer", server);
        queuing = false;
    }
    serverF.getServer(location.hash.substr(1), define);
}, 500)