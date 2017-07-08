/**
 * index.js - Makes Pocketmine Server Manager main page
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('ping', (event, arg) => {
    console.log(arg) // prints "pong"
});


window.addEventListener("load", function() {
    const main = require(__dirname + '/main.js');
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

    // document.getElementById("main-logo").addEventListener("click", function(event){
    // 	document.getElementById("frame").src = "serverPicker.html";
    // 	document.getElementById("frame").contentWindow.location = "serverPicker.html";
    // 	document.getElementById("frame").contentWindow.location.reload();
    // 	console.log("Reloading frame");
    // })


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

    /**
     * Add Server Dialog
     */
    var addServerOpen = document.getElementById("addServerOpen");
    var addServerOpen2 = document.getElementById("footerAddServer");
    var addServerDialog = document.getElementById("createServerDialog").MDCDialog;
    var addServerForm = document.getElementById("addServerForm");

    /**
     * Opening buttons
     */
    addServerOpen.addEventListener('click', function(evt) {
        addServerDialog.lastFocusedTarget = evt.target;
        addServerDialog.show();
    });
    addServerOpen2.addEventListener('click', function(evt) {
        addServerDialog.lastFocusedTarget = evt.target;
        addServerDialog.show();
    });

    /**
     * Closing buttons
     */
    addServerDialog.listen('MDCDialog:accept', function() {
        if (!document.getElementById("serverName").value.match(/^[\w\-._]+$/)) {
            main.snackbar("Please enter a server name only with alphanumerical\n, dots (.), underscores (_)\nand hyphens (-) caracters.");
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