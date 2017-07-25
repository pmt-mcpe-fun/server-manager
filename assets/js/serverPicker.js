/**
 * serverPicker.js - ServerPicker page related js file
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
const server = require('./js/server.js');

// Defining custom left click element
document.body.addEventListener("contextmenu", function(event) {
    var menu = new mdc.menu.MDCSimpleMenu(document.querySelector('.mdc-simple-menu'));
    document.getElementById("leftClick").style.left = event.clientX + 'px';
    document.getElementById("leftClick").style.top = event.clientY + 'px';
    // Showing element
    menu.open = !menu.open;
});

// Adding add server button
document.getElementById("addServerOpen").addEventListener('click', function(evt) {
    var addServerDialog = top.document.getElementById("createServerDialog").MDCDialog;
    addServerDialog.lastFocusedTarget = evt.target;
    addServerDialog.show();
});
// Adding add server button
document.getElementById("modifyServerBtn").addEventListener('click', function(evt) {
    document.querySelectorAll(".removeServerBtn").forEach(function(elem) {
        elem.classList.toggle("shown");
        elem.classList.toggle("hidden");
    })
});

/**
 * Refreshes forlders from home
 * 
 */
window.refreshFolders = function() {
    if (document.getElementById("head1")) {
        document.getElementById("contents").innerHTML = '<ul class="mdc-list mdc-list--two-line" id="serverPicker"></ul>';
    }
    var hey = ipcRenderer.sendSync("getVar", "serverFolder");
    var servers = fs.readdirSync(hey);
    var serversC = 0;
    servers.forEach(function(folder) {
        try {
            fs.accessSync(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), folder, "server.properties"));
            fs.accessSync(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), folder, "PocketMine-MP.phar"));
            server.getServer(folder, addServer);
            serversC++;
        } catch (e) {
            // console.error(e);
        }
    }, this);
    if (serversC == 0) {
        document.getElementById("contents").innerHTML += `<h2 id='head1' style='margin-left: 50px;' class='mdc-typography--subheading2'>No server created for the moment.</h2>
	<button style='margin-left: 50px;' id='addServerButton'
	 class='mdc-button'  data-mdc-auto-init='MDCRipple'
	 onclick='top.document.getElementById(\"createServerDialog\").MDCDialog.show();'>Create one</button>`;
    }
}

// When server is received
function addServer(server) {
    var servPath = ipcRenderer.sendSync("getVar", "serverFolder");
    var running = server.isStarted;
    var serverInfos = properties.parseProperties(fs.readFileSync(path.join(servPath, server.name, "server.properties")).toString());
    var list = document.getElementById("serverPicker");
    if (typeof list == "object") {
        if (!document.getElementById("server" + server.name)) {
            list.innerHTML += `<li onclick="location = 'serverInfos.html#` + server.name + `'" class="mdc-list-item" data-mdc-auto-init="MDCRipple" id="server` + server.name + `">
    		<i class="material-icons mdc-list-item__start-detail removeServerBtn hidden" style="color: red;" onclick="require('./js/main.js').removeServer('${server.name}');event.stopPropagation();">
      			remove_circle
    		</i>
    		<i id="server` + server.name + `Running" class="material-icons mdc-list-item__start-detail" style="color: ` + (running ? "green" : "red") + `;">
      			` + (running ? "play_arrow" : "stop") + `
    		</i>
            <span class="mdc-list-item__text">
    		    ` + server.name + `
			    <span class="mdc-list-item__text__secondary" id="server` + server.name + `Secondary">
                    ` + serverInfos["motd"] + ` - (` + Object.keys(server.players).length + "/" + server.settings["max-players"] + ` players)
                </span>
            </span>
			<i class="material-icons mdc-list-item__end-detail">navigate_next</i>
          </li>`;
        } else {
            document.getElementById("server" + server.name + "Running").style.color = (running ? "green" : "red")
            document.getElementById("server" + server.name + "Running").innerHTML = (running ? "play_arrow" : "stop")
            var Secondary = serverInfos["motd"] + " - (" + Object.keys(server.players).length + "/" + server.settings["max-players"] + " players)";
            if (document.getElementById("server" + server.name + "Secondary").innerHTML.indexOf(Secondary) == 0) { // MOTD, Max players, or players number has changed
                document.getElementById("server" + server.name + "Secondary").innerHTML = Secondary;
            }
        }
    }
};

window.refreshFolders();
setInterval(window.refreshFolders, 5000);