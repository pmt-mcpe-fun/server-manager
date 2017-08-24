/**
 * managePlugins.js - JS File for plugins managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */


var MDCMenuPlgs = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsPlugin`)); // Defining real menu;
window.serverCallbacks.push(function(server) {
    var pluginsList = document.getElementById("managePluginsList").children;
    for (var i = 0; i < pluginsList.length; i++) {
        if (!server.plugins[pluginsList[i].id.substring(12)]) {
            pluginsList[i].remove();
        }
    }
    if (Object.keys(server.plugins).length < 1) {
        document.getElementById("noPlugins").style.display = "block";
    } else {
        document.getElementById("noPlugins").style.display = "none";
        Object.keys(server.plugins).forEach(function(key) {
            if (!document.getElementById(`managePlugin${key}`)) {
                document.getElementById("managePluginsList").innerHTML += `
                <li class="mdc-list-item" id="managePlugin${key}">
                <span id="managePlugin${key}Props" class=" mdc-list-item__start-detail">
                        <i class='material-icons'>settings</i>
    		        </span>
                    <span class="mdc-list-item__text">
    		            ${key}
                    </span>
                    <span class="mdc-list-item__end-detail">
                        <i class="material-icons"
                        onclick="window.window.displayPluginData(event, '${key}');"
                        >more_vert</i>
                    </span>
                </li>`;
            }
        });
    }
});


document.body.addEventListener("click", function() {
    if (MDCMenuPlgs.open) MDCMenuPlgs.open = false;
})

/**
 * Sends confirms and deletes data & phar from the server.
 */
window.removePlugin = function(key) {
    var alreadyRemoved = false;
    if (confirm("Are you sure that you want to delete plugin '" + key + "'?")) {
        if (fs.existsSync(path.join(require("electron").ipcRenderer.sendSync("getVar", "appFolder"), "servers", server.name, "plugins", key + ".phar"))) { // Removing phar
            fs.unlink(path.join(require("electron").ipcRenderer.sendSync("getVar", "appFolder"), "servers", server.name, "plugins", key + ".phar"), function(err) {
                top.main.snackbar("Successfully removed plugin " + key + " !\nRestart your server to apply changes.")
            });
            alreadyRemoved = true;
        }
        if (fs.existsSync(path.join(require("electron").ipcRenderer.sendSync("getVar", "appFolder"), "servers", server.name, "plugins", key))) { // Removing data folder / DevTools plugins based folder
            if (alreadyRemoved || confirm("Do you want to remove " + key + "'s configurations and data?")) { // Prompt to remove data if data.
                require("electron-require").lib("fs-utils.js").rmdir(path.join(require("electron").ipcRenderer.sendSync("getVar", "appFolder"), "servers", server.name, "plugins", key + ".phar"));
                if (!alreadyRemoved) top.main.snackbar("Successfully removed plugin " + key + " !\nRestart your server to apply changes.");
            }
        }
    }
}

/**
 * Display menu data for plugin
 */
window.displayPluginData = function(event, key) {
    console.log("Calling plg ", MDCMenuPlgs);
    document.getElementById(`menuActionsPluginList`).innerHTML = "";
    MDCMenuPlgs.items = [];
    Object.keys(server.actions.pluginsActions).forEach(function(name) {
        // Adding action
        var nameAsId = name.replace(/ /g, "_");
        document.getElementById(`menuActionsPluginList`).innerHTML += `
        <li class="mdc-list-item"
        cmd=${server.actions.pluginActions[name]}
        plugin="${key}"
        role="menuitem" tabindex="0" 
        onclick="window.server.commands.push(parseAsk(this.getAttribute('cmd').replace(/\%p/g, this.plugin), this.innerHTML, server.plugins[this.getAttribute('plugin')]));"
        id="managePlugin${key}Action${nameAsId}">
            ${name}
        </li>`;
    });
    if (server.actions.pluginsSpecificActions[key]) Object.keys(server.actions.pluginsSpecificActions[key]).forEach(function(name) {
        // Adding action
        var nameAsId = name.replace(/ /g, "_");
        document.getElementById(`menuActionsPluginList`).innerHTML += `
        <li class="mdc-list-item"
        cmd=${server.actions.pluginsSpecificActions[key][name]}
        plugin="${key}"
        role="menuitem" tabindex="0" 
        onclick="window.server.commands.push(parseAsk(this.getAttribute('cmd').replace(/\%p/g, this.plugin), this.innerHTML, server.plugins[this.getAttribute('plugin')]));"
        id="managePlugin${key}Action${nameAsId}">
            ${name}
        </li>`;
        MDCMenuPlgs.items.push(document.getElementById(`managePlugin${key}Action${nameAsId}`));
        mdc.ripple.MDCRipple.attachTo(document.getElementById(`managePlugin${key}Action${nameAsId}`));
    });
    document.getElementById(`menuActionsPluginList`).innerHTML += `
    <li class="mdc-list-item" 
    role="menuitem" tabindex="0" 
    onclick="window.removePlugin('${key}')"
    id="managePlugin${key}ActionRemove">
        Remove
    </li>`;
    document.getElementById("menuActionsPlugin").style.left = (event.clientX - 170 /**Width**/ ).toString() + 'px';
    document.getElementById("menuActionsPlugin").style.top = event.clientY.toString() + 'px';
    MDCMenuPlgs.open = true;
    event.stopImmediatePropagation();
    event.stopPropagation();
    mdc.autoInit();
}