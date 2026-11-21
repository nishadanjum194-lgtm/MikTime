const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', Object.freeze({
  close: () => ipcRenderer.invoke('window:close')
}));
