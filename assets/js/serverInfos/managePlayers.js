/**
 * managePlayers.js - JS File for players managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var openMenu = undefined;
window.serverCallbacks.push(function(server) {
    var playersList = document.getElementById("managePlayersList").children;
    console.log(server.players);
    for (var i = 0; i < playersList.length; i++) {
        if (!server.players[playersList[i].id.substring(12)]) {
            playersList[i].remove();
        }
    }
    if (Object.keys(server.players).length < 1) {
        document.getElementById("noPlayer").style.display = "block";
    } else {
        document.getElementById("noPlayer").style.display = "none";
        Object.keys(server.players).forEach(function(key) {
            if (!document.getElementById(`managePlayer${key}`)) {
                document.getElementById("managePlayersList").innerHTML += `
            <li class="mdc-list-item" id="managePlayer${key}">
                <span id="managePlayer${key}Props" class=" mdc-list-item__start-detail">
    		    </span>
                <span class="mdc-list-item__text">
    		        ${key}
                </span>
                <span class="mdc-list-item__end-detail">
                    <i class="material-icons" id="actionsPlayer${key}">more_vert</i>
                    <div class="mdc-simple-menu mdc-simple-menu--open-from-top-left" id="menuActionsPlayer${key}" tabindex="-1">
                        <ul class="mdc-simple-menu__items mdc-list" role="menuActionsPlayer${key}List" aria-hidden="true">
                        </ul>
                    </div>
                </span>
            </li>`;
                new mdc.ripple.MDCRipple(document.getElementById("managePlayer" + key));
                document.getElementById(`menuActionsPlayer${key}`).MDCMenu = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsPlayer${key}`)); // Defining real menu;
                // Adding actions of player
                document.getElementById("actionsPlayer" + key).addEventListener("click", function() {
                    if (openMenu) {
                        openMenu.open = false;
                    }
                    Object.keys(server.actions.playerActions).forEach(function(name) {
                        // Actions to remove
                        if (name == "Add to whitelist" && window.server.players[key].whitelisted) return;
                        if (name == "Remove from whitelist" && !window.server.players[key].whitelisted) return;
                        if (name == "OP" && window.server.players[key].op) return;
                        if (name == "DeOP" && !window.server.players[key].op) return;
                        // Adding action
                        var nameAsId = name.replace(/ /g, "_");
                        document.getElementById("menuActionsPlayer" + key + "List").innerHTML += `
                     <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="managePlayer${key}Action${nameAsId}">
                         ${name}
                     </li>`;
                        new mdc.ripple.MDCRipple(document.getElementById(`managePlayer${key}Action${nameAsId}`));
                        document.getElementById(`managePlayer${key}Action${nameAsId}`)
                            .setAttribute("cmd", server.actions.playerActions[name])
                            .setAttribute("player", key)
                            .addEventListener("click", function() {
                                window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.player), this.innerHTML, server.players[this.player]));
                            });
                    });
                    document.getElementById("menuActionsPlayer" + key).MDCMenu.open = true;
                });
                // Adding player's attribute
                if (server.players[key].op) document.getElementById(`managePlayer${key}Props`).innerHTML += "<i class='material-icons'>build</i>";
                if (server.players[key].whitelisted) document.getElementById(`managePlayer${key}Props`).innerHTML += "<i class='material-icons'>verified_user</i>";
            }
        });
    }
});


/**
 * Asks the user a value in a command
 * 
 * @param {String} command
 * @param {String} name
 * @param {String} player
 */
function parseAsk(command, name, player) {
    var num = 1;
    while (command.match(/\%a/g)) {
        command = command.replace("%a",
            customPrompt("Action '" + name + "' on player asks you for mutiple values in command<br>\n" + command.replace("%a", "<b>(?)</b>").replace(/\%a/, "(?)")));
    }
}
/**
 * Prompts the user
 * 
 * @param {String} message
 */
function customPrompt(message) {
    return prompt(message); // TODO, custom prompt
}