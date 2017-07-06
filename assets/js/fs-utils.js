// From https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
const path = require('path');
const fs = require('fs');


/**
 * Copies a file syncronously
 * 
 * @param {String} source 
 * @param {String} target 
 */
exports.copyFileSync = function(source, target) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

/**
 * Copies a direcory recursivly
 * 
 * @param {String} source 
 * @param {String} target 
 */
exports.copyFolderRecursiveSync = function(source, target) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function(file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                exports.copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                exports.copyFileSync(curSource, targetFolder);
            }
        });
    }
}

/**
 * Removes a directory recursivly
 * 
 * @param {Sting} dir 
 */
exports.rmdir = function(dir) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
            // pass these files
        } else if (stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};