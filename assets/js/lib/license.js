/**
 * license.js - Utilities around licenses.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
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
 * @property {String} [url]
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
    },
    "mit": {
        name: "MIT License",
        key: "mit",
        spdx_id: "MIT"
    },
    "gpl-3.0": {
        name: "GNU General Public License v3.0",
        key: "gpl-3.0",
        spdx_id: "GPL-3.0"
    },
    "lgpl-3.0": {
        name: "GNU Lesser General Public License v3.0",
        key: "lgpl-3.0",
        spdx_id: "LGPL-3.0"
    },
    "agpl-3.0": {
        name: "GNU Affero General Public License v3.0",
        key: "agpl-3.0",
        spdx_id: "AGPL-3.0"
    },
    "lgpl-2.1": {
        name: "GNU Lesser General Public License v2.1",
        key: "lgpl-2.1",
        spdx_id: "LGPL-2.1"
    },
    "gpl-2.0": {
        name: "GNU General Public License v2.0",
        key: "gpl-2.0",
        spdx_id: "GPL-2.0"
    },
    "lgpl-2.0": {
        name: "GNU Library General Public License v2.0",
        key: "lgpl-2.0",
        spdx_id: "LGPL-2.0"
    },
    "bsd-3-clause": {
        name: "3-Clause BSD License",
        key: "bsd-3-clause",
        spdx_id: "BSD-3-Clause"
    },
    "none": { // :(
        name: "No license",
        key: "none",
        spdx_id: ""
    },
    "custom": {
        name: "Custom License",
        key: "custom",
        spdx_id: ""
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
 * Gets a custom license from github.
 */
exports.getLicenseFromGH = function(user, repo, cb) { // Poggit is based on github and we know it's url
    http.get(`https://api.github.com/repos/${user}/${repo}/LICENSE`, function(response) {
        if (response.statusCode == 404) {
            cb(exports.LicenseList.none);
        }
        var contentType = response.headers['content-type'];

        var error;
        if (response.statusCode !== 200) {
            error = new Error("Looks like you searched github too much and it dkeyn't liked that ! Check back in a few seconds/minutes.");
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error("Looks like you searched github too much and it dkeyn't liked that ! Check back in a few seconds/minutes.");
        }
        if (error) cb({ error: error });

        response.on('data', function(chunk) {
            JSONData += chunk.toString();
        });
        response.on('end', () => {
            try {
                var parsedData = JSON.parse(JSONData);
                var license = exports.LicenseList[parsedData["license"]];
                license["content"] = Buffer.from(parsedData["content"], parsedData["encoding"]).toString();
                cb(license);
            } catch (e) {
                cb({});
            }
        });
    });
}