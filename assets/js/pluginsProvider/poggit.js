/**
 * poggit.js - Poggit plugin provider.
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
 * @typedef {Object} PoggitCategory
 * @property {Boolean} major Is this the main category
 * @property {String} category_name The name of the category
 */

/**
 * @typedef {Object} PoggitAPI
 * @property {String} from First API version
 * @property {String} to Last API version
 */

/**
 * @typedef {Object} Plugin
 * @property {number} id The id of the plugin
 * @property {String} name The name of the plugin
 * @property {String} version The version of the plugin
 * @property {String} html_url The poggit page of the plugin
 * @property {String} tagline The desciption of the plugin
 * @property {String} artifact_url The phar location
 * @property {number} downloads How many downloads does the plugin have
 * @property {String} repo_name Github repo of the plugin
 * @property {String} icon_url The icon location of the plugin
 * @property {String} changelog_url The changelog url
 * @property {String} license The license type of the plugin (apache-2.0, mit, gpl-3.0, lgpl-3.0, custom,...)
 * @property {String} license_url The url of the license when this is a custom one
 * @property {Boolean} is_pre_release Is the plugin a pre release?
 * @property {Boolean} is_outdated Is the plugin outdated?
 * @property {Boolean} is_official Is the plugin official (by the PMMP team)?
 * @property {number} submission_date The date where the plugin has bee released/updated
 * @property {number} state State number of the plugin (3: Checked, 4: Voted, 5: Approved, 6: Featured)
 * @property {Category[]} categories Categories of the plugin
 * @property {String[]} keywords Keywords of the plugin when searching
 * @property {API[]} api Is the plugin a pre release
 * @property {String[]} deps Dependencies from the plugin (to install)
 */

const PLUGIN_STATE_CHECKED = 3;
const PLUGIN_STATE_VOTED = 4;
const PLUGIN_STATE_APPROVED = 5;
const PLUGIN_STATE_FEATURED = 6;
const { URL } = require("url");

const PLUGIN_STATE_COLORS = [
    "black",
    "gray",
    "red", // First 3 arent used.
    "orange",
    "yellow",
    "lightblue",
    "lime"
];
const PLUGIN_TAGS_COLORS = {
    official: "lightblue",
    pre_release: "gold",
    outdated: "red"
}
const PLUGIN_STATE_NAMES = [
    "",
    "",
    "", // First 3 arent used.
    "Checked",
    "Voted",
    "Approved",
    "Featured"
];

var require = top.require;
var http = require("https");
var mdc = require('material-components-web/dist/material-components-web');
// var rq = require('electron-require');
/** @type {../lib/version.js} */
var version = rq.lib("version.js");
var license = rq.lib("license.js");
var readmeLib = rq.lib("readme.js");

