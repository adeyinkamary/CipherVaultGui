const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cipherVault", {
  pickFile: () => ipcRenderer.invoke("pick-file"),
  encrypt: (payload) => ipcRenderer.invoke("encrypt-file", payload),
  decrypt: (payload) => ipcRenderer.invoke("decrypt-file", payload),
});
