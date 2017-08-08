/**
 * whitelist.js - Everything related to whitelist editing of PSM app.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

var players = [];
var wlPath = "";
var dialog = new mdc.dialog.MDCDialog(document.getElementById("editWhitelist"));

window.serverCallbacks.push(function (server) {
    wlPath = path.join(ipcRenderer.sendSync("getVar", "serverFolder"), server.name, "white-list.txt");
    setInterval(function () {
        if (fs.existsSync(wlPath)) {
            fs.readFile(wlPath, function (err, data) {
                if (!err) {
                    var playersCurrent = data.toString().split(os.EOL);
                    playersCurrent.forEach(function (playerName, index) {
                        if (playerName.match(/^[a-zA-Z0-9_.-]+$/)) players[index] = playerName;
                    });
                }
            })
        }
    }, 300)
});
document.getElementById("EditWhitelistBtn").addEventListener("click", function () {
    document.getElementById("whiteListPlayers").innerHTML = "";
    players.forEach(function (player) {
        document.getElementById("whiteListPlayers").innerHTML += `<li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="whiteList${player}">
    		<i class="material-icons mdc-list-item__start-detail" style="color: red;" onclick="removePlayerFromWL('${player}');this.parentElement.remove();">
      			remove_circle
    		</i>
            <span class="mdc-list-item__text">
    		    ${player}
            </span>
          </li>`;
        new mdc.ripple.MDCRipple(document.getElementById(`whiteList${player}`));
    });
    if (players.length < 1) {
        document.getElementById("whiteListPlayers").innerHTML = `<li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="noPlayer">
            <span class="mdc-list-item__text">
    		    No player is currently whitelisted on your server.
            </span>
          </li>`;
    }
    dialog.show();
})



document.getElementById("addPlayerToWLBtn").addEventListener("click", function (ev) {
    if (!document.getElementById("addPlayerWLInput")) {
        if (players.length < 1) {
            document.getElementById("whiteListPlayers").innerHTML = `<li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="addPlayerWLInputList">
    		<i class="material-icons mdc-list-item__start-detail" style="color: red;" id="removeAddPlayerWLInput">
      			remove_circle
    		</i>
            <span class="mdc-list-item__text">
                <input id="addPlayerWLInput" class="mdc-textfield__input" type="text" pattern="^[a-zA-Z0-9_.-]+$" />
            </span>
            <i class="material-icons mdc-list-item__end-detail" style="color: var(--mdc-theme-primary, green);" id="validAddPlayerWLInput">
      			done
    		</i>
          </li>`;
        } else {
            document.getElementById("whiteListPlayers").innerHTML += `<li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="addPlayerWLInputList">
    		<i class="material-icons mdc-list-item__start-detail" style="color: red;" id="removeAddPlayerWLInput">
      			remove_circle
    		</i>
            <span class="mdc-list-item__text">
                <input id="addPlayerWLInput" class="mdc-textfield__input" type="text" pattern="^[a-zA-Z0-9_.-]+$" />
            </span>
            <i class="material-icons mdc-list-item__end-detail" style="color: var(--mdc-theme-primary, green);" id="validAddPlayerWLInput">
      			done
    		</i>
          </li>`;
        }
        document.getElementById("removeAddPlayerWLInput").addEventListener("click", function () {
            document.getElementById("addPlayerWLInputList").remove();
            if (players.length < 1) {
                document.getElementById("whiteListPlayers").innerHTML = `<li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="noPlayer">
            <span class="mdc-list-item__text">
    		    No player is currently whitelisted on your server.
            </span>
          </li>`;
            }
        });
        new mdc.ripple.MDCRipple(document.getElementById(`addPlayerWLInputList`));
        var addPlayer = function () {
            var player = document.getElementById("addPlayerWLInput").value;
            if (players.indexOf(player) == -1) {
                addPlayerToWL(player);
                document.getElementById("addPlayerWLInputList").remove();
                document.getElementById("whiteListPlayers").innerHTML += `<li onclass="mdc-list-item" data-mdc-auto-init="MDCRipple" id="whiteList${player}">
    		<i class="material-icons mdc-list-item__start-detail" style="color: red;" onclick="removePlayerFromWL('${player}');this.parentElement.remove();">
      			remove_circle
    		</i>
            <span class="mdc-list-item__text">
    		    ${player}
            </span>
          </li>`
            }
        }
        document.getElementById("addPlayerWLInput").addEventListener("keydown", function (event) {
            if (event.which == 13 || event.keyCode == 13) {
                addPlayer();
                return false;
            }
            if (players.indexOf(this.value + event.char) > -1) {
                document.getElementById("validAddPlayerWLInput").setAttribute("disabled", "true");
            }
            return true;
        });
        document.getElementById("validAddPlayerWLInput").addEventListener("click", addPlayer);
    }
});



/**
 * Adds a player to the whitelist
 * @param {string} playerName 
 */
function addPlayerToWL(playerName) {
    if (players.indexOf(playerName) < 0) {
        players.push(playerName);
        fs.writeFile(wlPath, players.join(os.EOL), function (e) {
            if (e) {
                min.snackbar(`Could not add ${playerName} to the whitelist.`);
            } else {
                if (window.server) {
                    window.server.commands.push(`whitelist add ${playerName}`);
                }
            }
        });
    }
}



/**
 * Removes a player from the whitelist
 * @param {string} playerName 
 */
function removePlayerFromWL(playerName) {
    if (players.indexOf(playerName) > -1) {
        delete players[players.indexOf(playerName)];
        fs.writeFile(wlPath, players.join(os.EOL), function (e) {
            if (e) {
                main.snackbar(`Could not remove ${playerName} from whitelist.`);
            } else {
                if (window.server) {
                    window.server.commands.push(`whitelist remove ${playerName}`);
                }
            }
        });
    }
}