window.pluginProviders.Poggit = {
    plugins: {},



    /**
     * Gets plugins from poggit API.
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
                error = new Error("Poggit seems to have some issues for the moment. Please check back later. (Status code: " + statusCode + ")");
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error("Poggit seems to have some issues with their API's for the moment. Please check back later. (Content type: " + contentType + ")");
            }
            if (error) {
                document.getElementById("pluginAddDialogBody").innerHTML = "<p>" + error.message + ". Click outside this dialog to dismiss this dialog.</p>";
            }
            response.on('data', function(chunk) {
                JSONData += chunk.toString();
            });
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(JSONData);
                    console.log(parsedData);
                    cb.apply(window.pluginProviders.Poggit, [parsedData]);
                } catch (error) {
                    document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Poggit: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
                    console.log(error);
                }
            });
        }).on('error', function(error) {
            document.getElementById("pluginAddDialogBody").innerHTML = "<p>Could not access Poggit: " + error.message + ". Click outside this dialog to dismiss dialog.</p>";
            console.log(error);
        });
    },


    /**
     * Orders a plugin array by state
     * 
     * @param {Plugin[]} plugins
     * @return {Plugin[]}
     */
    orderPluginsByState: function(plugins) {
        /** @type {Plugin[]} */
        var featured = [];
        /** @type {Plugin[]} */
        var approved = [];
        /** @type {Plugin[]} */
        var voted = [];
        /** @type {Plugin[]} */
        var checked = [];
        plugins.forEach(function(plugin, index) {
            switch (plugin.state) {
                case PLUGIN_STATE_CHECKED:
                    checked.push(plugin);
                    break;
                case PLUGIN_STATE_VOTED:
                    voted.push(plugin);
                    break;
                case PLUGIN_STATE_APPROVED:
                    approved.push(plugin);
                    break;
                case PLUGIN_STATE_FEATURED:
                    featured.push(plugin);
                    break;
            }
        });
        /** @type {Plugin[]} */
        var ret = featured.clone();
        approved.forEach(function(elem) { ret.push(elem) })
        voted.forEach(function(elem) { ret.push(elem) })
        checked.forEach(function(elem) { ret.push(elem) })
        console.log(checked, voted, approved, featured, ret);
        return ret;
    },

    /**
     * Displays plugins informations
     * 
     * @param {Plugin} plugin 
     */
    displayPluginInfos: function(plugin) {
        document.getElementById("pluginInfosName").innerHTML = plugin.name;
        document.getElementById("pluginInfosDesc").innerHTML = plugin.tagline;
        document.getElementById("pluginInfosAuthor").innerHTML = `Author: <span style="cursor: pointer">${plugin.repo_name.split("/")[0]}</span>`;
        document.getElementById("pluginInfosAuthor").children[0].addEventListener("click", function() {
                shell.openExternal(`https://github.com/${plugin.repo_name.split("/")[0]}`);
            })
            // Getting license
        license.getLicenseFromGH(plugin.repo_name.split("/")[0], plugin.repo_name.split("/")[1], function(licenseObj) {
            if (licenseObj.error) {
                document.getElementById("pluginInfosReadMe").innerHTML = licenseObj.error.message;
                console.log(licenseObj.error);
            } else {
                if (licenseObj.key == "none" && plugin.license !== "none") { // Getting license from poggit if Github is unaccessible
                    licenseObj = license.LicenseList[plugin.license];
                }
                document.getElementById("pluginInfosLicense").innerHTML = `License: <span style="cursor: pointer">${licenseObj.name}</span>`;
                document.getElementById("pluginInfosLicense").children[0].addEventListener("click", function() {
                    shell.openExternal(licenseObj.url);
                })
                document.getElementById("pluginInfosLicenseContents").value = licenseObj.contents;
            }
        });
        // getting readme
        readmeLib.getReadmeFromGH(plugin.repo_name.split("/")[0], plugin.repo_name.split("/")[1], function(readme) {
            document.getElementById("pluginInfosReadMe").innerHTML = readme;
            var readmeParsed = readmeLib.parseReadme(
                document.getElementById("pluginInfosReadMe").cloneNode(true).children[0]
            );
            console.log(readmeParsed);
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
        document.getElementById("pluginInfosLicense").innerHTML = "License: Checking...";
        document.getElementById("pluginInfosDownloadURL").value = plugin.artifact_url;
        document.getElementById("pluginInfos").classList.add("shown");
        document.getElementById("pluginInfos").classList.remove("hidden");
    },

    /**
     * Lists the plugins
     */
    listPlugins: function() {
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
        this.get('https://poggit.pmmp.io/releases.json', function(data) {
            if (data.length > 0) {
                document.getElementById("pluginAddDialogBody").innerHTML = `
                    <p>Plugin list:</p>
                    <ul id="poggitPluginList" class="mdc-list mdc-list--two-line"></ul>`;
                this.orderPluginsByState(data).forEach(function(plugin, index) {
                    if (plugin) {
                        if (document.getElementById(`poggitPlugin${plugin.name}`)) { // Checking version to get latest. TODO: Multiple versions handling.
                            if (version.compare(plugin.version, document.getElementById(`poggitPlugin${plugin.name}`).getAttribute("data-version"))) { // Newest version
                                document.getElementById(`poggitPlugin${plugin.name}`).remove();
                            }
                        }
                        if (!document.getElementById(`poggitPlugin${plugin.name}`)) {
                            document.getElementById("poggitPluginList").innerHTML += ` 
                                <li class="mdc-list-item mdc-list-item mdc-ripple-surface" id="poggitPlugin${plugin.name}" 
                                data-index="${index}" 
                                data-id="${plugin.id}"
                                data-name="${plugin.name}"
                                data-version="${plugin.version}"
                                data-tagline="${plugin.tagline}">
                                    <span class="mdc-list-item__start-detail">
                                       <img style="width: 24px; height: 24px" src="${plugin.icon_url !== null ? plugin.icon_url : 'https://www.clker.com/cliparts/G/U/Y/N/H/e/unknown-file-icon-md.png'}">
                                       </span>
                                    <span class="mdc-list-item__text">
                                        <span class="inline">
                                            <span id="poggitPlugin${plugin.name}Tags">
                                                <span class="poggitPluginTag", style="background-color: ${PLUGIN_STATE_COLORS[plugin.state]}">
                                                    ${PLUGIN_STATE_NAMES[plugin.state]}
                                                </span>
                                            </span>
                                            &nbsp;
                                            &nbsp;
                                            ${plugin.name}
                                        </span>
                                        <span class="mdc-list-item__text__secondary">
                                            ${plugin.tagline} - Author: ${plugin.repo_name.split("/")[0]}
                                        </span>
                                    </span>
                                    <button class="mdc-list-item__end-detail mdc-button mdc-button--raised inline poggitView" id="poggitPlugin${plugin.name}ViewBtn" 
                                    onclick="window.pluginProviders.Poggit.displayPluginInfos(window.pluginProviders.Poggit.plugins['${plugin.name}']);">
                                        View&nbsp;
                                        <i class="material-icons">pageview</i>
                                    </button>
                                </li>`;
                            if (plugin.is_official) document.getElementById(`poggitPlugin${plugin.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS.official}">
                                    Pre-release
                                    </span>`;
                            if (plugin.is_outdated) document.getElementById(`poggitPlugin${plugin.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS.outdated}">
                                    Pre-release
                                    </span>`;
                            if (plugin.is_pre_release) document.getElementById(`poggitPlugin${plugin.name}Tags`).innerHTML += `<span class="poggitPluginTag", style="background-color: ${PLUGIN_TAGS_COLORS.pre_release}">
                                    Pre-release
                                    </span>`;
                            window.pluginProviders.Poggit.plugins[plugin.name] = plugin;
                            console.log(`Adding listener to poggitPlugin${plugin.name}ViewBtn`, document.getElementById(`poggitPlugin${plugin.name}ViewBtn`));
                        }
                    }
                });
                document.getElementById("pluginAddSurface").style.marginTop = "-" + window.innerHeight * 0.1 + "px";
                document.getElementById("pluginAddDialogBody").style.maxHeight = window.innerHeight * 0.4 + "px";
            }
        });
    }
}


/**
 * Array cloning method
 * 
 * @return {Array}
 */
Array.prototype.clone = function() {
    var ret = [];
    var i = this.length;
    while (i--) ret[i] = this[i];
    return ret;
}


/** 
 * Captalizes the first letter of the string
 * 
 * @this String 
 * @return {String}
 */
String.prototype.capitalize = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
}