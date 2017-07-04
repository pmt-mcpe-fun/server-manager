/**
 * echange.js - Communication system between nodejs electron app and rendering engine. Asyncrosnous.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */


const callbacks = {};
const path = require('path');
const fs = require('fs');
const main = require(__dirname + '/main.js');

const echangeFile = path.join(main.appFolder, "requests.json");

try {
	fs.accessSync(echangeFile);
} catch (e) { // No .pocketmine folder
	fs.writeFileSync(echangeFile, "{}");
}

/**
 * Sends a request to main process
 * 
 * @param {String} requestName
 * @param {Object} requestData
 * @param {Function} callback(data)
 */
exports.requestData = function(requestName, requestData, callback){
    callbacks[requestName] = callback;
    var contents = JSON.parse(fs.readFileSync(echangeFile));
    contents[requestName] = requestData;
    fs.writeFileSync(echangeFile, JSON.stringify(contents));
}

/**
 * Callback from main process about data
 * 
 * @param {String} requestName
 * @param {String} data
 */
exports.receiveData = function(requestName, data){
    data = JSON.parse(data);
    callbacks[requestName](data);
}