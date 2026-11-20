const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  cornerMode: () => ipcRenderer.invoke('window:corner'),
  normalMode: () => ipcRenderer.invoke('window:normal'),
  resizeWindow: (w, h) => ipcRenderer.invoke('window:resize', { w, h }),
});