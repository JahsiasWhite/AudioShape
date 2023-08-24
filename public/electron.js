const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');
const fs = require('fs');
const url = require('url');

const { glob, globSync, Glob } = require('glob');
// const { fetch } = require('node-fetch');
let fetch;
import('node-fetch').then((module) => {
  fetch = module;
});

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
    folderPath = getParentDirectory(folderPath); // ! DOES THIS WORK?

    let correctedPath = '';
    console.error('PATH IS ', folderPath, path.dirname(folderPath));
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
    console.error('IMAGES : ', imageFiles);

    // Make sure we have some files
    if (audios.length === 0) {
      // ! OUTPUT ERROR HERE?
      event.reply('GRAB_SONGS', []); // Send an empty array to the renderer ?? WHAT DOES THIS DO?
      return;
    }

    /* Get all songs */
    let count = 0; // This is so we know when we ran out of files to parse and can return
    songs = []; // ? Reset songs here?
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
          const albumDir = path.dirname(file);
          let savedImage = undefined;
          for (image in imageFiles) {
            const imageDir = path.dirname(imageFiles[image]);
            if (albumDir === imageDir) {
              savedImage = imageFiles[image];
            }
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

  ipcMain.on('SAVE_SONG', async (event, speed, filePath) => {
    console.error('AB   : ', speed, speed.sampleRate);
    // Apply the speed modification to the audioBuffer (using audio processing libraries)

    const audioBuffer = await getAudioBuffer(speed, filePath);

    // Convert the audio buffer to a WAV file
    const wavData = audioBufferToWav(audioBuffer);

    // Derive the output file path
    const outputPath = filePath.replace('.wav', '_modified.wav');

    console.error(wavData);

    // Write the WAV data to the output file
    // fs.writeFileSync(outputPath, new Buffer(wavData), 'binary');
    // // Send a response back to the renderer process
    // event.sender.send('EXPORT_COMPLETE', outputPath);

    // // For demonstration, let's assume modifiedAudioBuffer is the modified audio data
    // // const modifiedAudioBuffer = applySpeedModification(audioBuffer);
    // filePath = getParentDirectory(filePath);

    // // Derive the output file path based on the current file path
    // const outputPath = filePath.replace('.wav', '_modified.wav');

    // if (outputPath) {
    //   const audioData = {
    //     sampleRate: audioBuffer.sampleRate,
    //     channelData: [],
    //   };
    //   // Convert each channel's data to a Float32Array
    //   for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    //     audioData.channelData[channel] = audioBuffer.getChannelData(channel);
    //   }

    //   console.error("HERE : ", audioData);
    //   // Convert the modified audio buffer to WAV format
    //   const wavData = await wavEncoder.encode(audioData);
    //   // Convert the WAV data to a Blob
    //   const wavBlob = new Blob([new Uint8Array(wavData)], {
    //     type: 'audio/wav',
    //   });
    // }
  });

  /* Helper function */

  async function getAudioBuffer(newSpeed, filePath) {
    // const audioContext = new (window.AudioContext ||
    //   window.webkitAudioContext)();

    // Load the current song's audio buffer
    console.error(filePath);
    const response = await fetch(filePath);
    const audioData = await response.arrayBuffer();

    // Decode the audio data to an audio buffer
    const audioBuffer = await audioContext.decodeAudioData(audioData);

    // Create a new audio buffer with increased playback speed
    // .5 === 2x speed, 2 === .5x speed
    const newLength = audioBuffer.duration * newSpeed;
    const newSampleCount = Math.ceil(newLength * audioBuffer.sampleRate);

    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      newSampleCount,
      audioBuffer.sampleRate
    );

    /* Copies the audio data to the new buffer */
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const oldData = audioBuffer.getChannelData(channel);
      const newData = newBuffer.getChannelData(channel);

      console.error(audioBuffer.length, newBuffer.length, newSampleCount);
      for (let i = 0; i < newBuffer.length; i++) {
        const oldIndex = Math.floor(i / newSpeed);
        newData[i] = oldData[oldIndex] || 0;
      }
    }

    return newBuffer;
  }

  /**
   * Takes in a directory path, typically of a file. This removes everything after the last '/'
   */
  function getParentDirectory(filePath) {
    const cutoffIndex = filePath.lastIndexOf('\\');
    const folderPath = filePath.substring(0, cutoffIndex);

    const fixedFolderPath = folderPath.substring(
      0,
      folderPath.lastIndexOf('\\')
    );

    return fixedFolderPath;
  }

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
        'WRITING NEW PATH',
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
