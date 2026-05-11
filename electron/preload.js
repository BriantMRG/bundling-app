const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Styles
  getStyles: () => ipcRenderer.invoke('get-styles'),
  insertStyle: (style) => ipcRenderer.invoke('insert-style', style),
  updateStyle: (style) => ipcRenderer.invoke('update-style', style),
  deleteStyle: (id) => ipcRenderer.invoke('delete-style', id),

  // Bundles
  getBundles: () => ipcRenderer.invoke('get-bundles'),
  getBundlesByStyle: (styleId) => ipcRenderer.invoke('get-bundles-by-style', styleId),
  insertBundle: (bundle) => ipcRenderer.invoke('insert-bundle', bundle),
  updateBundle: (bundle) => ipcRenderer.invoke('update-bundle', bundle),
  deleteBundle: (id) => ipcRenderer.invoke('delete-bundle', id),
  checkDuplicateBundle: (bundleNumber, styleId) =>
    ipcRenderer.invoke('check-duplicate-bundle', bundleNumber, styleId),
  // Updates
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', cb),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', cb),
  installUpdate: () => ipcRenderer.send('install-update'),
});