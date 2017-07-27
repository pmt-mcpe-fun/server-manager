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
        var goTab = document.querySelector('data-tab[data-tab-id="' + this.getAttribute("data-go-tab") + '"]');
        console.log("Going to " + this.getAttribute("data-go-tab"), goTab);
        if (goTab && !goTab.classList.contains("active")) {
            document.querySelector('data-tab.active').classList.remove("active"); // Removes the old one
            goTab.classList.add("active"); // Shows the new one
        }
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