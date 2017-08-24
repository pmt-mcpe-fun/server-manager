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
// var rq = require('electron-require');
/** @type {../lib/version.js} */
var version = rq.lib("version.js");
var license = rq.lib("license.js");
var readmeLib = rq.lib("readme.js");
// var fs = require("fs")
// var path = require("path");
// var os = require("os");
const jsyaml = require("js-yaml");

const GITHUB_PLUGIN_TAGS_COLORS = {
    outdated: "red",
    "10stars": "cyan", // > 10 Stars
    "50stars": "blue", // > 50 Starts
    "100stars": "lightblue", // > 100 Stars
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
            <span class="search big"><i class="material-icons">search</i>
                <div class="mdc-textfield mdc-textfield--upgraded" id="githubSearchTF">
                    <input type="text" id="githubPluginSearch" class="mdc-textfield__input" />
                    <label class="mdc-textfield__label" for="githubPluginSearch">Search a plugin...</label>
                </div></span>
            </span></center>`;
        mdc.textfield.MDCTextfield.attachTo(document.getElementById("githubSearchTF"));
        document.getElementById("githubPluginSearch").addEventListener("keypress", function(ev) {
            if (ev.keyCode == 13) window.pluginProviders.Github.searchPlugin(this.value);
        });
    },



    searchPlugin: function(pluginName) {
        this.plugins = [];
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
        this.get(encodeURIComponent(pluginName).replace(/ /g, "+") + "+language:php", function(data) {
            data.items.forEach(function(pluginRepo, index) {
                var options = {
                    headers: {
                        "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester"
                    },
                    hostname: "raw.githubusercontent.com",
                    path: "/" + pluginRepo.full_name + "/" + pluginRepo.default_branch + "/plugin.yml"
                }
                var resData = "";
                var res;
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
                    if (statusCode == 404) {
                        delete data.items[index];
                        window.pluginProviders.Github.displayPlugins(pluginName); // Still displaying so if no result found, tell them.
                    }
                    res = response;
                    response.on('data', function(chunk) {
                        resData += chunk.toString();
                    });

                    response.on('end', () => {
                        if (statusCode == 200) {
                            var pluginId = window.pluginProviders.Github.plugins.length;
                            license.getLicenseFromGH(pluginRepo.full_name.split("/")[0], pluginRepo.full_name.split("/")[1], function(licenseObj) {
                                window.pluginProviders.Github.plugins[pluginId].license = licenseObj;
                            });
                            window.pluginProviders.Github.plugins.push({
                                infos: jsyaml.safeLoadAll(resData)[0],
                                repo_data: pluginRepo,
                                repo_author: pluginRepo.full_name.split("/")[0],
                                repo_name: pluginRepo.full_name.split("/")[1],
                                license: null
                            });
                            window.pluginProviders.Github.displayPlugins(pluginName);
                        } else {}
                    });
                }).on('error', function(error) {
                    if (res) res.resume();
                    document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Github: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
                    console.log(error);
                });
            });
            if (data.items.length == 0) {
                document.getElementById("pluginAddDialogBody").innerHTML = `
                <div class="inline">
                    <img src="https://github.com/fluidicon.png" style="width: 24px; height: 24px;" />
                    <span class="search inline"><i class="material-icons">search</i>
                        <div class="mdc-textfield" id="githubSearchTF">
                            <input type="text" id="githubPluginSearch" class="mdc-textfield__input" pattern="^[\\w\\-\\._]+$" value="${pluginName}" />
                        </div></span>
                    </span>
                </div><br>
                <h3>No plugin found.</h3>`;
                document.getElementById("githubPluginSearch").addEventListener("keypress", function(ev) {
                    if (ev.keyCode == 13) window.pluginProviders.Github.searchPlugin(this.value);
                });
            }
        })
    },


    /**
     * Gets plugins from github API.
     * 
     * @param {String} qstring The url to get
     * @param {Function} cb
     * @return {Plugin[]}
     */
    get: function(qstring, cb) {
        var JSONData = '';
        var options = {
            headers: {
                "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester"
            },
            hostname: "api.github.com",
            path: "/search/repositories?q=" + qstring
        }
        var res;
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
            res = response;
            response.on('data', function(chunk) {
                JSONData += chunk.toString();
            });
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(JSONData);
                    cb.apply(window.pluginProviders.github, [parsedData]);
                } catch (error) {
                    document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Github: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
                    console.log(error);
                }
            });
        }).on('error', function(error) {
            if (res) res.resume();
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
                    <img src="https://github.com/fluidicon.png" style="width: 24px; height: 24px;" />
                    <span class="search inline"><i class="material-icons">search</i>
                        <div class="mdc-textfield" id="githubSearchTF">
                            <input type="text" id="githubPluginSearch" class="mdc-textfield__input" pattern="^[\\w\\-\\._]+$" value="${searchPluginName}" />
                        </div></span>
                    </span></center>
                </div><br>
                <ul id="githubPluginList" class="mdc-list mdc-list--two-line"></ul>`;
                document.getElementById("githubPluginSearch").addEventListener("keypress", function(ev) {
                    if (ev.keyCode == 13) window.pluginProviders.Github.searchPlugin(this.value);
                });
                if (window.pluginProviders.Github.plugins.length == 0) {
                    document.getElementById("githubPluginList").innerHTML = `<li id='noPluginsFound'><h3>No plugins found for '${searchPluginName}'</h3></li>`;
                }
                window.pluginProviders.Github.plugins.forEach(function(plugin, key) {
                    if (document.getElementById("noPluginsFound")) document.getElementById("noPluginsFound").remove();
                    document.getElementById("githubPluginList").innerHTML += `
                    <li class="mdc-list-item mdc-list-item mdc-ripple-surface" id="githubPlugin${plugin.repo_data.id}" 
                    data-index="${key}"
                    data-name="${plugin.infos.name}"
                    data-version="${plugin.infos.version}"
                    data-tagline="${plugin.infos.description}">
                        <span class="mdc-list-item__text">
                            <span class="inline">
                                <span id="githubPlugin${plugin.repo_data.id}Tags">
                                </span>
                                &nbsp;
                                &nbsp;
                                ${plugin.infos.name}
                            </span>
                            <span class="mdc-list-item__text__secondary">
                                ${plugin.repo_data.description} - Author(s): ${plugin.infos.author} - Maintainer: ${plugin.repo_author}
                            </span>
                        </span>
                        <button class="mdc-list-item__end-detail mdc-button mdc-button--raised inline githubView" id="githubPlugin${plugin.repo_data.id}ViewBtn" 
                        onclick="window.pluginProviders.Github.displayPluginInfos('${key}');">
                            View&nbsp;
                            <i class="material-icons">pageview</i>
                        </button>
                    </li>`;
                    if (plugin.infos.api instanceof String) {
                        if (plugins.infos.api !== api) document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS.outdated}">
                            Outdated
                        </span>`;
                    }
                    if (plugin.infos.api instanceof Array) {
                        if (plugins.infos.api.indexOf(api) == -1) document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS.outdated}">
                            Outdated
                        </span>`;
                    }
                    if (plugin.repo_data.stargazers_count > 100) {
                        document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS["100stars"]}">
                            ${plugin.repo_data.stargazers_count} stars
                        </span>`;
                    } else {
                        if (plugin.repo_data.stargazers_count > 50) {
                            document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS["50stars"]}">
                                ${plugin.repo_data.stargazers_count} stars
                            </span>`;
                        } else {
                            if (plugin.repo_data.stargazers_count > 10) {
                                document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS["10stars"]}">
                                    ${plugin.repo_data.stargazers_count} stars
                                </span>`;
                            }
                        }
                    }
                    if (plugin.repo_data.open_issues_count > 20) {
                        document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS["20issues"]}">
                            ${plugin.repo_data.open_issues_count} issues
                        </span>`;
                    } else if (plugin.repo_data.open_issues_count > 10) {
                        document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS["10issues"]}">
                            ${plugin.repo_data.open_issues_count} issues
                        </span>`;
                    } else if (plugin.repo_data.open_issues_count > 3) {
                        document.getElementById(`githubPlugin${plugin.repo_data.id}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${GITHUB_PLUGIN_TAGS_COLORS["3issues"]}">
                            ${plugin.repo_data.open_issues_count} issues
                        </span>`;
                    }
                });
            }
        };
        xhttp.open("GET", "https://raw.githubusercontent.com/pmmp/PocketMine-MP/master/src/pocketmine/PocketMine.php", true);
        xhttp.send();
    },

    /**
     * Displays the plugin infos from it's key in plugins.
     */
    displayPluginInfos: function(key) {
        var plugin = window.pluginProviders.Github.plugins[key];
        document.getElementById("pluginInfosName").innerHTML = plugin.infos.name;
        document.getElementById("pluginInfosDesc").innerHTML = plugin.repo_data.description;
        document.getElementById("pluginInfosAuthor").innerHTML = `Author: <span style="cursor: pointer">${plugin.repo_author}</span>`;
        document.getElementById("pluginInfosAuthor").children[0].addEventListener("click", function() {
            shell.openExternal(`https://github.com/${plugin.repo_author}`);
        });
        if (plugin.license) {
            document.getElementById("pluginInfosLicense").innerHTML = `License: <span style="cursor: pointer">${plugin.license.name}</span>`;
            document.getElementById("pluginInfosLicense").children[0].addEventListener("click", function() {
                shell.openExternal(plugin.license.url);
            });
        } else {
            document.getElementById("pluginInfosLicense").innerHTML = `License: Checking...`;
        }
        // getting readme
        readmeLib.getReadmeFromGH(plugin.repo_author, plugin.repo_name, function(readme) {
            document.getElementById("pluginInfosReadMe").innerHTML = readme;
            var readmeParsed = readmeLib.parseReadme(
                document.getElementById("pluginInfosReadMe").cloneNode(true).children[0]
            );
            if (readmeParsed) {
                document.getElementById("pluginInfosReadMe").innerHTML = "";
                document.getElementById("pluginInfosReadMe").appendChild(readmeParsed); // Changing links, allowing images, ect...
            }
            // Resizing when readme is small
            if (document.getElementById("pluginInfosReadMe").offsetHeight > document.querySelector("article").offsetHeight) {
                document.getElementById("pluginInfos").style.maxHeight = window.innerHeight * 0.4 + "px";
                document.getElementById("pluginInfos").style.top = "calc(76px + 5%)";
            }
        });
        document.getElementById("pluginInfosDownloadURL").value = "https://api.github.com/repos/" + plugin.repo_author + "/" + plugin.repo_name + "/zipball/master"; // TODO: 1.5 Choose branch.
        document.getElementById("pluginInfos").classList.add("shown");
        document.getElementById("pluginInfos").classList.remove("hidden");
    },



    downloadPlugin: function(pluginUrlPath) {
        var options = {
            headers: {
                "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester"
            },
            hostname: (new URL(pluginUrlPath)).hostname,
            path: (new URL(pluginUrlPath)).pathname
        }
        top.main.snackbar("Downloading plugin...");
        var res;
        http.get(options, function(response) {
            if (response.statusCode == 302 || response.statusCode == 301) {
                response.resume();
                window.pluginProviders.Github.downloadPlugin(response.headers['location']);
            } else if (response.statusCode == 404) {
                top.main.snackbar("Plugin not found.");
            } else {
                var statusCode = response.statusCode;
                var contentType = response.headers['content-type'];
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
                res = response;
                var tmpfile = path.join(os.tmpdir(), pluginUrlPath.split("/")[3] + "." + pluginUrlPath.split("/")[4] + ".phar.zip");
                response.pipe(fs.createWriteStream(tmpfile)).on('close', () => {
                    try { // Windows
                        fs.accessSync(path.join(os.homedir(), ".pocketmine", "php", "bin", "php")); // Windows
                        phpExecutable = path.join(os.homedir(), ".pocketmine", "php", "bin", "php", "php.exe");
                    } catch (e) { // Linux & MacOS
                        phpExecutable = path.join(os.homedir(), ".pocketmine", "php", "bin", "php7", "bin", "php");
                    }
                    var pathname;
                    if (os.platform().indexOf("win") !== -1 && os.platform() !== "darwin") {
                        pathname = path.dirname(location.pathname).substr(1);
                    } else {
                        pathname = path.dirname(location.pathname);
                    }
                    require("child_process").exec(phpExecutable + " -dphar.readonly=Off " + path.join(pathname, "js", "pluginsProvider", "build.php") +
                        " --input-zip=" + tmpfile + " --tmpdir=" + os.tmpdir() + " --output-phar=" +
                        path.join(os.homedir(), ".pocketmine", "servers", window.server.name, "plugins", pluginUrlPath.split("/")[4] + ".phar"),
                        function(err, stdout, stderr) {
                            if (err) {
                                console.log(err, stdout, stderr);
                                top.window.main.snackbar("Could not export plugin " + pluginUrlPath.split("/")[4] + ".");
                            } else {
                                top.window.main.snackbar("Successfully downloaded " + pluginUrlPath.split("/")[4] + "!");
                            }
                        });
                }).on('error', function(error) {
                    if (res) res.resume();
                    document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Github: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
                    console.log(error);
                });
            }
        })
    }
}