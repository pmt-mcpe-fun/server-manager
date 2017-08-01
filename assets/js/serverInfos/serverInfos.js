/**
 * serverInfos.js - Server Infos js file
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
const properties = require("./js/lib/properties.js");
const main = require('./js/main.js');
const serverF = require('./js/lib/server.js');

var queuing = false; // TODO: Find a better var name.
var first = 1;
window.serverCallbacks = [];

// Defining custom left click element
document.body.addEventListener("contextmenu", function(event) {
    var menu = new mdc.menu.MDCSimpleMenu(document.querySelector("data-tab.active .leftClick"));
    document.querySelector("data-tab.active .leftClick").style.left = event.clientX + 'px';
    document.querySelector("data-tab.active .leftClick").style.top = event.clientY + 'px';
    // Showing element
    menu.open = !menu.open;
});


function define(serverR) {
    window.server = serverR;
    document.getElementById("serverName").innerHTML = window.server.name;
    document.getElementById("started?").innerHTML = window.server.isStarted ? "play_arrow" : "stop";
    document.getElementById("started?").style.color = window.server.isStarted ? "green" : "red";
    document.getElementById("consoleContent").innerHTML = window.server.log.replace(/&/gim, "&amp;").replace(/</gim, "&lt;").replace(/>/gim, "&gt;").replace(/\r|\n/g, "<br>").replace(/(<br>)+/g, "<br>"); // F*ck this shit of vars.
    if (first > 0) {
        document.querySelector(".console").scrollTop = 10000000; // Should not have a that long console pixels.
        document.getElementById("consoleContent").scrollTop = 10000000; // Should not have a that long console pixels.
        first--;
    }
    window.serverCallbacks.forEach(function(cb, index) {
        cb(serverR);
    }, this);
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
document.getElementById("commandEnter").addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        window.server.commands.push(this.value);
        this.value = "";
        queuing = true;
        first = 3; //Scroll to bottom when received text
    }
});
setInterval(function() {
    if (queuing) {
        ipcRenderer.send("setServer", window.server);
        queuing = false;
    }
    serverF.getServer(location.hash.substr(1), define);
}, 500);

// MDC Installation
document.querySelectorAll(".mdc-textfield").forEach(function(elem) {
    new mdc.textfield.MDCTextfield(elem);
});
window.tabBar = new mdc.tabs.MDCTabBar(document.querySelector('.mdc-tab-bar'));
// Removing shadow from top so tool bar intergates correctly
top.document.querySelector("header.mdc-toolbar").style.boxShadow = "0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12)";