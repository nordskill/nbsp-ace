const { BrowserWindow, app } = require('electron');
const project = require('./package.json');


let windowOptions = {
    title: `${project.productName} v.${project.version}`,
    width: 1280,
    height: 700,
    webPreferences: {
        // preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        enableRemoteModule: false,
        contextIsolation: true,
        sandbox: false
    },
    show: false // Пока-что окно не нужно показывать пользователю
};

if (process.env.NODE_ENV === 'development') {

    require('electron-reload')(__dirname);

    windowOptions = Object.assign(windowOptions, {
        x: 1280,
        y: 10
    });

}

app.whenReady().then(() => {

    const win = new BrowserWindow(windowOptions);

    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools();
    } else {
        win.setMenu(null);
    }

    win.loadFile('index.html');
    win.once('ready-to-show', win.show);

});

app.on('window-all-closed', app.quit);
