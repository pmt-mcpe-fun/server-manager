/**
 * serverInfos.js - Server Infos js file
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

window.addEventListener("load", function() {
    document.querySelectorAll(".mdc-textfield").forEach(function(elem) {
        new mdc.textfield.MDCTextfield(elem);
    })
})