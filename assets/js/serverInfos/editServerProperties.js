/**
 * editServerProperties.js - Everything related to server properties editing of PSM app.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

var inputs = {};
window.addEventListener("load", function() {
    document.querySelectorAll(".mdc-textfield").forEach(function(elem) {
        new mdc.textfield.MDCTextfield(elem);
    });
    // Server editing dialog
    document.querySelectorAll('.mdc-slider').forEach(function(elem) {
        inputs[elem.id] = new mdc.slider.MDCSlider(elem);
        elem.MDCSlider = inputs[elem.id];
        inputs[elem.id].listen("MDCSlider:input", function() {
            console.log(this.MDCSlider);
            elem.childNodes[3].childNodes[1].childNodes[1].innerHTML = this.MDCSlider.value;
        })
    });
    document.querySelectorAll('.mdc-select').forEach(function(elem) {
        inputs[elem.id] = new mdc.select.MDCSelect(elem);
    });
});


document.getElementById("EditServerPropertiesBtn").addEventListener("click", function(event) {
    document.getElementById("editServerDialog").MDCDialog.show();
    //Setting elements back to default.
    document.getElementById("serverMOTD").value = window.server.settings["motd"];
    document.getElementById("serverPort").value = window.server.settings["server-port"];
    document.getElementById("maxPlayers").value = window.server.settings["max-players"];
    document.getElementById("editServerWhitelist?").checked = window.server.settings["white-list"] == "on" ? true : false;
    inputs["editServerSpawnProtection"].value = window.server.settings["spawn-protection"];
    // console.log(inputs["editServerSpawnProtection"]);
    inputs["editServerSpawnProtection"].root_.childNodes[3].childNodes[1].childNodes[1].innerHTML = window.server.settings["spawn-protection"];
    inputs["editServerViewDistance"].value = window.server.settings["view-distance"];
    inputs["editServerViewDistance"].root_.childNodes[3].childNodes[1].childNodes[1].innerHTML = window.server.settings["view-distance"];
    inputs["editServerGamemode"].selectedIndex = "gamemode" + window.server.settings["gamemode"];
    document.getElementById("editServerForceDefaultGamemode").checked = window.server.settings["force-gamemode"] == "on" ? true : false;
    inputs["editServerDifficulty"].selectedIndex = window.server.settings["difficulty"];
    document.getElementById("editServerPVP").checked = window.server.settings["pvp"] == "on" ? true : false;
    document.getElementById("editServerHardcore").checked = window.server.settings["hardcore"] == "on" ? true : false;
    document.getElementById("editServerAnimals?").checked = window.server.settings["spawn-animals"] == "on" ? true : false;
    document.getElementById("editServerMonters?").checked = window.server.settings["spawn-mobs"] == "on" ? true : false;
    autoSave = document.getElementById("editServerAutoSave").checked = window.server.settings["auto-save"] == "on" ? true : false;
});



// Let's make the window.server edit dialog !
new mdc.dialog.MDCDialog(document.getElementById("editServerDialog")).listen('MDCDialog:accept', function() {
    if (server) {
        var serverMOTD = document.getElementById("serverMOTD").value;
        var serverPort = document.getElementById("serverPort").value;
        var maxPlayers = document.getElementById("maxPlayers").value;
        var whitelist = document.getElementById("editServerWhitelist?").checked;
        var viewDistance = inputs["editServerViewDistance"].value;
        var spawnProtection = inputs["editServerSpawnProtection"].value;
        var defaultGamemode = inputs["editServerGamemode"].value.replace("gamemode", "");
        var forceGamemode = document.getElementById("editServerForceDefaultGamemode").checked;
        var difficulty = inputs["editServerDifficulty"].value.replace("difficulty", "");
        var pvp = document.getElementById("editServerPVP").checked;
        var hardcore = document.getElementById("editServerHardcore").checked;
        var animalsSpawning = document.getElementById("editServerAnimals?").checked;
        var montersSpawning = document.getElementById("editServerMonters?").checked;
        var autoSave = document.getElementById("editServerAutoSave").checked;
        var restart = false;
        if (serverMOTD !== window.server.settings.motd) {
            window.server.settings["motd"] = serverMOTD;
            if (server.isStarted) window.server.commands.push("setmotd " + serverMOTD); // Use window.server->getNetwork->setName() & window.server->setConfigString("motd", motd)
        }
        if (serverPort !== window.server.settings["server-port"]) {
            window.server.settings["server-port"] = serverPort;
            if (server.isStarted) restart = true;
        }
        if (maxPlayers !== window.server.settings["max-players"]) {
            window.server.settings["max-players"] = maxPlayers;
            if (server.isStarted) restart = true;
        }
        if (whitelist !== window.server.settings["white-list"]) {
            window.server.settings["white-list"] = whitelist ? "on" : "off";
            if (server.isStarted) window.server.commands.push("whitelist " + window.server.settings["white-list"]);
        }
        if (viewDistance !== window.server.settings["view-distance"]) {
            window.server.settings["view-distance"] = viewDistance;
            if (server.isStarted) window.server.commands.push("setviewdistance " + viewDistance); // Use window.server->setConfigInt("view-distance", viewdistance) & foreach players ->setViewDistance(viewdistance)
        }
        if (spawnProtection !== window.server.settings["spawn-protection"]) {
            window.server.settings["spawn-protection"] = spawnProtection;
            if (server.isStarted) window.server.commands.push("setcfg spawn-protection " + spawnProtection);
        }
        if (defaultGamemode !== window.server.settings["gamemode"]) {
            window.server.settings["gamemode"] = defaultGamemode;
            if (server.isStarted) window.server.commands.push("setcfg gamemode " + defaultGamemode);
        }
        if (forceGamemode !== window.server.settings["force-gamemode"]) {
            window.server.settings["force-gamemode"] = forceGamemode ? "on" : "off";
            if (server.isStarted) window.server.commands.push("setcfg force-gamemode " + window.server.settings["force-gamemode"]);
        }
        if (difficulty !== window.server.settings["difficulty"]) {
            window.server.settings["difficulty"] = difficulty;
            if (server.isStarted) window.server.commands.push("difficulty " + difficulty);
        }
        if (pvp !== window.server.settings["pvp"]) {
            window.server.settings["pvp"] = pvp ? "on" : "off";
            if (server.isStarted) window.server.commands.push("setcfg pvp " + window.server.settings["pvp"]);
        }
        if (hardcore !== window.server.settings["hardcore"]) {
            window.server.settings["hardcore"] = hardcore ? "on" : "off";
            if (server.isStarted) window.server.commands.push("setcfg hardcore " + window.server.settings["hardcore"]);
        }
        if (animalsSpawning !== window.server.settings["spawn-animals"]) {
            window.server.settings["spawn-animals"] = animalsSpawning ? "on" : "off";
            if (server.isStarted) window.server.commands.push("setcfg spawn-animals " + window.server.settings["spawn-animals"]);
        }
        if (montersSpawning !== window.server.settings["spawn-mobs"]) {
            window.server.settings["spawn-mobs"] = montersSpawning ? "on" : "off";
            if (server.isStarted) window.server.commands.push("setcfg spawn-mobs " + window.server.settings["spawn-mobs"]);
        }
        queuing = true;
        main.snackbar("Saving changes " + (restart ? "(restart required)" : "") + "...");
    }
});