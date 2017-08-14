/**
 * Formating codes of terminal in JS. Convertable to HTML
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

const os = require("os");
const { execSync } = require("child_process");
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

String.prototype.splitWithIndex = function(delim) {
    var ret = []
    var splits = this.split(delim)
    var index = 0
    for (var i = 0; i < splits.length; i++) {
        ret[index] = splits[i];
        index += splits[i].length + delim.length
    }
    return ret;
}

Array.prototype.clone = function() {
    var ret = [];
    var i = this.length;
    while (i--) ret[i] = this[i];
    return ret;
}

switch (os.platform()) {
    case "darwin":
    case "freebsd":
    case "openbsd":
    case "linux":
    case "sunos":
        getUnixEscapeCodes();
        break;
    case "android":
    case "win32":
        getWinEscapeCodes();
        break;
}
const COLORS = [
    exports.COLOR_AQUA,
    exports.COLOR_BLACK,
    exports.COLOR_BLUE,
    exports.COLOR_DARK_AQUA,
    exports.COLOR_DARK_BLUE,
    exports.COLOR_DARK_GRAY,
    exports.COLOR_DARK_GREEN,
    exports.COLOR_DARK_RED,
    exports.COLOR_ORANGE,
    exports.COLOR_GRAY,
    exports.COLOR_GREEN,
    exports.COLOR_LIGHT_PURPLE,
    exports.COLOR_PURPLE,
    exports.COLOR_RED,
    exports.COLOR_WHITE,
    exports.COLOR_YELLOW
];

const FORMATS = [
    exports.FORMAT_BOLD,
    exports.FORMAT_ITALIC,
    exports.FORMAT_OBFUSCATED,
    exports.FORMAT_STRIKETHROUGH,
    exports.FORMAT_UNDERLINE,
    exports.FORMAT_RESET
];

/**
 * Defining replacements for terminal codes to HTML
 */
exports.CODE2HTML = {}
exports.CODE2HTML[exports.FORMAT_BOLD] = "<span class='consoleFormatBOLD'>";
exports.CODE2HTML[exports.FORMAT_ITALIC] = "<span class='consoleFormatITALIC'>";
exports.CODE2HTML[exports.FORMAT_OBFUSCATED] = "<span class='consoleFormatOBFUSCATED'>";
exports.CODE2HTML[exports.FORMAT_STRIKETHROUGH] = "<span class='consoleFormatSTRIKEOUT'>";
exports.CODE2HTML[exports.FORMAT_UNDERLINE] = "<span class='consoleFormatUNDERLINE'>";
exports.CODE2HTML[exports.FORMAT_RESET] = "<span class='consoleFormatRESET'>";
exports.CODE2HTML[exports.COLOR_AQUA] = "<span class='consoleColorAQUA'>";
exports.CODE2HTML[exports.COLOR_BLACK] = "<span class='consoleColorBLACK'>";
exports.CODE2HTML[exports.COLOR_BLUE] = "<span class='consoleColorBLUE'>";
exports.CODE2HTML[exports.COLOR_DARK_AQUA] = "<span class='consoleColorDARKAQUA'>";
exports.CODE2HTML[exports.COLOR_DARK_BLUE] = "<span class='consoleColorDARKBLUE'>";
exports.CODE2HTML[exports.COLOR_DARK_GRAY] = "<span class='consoleColorDARKGRAY'>";
exports.CODE2HTML[exports.COLOR_DARK_GREEN] = "<span class='consoleColorDARKGREEN'>";
exports.CODE2HTML[exports.COLOR_DARK_RED] = "<span class='consoleColorDARKRED'>";
exports.CODE2HTML[exports.COLOR_ORANGE] = "<span class='consoleColorORANGE'>";
exports.CODE2HTML[exports.COLOR_GRAY] = "<span class='consoleColorGRAY'>";
exports.CODE2HTML[exports.COLOR_GREEN] = "<span class='consoleColorGREEN'>";
exports.CODE2HTML[exports.COLOR_LIGHT_PURPLE] = "<span class='consoleColorLIGHTPURPLE'>";
exports.CODE2HTML[exports.COLOR_PURPLE] = "<span class='consoleColorPURPLE'>";
exports.CODE2HTML[exports.COLOR_RED] = "<span class='consoleColorRED'>";
exports.CODE2HTML[exports.COLOR_WHITE] = "<span class='consoleColorWHITE'>";
exports.CODE2HTML[exports.COLOR_YELLOW] = "<span class='consoleColorYELLOW'>";

