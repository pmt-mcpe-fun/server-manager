/**
 * version.js - A large range of version utils.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const CHANGE_MATTER_ORDER_PATCH = 1;
const CHANGE_MATTER_ORDER_ALPHA = 2;
const CHANGE_MATTER_ORDER_BETA = 3;
const CHANGE_MATTER_ORDER_DELTA = 4; // REALLY Rare
const CHANGE_MATTER_ORDER_NOTSPECIFIED = 5;

const VERSION_FIRST_SUPERIOR = 1;
const VERSION_FIRST_INFERIOR = -1;
const VERSIONS_EQUAL = 0;
exports.VERSION_FIRST_SUPERIOR = 1;
exports.VERSION_FIRST_INFERIOR = -1;
exports.VERSIONS_EQUAL = 0;

/**
 * Compares two versions. Returns true if first one is superior, false if the first one is .
 * 
 * @param {String} version1Str
 * @param {String} version2Str
 */
function compare(version1Str, version2Str) {
    // Parsing first version
    var version1 = parse(version1Str);
    // Parsing second version
    var version2 = parse(version2Str);
    if (version1.major > version2.major) return VERSION_FIRST_SUPERIOR;
    if (version1.major < version2.major) return VERSION_FIRST_INFERIOR;
    if (version1.minor > version2.minor) return VERSION_FIRST_SUPERIOR;
    if (version1.minor < version2.minor) return VERSION_FIRST_INFERIOR;
    if (version1.build > version2.build) return VERSION_FIRST_SUPERIOR;
    if (version1.build < version2.build) return VERSION_FIRST_INFERIOR;
    if (version1.revision > version2.revision) return VERSION_FIRST_SUPERIOR;
    if (version1.revision < version2.revision) return VERSION_FIRST_INFERIOR;
    version1.other.forEach(function(num, index) {
        if (version2.other[index] !== undefined) {
            if (num > version2.other[index]) return VERSION_FIRST_SUPERIOR;
            if (num < version2.other[index]) return VERSION_FIRST_INFERIOR;
            delete version1.other[index];
            delete version2.other[index];
        } else { // More version1 others than the other one. Note that if they're all 0, it's still the same
            if (num > 0) return VERSION_FIRST_SUPERIOR;
        }
    });
    if (version2.other.length > 0) { // More version2 other than the other. Note that if they're all 0, it's still the same
        version2.forEach(function(num) {
            if (num > 0) return VERSION_FIRST_INFERIOR;
        });
    }
    if (version1.change > version2.change) return VERSION_FIRST_SUPERIOR;
    if (version1.change < version2.change) return VERSION_FIRST_INFERIOR;
    if (version1.changeRev > version2.changeRev) return VERSION_FIRST_SUPERIOR;
    if (version1.changeRev < version2.changeRev) return VERSION_FIRST_INFERIOR;
    return VERSIONS_EQUAL;
}
exports.compare = compare;

/**
 * Parses a version string and returns an object
 * 
 * @param {String} version 
 */
function parse(version) {
    var change = 0;
    var changeRev = 0;
    if (/(#|-)(\w+)/.exec(version) !== null) {
        var abdp = version.split(/#|-/)[1]; // Patch, Alpha, Beta, Delta
        version = version.replace(abdp, "");
        if (abdp.indexOf(".") !== -1) {
            changeRev = abdp.split(".")[1];
            abdp = abdp.split(".")[0];
        } else if (/[0-9]+/.exec(version) !== null) {
            changeRev = /[0-9]+/.exec(version)[0];
            abdp = abdp.replace(changeRev, "");
        }
        switch (abdp) {
            case "patch":
                change = CHANGE_MATTER_ORDER_PATCH;
                break;
            case "alpha":
                change = CHANGE_MATTER_ORDER_ALPHA;
                break;
            case "beta":
                change = CHANGE_MATTER_ORDER_BETA;
                break;
            case "delta":
                change = CHANGE_MATTER_ORDER_DELTA;
                break;
        }
    } else {
        change = CHANGE_MATTER_ORDER_NOTSPECIFIED; // No Alpha, Beta, Delta, Patch
    }
    var nums = version.split(".");
    var major = nums.shift();
    var minor = 0;
    if (nums.length > 0) minor = nums.shift();
    var build = 0;
    if (nums.length > 0) build = nums.shift();
    var revision = 0;
    if (nums.length > 0) revision = nums.shift();
    return {
        major: major,
        minor: minor,
        build: build,
        revision: revision,
        other: nums,
        change: change,
        changeRev: changeRev
    }
}