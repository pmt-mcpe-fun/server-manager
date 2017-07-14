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
    this.changed = false;
    this.settings = properties.parseProperties(fs.readFileSync(path.join(this.folder, "server.properties")).toString());

    /**
     * Starts the server
     */
    this.start = function() {
        if(this.isStarted) return; // DO NOT CREATE IT TWO TIMES !
        this.log += "[PMS] Starting server " + this.name + "...\n";
        this.proc = spawn(php.phpExecutable, [path.join(this.folder, "PocketMine-MP.phar"), "enable-ansi"], {cwd: this.folder});
        this.isStarted = true;

        this.proc.stdout.on('data', (data) => {
            this.log += data;
        });

        this.proc.stderr.on('data', (data) => {
            this.log += data;
        });

        this.proc.on('exit', (code) => {
            this.log += "[PMS] Server stopped.";
            this.isStarted = false;
            fs.writeFileSync(path.join(this.folder, "server.properties"), properties.emitProperties(this.settings));
        });
    }

    /**
     * Inputs a command
     * 
     * @param {String} Command
     */
    this.inputCommand = function(Command) {
        try {
            this.proc.stdin.write(Command + "\n");
            this.log += "> " + Command + "\n";
        } catch(e) { // Process has ended
            this.isStarted = false;
        }
    };

    /**
     * Stops the server
     */
    this.stop = function(){
        this.inputCommand("stop")
    }

    /**
     * Saves the server properties
     * 
     * @return {Boolean}
     */
    this.save = function(){
        if(this.isStarted){
            return false;
        }
        fs.writeFileSync(path.join(this.folder, "server.properties"), properties.emitProperties(this.settings));
        return true;
    }

}


/**
 * Creates a version of the server exportable to the process
 */
exports.ServerExportable = function() {

    /**
     * Import server instance 
     * 
     * @param {Server} server
     */
    this.import = function(Server) {
        this.name = Server.name;
        this.isStarted = Server.isStarted;
        this.players = Server.players;
        this.log = Server.log;
        this.commands = [];
        this.settings = Server.settings
    }
}