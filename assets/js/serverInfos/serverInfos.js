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
const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const os = require('os');
const rq = require('electron-require');

const properties = rq.lib("properties.js");
const main = rq('./js/main.js');
const serverF = rq.lib('server.js');
const formatingCodes = rq.lib('formatingCodes.js');
const mdc = require("material-components-web/dist/material-components-web");


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
    document.getElementById("started?").style.color = window.server.isStarted ? "var(--mdc-theme-primary, green)" : "red";
    var logsNew = window.server.log.replace(/&/gim, "&amp;").replace(/</gim, "&lt;").replace(/>/gim, "&gt;").replace(/\r|\n/g, "<br>").replace(/(<br>)+/g, "<br>").split("<br>");
    var logsHTML = document.getElementById("consoleContent");
    for (var i = logsHTML.children.length - 1; i < logsNew.length - 1; i++) {
        if (i !== -1 && !document.getElementById("console" + i) && logsNew[i].indexOf("\u001b]0;") == -1) {
            var newLine = document.createElement("p");
            newLine.innerHTML = formatingCodes.terminal2HTML(logsNew[i]);
            newLine.id = "console" + i;
            logsHTML.appendChild(newLine);
        }
    }
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
document.getElementById("openPocketMineYML").addEventListener("click", function() {
    shell.openItem(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), window.server.name, 'pocketmine.yml'));
});
document.getElementById("openServerFolder").addEventListener("click", function() {
    shell.showItemInFolder(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), window.server.name, "PocketMine-MP.phar"));
    shell.beep();
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

mdc.autoInit();