/**
 * properties.js - Parses .properties & ini file
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const os = require("os");
/**
 * Parse properties string
 * 
 * @param {String} properties
 * 
 * @return {{*}}
 */
exports.parseProperties = function(properties) {
    returning = {};
    properties.split(os.EOL).forEach(function(elem) {
        if (elem.indexOf("=") > 0) returning[elem.split("=")[0]] = elem.split("=")[1].replace(/\n|\r/g, "");
    }, this);
    return returning;
}

/**
 * Parse object to properties string
 * 
 * @param {{}} properties
 * 
 * @return {String}
 */
exports.emitProperties = function(properties) {
    returning = "";
    Object.keys(properties).forEach(function(key) {
        returning += key + "=" + properties[key] + os.EOL;
    });
    return returning;
}