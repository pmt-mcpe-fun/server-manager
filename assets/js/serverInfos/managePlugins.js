/**
 * managePlugins.js - JS File for plugins managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
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
                        <ul class="mdc-simple-menu__items mdc-list" role="menuActionsPlugin${key}List" aria-hidden="true">
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
                        document.getElementById(`managePlugin${key}Action${nameAsId}`)
                            .setAttribute("cmd", server.actions.pluginActions[name])
                            .setAttribute("plugin", key)
                            .addEventListener("click", function() {
                                window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.plugin), this.innerHTML, server.plugins[this.plugin]));
                            });
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