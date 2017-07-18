/**
 * whitelist.js - Everything related to whitelist editing of PSM app.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

var players = [""];
var wlPath = "";

window.serverCallbacks.push(function(server) {
    wlPath = path.join(ipcRenderer.sendSync("getVar", "serverFolder"), server.name, "white-list.txt");
    setInterval(function() {
        if (fs.existsSync(wlPath)) {
            fs.readFile(wlPath, function(err, data) {
                players = data.split(os.EOL);
            })
        }
    })
    document.getElementById("EditWhitelistBtn").addEventListener("click", function() {
        document.getElementById("whiteListPlayers").innerHTML = "";
        players.forEach(function(player) {
            document.getElementById("whiteListPlayers").innerHTML += `<li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="whiteList${player}">
    		<i class="material-icons mdc-list-item__start-detail" style="color: red;" onclick="removePlayerFromWL('${player}');event.stopPropagation();">
      			remove_circle
    		</i>
            <span class="mdc-list-item__text">
    		    ${player}
            </span>
          </li>`;
            new mdc.ripple.MDCRipple(document.getElementById(`whiteList${player}`));
            document.getElementById("editWhitelist").MDCDialog.show();
        });
    })
});



/**
 * Removes a player from the whitelist
 * @param {string} playerName 
 */
function removePlayerFromWL(playerName) {
    if (players.indexOf(playerName)) {
        delete players[players.indexOf(playerName)];
        fs.writeFile(wlPath, players.join(os.EOL), function(e) {
            if (e) {
                min.snackbar(`Could not remove ${playerName} from whitelist.`);
            } else {
                if (window.server) {
                    window.server.commands.push(`whitelist remove ${playerName}`);
                }
            }
        });
    }
}