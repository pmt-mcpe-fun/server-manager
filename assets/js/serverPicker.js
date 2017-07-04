/**
 * index.js - Makes Pocketmine Server Manager vuttons functional
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

if(top) require = top.require;
const path = require('path');
const fs = require('fs');
const os = require('os');
const properties = require("./properties.js");
const main = require('./main.js');

var servers = fs.readdirSync(main.serverFolder);
if (servers.length > 0) {
	servers.forEach(function (folder) {
		try {
			fs.accessSync(path.join(main.serverFolder, folder, "server.properties"));
			var serverInfos = properties.parseProperties(fs.readFileSync(path.join(main.serverFolder, folder, "server.properties")).toString());
			var list = document.getElementById("serverPicker");
			if (typeof list == "object") {
				list.innerHTML += '<li class="mdl-list__item mdl-list__item--three-line"> \
	    <span class="mdl-list__item-primary-content"> \
	      <span>' + folder + '</span> \
	      <span class="mdl-list__item-text-body">' + serverInfos.motd + '</span> \
	    </span> \
	    <span class="mdl-list__item-secondary-content"> \
	      <a class="mdl-list__item-secondary-action" href="serverInfos.html#' + folder + '"><i class="material-icons" style="color: rgb(66,66,66);">navigate_next</i></a> \
	    </span> \
	  </li><hr>';
			}
		} catch (e) {
			console.error(e);
		}
	}, this);
} else {
	document.getElementById("page-content").innerHTML += "<h2 style='padding-left: 50px;'>No server created for the moment.</h2> \
	<button style='padding-left: 50px;' class='mdl-button mdl-js-button mdl-button--raised' onclick='document.getElementById(\"createServerDialog\").showModal();'>Create one</button>"
}