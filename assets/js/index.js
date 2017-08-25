/**
 * index.js - Makes Pocketmine Server Manager main page
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const fs = require('fs');
const path = require('path');
const { remote, ipcRenderer } = require("electron");
const mdc = require("material-components-web/dist/material-components-web");
const rq = require('electron-require');
const main = rq('./js/main.js');


window.addEventListener("load", function() {
    mdc.autoInit();
    window.main = main;
    /**
     * Adding frame changing API
     */
    document.getElementById("frame").addEventListener("load", function(event) {
        if (document.getElementById("frame").contentWindow.location.pathname.indexOf("serverPicker.html") > 0) {
            document.getElementById("main-logo").childNodes[0].innerHTML = "home";
            document.getElementById("main-logo").setAttribute("href", "serverPicker.html#");
            document.getElementById("main-logo").classList.add("unclickable");
        } else {
            document.getElementById("main-logo").childNodes[0].innerHTML = "navigate_before";
            document.getElementById("main-logo").setAttribute("href", "serverPicker.html");
            document.getElementById("main-logo").classList.remove("unclickable");
        }
    });


    /**
     * Buttons managing window (fullscreen, minimize, close window)
     */
    document.getElementById("fullscreenBtn").addEventListener("click", function() {
        if (remote.getCurrentWindow().isMaximized()) {
            remote.getCurrentWindow().unmaximize();
            this.innerHTML = "fullscreen";
        } else {
            remote.getCurrentWindow().maximize();
            this.innerHTML = "fullscreen_exit";
        }
    });
    document.getElementById("minimizeBtn").addEventListener("click", function() {
        remote.getCurrentWindow().minimize();
    });
    document.getElementById("closeBtn").addEventListener("click", function() {
        if (!localStorage.getItem("alreadyWarned")) {
            remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                type: "info",
                buttons: ["OK"],
                title: "Background running",
                message: `Closing the window will not stop your servers, letting them run in the background with the app.\r\n\r\nIf you want to close the app when all your servers are stopped, relaunch the window (relaunching the app), right click and click 'Exit Pocketmine Server Manager'.`,
                checkboxLabel: "Do not show again"
            }, function(response, checked) {
                if (checked) localStorage.setItem("alreadyWarned", true);
                remote.getCurrentWindow().close();
            })
        } else {
            remote.getCurrentWindow().close();
        }
    });



    /**
     * Making menu
     */
    var menu = new mdc.menu.MDCSimpleMenu(document.querySelector('.mdc-simple-menu'));
    // Add event listener to some button to toggle the menu on and off.
    document.querySelector('#open_menu').addEventListener('click', function() {
        menu.open = !menu.open
    });


    // Exiting
    document.getElementById("exitPSM").addEventListener("click", main.exit);
    // Modifying servers
    document.getElementById("modifyServerBtn").addEventListener('click', function(evt) {
        document.getElementById("frame").contentWindow.document.querySelectorAll(".removeServerBtn").forEach(function(elem) {
            elem.classList.toggle("shown");
            elem.classList.toggle("hidden");
        })
    });

    /**
     * Add Server Dialog
     */
    var addServerOpen = document.getElementById("addServerOpen");
    var addServerDialog = document.getElementById("createServerDialog").MDCDialog;
    var addServerForm = document.getElementById("addServerForm");

    /**
     * Versions field
     */
    setInterval(function() {
        if (!addServerDialog.open) {
            document.getElementById("versionList").innerHTML = `<li class="mdc-list-item" role="option" id="supported" aria-disabled="true">
                Supported MCPE Version
            </li>`;
            document.getElementById("basedText").innerHTML = "Supported MCPE version";
            var versions = Object.keys(JSON.parse(fs.readFileSync(path.join(ipcRenderer.sendSync("getVar", "appFolder"), "versions.json"))).pharsVersion);
            versions.forEach(function(version) {
                document.getElementById("versionList").innerHTML += `
                <li class="mdc-list-item" role="option" id="${version}" tabindex="0">
                    ${version}
                </li>`;
            });
            new mdc.select.MDCSelect(document.querySelector(".mdc-select"));
        }
    }, 1000);

    /**
     * Opening buttons
     */
    addServerOpen.addEventListener('click', function(evt) {
        addServerDialog.lastFocusedTarget = evt.target;
        addServerDialog.show();
    });

    /**
     * Closing buttons
     */
    addServerDialog.listen('MDCDialog:accept', function() {
        if (!document.getElementById("serverName").value.match(/^[\w\-._]+$/)) {
            main.snackbar("Please enter a server name only with alphanumerical" + os.EOL + ", dots (.), underscores (_)" + os.EOL + "and hyphens (-) caracters.");
            return false;
        }
        if (main.selects[0].value <= 0.1) {
            main.snackbar("Please select a valid MCPE version");
            return false;
        }
        main.createPMServer(document.getElementById("serverName").value, document.getElementById("serverPort").value, main.selects[0].value);
        resetForm(addServerForm);
        document.getElementById("serverPort").value = 19132 + fs.readdirSync(ipcRenderer.sendSync("getVar", "serverFolder")).length;
        addServerDialog.close();
    })
    addServerDialog.listen('MDCDialog:cancel', function() {});
    var hey = ipcRenderer.sendSync("getVar", "serverFolder");
    document.getElementById("serverPort").value = 19132 + fs.readdirSync(hey).length;

    /**
     * Clears an HTML form
     * 
     * @param {HTMLElement} form 
     */
    function resetForm(form) {
        // clearing inputs
        var inputs = form.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            switch (inputs[i].type) {
                // case 'hidden':
                case 'text':
                    inputs[i].value = '';
                    break;
                case 'radio':
                case 'checkbox':
                    inputs[i].checked = false;
            }
        }

        // clearing selects
        main.selects.forEach(function(sel) {
            sel.selectedIndex = 0;
        })
    }
});