function getUnixEscapeCodes() {
    exports.FORMAT_BOLD = execSync("tput bold").toString();
    exports.FORMAT_OBFUSCATED = execSync("tput smacs").toString();
    exports.FORMAT_ITALIC = execSync("tput sitm").toString();
    exports.FORMAT_UNDERLINE = execSync("tput smul").toString();
    exports.FORMAT_STRIKETHROUGH = "\x1b[9m"; //execSync("tput ").toString();
    exports.FORMAT_RESET = execSync("tput sgr0").toString();

    var colors = parseInt(execSync("tput colors").toString());
    if (colors > 8) {
        exports.COLOR_BLACK = colors >= 256 ? execSync("tput setaf 16").toString() : execSync("tput setaf 0").toString();
        exports.COLOR_DARK_BLUE = colors >= 256 ? execSync("tput setaf 19").toString() : execSync("tput setaf 4").toString();
        exports.COLOR_DARK_GREEN = colors >= 256 ? execSync("tput setaf 34").toString() : execSync("tput setaf 2").toString();
        exports.COLOR_DARK_AQUA = colors >= 256 ? execSync("tput setaf 37").toString() : execSync("tput setaf 6").toString();
        exports.COLOR_DARK_RED = colors >= 256 ? execSync("tput setaf 124").toString() : execSync("tput setaf 1").toString();
        exports.COLOR_PURPLE = colors >= 256 ? execSync("tput setaf 127").toString() : execSync("tput setaf 5").toString();
        exports.COLOR_ORANGE = colors >= 256 ? execSync("tput setaf 214").toString() : execSync("tput setaf 3").toString();
        exports.COLOR_GRAY = colors >= 256 ? execSync("tput setaf 145").toString() : execSync("tput setaf 7").toString();
        exports.COLOR_DARK_GRAY = colors >= 256 ? execSync("tput setaf 59").toString() : execSync("tput setaf 8").toString();
        exports.COLOR_BLUE = colors >= 256 ? execSync("tput setaf 63").toString() : execSync("tput setaf 12").toString();
        exports.COLOR_GREEN = colors >= 256 ? execSync("tput setaf 83").toString() : execSync("tput setaf 10").toString();
        exports.COLOR_AQUA = colors >= 256 ? execSync("tput setaf 87").toString() : execSync("tput setaf 14").toString();
        exports.COLOR_RED = colors >= 256 ? execSync("tput setaf 203").toString() : execSync("tput setaf 9").toString();
        exports.COLOR_LIGHT_PURPLE = colors >= 256 ? execSync("tput setaf 207").toString() : execSync("tput setaf 13").toString();
        exports.COLOR_YELLOW = colors >= 256 ? execSync("tput setaf 227").toString() : execSync("tput setaf 11").toString();
        exports.COLOR_WHITE = colors >= 256 ? execSync("tput setaf 231").toString() : execSync("tput setaf 15").toString();
    } else {
        exports.COLOR_BLACK = exports.COLOR_DARK_GRAY = execSync("tput setaf 0").toString();
        exports.COLOR_RED = exports.COLOR_DARK_RED = execSync("tput setaf 1").toString();
        exports.COLOR_GREEN = exports.COLOR_DARK_GREEN = execSync("tput setaf 2").toString();
        exports.COLOR_YELLOW = exports.COLOR_ORANGE = execSync("tput setaf 3").toString();
        exports.COLOR_BLUE = exports.COLOR_DARK_BLUE = execSync("tput setaf 4").toString();
        exports.COLOR_LIGHT_PURPLE = exports.COLOR_PURPLE = execSync("tput setaf 5").toString();
        exports.COLOR_AQUA = exports.COLOR_DARK_AQUA = execSync("tput setaf 6").toString();
        exports.COLOR_GRAY = exports.COLOR_WHITE = execSync("tput setaf 7").toString();
    }
}



