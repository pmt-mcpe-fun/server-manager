/**
 * properties.js - Parses .properties file
 * 
 * @author Ad5001, NFGamerMC
 * @version 1.0.0
 * @license CC-BY-NC-SA-4.0
 * @package PocketMine Server Manager
 */

const electron = require('electron')
const Menu = electron.Menu;
const app = electron.app

const template = [{
        label: 'Visit Us',
        submenu: [{
                label: 'PMT',
                accelerator: process.platform === 'darwin' ? 'Shift+Command+H' : 'Ctrl+Shift+H',
                click(item, focusedWindow) {
                    if (focusedWindow) electron.shell.openExternal('https://pmt.mcpe.fun')
                },
            },
            {
                label: 'PSM',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+H' : 'Ctrl+Alt+H',
                click(item, focusedWindow) {
                    if (focusedWindow) require('electron').shell.openExternal('https://psm.mcpe.fun/user/')
                }
            },
        ]
    },
    {
        label: 'Developer',
        submenu: [{
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                }
            },
            {
                role: 'zoomin'
            },
            {
                role: 'zoomout'
            },
            {
                type: 'separator'
            }
        ]
    },
    {
        label: 'Donate',
        submenu: [{
                label: 'NFGamerMC',
                accelerator: 'Ctrl+Shift+N',
                click(item, focusedWindow) { if (focusedWindow) require('electron').shell.openExternal('https://paypal.me/NFGamerMC') }
            },
            {
                label: 'Ad5001',
                accelerator: 'Ctrl+Shift+A',
                click(item, focusedWindow) { if (focusedWindow) require('electron').shell.openExternal('https://en.ad5001.eu') }
            }
        ]
    },
    {
        role: 'help',
        submenu: [{
                label: 'Email Support',
                click() { require('electron').shell.openExternal('mailto:mail@ad5001.eu?CC=support@nfgamermc.com&Subject=Server%20Manager%3A%20Support%20Request') }
            },
            {
                label: 'Twitter Support (@NFGamerMC)',
                click() { require('electron').shell.openExternal('https://twitter.com/NFGamerMC') }
            },
            {
                label: 'Twitter Support (@Ad5001P4F)',
                click() { require('electron').shell.openExternal('https://twitter.com/Ad5001P4F') }
            }
        ]
    }
]

if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
            label: name,
            submenu: [{
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        })
        // Edit menu.
    template[1].submenu.push({
            type: 'separator'
        }, {
            label: 'Speech',
            submenu: [{
                    role: 'startspeaking'
                },
                {
                    role: 'stopspeaking'
                }
            ]
        })
        // Window menu.
    template[3].submenu = [{
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        },
        {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: 'Zoom',
            role: 'zoom'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    ]
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)