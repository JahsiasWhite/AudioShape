const { contextBridge, ipcRenderer } = require('electron');

const electronHandler = {
  windowControls: {
    minimize: () => ipcRenderer.send('WINDOW_MINIMIZE'),
    maximize: () => ipcRenderer.send('WINDOW_MAXIMIZE'),
    close: () => ipcRenderer.send('WINDOW_CLOSE'),
  },
  ipcRenderer: {
    sendMessage(channel, ...args) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel, func) {
      const subscription = (_event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel, func) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    removeAllListeners(channel, func) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
