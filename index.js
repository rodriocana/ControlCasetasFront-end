const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.resolve(__dirname, "dist", "control-casetas", "browser", "assets", "iconoControl.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Se mantiene solo una vez
    },
  });

  // Ruta al index.html
  win.loadFile(path.join(__dirname, 'dist', 'control-casetas', 'browser', 'index.html')); // Verifica la ruta




  // Abrir DevTools solo en desarrollo
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
}

// Evento cuando la app está lista
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar la aplicación cuando todas las ventanas se cierran (excepto en macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
