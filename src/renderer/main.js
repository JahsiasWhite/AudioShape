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
    // Get all songs in the folder
    // TODO Get all songs in subdirectories as well
    const audios = await glob(folderPath + '\\*.{mp3, wav, ogg}');

    // Make sure we have some files
    // ! Should I also say there's an error here?
    const files = await getMp3FilesFromDirectory(folderPath);
    if (files.length === 0) {
      return;
    }

    const file = folderPath + '\\' + files[0];

    let count = 0; // This is so we know when we ran out of files to parse and can return
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
        if (count === files.length) {
          mainWindow.webContents.send('GRAB_SONGS', songs);
        }
      })
      .catch((error) => {
        // TODO: ! SEND THE ERROR MESSAGE THEYRE DIFF
        mainWindow.webContents.send('ERROR_MESSAGE', {
          title: 'Error',
          description: `Unable to parse metadata of: ${file}`,
        });
      });

    // Glob(folderPath + '**\\*.{mp3, wav, ogg}', (error, files) => {
    //   console.error('INSIDE');
    //   if (error) {
    //     console.log('ERROR   ', error);
    //     // localWindow.webContents.send('ERROR_MESSAGE', {
    //     //   title: 'Error',
    //     //   description: "Couldn't fetch songs.",
    //     //   color: 'rgb(40,40,40)',
    //     //   duration: 5000,
    //     // });
    //   } else {
    //     console.error('IN ELSE ');
    //     let songs = [];
    //     let count = 0;
    //     files.map((file) => {
    //       metadata
    //         .parseFile(file)
    //         .then((data) => {
    //           let title = data.common.title;
    //           let artist = data.common.artist;
    //           let album = data.common.album;
    //           let duration = data.format.duration;

    //           // To avoid empty fields, if the file doesn't have the appropriate metadata, the file's name is used as the title, and the album and artist are set to "Unknown".
    //           if (
    //             typeof data.common.title === 'undefined' ||
    //             data.common.title.trim() === ''
    //           ) {
    //             title = path.basename(file).split('.').slice(0, -1).join('.');
    //           }
    //           if (
    //             typeof data.common.album === 'undefined' ||
    //             data.common.album.trim() === ''
    //           ) {
    //             album = 'Unknown Album';
    //           }
    //           if (
    //             typeof data.common.artist === 'undefined' ||
    //             data.common.artist.trim() === ''
    //           ) {
    //             artist = 'Unknown Artist';
    //           }

    //           songs.push({
    //             file: file,
    //             title: title,
    //             artist: artist,
    //             album: album,
    //             duration: duration,
    //           });

    //           count++;
    //           if (count === files.length) {
    //             console.error('SENDING SONGS ', songs);
    //             localWindow.webContents.send('getSongs', songs);
    //           }
    //         })
    //         .catch((error) => {
    //           console.log(error);
    //           localWindow.webContents.send('ERROR_MESSAGE', {
    //             title: 'Error',
    //             description: "Couldn't parse the metadata.",
    //             color: 'rgb(40,40,40)',
    //             duration: 5000,
    //           });
    //         });
    //     });
    //     console.error('RIGHTHERE', files);
    //   }
    // });
  });

  /* Helper IPC functions */
  // Function to get all MP3 files from a directory
  async function getMp3FilesFromDirectory(folderPath) {
    let files;
    try {
      files = await fs.promises.readdir(folderPath);
      console.error('FILES ARE : ', files);
    } catch (e) {
      mainWindow.webContents.send('ERROR_MESSAGE', {
        title: 'Error',
        description: `No file or directory found at: ${folderPath}`,
      });
      return [];
    }
    const mp3Files = files.filter((file) => path.extname(file) === '.mp3');
    return mp3Files;
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
