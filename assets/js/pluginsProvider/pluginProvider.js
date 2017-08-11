/**
 * pluginProviders.js - Lists the plugins providers.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var pluginProvidersList = {
    github: {
        img: "https://github.com/fluidicon.png",
        name: "Github",
    },
    poggit: {
        img: "https://poggit.pmmp.io/res/poggit.png",
        name: "Poggit",
    },
}

function refresh() {
    document.getElementById("pluginAddDialogBody").innerHTML = `
    <p>Choose an plugin provider</p>
    <ul id="pluginProvidersList" class="mdc-list"></ul>`;

    Object.keys(pluginProvidersList).forEach(function(keyName) {
        document.getElementById("pluginProvidersList").innerHTML += ` 
        <li class="mdc-list-item" id="pluginProvider${keyName}" data-keyname="${keyName}">
            <span class="mdc-list-item__start-detail">
               <img style="width: 24px; height: 24px" src="${pluginProvidersList[keyName].img}">
    		</span>
            <span class="mdc-list-item__text">
    		   ${pluginProvidersList[keyName].name}
            </span>
        </li>`;
        new mdc.ripple.MDCRipple(document.getElementById(`pluginProvider${keyName}`));
        document.getElementById(`pluginProvider${keyName}`).addEventListener("click", function(event) {
            document.getElementById("pluginAddDialogTitle").innerHTML = "Add plugin - " + pluginProvidersList[this.getAttribute("data-keyname")].name;
            console.log(pluginProvidersList[this.getAttribute("data-keyname")].name, window.pluginProviders[pluginProvidersList[this.getAttribute("data-keyname")].name]);
            var plugProvider = window.pluginProviders[pluginProvidersList[this.getAttribute("data-keyname")].name];
            plugProvider.listPlugins();
        });
    });
}
document.getElementById("pluginAddDialog").MDCDialog = new mdc.dialog.MDCDialog(document.getElementById("pluginAddDialog"));
document.getElementById("addPluginBtn").addEventListener("click", function(event) {
    document.getElementById("pluginAddDialog").MDCDialog.show();
    refresh();
});

document.getElementById("pluginInfos").addEventListener("click", function() {
    event.stopImmediatePropagation();
    event.stopPropagation();
});

document.addEventListener("click", function() {
    if (document.getElementById("pluginInfos").classList.contains("shown")) {
        console.log("Hidding pluigin infos.");
        document.getElementById("pluginInfos").classList.remove("shown");
        document.getElementById("pluginInfos").classList.add("hidden");
    }
});
document.getElementById("pluginInfosClose").addEventListener("click", function() {
    console.log("Hidding pluigin infos.");
    document.getElementById("pluginInfos").style.top = "";
    document.getElementById("pluginInfos").classList.remove("shown");
    document.getElementById("pluginInfos").classList.add("hidden");
});
document.getElementById("pluginInfosDownload").addEventListener("click", function() {
    console.log("Downloading plugin at " + document.getElementById("pluginInfosDownloadURL").value);
    document.getElementById("pluginInfos").style.top = "";
    document.getElementById("pluginInfos").classList.remove("shown");
    document.getElementById("pluginInfos").classList.add("hidden");
    window.pluginProviders[window.currentProvider].downloadPlugin(document.getElementById("pluginInfosDownloadURL").value);
});
window.addEventListener('resize', function(e) {
    console.log("Resizing window");
    resizeCb();
});

function resizeCb() {
    document.getElementById("pluginAddSurface").style.marginTop = "-" + window.innerHeight * 0.1 + "px";
    document.getElementById("pluginAddDialogBody1").style.maxHeight = window.innerHeight * 0.4 + "px";
    document.getElementById("pluginInfosReadMe").style.maxHeight = (window.innerHeight * 0.7 - 124) + "px";
    document.getElementById("pluginInfos").style.maxHeight = window.innerHeight * 0.7 + "px";
}

// Resize a first time
resizeCb();