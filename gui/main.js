const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const encryptController = require("../src/controllers/encryptController");
const decryptController = require("../src/controllers/decryptController");



function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.handle("pick-file", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("encrypt-file", async (_, payload) => {
  try {
    await encryptController(payload);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle("decrypt-file", async (_, payload) => {
  try {
    await decryptController(payload);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
