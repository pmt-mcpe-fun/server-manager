/**
 * ui.js - UI changing related file
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var consoleUI = `
<div class="half" id="dataConsoleHalf">
    <!-- Right tab -->
    <h1 class="mdc-typography--display1">Console</h1>
    <div class="console">
        <p id="consoleContent" class="mdc-typography--body1"></p>
    </div>
    <div class="inline" id="commandHolder">
        <span class="material-icons">navigate_next</span>
        <input type="text" id="commandEnter" class="mdc-textfield__input inner" placeholder="Type a command...">
    </div>
</div>`;

// Style when the window is too small to display all the content
var styleTooSmall = `
data-tab {
    overflow: scroll !important;
}
.mdc-tab__icon-text {
    display: none !important;
}
.mdc-tab {
    min-width: 24px !important;
}
`



// MDC Installation
document.querySelectorAll(".mdc-textfield").forEach(function(elem) {
    new mdc.textfield.MDCTextfield(elem);
});
window.tabBar = new mdc.tabs.MDCTabBar(document.querySelector('.mdc-tab-bar'));

var uiResize = () => {
    if (window.innerHeight < 495 || window.innerWidth < 540) {
        if (document.getElementById("dataConsoleHalf")) document.getElementById("dataConsoleHalf").remove();
        document.getElementById("customStyle").innerHTML = styleTooSmall;
        // Tab adding
        document.getElementById("data-tab-console").style.display = "table-cell";
    } else {
        if (!document.getElementById("dataConsoleHalf")) {
            document.querySelector(`data-tab[data-tab-id="main"]`).innerHTML += consoleUI;
            document.getElementById("commandEnter").addEventListener("keypress", window.enterCommand);
        }
        document.getElementById("customStyle").innerHTML = "";
        // Tab removing
        document.getElementById(`data-tab-console`).style.display = "none";
    }
    if (window.server) define(window.server);
    mdc.autoInit(document, () => {});
    window.tabBar = new mdc.tabs.MDCTabBar(document.getElementById('tab-bar'));
}

uiResize();
window.addEventListener("resize", uiResize);