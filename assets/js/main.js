/**
 * main.js - JS file requirered everywhere
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

if(!require) require = top.window.require;
if(!_dirname) _dirname = top._dirname;
const path = require('path');
const fs = require('fs');
const os = require('os');
const properties = require(_dirname + "/js/properties.js");
const ListenerTracker = require(top._dirname + "/js/interceptListener.js");


// Defining servers folder location
exports.serverFolder = path.join(os.homedir(), '.pocketmine');
try {
	fs.accessSync(exports.serverFolder);
} catch (e) { // No .pocketmine folder
	fs.mkdirSync(exports.serverFolder);
}

window.addEventListener("load", function (event) {// Defining custom left click element
	document.body.addEventListener("contextmenu", function (event) {
		console.log("Lol");
		if(!document.getElementById("leftClickButton")) return;
		leftClickElem = document.getElementById("leftClickButton");
		console.log(document.getElementById("leftClick"));
		leftClickElem.style.left = event.clientX + 'px';
		leftClickElem.style.top = event.offsetY + event.clientY + 'px';
		// Showing element
		console.log(leftClickElem.getEventListeners("click")[0].listener);
		leftClickElem.getEventListeners("click")[0].listener.apply(leftClickElem, event)
	});
});