function getWinEscapeCodes() {
    exports.FORMAT_BOLD = "\x1b[1m";
    exports.FORMAT_OBFUSCATED = "";
    exports.FORMAT_ITALIC = "\x1b[3m";
    exports.FORMAT_UNDERLINE = "\x1b[4m";
    exports.FORMAT_STRIKETHROUGH = "\x1b[9m";
    exports.FORMAT_RESET = "\x1b[m";
    exports.COLOR_BLACK = "\x1b[38;5;16m";
    exports.COLOR_DARK_BLUE = "\x1b[38;5;19m";
    exports.COLOR_DARK_GREEN = "\x1b[38;5;34m";
    exports.COLOR_DARK_AQUA = "\x1b[38;5;37m";
    exports.COLOR_DARK_RED = "\x1b[38;5;124m";
    exports.COLOR_PURPLE = "\x1b[38;5;127m";
    exports.COLOR_ORANGE = "\x1b[38;5;214m";
    exports.COLOR_GRAY = "\x1b[38;5;145m";
    exports.COLOR_DARK_GRAY = "\x1b[38;5;59m";
    exports.COLOR_BLUE = "\x1b[38;5;63m";
    exports.COLOR_GREEN = "\x1b[38;5;83m";
    exports.COLOR_AQUA = "\x1b[38;5;87m";
    exports.COLOR_RED = "\x1b[38;5;203m";
    exports.COLOR_LIGHT_PURPLE = "\x1b[38;5;207m";
    exports.COLOR_YELLOW = "\x1b[38;5;227m";
    exports.COLOR_WHITE = "\x1b[38;5;231m";
}

/**
 * Converts terminal line escape codes (formats & colors) to HTML based colors and formats using spans and classes.
 * 
 * @param {String} lineTerminal
 * @return {String}
 */
exports.terminal2HTML = function(lineTerminal) {
    var tokens = tokenize(lineTerminal);
    var codes = tokens[0];
    var texts = tokens[1].clone();
    var currentOpenedColors = 0;
    var doneCodes = 0;
    codes.forEach(function(code, i) {
        if (exports.CODE2HTML[code]) {
            texts[i - code.length] = exports.CODE2HTML[code];
            currentOpenedColors += 1;
        }
    });
    texts.push("</span>".repeat(currentOpenedColors));
    var newString = texts.join("");
    return newString;
}

/**
 * 
 * @param {String} line 
 */
function tokenize(line) {
    var codes = [];
    var texts = [line];
    COLORS.concat(FORMATS).forEach(function(code) {
        var newText = texts.clone();
        texts.forEach(function(text, previousIndex) {
            if (text) {
                var splitted = text.splitWithIndex(code);
                splitted.forEach(function(textSplited, index) {
                    index += previousIndex;
                    if (textSplited) {
                        if (!newText[index] || newText[index].length > textSplited.length) {
                            if (!exports.CODE2HTML[textSplited]) {
                                newText[index] = textSplited;
                            } else {
                                codes[index + textSplited.length] = textSplited;
                            }
                        }
                    }
                });
                Object.keys(splitted).forEach(function(key) {
                    if (key !== 0) codes[key] = code;
                });
            }
        });
        texts = newText;
    });
    texts.forEach(function(text, index) { // Refiltering a second time to remove the unecessary, fix what needs to be fixed, ect...
        if (!text) {
            delete texts[index];
        } else {
            var currentDeleted = 0;
            COLORS.concat(FORMATS).forEach(function(code) {
                if (text.startsWith(code)) {
                    text = text.replace(code, "");
                    delete texts[index];
                    codes[index + currentDeleted + code.length] = code;
                    currentDeleted += code.length;
                }
            })
            if (exports.CODE2HTML[texts[index]]) { // Format Code chaining
                codes[index + texts[index].length] = texts[index];
                delete texts[index];
            }
        }
    });
    codes.forEach(function(code, index) { // Refiltering codes a second time to prevent the ones that aren't really there.
        if (line.substr(index - code.length, code.length) !== code && code !== exports.FORMAT_RESET) {
            delete codes[index];
        }
    })
    return [codes, texts];
}