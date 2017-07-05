/**
 * main.js - JS file requirered everywhere
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

if(top) {
	require = top.window.require;
}
const path = require('path');
const fs = require('fs');
const os = require('os');
const properties = require("./js/properties.js");
const ListenerTracker = require("./js/interceptListener.js");

exports.inputs = {};
exports.selects = [];


// Defining servers folder location
exports.appFolder = path.join(os.homedir(), '.pocketmine');
exports.serverFolder = path.join(exports.appFolder, "servers");
try {
	fs.accessSync(exports.serverFolder);
} catch (e) { // No .pocketmine folder
	fs.mkdirSync(exports.appFolder);
	fs.mkdirSync(exports.serverFolder);
}

window.addEventListener("load", function (event) {

	// Making inputs working
	document.querySelectorAll('.mdc-textfield').forEach(function(elem){
		exports.inputs[elem.id] = new mdc.textfield.MDCTextfield(elem, /* foundation */ undefined, (el) => {
		  // do something with el...
		  return new mdc.ripple.MDCRipple(el);
		});
	});
	document.querySelectorAll('.mdc-select').forEach(function(elem){
		exports.selects.push(new mdc.select.MDCSelect(elem));
	});
});