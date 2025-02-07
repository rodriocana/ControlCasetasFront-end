const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "dist", 'control-casetas', 'browser', "assets","iconoControl.png"), // Asegúrate de que la ruta y el archivo sean correctos
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Ajusta la ruta para cargar el archivo index.html de la carpeta 'browser'
  const indexPath = path.join(__dirname, 'dist', 'control-casetas', 'browser', 'index.html');
  console.log("Cargando: ", indexPath);  // Verifica la ruta en la consola
  win.loadFile(indexPath);

  // Abre las herramientas de desarrollo (opcional)
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
