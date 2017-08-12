/**
 * github.js - Github plugin provider.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

// Please note type def plugin only uses the useful infos for PSM.
// Some may need to look at extended plugin description.
/**
 * @typedef {Object} GithubPluginYML
 * @property {String} name The name of a plugin
 * @property {String[]|String} api The api(s) supported by the plugin
 * @property {String} version The version of the plugin.
 * @property {String} main The main file of the plugin.
 * @property {String} [author] (Optional) The author of the plugin
 * @property {String[]} [authors] (Optional) The authors of the plugin
 * @property {Object} [commands] (Optional) The commands of the plugin
 * @property {Object} [permissions] (Optional) The permissions of the plugin
 * @property {String} [website] The website of the plugin
 */

/**
 * @typedef GithubRepo
 * @property {String} name
 * @property {String} full_name
 * @property {Object} owner
 * @property {String} description
 * @property {number} stargazers_count
 * @property {number} open_issues_count
 * @property {String} default_branch
 */

/**
 * @typedef {Object} Plugin
 * @property {GithubPluginYML} infos
 * @property {GithubRepo} repo_data
 * @property {String} repo_author
 * @property {String} repo_name
 * @property {License} license
 */



var http = require("https");
var mdc = require('material-components-web/dist/material-components-web');
const { URL, URLSearchParams } = require("url");
// var rq = require('electron-require');
/** @type {../lib/version.js} */
var version = rq.lib("version.js");
var license = rq.lib("license.js");
var readmeLib = rq.lib("readme.js");
const jsyaml = require("js-yaml");

const PLUGIN_TAGS_COLORS = {
    outdated: "red",
    "10stars": "dark_blue", // > 10 Stars
    "50stars": "blue", // > 50 Starts
    "100stars": "light_blue", // > 100 Stars
    "3issues": "yellow", // > 3 Issues
    "10issues": "orange", // > 10 issues
    "20issues": "red", // > 20 issues
}

