/**
 * pluginProviders.js - Lists the plugins providers.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const path = require("path");
const mdc = require("material-components-web");

var pluginProviders = {
    github: {
        img: "https://github.com/fluidicon.png",
        name: "Github",
        provider: path.join(__dirname, "github.js")
    },
    poggit: {
        img: "https://poggit.pmmp.io/res/poggit.png",
        name: "Poggit",
        provider: path.join(__dirname, "poggit.js")
    },
}


document.getElementById("pluginAddDialogBody").innerHTML = `
<p>Choose an plugin provider</p>
<ul id="pluginProvidersList" class="mdc-list"></ul>`;

Object.keys(pluginProviders).forEach(function(keyName) {
    document.getElementById("pluginProvidersList").innerHTML += ` 
        <li class="mdc-list-item" id="pluginProvider${keyName}" data-keyname="${keyName}">
            <span class="mdc-list-item__start-detail">
               <img style="width: 24px; height: 24px" src="${pluginProviders[keyName].img}">
    		</span>
            <span class="mdc-list-item__text">
    		   ${pluginProviders[keyName].name}
            </span>
        </li>`;
    new mdc.ripple.MDCRipple(document.getElementById(`pluginProvider${keyName}`));
    document.getElementById(`pluginProvider${keyName}`).addEventListener("click", function(event) {
        var plugProvider = require(pluginProviders[this.getAttribute("data-keyname")].provider);
        plugProvider.listPlugins();
    });
});

document.getElementById("pluginAddDialog").MDCDialog = new mdc.dialog.MDCDialog(document.getElementById("pluginAddDialog"));
document.getElementById("pluginAddBtn").addEventListener("click", function(event) {
    document.getElementById("pluginAddDialog").MDCDialog.show();
})