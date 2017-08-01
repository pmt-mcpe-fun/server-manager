/**
 * manageLevels.js - JS File for levels managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var openMenu = undefined;
window.serverCallbacks.push(function(server) {
    var levelsList = document.getElementById("manageLevelsList").children;
    for (var i = 0; i < levelsList.length; i++) {
        if (!server.levels[levelsList[i].id.substring(12)]) {
            levelsList[i].remove();
        }
    }
    if (Object.keys(server.levels).length < 1) {
        document.getElementById("noLevels").style.display = "block";
    } else {
        document.getElementById("noLevels").style.display = "none";
        Object.keys(server.levels).forEach(function(key) {
            if (!document.getElementById(`manageLevel${key}`)) {
                document.getElementById("manageLevelsList").innerHTML += `
            <li class="mdc-list-item" id="manageLevel${key}">
                <span id="manageLevel${key}Props" class=" mdc-list-item__start-detail">
    		    </span>
                <span class="mdc-list-item__text">
    		        ${key}
                </span>
                <span class="mdc-list-item__end-detail">
                    <i class="material-icons" id="actionsLevel${key}">more_vert</i>
                    <div class="mdc-simple-menu mdc-simple-menu--open-from-top-left" id="menuActionsLevel${key}" tabindex="-1">
                        <ul class="mdc-simple-menu__items mdc-list" role="menuActionsLevel${key}List" aria-hidden="true">
                        </ul>
                    </div>
                </span>
            </li>`;
                new mdc.ripple.MDCRipple(document.getElementById("manageLevel" + key));
                document.getElementById(`menuActionsLevel${key}`).MDCMenu = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsLevel${key}`)); // Defining real menu;
                // Adding actions of level
                document.getElementById("actionsLevel" + key).addEventListener("click", function() {
                    if (openMenu) {
                        openMenu.open = false;
                    }
                    Object.keys(server.actions.levelActions).forEach(function(name) {
                        // Actions to remove
                        if (name == "Add to whitelist" && window.server.levels[key].whitelisted) return;
                        if (name == "Remove from whitelist" && !window.server.levels[key].whitelisted) return;
                        if (name == "OP" && window.server.levels[key].op) return;
                        if (name == "DeOP" && !window.server.levels[key].op) return;
                        // Adding action
                        var nameAsId = name.replace(/ /g, "_");
                        document.getElementById("menuActionsLevel" + key + "List").innerHTML += `
                     <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="manageLevel${key}Action${nameAsId}">
                         ${name}
                     </li>`;
                        new mdc.ripple.MDCRipple(document.getElementById(`manageLevel${key}Action${nameAsId}`));
                        document.getElementById(`manageLevel${key}Action${nameAsId}`)
                            .setAttribute("cmd", server.actions.levelActions[name])
                            .setAttribute("level", key)
                            .addEventListener("click", function() {
                                window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.level), this.innerHTML, server.levels[this.level]));
                            });
                    });
                    document.getElementById("menuActionsLevel" + key).MDCMenu.open = true;
                    openMenu = document.getElementById("menuActionsLevel" + key).MDCMenu;
                });
                // Adding level's attribute
                if (server.levels[key].loaded) document.getElementById(`manageLevel${key}Props`).innerHTML += "<i class='material-icons'>build</i>";
                if (server.levels[key].whitelisted) document.getElementById(`manageLevel${key}Props`).innerHTML += "<i class='material-icons'>verified_user</i>";
            }
        });
    }
});