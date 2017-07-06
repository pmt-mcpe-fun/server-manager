// From https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
const path = require('path');
const fs = require('fs');

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