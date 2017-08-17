/**
 * managePlugins.js - JS File for plugins managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var openMenu = undefined;


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
                    <div class="mdc-simple-menu mdc-simple-menu--open-from-top-left" id="menuActionsPlugin${key}" tabindex="-1">
                        <ul class="mdc-simple-menu__items mdc-list" id="menuActionsPlugin${key}List" aria-hidden="true">
                        </ul>
                    </div>
                </span>
            </li>`;
                new mdc.ripple.MDCRipple(document.getElementById("managePlugin" + key));
                document.getElementById(`menuActionsPlugin${key}`).MDCMenu = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsPlugin${key}`)); // Defining real menu;
                // Adding actions of plugin
                document.getElementById("actionsPlugin" + key).addEventListener("click", function() {
                    if (openMenu) {
                        openMenu.open = false;
                    }
                    Object.keys(server.actions.pluginActions).forEach(function(name) {
                        // Actions to remove
                        if (name == "Add to whitelist" && window.server.plugins[key].whitelisted) return;
                        if (name == "Remove from whitelist" && !window.server.plugins[key].whitelisted) return;
                        if (name == "OP" && window.server.plugins[key].op) return;
                        if (name == "DeOP" && !window.server.plugins[key].op) return;
                        // Adding action
                        var nameAsId = name.replace(/ /g, "_");
                        document.getElementById("menuActionsPlugin" + key + "List").innerHTML += `
                     <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="managePlugin${key}Action${nameAsId}">
                         ${name}
                     </li>`;
                        new mdc.ripple.MDCRipple(document.getElementById(`managePlugin${key}Action${nameAsId}`));
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).setAttribute("cmd", server.actions.pluginActions[name])
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).setAttribute("plugin", key)
                        document.getElementById(`managePlugin${key}Action${nameAsId}`).addEventListener("click", function() {
                            window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.plugin), this.innerHTML, server.plugins[this.plugin]));
                        });
                    });
                    document.getElementById("menuActionsPlugin" + key + "List").innerHTML += `
                    <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="managePlugin${key}ActionRemove">
                        Remove
                    </li>`;
                    new mdc.ripple.MDCRipple(document.getElementById(`managePlugin${key}ActionRemove`));
                    document.getElementById(`managePlugin${key}ActionRemove`).addEventListener("click", function() {
                        var alreadyRemoved = false;
                        if (confirm("Are you sure that you want to delete plugin '" + key + "'?")) {
                            if (fs.existsSync(path.join(require("electron").ipcRenderer.sendSync("getVar", "serversFolder"), server.name, "plugins", key + ".phar"))) { // Removing phar
                                fs.unlink(path.join(require("electron").ipcRenderer.sendSync("getVar", "serversFolder"), server.name, "plugins", key + ".phar"), function(err) {
                                    top.main.snackbar("Successfully removed plugin " + key + " !\nRestart your server to apply changes.")
                                });
                                alreadyRemoved = true;
                            }
                            if (fs.existsSync(path.join(require("electron").ipcRenderer.sendSync("getVar", "serversFolder"), server.name, "plugins", key))) { // Removing data folder / DevTools plugins based folder
                                if (alreadyRemoved || confirm("Do you want to remove " + key + "'s configurations and data?")) { // Prompt to remove data if data.
                                    require("electron-require").lib("fs-utils.js").rmdir(path.join(require("electron").ipcRenderer.sendSync("getVar", "serversFolder"), server.name, "plugins", key + ".phar"));
                                    if (!alreadyRemoved) top.main.snackbar("Successfully removed plugin " + key + " !\nRestart your server to apply changes.");
                                }
                            }
                        }
                    });
                    document.getElementById("menuActionsPlugin" + key).MDCMenu.open = true;
                    openMenu = document.getElementById("menuActionsPlugin" + key).MDCMenu;
                });
                // Adding plugin's attribute
                if (server.plugins[key].op) document.getElementById(`managePlugin${key}Props`).innerHTML += "<i class='material-icons'>build</i>";
                if (server.plugins[key].whitelisted) document.getElementById(`managePlugin${key}Props`).innerHTML += "<i class='material-icons'>verified_user</i>";
            }
        });
    }
});