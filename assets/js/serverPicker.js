/**
 * index.js - Makes Pocketmine Server Manager buttons functional
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
const { Server } = require('./js/server.js');

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

/**
 * Refreshes forlders from home
 * 
 */
window.refreshFolders = function() {
    document.getElementById("contents").innerHTML = '<ul class="mdc-list mdc-list--two-line" id="serverPicker"></ul>';
    var hey = ipcRenderer.sendSync("getVar", "serverFolder");
    var servers = fs.readdirSync(hey);
    var serversC = 0;
    servers.forEach(function(folder) {
        try {
            fs.accessSync(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), folder, "server.properties"));
            fs.accessSync(path.join(ipcRenderer.sendSync("getVar", "serverFolder"), folder, "PocketMine-MP.phar"));
            Server(folder, addServer);
            serversC++;
        } catch (e) {}
    }, this);
    if (serversC == 0) {
        document.getElementById("contents").innerHTML += `<h2 id='head1' style='margin-left: 50px;' class='mdc-typography--subheading2'>No server created for the moment.</h2>
	<button style='margin-left: 50px;' id='addServerButton'
	 class='mdc-button mdc-button--raised'  data-mdc-auto-init='MDCRipple'
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
        list.innerHTML += `<li onclick="location = 'serverInfos.html#` + server.name + `'" class="mdc-list-item" data-mdc-auto-init="MDCRipple">
    		<i class="material-icons mdc-list-item__start-detail" style="color: ` + (running ? "green" : "red") + `;">
      			` + (running ? "play_arrow" : "stop") + `
    		</i>
            <span class="mdc-list-item__text">
    		    ` + server.name + `
			    <span class="mdc-list-item__text__secondary">
                    ` + serverInfos["motd"] + ` - 
                    (` + Object.keys(server.players).length + "/" + server.settings["max-players"] + ` players)
                </span>
            </span>
			<i class="material-icons mdc-list-item__end-detail">navigate_next</i>
  		</li>`;
    }
};

window.refreshFolders();
setInterval(window.refreshFolders, 5000);