window.pluginProviders.Github = {
    plugins: [],

    /**
     * Shows the main github search.
     */
    listPlugins: function() {
        window.currentProvider = "Github";
        document.getElementById("pluginAddDialogBody").innerHTML = `
            <center><h1>Search Github for a plugin</h1><br>
            <span class="search"><i class="material-icons">search</i>
                <div class="mdc-textfield mdc-textfield--upgraded" id="githubSearchTF">
                    <input type="text" id="githubPluginSeach" class="mdc-textfield__input" pattern="^[\w\-\._]+$" />
                    <label class="mdc-textfield__label" for="githubPluginSeach">Search a plugin...</label>
                </div></span>
            </span></center>`;
        mdc.textfield.MDCTextfield.attachTo(document.getElementById("githubSearchTF"));
        document.getElementById("githubPluginSearch").addEventListener("keypress", function(ev) {
            this.searchPlugin(this.value + ev.char);
        });
    },



    searchPlugin: function(pluginName) {
        document.getElementById("pluginAddDialogBody").innerHTML = `
            <div role="progressbar" 
            class="mdc-linear-progress mdc-linear-progress--indeterminate mdc-linear-progress--accent mdc-elevation--z10" 
            id="pluginAddDialogLoading" style="border-radius: 200px;">
                <!--<div class="mdc-linear-progress__buffering-dots"></div>
                <div class="mdc-linear-progress__buffer"></div>-->
                <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                    <span class="mdc-linear-progress__bar-inner"></span>
                </div>
                <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                    <span class="mdc-linear-progress__bar-inner"></span>
                </div>
            </div>`;
        get("https://api.github.com/search/repositories/?q=" + encodeURIComponent(pluginName).replace(/ /g, "+") + "+language:php", function(data) {
            data.item.forEach(function(pluginRepo) {
                var options = {
                    headers: {
                        "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester"
                    },
                    hostname: "raw.githubusercontent.com",
                    path: "/repos/" + pluginRepo.full_name + "/" + pluginRepo.default_branch + "/plugin.yml"
                }
                options.path = url.pathname;
                var resData = "";
                http.get(options, function(response) {
                    if (response.statusCode == 302 || response.statusCode == 301) {
                        return get(response.headers['location'], dest, cb);
                    }

                    var statusCode = response.statusCode;

                    var error;
                    if (statusCode !== 200 && statusCode !== 404) {
                        readmeLib.getRateLimitReset(function(data) {
                            if (data.resources.search.remaining == 0) { // No more remaining tokens
                                var date = Date.now() / 1000;
                                var date2 = data.resources.core.reset;
                                var minutesRemaining = (date2 - date) / 60
                                minutesRemaining = Math.round(minutesRemaining)
                                cb("You searched too much plugins on github and now you'll need to wait " + minutesRemaining + " minutes before researching some plugins again.");
                            }
                        });
                    }
                    if (statusCode == 404) delete data.items[index];

                    response.on('data', function(chunk) {
                        resData += chunk.toString();
                    });

                    response.on('end', () => {
                        if (statusCode == 200) {
                            license.getLicenseFromGH(pluginRepo.full_name.split("/")[0], pluginRepo.full_name.split("/")[1], function(licenseObj) {
                                window.pluginProviders.Github.plugins.push({
                                    infos: jsyaml.safeLoad(resData),
                                    repo_data: pluginRepo,
                                    repo_author: pluginRepo.full_name.split("/")[0],
                                    repo_name: pluginRepo.full_name.split("/")[1],
                                    license: licenseObj
                                });
                                if (index == data.length - 1) {
                                    window.pluginProviders.Github.displayPlugins(pluginName);
                                }
                            })
                        }
                    });
                }).on('error', function(error) {
                    document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Github: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
                    console.log(error);
                });
            })
        })
    },


    /**
     * Gets plugins from github API.
     * 
     * @param {String} urlStr The url to get
     * @param {Function} cb
     * @return {Plugin[]}
     */
    get: function(urlStr, cb) {
        var JSONData = '';
        var options = {
            headers: {
                "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester"
            }
        }
        var url = new URL(urlStr);
        options.hostname = url.hostname;
        options.path = url.pathname;
        http.get(options, function(response) {
            if (response.statusCode == 302 || response.statusCode == 301) {
                return get(response.headers['location'], dest, cb);
            }

            var statusCode = response.statusCode;
            var contentType = response.headers['content-type'];

            var error;
            if (statusCode !== 200) {
                readmeLib.getRateLimitReset(function(data) {
                    if (data.resources.search.remaining == 0) { // No more remaining tokens
                        var date = Date.now() / 1000;
                        var date2 = data.resources.core.reset;
                        var minutesRemaining = (date2 - date) / 60
                        minutesRemaining = Math.round(minutesRemaining)
                        cb("You searched too much plugins on github and now you'll need to wait " + minutesRemaining + " minutes before researching some plugins again.");
                    }
                });
            }
            response.on('data', function(chunk) {
                JSONData += chunk.toString();
            });
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(JSONData);
                    console.log(parsedData);
                    cb.apply(window.pluginProviders.github, [parsedData]);
                } catch (error) {
                    document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Github: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
                    console.log(error);
                }
            });
        }).on('error', function(error) {
            document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Github: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
            console.log(error);
        });
    },


    /**
     * Displays the plugins from search
     * 
     * @param {String} searchPluginName
     */
    displayPlugins: function(searchPluginName) {
        // Adapted from PMT Web source
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var api = /const API_VERSION = "(.+)";/.exec(xhttp.responseText);
                document.getElementById("pluginAddDialogBody").innerHTML = `
                <div class="inline">
                    <img src="https://github.com/fluidicon.png" />
                    <span class="search inline"><i class="material-icons">search</i>
                        <div class="mdc-textfield mdc-textfield--upgraded" id="githubSearchTF">
                            <input type="text" id="githubPluginSeach" class="mdc-textfield__input" pattern="^[\w\-\._]+$" />
                            <label class="mdc-textfield__label mdc-textfield__label--float-above" for="githubPluginSeach">Search a plugin...</label>
                        </div></span>
                    </span></center>
                </div><br>
                <ul id="githubPluginList" class="mdc-list mdc-list--two-line"></ul>`;
                this.plugins.forEach(function(key) {
                    var plugin = window.pluginProviders.plugins[key];
                    document.getElementById("githubPluginList").innerHTML += `
                    <li class="mdc-list-item mdc-list-item mdc-ripple-surface" id="githubPlugin${plugin.infos.name}" 
                    data-index="${key}"
                    data-name="${plugin.infos.name}"
                    data-version="${plugin.infos.version}"
                    data-tagline="${plugin.infos.description}">
                        <span class="mdc-list-item__text">
                            <span class="inline">
                                <span id="githubPlugin${plugin.infos.name}Tags">
                                </span>
                                &nbsp;
                                &nbsp;
                                ${plugin.infos.name}
                            </span>
                            <span class="mdc-list-item__text__secondary">
                                ${plugin.infos.description} - Author: ${plugin.infos.author}
                            </span>
                        </span>
                        <button class="mdc-list-item__end-detail mdc-button mdc-button--raised inline githubView" id="githubPlugin${plugin.infos.name}ViewBtn" 
                        onclick="window.pluginProviders.Github.displayPluginInfos(window.pluginProviders.Github.plugins['${plugin.infos.name}']);">
                            View&nbsp;
                            <i class="material-icons">pageview</i>
                        </button>
                    </li>`;
                    if (plugin.infos.api instanceof String) {
                        if (plugins.infos.api !== api) document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS.outdated}">
                            Outdated
                        </span>`;
                    } else if (plugin.infos.api instanceof Array) {
                        if (plugins.infos.api.indexOf(api) == -1) document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS.outdated}">
                            Outdated
                        </span>`;
                    } else {
                        document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS.outdated}">
                            Outdated
                        </span>`;
                    }
                    if (plugin.repo_data.stargazers_count > 100) {
                        document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS["100stars"]}">
                            > 100 stars
                        </span>`;
                    } else if (plugin.repo_data.open_issues_count > 50) {
                        document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS["50stars"]}">
                            > 50 stars
                        </span>`;
                    } else if (plugin.repo_data.open_issues_count > 10) {
                        document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS["10stars"]}">
                            > 10 stars
                        </span>`;
                    }
                    if (plugin.repo_data.open_issues_count > 20) {
                        document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS["20issues"]}">
                            > 20 issues
                        </span>`;
                    } else if (plugin.repo_data.open_issues_count > 10) {
                        document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS["10issues"]}">
                            > 10 issues
                        </span>`;
                    } else if (plugin.repo_data.open_issues_count > 3) {
                        document.getElementById(`githubPlugin${plugin.infos.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS["3issues"]}">
                            > 3 issues
                        </span>`;
                    }
                });
            }
        };
        xhttp.open("GET", "https://raw.githubusercontent.com/pmmp/PocketMine-MP/master/src/pocketmine/PocketMine.php", true);
        xhttp.send();
    }
}