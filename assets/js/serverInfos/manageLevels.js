/**
 * manageLevels.js - JS File for levels managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var openMenu = undefined;
var levelAddGeneratorSelect;
window.serverCallbacks.push(function(server) {
    var levelsList = document.getElementById("manageLevelsList").children;
    for (var i = 0; i < levelsList.length; i++) {
        if (!server.levels[levelsList[i].id.substring(11)]) {
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
                    <i class='material-icons'>public</i>
    		    </span>
                <span class="mdc-list-item__text">
    		        ${key}
                </span>
                <span class="mdc-list-item__end-detail">
                    <i class="material-icons" id="actionsLevel${key}">more_vert</i>
                    <div class="mdc-simple-menu mdc-simple-menu--open-from-top-right" style="position: absolute" id="menuActionsLevel${key}" tabindex="-1">
                        <ul class="mdc-simple-menu__items mdc-list" id="menuActionsLevel${key}List" role="menu" aria-hidden="true">
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
                     <li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" role="menuitem" tabindex="0" id="manageLevel${key}Action${nameAsId}">
                         ${name}
                     </li>`;
                        new mdc.ripple.MDCRipple(document.getElementById(`manageLevel${key}Action${nameAsId}`));
                        document.getElementById(`manageLevel${key}Action${nameAsId}`).setAttribute("cmd", server.actions.levelActions[name])
                        document.getElementById(`manageLevel${key}Action${nameAsId}`).setAttribute("level", key)
                        document.getElementById(`manageLevel${key}Action${nameAsId}`).addEventListener("click", function() {
                            window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.level), this.innerHTML, server.levels[this.level]));
                        });
                    });
                    document.getElementById("menuActionsLevel" + key).MDCMenu.open = true;
                    openMenu = document.getElementById("menuActionsLevel" + key).MDCMenu;
                });
                // Adding level's attribute
                if (server.levels[key].loaded) document.getElementById(`manageLevel${key}Props`).innerHTML += "<i class='material-icons'>done</i>";
            }
        });
    }
    if (!document.getElementById("levelAddDialog").MDCDialog.open) {
        document.getElementById("levelAddGeneratorList").innerHTML = `<li class="mdc-list-item" role="option" aria-disabled="true">
                Normal
            </li>`;
        document.getElementById("levelAddGeneratorDefaultText").innerHTML = "Normal";
        Object.keys(server.generators).forEach(function(name) {
            document.getElementById("levelAddGeneratorList").innerHTML += `
                <li class="mdc-list-item" role="option" tabindex="0">
                    ${name}
                </li>`;
        });
        levelAddGeneratorSelect = new mdc.select.MDCSelect(document.getElementById("levelAddGeneratorSelect"));
    }
});




document.getElementById("levelAddDialog").MDCDialog = new mdc.dialog.MDCDialog(document.getElementById("levelAddDialog"));

document.getElementById("addLevelBtn").addEventListener("click", function(event) {
    document.getElementById("levelAddName").value = "";
    document.getElementById("levelAddName").parentElement.children[1].classList.remove("mdc-textfield__label--float-above");
    document.getElementById("levelAddSeed").value = require("crypto").createHash("sha256").update(
        Math.random() * 100000000 * require("electron").remote.process.pid +
        require("electron").remote.process.getProcessMemoryInfo() - require("electron").remote.process.getCPUUsage() +
        "").digest("hex");
    levelAddGeneratorSelect.selectedIndex = 0;
    document.getElementById("levelAddDialog").MDCDialog.show();
});
document.getElementById("addLevelLC").addEventListener("click", function(event) {
    document.getElementById("levelAddName").value = "";
    document.getElementById("levelAddName").parentElement.children[1].classList.remove("mdc-textfield__label--float-above");
    document.getElementById("levelAddSeed").value = require("crypto").createHash("sha256").update(
        Math.random() * 100000000 * require("electron").remote.process.pid +
        require("electron").remote.process.getProcessMemoryInfo() - require("electron").remote.process.getCPUUsage()
    ).digest("hex");
    levelAddGeneratorSelect.selectedIndex = 0;
    document.getElementById("levelAddDialog").MDCDialog.show();
});
// Adding level confirmation
document.getElementById("levelAddConfirm").addEventListener("click", function() {
    if (document.getElementById("levelAddName").value.length > 1) {
        var cmd = ("psmcoreactplugin createlevel4psm " +
            document.getElementById("levelAddName").value + " " +
            levelAddGeneratorSelect.value.toLowerCase() + " " +
            require("buffer").Buffer.from(
                document.getElementById("levelAddSeed").value.toString(), "utf8"
            ).toString("hex").replace(/[^0-9]/g, parseInt(Math.random() * 10))).replace(/\r|\n/g, "");
        server.commands.push(cmd);
        ipcRenderer.send("setServer", window.server);
        top.main.snackbar("Generating level " + document.getElementById("levelAddName").value + "...");
    } else {
        top.main.snackbar("Please enter a name for your new level.");
    }
})