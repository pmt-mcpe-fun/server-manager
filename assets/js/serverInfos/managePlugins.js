/**
 * managePlugins.js - JS File for plugins managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */


var MDCMenu = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsPlugin`)); // Defining real menu;
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
                        <i class="material-icons" id="actionsPlugin${key}">more_vert</i>
                    </span>
                </li>`;
                mdc.ripple.MDCRipple.attachTo(document.getElementById("managePlugin" + key));
                // Adding actions of plugin
                document.getElementById("actionsPlugin" + key).addEventListener("click", function(ev) {
                    document.getElementById(`menuActionsPluginList`).innerHTML = "";
                    Object.keys(server.actions.pluginsActions).forEach(function(name) {
                        // Adding action
                        var nameAsId = name.replace(/ /g, "_");
                        document.getElementById(`menuActionsPluginList`).innerHTML += `
                        <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" role="menuitem" tabindex="0" id="managePlugin${key}Action${nameAsId}">
                            ${name}
                        </li>`;
                        mdc.ripple.MDCRipple.attachTo(document.getElementById(`managePlugin${key}Action${nameAsId}`));
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).setAttribute("cmd", server.actions.pluginActions[name])
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).setAttribute("plugin", key)
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).addEventListener("click", function() {
                            window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.plugin), this.innerHTML, server.plugins[this.plugin]));
                        });
                    });
                    if (server.actions.pluginsSpecificActions[key]) Object.keys(server.actions.pluginsSpecificActions[key]).forEach(function(name) {
                        // Adding action
                        var nameAsId = name.replace(/ /g, "_");
                        document.getElementById(`menuActionsPluginList`).innerHTML += `
                        <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" role="menuitem" tabindex="0" id="managePlugin${key}Action${nameAsId}">
                            ${name}
                        </li>`;
                        mdc.ripple.MDCRipple.attachTo(document.getElementById(`managePlugin${key}Action${nameAsId}`));
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).setAttribute("cmd", server.actions.pluginActions[name])
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).setAttribute("plugin", key)
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).addEventListener("click", function() {
                            window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.plugin), this.innerHTML, server.plugins[this.plugin]));
                        });
                    });
                    document.getElementById(`menuActionsPluginList`).innerHTML += `
                    <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" role="menuitem" tabindex="0" id="managePlugin${key}ActionRemove">
                        Remove
                    </li>`;
                    mdc.ripple.MDCRipple.attachTo(document.getElementById(`managePlugin${key}ActionRemove`));
                    document.getElementById(`managePlugin${key}ActionRemove`).addEventListener("click", function() {
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
                    });
                    MDCMenu = mdc.menu.MDCSimpleMenu.attachTo(document.getElementById(`menuActionsPlugin`));
                    document.getElementById("menuActionsPlugin").style.left = event.clientX + 'px';
                    document.getElementById("menuActionsPlugin").style.top = event.clientY + 'px';
                    MDCMenu.open = true;
                });
            }
        });
    }
});