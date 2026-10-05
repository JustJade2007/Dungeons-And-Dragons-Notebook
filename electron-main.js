/**
 * Electron Main Process for Dungeons & Dragons Notebook
 *
 * Runs the application in its own native desktop window (NOT Microsoft Edge).
 * Embeds the local Express server and serves the tabletop codex securely and seamlessly.
 */

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const isPackaged = app.isPackaged;
const appRoot = isPackaged ? path.dirname(process.execPath) : __dirname;
process.env.APP_DATA_DIR = path.join(appRoot, 'data');

// Import server module
let serverModule;
try {
  serverModule = require('./server.bundle.js');
} catch (e) {
  serverModule = require('./server.js');
}

const { startServer } = serverModule;

let mainWindow = null;
let serverInstance = null;

const isHeadless = process.argv.includes('--no-open') || process.env.TEST_MODE === 'true';

async function initializeApp() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const serverInfo = await startServer(port, false);
    serverInstance = serverInfo.server;
    const appUrl = serverInfo.url;

    if (isHeadless) {
      console.log(`[Desktop App] Headless test mode active at: ${appUrl}`);
      // Keep event loop alive for headless tests
      setInterval(() => {}, 10000);
      return;
    }

    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 700,
      title: 'Dungeons & Dragons Notebook — Tabletop Campaign Organizer',
      backgroundColor: '#07090e',
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    Menu.setApplicationMenu(null);

    await mainWindow.loadURL(appUrl);

    mainWindow.on('closed', () => {
      mainWindow = null;
      if (serverInstance) {
        serverInstance.close(() => {
          app.quit();
        });
      } else {
        app.quit();
      }
    });
  } catch (err) {
    console.error('[Desktop App] Initialization error:', err);
    app.quit();
  }
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (serverInstance) {
    serverInstance.close(() => {
      app.quit();
    });
  } else {
    app.quit();
  }
});
