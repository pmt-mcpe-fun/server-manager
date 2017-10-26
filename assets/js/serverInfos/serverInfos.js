/**
 * serverInfos.js - Server Infos js file
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
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


var scroll = 1;
var stopping = false;
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
    var logsHTML = document.getElementById("consoleContent") || document.getElementById("consoleContent2");
    if (logsHTML) {
        for (var i = logsHTML.children.length - 1; i < logsNew.length - 1; i++) {
            if (i !== -1 && !logsHTML.querySelector(`p[data-id="console${i}"]`) && logsNew[i].indexOf("\u001b]0;") == -1) {
                var newLine = document.createElement("p");
                newLine.innerHTML = formatingCodes.terminal2HTML(logsNew[i]);
                newLine.setAttribute("data-id", "console" + i);
                logsHTML.appendChild(newLine);
                document.querySelector(".console").scrollTop = 10000000; // Should not have a that long console pixels.
                document.getElementById("consoleContent").scrollTop = 10000000; // Should not have a that long console pixels.
            }
        }
    }
    window.serverCallbacks.forEach(function(cb, index) {
        cb(serverR);
    }, this);
}
// Adding starting server button to start the server
document.getElementById("startServer").addEventListener("click", function(event) {
    window.server.start();
    stopping = false;
});
// Button to stop the server
document.getElementById("stopServer").addEventListener("click", function(event) {
    window.server.stop();
    stopping = true;
});
// Button to clear the log
document.getElementById("clearLog").addEventListener("click", function(event) {
    server.log = "";
    ipcRenderer.send("clearLog", server.name);
    ipcRenderer.once("clearLogSucess", function() {
        document.getElementById("consoleContent").innerHTML = "";
    });
    top.main.snackbar("Clearing log...");
});
// Opens pocktemine.yml file in a new notepad/gedit/ default text editor
document.getElementById("openPocketMineYML").addEventListener("click", function() {
    shell.openItem(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), window.server.name, 'pocketmine.yml'));
});
// Opens server's folder in explorer
document.getElementById("openServerFolder").addEventListener("click", function() {
    shell.showItemInFolder(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), window.server.name, "PocketMine-MP.phar"));
});
// Checks when a command is enter with "Enter"
window.enterCommand = function(event) {
    if (event.keyCode == 13) {
        window.server.commands.push(this.value);
        this.value = "";
        queuing = true;
        scroll = 3; //Scroll to bottom when received text
    }
};
document.getElementById("commandEnter").addEventListener("keypress", window.enterCommand);
document.getElementById("commandEnter2").addEventListener("keypress", window.enterCommand);
var editServerVersionDialog = new mdc.dialog.MDCDialog(document.getElementById("editServerVersionDialog"));
var editServerVersionSelect = new mdc.select.MDCSelect(document.getElementById("editServerVersionSelect"));

// Send server interval
setInterval(function() {
    if (window.server && !stopping) ipcRenderer.send("setServer", window.server);
    serverF.getServer(location.hash.substr(1), define);
    // Server dialog versions changing
    if (!editServerVersionDialog.open) {
        document.getElementById("editServerVersionList").innerHTML = `<li class="mdc-list-item" role="option" id="supported" aria-disabled="true">
                Supported MCPE Version
            </li>`;
        document.getElementById("editServerVersionDefaultText").innerHTML = "Supported MCPE version";
        var versions = Object.keys(JSON.parse(fs.readFileSync(path.join(ipcRenderer.sendSync("getVar", "appFolder"), "versions.json"))).pharsVersion);
        versions.forEach(function(version) {
            document.getElementById("editServerVersionList").innerHTML += `
                <li class="mdc-list-item" role="option" tabindex="0">
                    ${version}
                </li>`;
        });
        editServerVersionSelect = new mdc.select.MDCSelect(document.getElementById("editServerVersionSelect"));
    }
}, 500);
// Adding version changer
document.getElementById("editServerVersionConfirm").addEventListener('click', function() {
    if (parseFloat(editServerVersionSelect.value) <= 0.1) {
        top.main.snackbar("Please select a valid version");
    } else {
        top.main.changePhar(parseFloat(editServerVersionSelect.value), window.server.name, false);
    }
});
// Adding nutton to show version changinb
document.getElementById("EditServerVersionBtn").addEventListener("click", function() {
    editServerVersionDialog.show();
});