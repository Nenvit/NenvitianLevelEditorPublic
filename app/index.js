const {BrowserWindow, app, globalShortcut, ipcMain, dialog} = require('electron');
const path = require("path");
const fs = require("fs");
const os = require('os');
const isDev = require('electron-is-dev');

const DSKTP = path.join(os.homedir(), '/OneDrive/Desktop');
const assetPath = isDev ? path.join(__dirname, 'assets') : path.join(process.resourcesPath, 'app', 'assets');
const full = true

fs.stat(path.join(DSKTP, 'Maps'), (err, stats) => {
    if (err) {
          if (err.code === 'ENOENT') {
              console.log('Directory does not exist.');
              console.log('Creating Directory...');
              fs.mkdir(path.join(DSKTP, 'Maps'), {recursive: true}, (err) => {
                if (err) {
          console.error('Error creating directory:', err.message);
          return;
      }
      console.log(`Directory created successfully at: ${path.join(DSKTP, 'Maps')}`);
            });
        } else {
            console.error('Error checking directory:', err.message);
        }
        return;
    }

    if (stats.isDirectory()) {
        console.log('Directory exists.');
    } else {
        console.log('Path exists but is not a directory.');
    }
});

const createWindow = () => {
    const win = new BrowserWindow({
        fullscreenable:true,
        fullscreen:full,
        title: "Nevitian Level Editor",
        icon: path.join(__dirname, "../icon/nenvitian.ico"),
        webPreferences: {
            preload: path.join(__dirname, './preload.js')
        },
        nodeIntegration:false,
        autoHideMenuBar:true,
    })
    win.loadFile("index.html")
}
app.whenReady().then(() => {
    createWindow();
    globalShortcut.register('CommandOrControl+W',()=>{
        //Intentionally left blank.
    })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

ipcMain.handle('read-file', async (event, filePath) => {
  return fs.promises.readFile(filePath, 'utf8');
});
ipcMain.handle('write-file', async (event, filePath, data) => {
  return fs.promises.writeFile(filePath, data, 'utf8');
});
ipcMain.handle('create-file', async (event, filePath, data = '') => {
  await fs.promises.writeFile(filePath, data, 'utf8');
  return true;
});
ipcMain.handle('delete-file', async (event, filePath) => {
  await fs.promises.unlink(filePath);
  return true;
});
ipcMain.handle('read-json', async (event, filePath) => {
  const data = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(data);
});
ipcMain.handle('write-json', async (event, filePath, obj) => {
  const data = JSON.stringify(obj, null, 2);
  await fs.promises.writeFile(filePath, data, 'utf8');
  return true;
});
ipcMain.handle('file-dialogue', async (event, options) => {
  const result = await dialogue.showSaveDialogue({
    title:'Save Your Map',
    defaultPath: path.join(DSKTP, `Maps`),
    filters:[
      {
        name: "Game Files",
        extensions: [ 'tzt', 'json', 'nvt', 'gfg' ]
      }
    ],
    ...options
  })
  return result.filePath;
});
ipcMain.handle('open-dialogue', async (event, options) => {
  const result = await dialog.showOpenDialog({
    title: "Load a Level Map",
    properties: ['openFile'],
    filters: [
      { name: "Game files", extensions: [ 'txt', 'json', 'nvt', 'gfg' ]},
      { name: "All", extensions: ['*']}
    ],
    ...options
  })
  return result.filePaths
})
ipcMain.handle('get-DSKTP', async (event)=>{
  return DSKTP;
});
ipcMain.handle('get-astPath', async(event, pth='')=>{
  return path.join(assetPath, pth);
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});