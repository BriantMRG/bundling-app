const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const db = require('../src/db/database');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));

  // Check for updates after window loads
  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  // Update available — ask user
  autoUpdater.on('update-available', () => {
    win.webContents.send('update-available');
  });

  // Update downloaded — ask user to restart
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
  });

  // Listen for user's decision
  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Styles ──────────────────────────────────────────
ipcMain.handle('get-styles', () => db.getAllStyles());
ipcMain.handle('insert-style', (_, style) => db.insertStyle(style));
ipcMain.handle('update-style', (_, style) => db.updateStyle(style));
ipcMain.handle('delete-style', (_, id) => db.deleteStyle(id));

// ── Bundles ─────────────────────────────────────────
ipcMain.handle('get-bundles', () => db.getAllBundles());
ipcMain.handle('get-bundles-by-style', (_, styleId) => db.getBundlesByStyle(styleId));
ipcMain.handle('insert-bundle', (_, bundle) => db.insertBundle(bundle));
ipcMain.handle('update-bundle', (_, bundle) => db.updateBundle(bundle));
ipcMain.handle('delete-bundle', (_, id) => db.deleteBundle(id));
ipcMain.handle('check-duplicate-bundle', (_, bundleNumber, styleId) =>
  db.checkDuplicateBundle(bundleNumber, styleId)
);