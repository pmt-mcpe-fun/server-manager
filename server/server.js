/**
 * server.js - Server instance
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @copyright (C) Ad5001 2017
 */

const { spawn } = require('child_process');
const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const properties = require('./lib/properties');

/**
 * Server class
 * 
 * @param {String} name
 * @param {{}} php
 */
exports.Server = function(name, php) {

    this.name = name;
    this.folder = path.join(php.app.serverFolder, name);
    this.isStarted = false;
    this.players = {};
    this.log = "";
    this.php = php;

    /**
     * Starts the server
     */
    this.start = function() {
        this.proc = spawn(php.phpExecutable, [path.join(this.folder, "PocketMine-MP.phar")]);
        this.isStarted = true;

        this.proc.stdout.on('data', (data) => {
            this.log += data;
        });

        this.proc.stderr.on('data', (data) => {
            this.log += data;
        });

        this.proc.stdin.on('data', (data) => {
            this.log += data;
        });

        this.proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });


        return proc;
    }


    this.getProc = function() {
        if (this.app.php);
    }


    this.inputCommand = function(Command) {
        this.log += "> cmd";
    };

}


/**
 * Creates a version of the server exportable to the process
 */
exports.ServerExportable = function() {

    /**
     * Import server instance
     */
    this.import = function(Server) {
        this.name = Server.name;
        this.isStarted = Server.isStarted;
        this.players = Server.players;
        this.log = Server.log;
        this.commands = [];
    }

    /**
     * Exports to a server instance
     */
    this.import = function(Server) {
        if (this.isStarted && !Server.isStarted) {
            Server.start();
        }
        Server.log = this.log;
        this.commands.forEach(function(cmd) {
            Server.inputCommand(cmd);
        }, this);
    }
}