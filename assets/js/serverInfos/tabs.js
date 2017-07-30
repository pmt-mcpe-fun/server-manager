/**
 * tabs.js - Makes tabs active.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

document.querySelectorAll(".mdc-tab").forEach(function(elem) {
    elem.addEventListener("click", function() {

        switchTab(this.getAttribute("data-go-tab"));
    });
});
var leaving = false;
var start;
window.addEventListener('beforeunload', function(event) {
    document.querySelector(".mdc-tab-bar").classList.add("leave");
    if (!leaving) {
        start = new Date().getTime();
        setTimeout(function() {
            location.replace("serverPicker.html");
        }, 351)
    }
    leaving = true;
    if ((new Date().getTime() - start) <= 350) {
        console.log("Leaving... " + leaving + "  " + (new Date().getTime() - start));
        event.returnValue = "";
    }
});
// Buttons in menu
document.querySelectorAll(".goToPlayers").forEach(function(elem) {
    elem.addEventListener("click", function() {
        window.tabBar.activeTabIndex = 1;
        switchTab("players");
    });
});
document.querySelectorAll(".goToManage").forEach(function(elem) {
    elem.addEventListener("click", function() {
        window.tabBar.activeTabIndex = 0;
        switchTab("main");
    });
});
document.querySelectorAll(".goToWorlds").forEach(function(elem) {
    elem.addEventListener("click", function() {
        window.tabBar.activeTabIndex = 2;
        switchTab("levels");
    });
});
document.querySelectorAll(".goToPlugins").forEach(function(elem) {
    elem.addEventListener("click", function() {
        window.tabBar.activeTabIndex = 3;
        switchTab("plugins");
    });
});

function switchTab(tabName) {
    var goTab = document.querySelector('data-tab[data-tab-id="' + tabName + '"]');
    console.log("Going to " + goTab.getAttribute("data-tab-id"), goTab);
    document.querySelector(".mdc-tab.mdc-tab--active").classList.remove("mdc-tab--active");
    document.querySelector(".mdc-tab[data-go-tab=\"" + tabName + "\"]").classList.add("mdc-tab--active");
    if (goTab && !goTab.classList.contains("active")) {
        document.querySelector('data-tab.active').classList.remove("active"); // Removes the old one
        goTab.classList.add("active"); // Shows the new one
    }
}