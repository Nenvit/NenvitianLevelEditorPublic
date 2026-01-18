const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  readJSON: (filePath) => ipcRenderer.invoke('read-json', filePath),
  writeJSON: (filePath, obj) => ipcRenderer.invoke('write-json', filePath, obj),
  createFile: (filePath, data) => ipcRenderer.invoke('create-file', filePath, data),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  showSaveDialog: (options) => ipcRenderer.invoke('file-dialogue', options),
  showOpenDialog: (options) => ipcRenderer.invoke('open-dialogue', options),
  getDSKTP: () => ipcRenderer.invoke('get-DSKTP'),
  getAstPath: (filePath) => ipcRenderer.invoke('get-astPath', filePath)
});