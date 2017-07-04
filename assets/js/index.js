/**
 * index.js - Makes Pocketmine Server Manager main page
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

const fs = require('fs');
const main = require(__dirname + '/main.js');

window.addEventListener("load", function () {
	/**
	 * Adding frame changing API
	 */
	document.getElementById("frame").addEventListener("load", function (event) {
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
	document.querySelector('#open_menu')
		.addEventListener('click', function() { 
			menu.open = !menu.open
			this.toggle();
		});

	/**
	 * Add Server Dialog buttons
	 */
	var addServerOpen = document.getElementById("addServerOpen");
	var addServerOpen2 = document.getElementById("footerAddServer");
	var addServerClose = document.getElementById("addServerClose");
	var addServerDialog = document.getElementById("createServerDialog");
	var addServerForm = document.getElementById("addServerForm");
	addServerOpen.addEventListener('click', function () {
		addServerDialog.showModal();
	});
	addServerOpen2.addEventListener('click', function () {
		addServerDialog.showModal();
	});
	addServerClose.addEventListener('click', function () {
		// resetForm(addServerForm);
		// document.getElementById("serverPort").value = 19132 + fs.readdirSync(window.serverFolder).length;
		addServerDialog.close();
	});
	document.getElementById("serverPort").value = 19132 + fs.readdirSync(main.serverFolder).length;

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
		var selects = form.getElementsByTagName('select');
		for (var i = 0; i < selects.length; i++)
			selects[i].selectedIndex = 0;

		// clearing textarea
		var text = form.getElementsByTagName('textarea');
		for (var i = 0; i < text.length; i++)
			text[i].innerHTML = '';

		return false;
	}
});