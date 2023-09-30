const { app, BrowserWindow, ipcMain, shell, session } = require('electron');

const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const url = require('url');

const { v4: uuidv4 } = require('uuid');

// For downloading youtube videos
const ytdl = require('ytdl-core');

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

/* Where the files are saved for the auto playing  */
let temporaryFilePath = null;
let newTemporaryFilePath = null;

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
    // If folderPath is empty, use the default path
    if (folderPath === '') {
      const settingsPath = getSettingsPath();

      const settings = getSettings(settingsPath);

      correctedPath = settings.libraryDirectory;
    } else {
      // Our string has '\' instead of '/' so we gotta fix that
      correctedPath = folderPath.replace(/\\/g, '/');

      // Save the new path to settings so when the app first starts, it will grab these
      updateLibraryDirectory(correctedPath);
    }

    // Get all songs in the given directory as well as all subdirectories
    const audios = await glob(correctedPath + '/**/*.{mp3,wav,ogg,mp4}');
    const imageFiles = await glob(correctedPath + '/**/*.{jpg,jpeg,png}');

    // Make sure we have at least one song in the directory
    if (audios.length === 0) {
      // ! OUTPUT ERROR HERE?
      event.reply('GRAB_SONGS', []); // Send an empty array to the renderer ?? I think this is broke right now
      return;
    }

    /* Get all songs */
    let count = 0; // This is so we know when we ran out of files to parse and can return
    songs = {}; // ? Reset songs here?
    audios.map((file) => {
      metadata
        .parseFile(file)
        .then((data) => {
          let title = data.common.title;
          let artist = data.common.artist;
          let album = data.common.album;
          let duration = data.format.duration;

          // Unique key, ! TODO: Should I do this different? Is this function costly?
          // Maybe do somehashing instead of this crude...
          let key = duration;

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

          // songs.push({
          //   id: key,
          //   file: file,
          //   title: title,
          //   artist: artist,
          //   album: album,
          //   duration: duration,
          //   albumImage: savedImage, // Init image
          // });
          songs[key] = {
            id: key,
            file: file,
            title: title,
            artist: artist,
            album: album,
            duration: duration,
            albumImage: savedImage, // Init image
          };

          // So we know when to end :)
          // Either this or more async + try blocks
          count++;
          if (count === audios.length) {
            mainWindow.webContents.send('GRAB_SONGS', songs);
          }
        })
        .catch((error) => {
          console.error('ERROR AT ', count, file, error);
          mainWindow.webContents.send('ERROR_MESSAGE', {
            title: 'Error',
            // description: `Unable to parse metadata of: ${file}`,
            description: error.message,
          });
        });
    });
  });

  /**
   * Exports the given song to the same location it was copied from
   */
  ipcMain.on('SAVE_SONG', async (event, audioData, filePath) => {
    // Construct the audio data into a Blob of wav data
    const wavData = await getAudioBuffer(audioData);

    // Create the new file path
    const outputPath = filePath.replace('.mp3', '_modified.wav'); // TODO Make this .mp3 || .wav

    // Convert the Blob to a Buffer
    const bufferData = await wavData.arrayBuffer();
    const buffer = Buffer.from(bufferData);

    // Write the Buffer to the file
    fs.writeFileSync(outputPath, buffer);
  });

  /* When auto playing with edits on, we have to save the song to play it will full functionality */
  ipcMain.on('SAVE_TEMP_SONG', async (event, audioData) => {
    newTemporaryFilePath = path.join(dataDirectory, `${uuidv4()}.wav`);

    // Construct the audio data into a Blob of wav data
    const wavData = await getAudioBuffer(audioData);

    // Convert the Blob to a Buffer
    const bufferData = await wavData.arrayBuffer();
    const buffer = Buffer.from(bufferData);

    // Write the Buffer to the temporary file
    fs.writeFileSync(newTemporaryFilePath, buffer);

    // Delete the temporary file on exit
    const deleteOnExit = () => {
      fs.unlinkSync(newTemporaryFilePath);
    };
    process.on('exit', deleteOnExit);
    process.on('SIGINT', deleteOnExit); // Listen to Ctrl+C events

    // Send back the path to the saved temporary file
    mainWindow.webContents.send('TEMP_SONG_SAVED', newTemporaryFilePath);
  });

  /**
   * Songs are created when we autoplay songs with custom settings, so they must be deleted when they are finished playing.
   */
  ipcMain.on('DELETE_TEMP_SONG', async (event) => {
    if (temporaryFilePath) {
      try {
        await fsPromises.unlink(temporaryFilePath);
      } catch (error) {
        console.error('Error deleting previous temporary file:', error);
      }
    }

    // newTemporaryFilePath is updated in SAVE_TEMP_SONG, which will be the next song that gets deleted
    temporaryFilePath = newTemporaryFilePath;
  });

  /**
   * Starts the spotify login with the user id
   */
  // var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
  // var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  var spotify_client_id = '071723df542346fab9e3c0f2dee691fd';
  var spotify_client_secret = 1;
  // my application redirect uri
  const redirectUri = 'http://localhost/oauth/redirect';
  ipcMain.on('start-spotify-login', (event) => {
    const spotifyClientId = spotify_client_id;
    const scope = 'streaming user-read-email user-read-private';
    const state = generateRandomString(16);
    // const redirectUri = 'http://localhost:3000/auth/callback';
    const authUrl =
      `https://accounts.spotify.com/authorize/?` +
      `response_type=code&` +
      `client_id=${spotifyClientId}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    shell.openExternal(authUrl);
  });

  // Prepare to filter only the callbacks for my redirectUri
  const filter = {
    urls: [redirectUri + '*'],
  };
  // intercept all the requests for that includes my redirect uri
  session.defaultSession.webRequest.onBeforeRequest(
    filter,
    function (details, callback) {
      const url = details.url;
      // process the callback url and get any param you need

      // don't forget to let the request proceed
      callback({
        cancel: false,
      });
    }
  );

  /**
   * Gets all user settings. Called when the user navigates to the settings page
   */
  ipcMain.on('GET_SETTINGS', (event) => {
    const settings = getSettings();
    const songDirectory = settings.libraryDirectory;

    const outputDirectory = dataDirectory;

    const output = {
      songDirectory: songDirectory,
      outputDirectory: outputDirectory,
    };

    mainWindow.webContents.send('GET_SETTINGS', output);
  });

  /**
   * Get all user playlists
   */
  ipcMain.on('GET_PLAYLISTS', (event) => {
    // Get filepath
    const playlistsFilePath = path.join(
      app.getPath('userData'),
      'Data',
      'playlists.json'
    );
    const playlists = getPlaylists(playlistsFilePath);
    mainWindow.webContents.send('GRAB_PLAYLISTS', playlists);
  });

  /**
   * Register an IPC listener for creating playlists. Calls back to the sender with the new playlists
   */
  ipcMain.on('CREATE_PLAYLIST', (event, playlistName) => {
    const updatedPlaylists = createPlaylist(playlistName);
    mainWindow.webContents.send('CREATE_PLAYLIST', updatedPlaylists);
  });

  ipcMain.on('DELETE_PLAYLIST', (event, playlistToDelete) => {
    // Get filepath
    const playlistsFilePath = path.join(
      app.getPath('userData'),
      'Data',
      'playlists.json'
    );

    // Get playlists
    const playlists = getPlaylists(playlistsFilePath);

    // Find and remove the playlist with the matching name
    const updatedPlaylists = playlists.filter(
      (playlist) => playlist.name !== playlistToDelete.name
    );

    try {
      // Write the updated playlists back to the file
      fs.writeFileSync(
        playlistsFilePath,
        JSON.stringify(updatedPlaylists, null, 2)
      );

      // Update the new playlists
      mainWindow.webContents.send('GRAB_PLAYLISTS', updatedPlaylists);
    } catch (error) {
      console.error('Error deleting playlist:', error);

      // Send an error message back to the renderer process
      // event.sender.send('PLAYLIST_DELETE_ERROR', error.message);
    }
  });

  /**
   * Add a new song to the given playlist
   *
   */
  ipcMain.on('TOGGLE_SONG_TO_PLAYLIST', (event, playlistName, songName) => {
    try {
      // Load the playlists file
      const playlistsFilePath = path.join(
        app.getPath('userData'),
        'Data',
        'playlists.json'
      );
      const playlists = getPlaylists(playlistsFilePath);

      // Find the playlist by name
      const playlistIndex = playlists.findIndex(
        (playlist) => playlist.name === playlistName
      );

      if (playlistIndex === -1) {
        // Playlist not found, handle accordingly (e.g., show an error)
        console.error(`Playlist "${playlistName}" not found.`);
        return;
      }

      // Add the song to the playlist
      if (!playlists[playlistIndex].songs) {
        // If the playlist doesn't have a songs array, create one
        playlists[playlistIndex].songs = [];
      }

      // Check if the song is already in the playlist
      if (playlists[playlistIndex].songs.includes(songName)) {
        // Remove the song from the playlist
        playlists[playlistIndex].songs = playlists[playlistIndex].songs.filter(
          (s) => s !== songName
        );
      } else {
        // Add the song to the playlist
        playlists[playlistIndex].songs.push(songName);
      }

      // Check if the playlist already has an image. If not, add one from the song!
      console.error(songs);
      // const song = songs[songName];
      // playlists[playlistIndex].image = song.image;

      // Save the updated playlists data back to the file
      fs.writeFileSync(playlistsFilePath, JSON.stringify(playlists, null, 2));

      // Update the new playlists
      mainWindow.webContents.send('GRAB_PLAYLISTS', playlists);
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error adding song to playlist:', error);
    }
  });

  /**
   * Downloads the youtube video from the specified url
   */
  ipcMain.on('DOWNLOAD_YOUTUBE_VID', async (event, videoUrl) => {
    console.error('URL IS : ', videoUrl);
    try {
      // Get the youtube video title
      const info = await ytdl.getInfo(videoUrl);
      const videoTitle = info.videoDetails.title;

      // Get where we are saving the video to
      const settings = getSettings();
      const songDirectory = settings.libraryDirectory;

      const downloadOptions = {
        directory: songDirectory, // Update with your desired directory
        filename: `${videoTitle}.mp4`,
      };
      console.error('DOWNLAODING ', songDirectory);
      // Start the download
      ytdl(videoUrl, downloadOptions)
        .pipe(
          fs.createWriteStream(
            path.join(downloadOptions.directory, downloadOptions.filename)
          )
        )
        .on('finish', () => {
          console.error('FINISHED DOWNLOADING');
          mainWindow.webContents.send(
            'download-success',
            'Download completed!'
          );
        })
        .on('error', (error) => {
          console.error('Error downloading video', error.message);
          mainWindow.webContents.send('download-error', error.message);
        });
    } catch (error) {
      console.error('Error fetching video', error.message);

      // maybe use error.name === 'SyntaxError' instead?
      if (error.message === 'Invalid or unexpected token') {
        // This error usually happens when the ytdl package is broken
        console.error('ytdl package is most likely broken');
      }

      mainWindow.webContents.send('download-error', error.message);
    }
  });

  /**
   *
   *
   * Helper functions
   *
   *
   *
   */

  function getSettingsPath() {
    const settingsPath = path.join(
      app.getPath('userData'),
      'Data',
      'settings.json'
    );
    return settingsPath;
  }

  function getSettings(settingsPath) {
    // Optional parameter
    if (settingsPath === undefined) {
      settingsPath = getSettingsPath();
    }

    const settingsData = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(settingsData);
  }

  /**
   * Gets all user playlists
   */
  function getPlaylists(playlistsFilePath) {
    let playlists = []; // Should I reget this everytime?
    try {
      const playlistsData = fs.readFileSync(playlistsFilePath, 'utf-8');
      playlists = JSON.parse(playlistsData);
    } catch (error) {
      console.error('Error reading playlists file:', error);
    }

    return playlists;
  }

  /**
   * Creates a new playlist with the given playlistName
   * @param {String} playlistName The name of the playlist
   * @returns [] of playlists with the newly created playlist
   */
  function createPlaylist(playlistName) {
    // Get playlist location
    const playlistsFilePath = path.join(
      app.getPath('userData'),
      'Data',
      'playlists.json'
    );

    // Get all, if any, existing playlists
    let playlists = getPlaylists(playlistsFilePath);

    // Create a new playlist object
    const newPlaylist = {
      name: playlistName,
      image: '',
      songs: [],
    };

    // Add the new playlist to the list of playlists
    playlists.push(newPlaylist);

    // Save the updated list of playlists back to the JSON file
    try {
      fs.writeFileSync(playlistsFilePath, JSON.stringify(playlists, null, 2));
    } catch (error) {
      console.error('Error writing playlists file:', error);
    }

    // Return the updated list of playlists (optional)
    return playlists;
  }

  var generateRandomString = function (length) {
    var text = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  async function getAudioBuffer(wavBytes) {
    // const audioContext = new (window.AudioContext ||
    //   window.webkitAudioContext)();

    // Load the current song's audio buffer
    const wav = new Blob([wavBytes], { type: 'audio/wav' });
    // const response = await fetch(filePath);
    // const audioData = await response.arrayBuffer();

    // // Decode the audio data to an audio buffer
    // const audioBuffer = await audioContext.decodeAudioData(audioData);

    // // Create a new audio buffer with increased playback speed
    // // .5 === 2x speed, 2 === .5x speed
    // const newLength = audioBuffer.duration * newSpeed;
    // const newSampleCount = Math.ceil(newLength * audioBuffer.sampleRate);

    // const newBuffer = audioContext.createBuffer(
    //   audioBuffer.numberOfChannels,
    //   newSampleCount,
    //   audioBuffer.sampleRate
    // );

    // /* Copies the audio data to the new buffer */
    // for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    //   const oldData = audioBuffer.getChannelData(channel);
    //   const newData = newBuffer.getChannelData(channel);

    //   console.error(audioBuffer.length, newBuffer.length, newSampleCount);
    //   for (let i = 0; i < newBuffer.length; i++) {
    //     const oldIndex = Math.floor(i / newSpeed);
    //     newData[i] = oldData[oldIndex] || 0;
    //   }
    // }

    return wav;
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

  /**
   * Changes the current song directory into the new given directory.
   * Also saves the change so on next boot, the new directory will be loaded
   * @param {String} newLibraryDirectory - Directory path
   */
  function updateLibraryDirectory(newLibraryDirectory) {
    const settingsPath = getSettingsPath(); // TODO: Can I combine this function with getSettings?

    try {
      const settings = getSettings(settingsPath);

      settings.libraryDirectory = newLibraryDirectory;

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.error('Updated song directory to ', newLibraryDirectory);
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
