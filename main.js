const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const WINDOW_WIDTH = 320;
const WINDOW_HEIGHT = 194;
const CORNER_GAP = 16;

let win = null;

function getCornerBounds(display) {
  const area = (display || screen.getPrimaryDisplay()).workArea;
  return {
    x: Math.round(area.x + area.width - WINDOW_WIDTH - CORNER_GAP),
    y: Math.round(area.y + area.height - WINDOW_HEIGHT - CORNER_GAP),
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT
  };
}

function snapToBottomRight(target = win) {
  if (!target || target.isDestroyed()) return;
  const display = screen.getDisplayMatching(target.getBounds());
  const bounds = getCornerBounds(display);
  target.setPosition(bounds.x, bounds.y, false);
  target.setAlwaysOnTop(true, 'screen-saver');
  target.moveTop();
}

ipcMain.handle('window:close', () => {
  if (win && !win.isDestroyed()) win.close();
  return { ok: true };
});

function enforceFloatingVisibility() {
  if (!win || win.isDestroyed()) return;
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

function createWindow() {
  const initialBounds = getCornerBounds(screen.getPrimaryDisplay());

  win = new BrowserWindow({
    ...initialBounds,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: WINDOW_WIDTH,
    maxWidth: WINDOW_WIDTH,
    minHeight: WINDOW_HEIGHT,
    maxHeight: WINDOW_HEIGHT,
    title: 'MikTime',
    icon: path.join(__dirname, 'assets', 'miktime-icon.jpg'),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    show: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.on('blur', () => {
    // Keep MikTime above regular application windows without taking focus.
    snapToBottomRight(win);
    enforceFloatingVisibility();
    win.showInactive();
  });

  win.on('focus', enforceFloatingVisibility);
  win.on('show', enforceFloatingVisibility);

  win.on('closed', () => {
    win = null;
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  win.once('ready-to-show', () => {
    snapToBottomRight(win);
    enforceFloatingVisibility();
    win.showInactive();
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  enforceFloatingVisibility();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
