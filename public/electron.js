const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');
const fs = require('fs');
const url = require('url');

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

/* Create the files to save settings */
const dataDirectory = path.join(app.getPath('userData'), 'Data');
const settingsFile = dataDirectory + 'settings.json';
const playlistsFile = dataDirectory + 'playlists.json';
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory);
}
if (!fs.existsSync(settingsFile)) {
  fs.writeFileSync(settingsFile, defaultSettings);
}
if (!fs.existsSync(playlistsFile)) {
  fs.writeFileSync(playlistsFile, '');
}

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
    let correctedPath = '';
    // If folderPath is empty, use the default path
    if (folderPath === '') {
      // ? Put in its own function? getSongDirectory
      const settingsPath = path.join(
        app.getPath('userData'),
        'Data',
        'settings.json'
      );
      const settingsData = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(settingsData);

      correctedPath = settings.libraryDirectory;
    } else {
      // Our string has '\' instead of '/' so we gotta fix that
      correctedPath = folderPath.replace(/\\/g, '/');

      // Save the new path to settings so when the app first starts, it will grab these
      updateLibraryDirectory(correctedPath);
    }

    // Get all songs in the given directory as well as all subdirectories
    const audios = await glob(correctedPath + '/**/*.{mp3, wav, ogg}');
    const imageFiles = await glob(correctedPath + '/**/*.{jpg, jpeg, png}');

    // Make sure we have some files
    if (audios.length === 0) {
      // ! OUTPUT ERROR HERE?
      event.reply('GRAB_SONGS', []); // Send an empty array to the renderer ?? WHAT DOES THIS DO?
      return;
    }

    /* Get all songs */
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

          /* Gets image for the song / album */
          // TODO Make this loop through all images
          const albumDir = path.dirname(file);
          const imageDir = path.dirname(imageFiles[0]);
          let savedImage = undefined;
          if (albumDir === imageDir) {
            savedImage = imageFiles[0];
          }

          songs.push({
            file: file,
            title: title,
            artist: artist,
            album: album,
            duration: duration,
            albumImage: savedImage, // Init image
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

  /* Helper function */

  function updateLibraryDirectory(newLibraryDirectory) {
    const settingsPath = path.join(
      app.getPath('userData'),
      'Data',
      'settings.json'
    );

    try {
      const settingsData = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(settingsData);

      settings.libraryDirectory = newLibraryDirectory;

      console.error(
        'WRITING PATH',
        settings.libraryDirectory,
        newLibraryDirectory
      );
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error('Error updating libraryDirectory in settings:', error);
    }
  }
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
