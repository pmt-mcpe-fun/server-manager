/**
 * index.js - Makes Pocketmine Server Manager vuttons functional
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

if (top) require = top.require;
const path = require('path');
const fs = require('fs');
const os = require('os');
const properties = require("./js/properties.js");
const main = require('./js/main.js');

// Defining custom left click element
document.body.addEventListener("contextmenu", function(event) {
    var menu = document.querySelector('.mdc-simple-menu').MDCSimpleMenu;
    console.log(document.getElementById("leftClick"));
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

var servers = fs.readdirSync(main.serverFolder);
if (servers.length > 0) {
    servers.forEach(function(folder) {
        try {
            fs.accessSync(path.join(main.serverFolder, folder, "server.properties"));
            var running;
            try {
                fs.accessSync(path.join(main.serverFolder, folder, "pms.json"));
                running = true;
            } catch (e) {
                running = false;
            }
            var serverInfos = properties.parseProperties(fs.readFileSync(path.join(main.serverFolder, folder, "server.properties")).toString());
            var list = document.getElementById("serverPicker");
            if (typeof list == "object") {
                list.innerHTML += '<a href="serverInfos.html#' + folder + '" class="mdc-list-item" data-mdc-auto-init="MDCRipple"> \
    		<i class="material-icons mdc-list-item__start-detail" style="color: ' + (running ? "play_arrow" : "stop") + ';"> \
      			' + (running ? "play_arrow" : "stop") + ' \
    		</i> \
    		' + folder + ' \
			<span class="mdc-list-item__text__secondary">&nbsp;-&nbsp;' + serverInfos["motd"] + '</span> \
			<i class="material-icons mdc-list-item__start-detail mdc-list-item__end-detail">navigate_next</i> \
  			</a>';
            }
        } catch (e) {
            console.error(e);
        }
    }, this);
} else {
    document.body.innerHTML += "<h2 style='margin-left: 50px;' class='mdc-typography--subheading2'>No server created for the moment.</h2> \
	<button style='margin-left: 50px;' id='addServerButton' \
	 class='mdc-button mdc-button--raised'  data-mdc-auto-init='MDCRipple' \
	 onclick='top.document.getElementById(\"createServerDialog\").MDCDialog.show();'>Create one</button>";
}