/**
 * managePlayers.js - JS File for players managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var MDCMenu = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsLevel`)); // Defining real menu;
window.serverCallbacks.push(function(server) {
    var playersList = document.getElementById("managePlayersList").children;
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
            key = server.players[key].name;
            if (!document.getElementById(`managePlayer${key}`)) {
                document.getElementById("managePlayersList").innerHTML += `
                <li class="mdc-list-item" id="managePlayer${key}">
                    <span id="managePlayer${key}Props" class=" mdc-list-item__start-detail">
                        <i class='material-icons'>person</i>
    		        </span>
                    <span class="mdc-list-item__text">
    		            ${key}
                    </span>
                    <span class="mdc-list-item__end-detail">
                        <i class="material-icons" id="actionsPlayer${key}">more_vert</i>
                    </span>
                </li>`;
                mdc.ripple.MDCRipple.attachTo(document.getElementById("managePlayer" + key));
                // Adding actions of player
                document.getElementById("actionsPlayer" + key).addEventListener("click", function() {
                    Object.keys(server.actions.playerActions).forEach(function(name) {
                        document.getElementById("menuActionsPlayerList").innerHTML = "";
                        // Actions to remove
                        if (name == "Add to whitelist" && window.server.players[key].whitelisted) return;
                        if (name == "Remove from whitelist" && !window.server.players[key].whitelisted) return;
                        if (name == "OP" && window.server.players[key].op) return;
                        if (name == "DeOP" && !window.server.players[key].op) return;
                        // Adding action
                        var nameAsId = name.replace(/ /g, "_");
                        document.getElementById("menuActionsPlayerList").innerHTML += `
                     <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" role="menuitem" tabindex="0" id="managePlayer${key}Action${nameAsId}">
                         ${name}
                     </li>`;
                        mdc.ripple.MDCRipple.attachTo(document.getElementById(`managePlayer${key}Action${nameAsId}`));
                        document.getElementById(`managePlayer${key}Action${nameAsId}`).setAttribute("cmd", server.actions.playerActions[name])
                        document.getElementById(`managePlayer${key}Action${nameAsId}`).setAttribute("player", key)
                        document.getElementById(`managePlayer${key}Action${nameAsId}`).addEventListener("click", function() {
                            window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.player), this.innerHTML, server.players[this.player]));
                        });
                    });
                    document.getElementById("menuActionsPlayerList").innerHTML += `
                    <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" role="menuitem" tabindex="0" id="managePlayer${key}ActionRemoveData">
                        Remove Player data
                    </li>`;
                    mdc.ripple.MDCRipple.attachTo(document.getElementById(`managePlayer${key}ActionRemoveData`));
                    document.getElementById(`managePlayer${key}ActionRemoveData`)
                        .addEventListener("click", function() {
                            if (fs.existsSync(path.join(require("electron").ipcRenderer.sendSync("getVar", "appFolder"), "servers", server.name, "players", key + ".dat"))) { // Removing data folder / DevTools plugins based folder
                                if (confirm("Do you want to remove " + key + "'s data?")) { // Prompt to remove data if data.
                                    fs.unlinkSync(path.join(require("electron").ipcRenderer.sendSync("getVar", "appFolder"), "servers", server.name, "players", key + ".dat"));
                                    top.main.snackbar("Successfully removed " + key + "'s data !\nRestart your server to apply changes.");
                                }
                            } else {
                                top.main.snackbar("Player '" + key + "' doesn't have any data.");
                            }
                        });
                    MDCMenu = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsPlayer`));
                    document.getElementById("menuActionsPlayer").style.left = event.clientX + 'px';
                    document.getElementById("menuActionsPlayer").style.top = event.clientY + 'px';
                    MDCMenu.open = true;
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