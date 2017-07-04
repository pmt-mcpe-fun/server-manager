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

var servers = fs.readdirSync(main.serverFolder);
if (servers.length > 0) {
	servers.forEach(function (folder) {
		try {
			fs.accessSync(path.join(main.serverFolder, folder, "server.properties"));
			var running;
			try{
				fs.accessSync(path.join(main.serverFolder, folder, "pms.json"));
				running = true;
			} catch(e) {
				running = false;
			}
			var serverInfos = properties.parseProperties(fs.readFileSync(path.join(main.serverFolder, folder, "server.properties")).toString());
			var list = document.getElementById("serverPicker");
			if (typeof list == "object") {
				list.innerHTML += '<a href="serverInfos.html#' + folder + '" class="mdc-list-item" data-mdc-auto-init="MDCRipple"> \
    		<i class="material-icons mdc-list-item__start-detail"> \
      			' + (running ? "play_arrow" : "stop" ) + ' \
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
	document.getElementById("page-content").innerHTML += "<h2 style='padding-left: 50px;'>No server created for the moment.</h2> \
	<button style='padding-left: 50px;' class='mdl-button mdl-js-button mdl-button--raised' onclick='document.getElementById(\"createServerDialog\").showModal();'>Create one</button>"
}