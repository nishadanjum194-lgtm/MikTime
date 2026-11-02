const { app, BrowserWindow } = require('electron');
const path = require('path');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 360,
    title: "MikTime",
    icon: path.join(__dirname, 'assets', 'miktime-icon.jpg'),
    height: 440,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    backgroundColor: '#00000000',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.setAlwaysOnTop(true, 'screen-saver');
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
