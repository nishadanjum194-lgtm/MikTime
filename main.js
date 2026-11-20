const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let win = null;

function getWindow() {
  if (!win || win.isDestroyed()) throw new Error('MikTime window is not available.');
  return win;
}

ipcMain.handle('window:corner', async () => {
  const current = getWindow();
  const area = screen.getDisplayMatching(current.getBounds()).workArea;
  const [width, height] = current.getSize();
  const nextWidth = Math.max(216, width);
  const nextHeight = Math.max(264, height);
  current.setMinimumSize(216, 264);
  current.setSize(nextWidth, nextHeight);
  current.setPosition(area.x + area.width - nextWidth, area.y + area.height - nextHeight);
  current.setAlwaysOnTop(true, 'screen-saver');
  current.moveTop();
  return { ok: true };
});

ipcMain.handle('window:normal', async () => {
  const current = getWindow();
  const area = screen.getDisplayMatching(current.getBounds()).workArea;
  const [width, height] = current.getSize();
  const nextWidth = Math.max(216, width);
  const nextHeight = Math.max(264, height);
  current.setMinimumSize(216, 264);
  current.setSize(nextWidth, nextHeight);
  current.setPosition(
    area.x + Math.round((area.width - nextWidth) / 2),
    area.y + Math.round((area.height - nextHeight) / 2)
  );
  current.setAlwaysOnTop(true, 'screen-saver');
  return { ok: true };
});

ipcMain.handle('window:resize', async (_event, payload) => {
  const current = getWindow();
  const width = Math.round(Number(payload && payload.w));
  const height = Math.round(Number(payload && payload.h));
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error('Invalid window size.');
  current.setSize(Math.min(900, Math.max(216, width)), Math.min(1000, Math.max(264, height)));
  return { ok: true };
});

function createWindow() {
  win = new BrowserWindow({
    width: 360,
    height: 440,
    minWidth: 216,
    minHeight: 264,
    title: 'MikTime',
    icon: path.join(__dirname, 'assets', 'miktime-icon.jpg'),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.on('closed', () => { win = null; });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
