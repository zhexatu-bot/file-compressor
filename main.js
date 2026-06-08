const { app, BrowserWindow } = require('electron');
require('./server');

let mainWindow;
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 900, height: 700, minWidth: 750, minHeight: 550,
    title: '文件压缩器',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  mainWindow.loadURL('http://localhost:3458');
  mainWindow.setMenuBarVisibility(false);
});
app.on('window-all-closed', () => app.quit());
