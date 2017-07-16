/**
 * serverInfos.js - Server Infos js file
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */


if (top) require = top.require;
const path = require('path');
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const os = require('os');
const properties = require("./js/properties.js");
const main = require('./js/main.js');
const serverF = require('./js/server.js');

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

var server;
var queuing = false; // TODO: Find a better var name.
var first = 1;

function define(serverR) {
    server = serverR;
    document.getElementById("serverName").innerHTML = server.name;
    document.getElementById("started?").innerHTML = server.isStarted ? "play_arrow" : "stop";
    document.getElementById("consoleContent").innerHTML = server.log.replace(/&/gim, "&amp;").replace(/</gim, "&lt;").replace(/>/gim, "&gt;").replace(/\n/gim, "<br>");
    if (first > 0) {
        document.querySelector(".console").scrollTop = 10000000; // Should not have a that long console pixels.
        document.getElementById("consoleContent").scrollTop = 10000000; // Should not have a that long console pixels.
        first--;
    }
}


document.getElementById("startServer").addEventListener("click", function(event) {
    server.start();
    queuing = true;
    first = 3;
});
document.getElementById("stopServer").addEventListener("click", function(event) {
    server.stop();
    queuing = true;
    first = 3;
});
document.getElementById("EditServerPropertiesBtn").addEventListener("click", function(event) {
    document.getElementById("editServerDialog").MDCDialog.show();
    //Setting elements back to default.
    document.getElementById("serverMOTD").value = server.settings["motd"];
    document.getElementById("serverPort").value = server.settings["server-port"];
    document.getElementById("maxPlayers").value = server.settings["max-players"];
    document.getElementById("editServerWhitelist?").checked = server.settings["white-list"] == "on" ? true : false;
    inputs["editServerSpawnProtection"].value = server.settings["spawn-protection"];
    // console.log(inputs["editServerSpawnProtection"]);
    inputs["editServerSpawnProtection"].root_.childNodes[3].childNodes[1].childNodes[1].innerHTML = server.settings["spawn-protection"];
    inputs["editServerViewDistance"].value = server.settings["view-distance"];
    inputs["editServerViewDistance"].root_.childNodes[3].childNodes[1].childNodes[1].innerHTML = server.settings["view-distance"];
    inputs["editServerGamemode"].selectedIndex = server.settings["gamemode"];
    document.getElementById("editServerForceDefaultGamemode").checked = server.settings["force-gamemode"] == "on" ? true : false;
    inputs["editServerDifficulty"].selectedIndex = server.settings["difficulty"];
    document.getElementById("editServerPVP").checked = server.settings["pvp"] == "on" ? true : false;
    document.getElementById("editServerHardcore").checked = server.settings["hardcore"] == "on" ? true : false;
    document.getElementById("editServerAnimals?").checked = server.settings["spawn-animals"] == "on" ? true : false;
    document.getElementById("editServerMonters?").checked = server.settings["spawn-mobs"] == "on" ? true : false;
    autoSave = document.getElementById("editServerAutoSave").checked = server.settings["auto-save"] == "on" ? true : false;

});
document.getElementById("commandEnter").addEventListener("keypress", function() {
    if (event.keyCode == 13) {
        server.commands.push(this.value);
        this.value = "";
        queuing = true;
        first = 3; //Scroll to bottom when received text
    }
})
setInterval(function() {
    if (queuing) {
        ipcRenderer.send("setServer", server);
        queuing = false;
    }
    serverF.getServer(location.hash.substr(1), define);
}, 500);

// Let's make the serveredit dialog !
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
        if (serverMOTD !== server.settings.motd) {
            server.settings["motd"] = serverMOTD;
            if (server.isStarted) server.commands.push("setmotd " + serverMOTD); // Use server->getNetwork->setName() & server->setConfigString("motd", motd)
        }
        if (serverPort !== server.settings["server-port"]) {
            server.settings["server-port"] = serverPort;
            if (server.isStarted) restart = true;
        }
        if (maxPlayers !== server.settings["max-players"]) {
            server.settings["max-players"] = maxPlayers;
            if (server.isStarted) restart = true;
        }
        if (whitelist !== server.settings["white-list"]) {
            server.settings["white-list"] = whitelist ? "on" : "off";
            if (server.isStarted) server.commands.push("whitelist " + server.settings["white-list"]);
        }
        if (viewDistance !== server.settings["view-distance"]) {
            server.settings["view-distance"] = viewDistance;
            if (server.isStarted) server.commands.push("setviewdistance " + viewDistance); // Use server->setConfigInt("view-distance", viewdistance) & foreach players ->setViewDistance(viewdistance)
        }
        if (spawnProtection !== server.settings["spawn-protection"]) {
            server.settings["spawn-protection"] = spawnProtection;
            if (server.isStarted) server.commands.push("setcfg spawn-protection " + spawnProtection);
        }
        if (defaultGamemode !== server.settings["gamemode"]) {
            server.settings["gamemode"] = defaultGamemode;
            if (server.isStarted) server.commands.push("setcfg gamemode " + defaultGamemode);
        }
        if (forceGamemode !== server.settings["force-gamemode"]) {
            server.settings["force-gamemode"] = forceGamemode ? "on" : "off";
            if (server.isStarted) server.commands.push("setcfg force-gamemode " + server.settings["force-gamemode"]);
        }
        if (difficulty !== server.settings["difficulty"]) {
            server.settings["difficulty"] = difficulty;
            if (server.isStarted) server.commands.push("difficulty " + difficulty);
        }
        if (pvp !== server.settings["pvp"]) {
            server.settings["pvp"] = pvp ? "on" : "off";
            if (server.isStarted) server.commands.push("setcfg pvp " + server.settings["pvp"]);
        }
        if (hardcore !== server.settings["hardcore"]) {
            server.settings["hardcore"] = hardcore ? "on" : "off";
            if (server.isStarted) server.commands.push("setcfg hardcore " + server.settings["hardcore"]);
        }
        if (animalsSpawning !== server.settings["spawn-animals"]) {
            server.settings["spawn-animals"] = animalsSpawning ? "on" : "off";
            if (server.isStarted) server.commands.push("setcfg spawn-animals " + server.settings["spawn-animals"]);
        }
        if (montersSpawning !== server.settings["spawn-mobs"]) {
            server.settings["spawn-mobs"] = montersSpawning ? "on" : "off";
            if (server.isStarted) server.commands.push("setcfg spawn-mobs " + server.settings["spawn-mobs"]);
        }
        queuing = true;
        main.snackbar("Saving changes...");
    }
});