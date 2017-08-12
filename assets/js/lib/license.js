/**
 * license.js - Utilities around licenses.
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
 * @typedef {Object} License
 * @property {String} name
 * @property {String} key
 * @property {String} spdx_id
 * @property {String} content
 * @property {String} url
 */

/**
 * License possibilities (default)
 * @var {License{}}
 */
exports.LicenseList = {
    "apache-2.0": {
        name: "Apache License 2.0",
        key: "apache-2.0",
        spdx_id: "Apache-2.0",
        url: "https://choosealicense.com/licenses/apache-2.0/"
    },
    "mit": {
        name: "MIT License",
        key: "mit",
        spdx_id: "MIT",
        url: "https://choosealicense.com/licenses/mit/"
    },
    "gpl-3.0": {
        name: "GNU General Public License v3.0",
        key: "gpl-3.0",
        spdx_id: "GPL-3.0",
        url: "https://choosealicense.com/licenses/gpl-3.0/"
    },
    "lgpl-3.0": {
        name: "GNU Lesser General Public License v3.0",
        key: "lgpl-3.0",
        spdx_id: "LGPL-3.0",
        url: "https://choosealicense.com/licenses/lgpl-3.0/"
    },
    "agpl-3.0": {
        name: "GNU Affero General Public License v3.0",
        key: "agpl-3.0",
        spdx_id: "AGPL-3.0",
        url: "https://choosealicense.com/licenses/agpl-3.0/"
    },
    "lgpl-2.1": {
        name: "GNU Lesser General Public License v2.1",
        key: "lgpl-2.1",
        spdx_id: "LGPL-2.1",
        url: "https://choosealicense.com/licenses/lgpl-2.1/"
    },
    "gpl-2.0": {
        name: "GNU General Public License v2.0",
        key: "gpl-2.0",
        spdx_id: "GPL-2.0",
        url: "https://choosealicense.com/licenses/gpl-2.0/"
    },
    "lgpl-2.0": {
        name: "GNU Library General Public License v2.0",
        key: "lgpl-2.0",
        spdx_id: "LGPL-2.0",
        url: "https://choosealicense.com/licenses/lgpl-2.0/"
    },
    "bsd-3-clause": {
        name: "3-Clause BSD License",
        key: "bsd-3-clause",
        spdx_id: "BSD-3-Clause",
        url: "https://choosealicense.com/licenses/bsd-3-clause/"
    },
    "none": { // :(
        name: "No license",
        key: "none",
        spdx_id: "",
        url: "https://choosealicense.com/no-license/"
    },
    "custom": {
        name: "Custom License",
        key: "custom",
        spdx_id: "",
        url: "#"
    },
    "other": {
        name: "Custom License",
        key: "other",
        spdx_id: "",
        url: "#"
    }
}
Object.keys(exports.LicenseList).forEach(function(licenseId) {
    try {
        exports.LicenseList[licenseId].content = fs.readFileSync("../pluginLicenses/" + licenseId + ".txt");
    } catch (e) {
        exports.LicenseList[licenseId].content = "";
    }
})


/**
 * @typedef {Function} LicenceFromGHCb
 * @param {License|Object} returnValue The return value. Object License or Error object.
 */


/**
 * Gets a custom license from github. Async.
 * 
 * @param {String} user Github username
 * @param {String} repo Github repo name (without username and slash)
 * @param {LicenceFromGHCb} cb Callback from request
 */
exports.getLicenseFromGH = function(user, repo, cb) { // Poggit is based on github and we know it's url
    var JSONData = "";
    var req = http.get({
        hostname: "api.github.com",
        path: `/repos/${user}/${repo}/license`,
        headers: {
            "User-Agent": "PSM (Pocketmine Server Manager, https://psm.mcpe.fun) User Requester"
        }
    }, function(response) {
        if (response.statusCode == 404) {
            cb(exports.LicenseList.none);
        } else {
            var contentType = response.headers['content-type'];

            var error;
            console.log(response.statusCode);
            if (response.statusCode !== 200) {
                cb(exports.LicenseList.none);
            }

            response.on('data', function(chunk) {
                JSONData += chunk.toString();
            });
            response.on('end', () => {
                try {
                    var parsedData = JSON.parse(JSONData);
                    var license = exports.LicenseList["none"];
                    if (parsedData.key) {
                        license = exports.LicenseList[parsedData["license"]["key"]];
                        license["content"] = Buffer.from(parsedData["content"], parsedData["encoding"]).toString();
                    } else {
                        license["content"] = "";
                    }
                    cb(license);
                } catch (e) {
                    cb({ error: e });
                }
            });
        }
    });
    req.on("error", function(err) {
        cb({ error: err });
    });
}