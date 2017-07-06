/**
 * properties.js - Parses .properties file
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

/**
 * Parse properties string
 * 
 * @param {String} properties
 */
exports.parseProperties = function(properties) {
    returning = {};
    properties.split("\n").forEach(function(elem) {
        if (elem.indexOf("=") > 0) returning[elem.split("=")[0]] = elem.split("=")[1];
    }, this);
    return returning;
}

/**
 * Parse object to properties string
 * 
 * @param {{}} properties
 */
exports.emitProperties = function(properties) {
    returning = "";
    Object.keys(properties).forEach(function(key) {
        returning += key + "=" + properties[key] + "\n";
    });
    return returning;
}