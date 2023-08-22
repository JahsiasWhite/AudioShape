const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');
const fs = require('fs');

const { glob, globSync, Glob } = require('glob');

// Annoying way to import this tbh
let metadata;
import('music-metadata').then((module) => {
  metadata = module;
});

/* Globals */
let defaultSettings = JSON.stringify({
  libraryDirectory: '',
  loop: 'none',
  volume: 100,
  allowRemote: true,
});

// TODO: I don't think I should even save these, at least not all. Is there a way to just access the directory so we don't have to do this?
let songs = [];

app.name = 'Music Player';

app.on('ready', function () {
  // Create our app
  const mainWindow = new BrowserWindow({
    width: app.isPackaged ? 800 : 1100, // If we are debugging, we want to double the width for the debug window
    height: 600,
    webPreferences: {
      // Set the path of an additional "preload" script that can be used to
      // communicate between node-land and browser-land.
      preload: path.join(__dirname, 'preload.js'),

      nodeIntegration: true,
      // enableRemoteModule: true,
      // contextIsolation: false,

      // ! TODO Idk this seems bad... cant play local files without it though?
      webSecurity: false,
    },
  });

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    : 'http://localhost:3000';
  mainWindow.loadURL(appURL);

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  /* IPC STUFF */

  ipcMain.on('GET_SONGS', async (event, folderPath) => {
    // Our string has '\' instead of '/' so we gotta fix that
    const correctedPath = folderPath.replace(/\\/g, '/');

    // Get all songs in the given directory as well as all subdirectories
    const audios = await glob(correctedPath + '/**/*.{mp3, wav, ogg}');
    console.error(audios);

    // Make sure we have some files
    if (audios.length === 0) {
      // ! OUTPUT ERROR HERE?
      event.reply('GRAB_SONGS', []); // Send an empty array to the renderer ?? WHAT DOES THIS DO?
      return;
    }

    let count = 0; // This is so we know when we ran out of files to parse and can return
    audios.map((file) => {
      metadata
        .parseFile(file)
        .then((data) => {
          let title = data.common.title;
          let artist = data.common.artist;
          let album = data.common.album;
          let duration = data.format.duration;

          // To avoid empty fields, if the file doesn't have the appropriate metadata, the file's name is used as the title, and the album and artist are set to "Unknown".
          if (
            typeof data.common.title === 'undefined' ||
            data.common.title.trim() === ''
          ) {
            title = path.basename(file).split('.').slice(0, -1).join('.');
          }
          if (
            typeof data.common.album === 'undefined' ||
            data.common.album.trim() === ''
          ) {
            album = 'Unknown Album';
          }
          if (
            typeof data.common.artist === 'undefined' ||
            data.common.artist.trim() === ''
          ) {
            artist = 'Unknown Artist';
          }

          songs.push({
            file: file,
            title: title,
            artist: artist,
            album: album,
            duration: duration,
          });

          // So we know when to end :)
          // Either this or more async + try blocks
          count++;
          if (count === audios.length) {
            mainWindow.webContents.send('GRAB_SONGS', songs);
          }
        })
        .catch((error) => {
          mainWindow.webContents.send('ERROR_MESSAGE', {
            title: 'Error',
            // description: `Unable to parse metadata of: ${file}`,
            description: error.message,
          });
        });
    });
  });
});

// app.whenReady().then(createWindow);

/* MAC OS STUFF */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
