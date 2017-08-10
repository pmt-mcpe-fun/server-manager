/**
 * readme.js - Utility around plugin's readme's
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const http = require("https");
const fs = require("fs");

/**
 * @typedef {Object} GithubRateLimitDataType
 * @param {Number} limit
 * @param {Number} remaining
 * @param {Number} reset
 */


/**
 * @typedef {Object} GithubRateLimitDataResources
 * @param {GithubRateLimitDataType} core
 * @param {GithubRateLimitDataType} search
 * @param {GithubRateLimitDataType} graphql
 */


/**
 * @typedef {Object} GithubRateLimitData
 * @param {GithubRateLimitDataResources} resources
 * @param {GithubRateLimitDataType} rate
 */


/**
 * Callback for getRateLimit
 * @function getRateLimitCb
 * @param {GithubRateLimitData} data
 * @return undefined
 */



/**
 * Gets the readme from github. Async.
 * 
 * @param {String} user Github username
 * @param {String} repo Github repo name (without username and slash)
 * @param {Function} cb Callback from request
 */
exports.getReadmeFromGH = function(user, repo, cb) { // Poggit is based on github and we know it's url
    var data = "";
    var req = http.get({
        hostname: "api.github.com",
        path: `/repos/${user}/${repo}/readme`,
        headers: {
            "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester",
            "Accept": "application/vnd.github.VERSION.html"
        }
    }, function(response) {
        if (response.statusCode == 404) {
            cb("No README is attached to this plugin.");
        } else {
            if (response.statusCode !== 200) {
                getRateLimitReset(function(data) {
                    if (data.resources.core.remaining == 0) { // No more remaining tokens
                        var date = Date.now() / 1000;
                        var date2 = data.resources.core.reset;
                        var minutesRemaining = (date2 - date) / 60
                        minutesRemaining = Math.round(minutesRemaining)
                        cb("You searched too much plugins and now you'll need to wait " + minutesRemaining + " minutes before seeing a plugin's readme (Nb: This is due to Github API rate limit).");
                    }
                })
            }

            response.on('data', function(chunk) {
                data += chunk.toString();
            });
            response.on('end', () => {
                try {
                    JSON.parse(data);
                    getRateLimitReset(function(data) {
                        if (data.resources.core.remaining == 0) { // No more remaining tokens
                            var date = Date.now() / 1000;
                            var date2 = data.resources.core.reset;
                            var minutesRemaining = (date2 - date) / 60
                            minutesRemaining = Math.round(minutesRemaining)
                            cb("You searched too much plugins and now you'll need to wait " + minutesRemaining + " minutes before seeing a plugin's readme (Nb: This is due to Github API rate limit).");
                        }
                    })
                } catch (e) {
                    cb(data);
                }
            });
        }
    });
    req.on("error", function(err) {
        getRateLimitReset(function(data) {
            if (data.resources.core.remaining == 0) { // No more remaining tokens
                var date = Date.now() / 1000;
                var date2 = data.resources.core.reset;
                var minutesRemaining = (date2 - date) / 60
                minutesRemaining = Math.round(minutesRemaining)
                cb("You searched too much plugins and now you'll need to wait " + minutesRemaining + " minutes before seeing a plugin's readme (Nb: This is due to Github API rate limit).");
            }
        })
        console.log(err);
    });
}

/**
 * If user gets past github limit (60 requests per hour), he needs to know when the rate will be setted back.
 * 
 * @param {getRateLimitCb} cb
 */
function getRateLimitReset(cb) {
    var data = "";
    var req = http.get({
        hostname: "api.github.com",
        path: `/rate_limit`,
        headers: {
            "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester",
            "Accept": "application/vnd.github.VERSION.html"
        }
    }, function(response) {
        if (response.statusCode == 404) {} else {
            if (response.statusCode !== 200) {}

            response.on('data', function(chunk) {
                data += chunk.toString();
            });
            response.on('end', () => {
                cb(JSON.parse(data));
            });
        }
    });
}

/**
 * Parses and "fixes" readme (changes links into outer links, ...)
 * 
 * @param {HTMLElement} readme
 * @return {getRateLimitCb}
 */
exports.parseReadme = function(readme) {
    if (readme) {
        readme.querySelectorAll("a").forEach(function(elem) {
            elem.setAttribute("pmt-href", elem.href);
            elem.href = "javascript:;";
            elem.addEventListener("click", function() {
                require("electron").shell.openExternal(this.getAttribute("pmt-href"));
            });
            console.log(elem);
        });
        readme.querySelectorAll("script").forEach(function(elem) {
            elem.remove(); // Removes external scripts
        });
    }
    return readme;
}