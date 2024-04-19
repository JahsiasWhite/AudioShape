const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
  protocol,
} = require('electron');

const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const url = require('url');

// For outputting to terminal
const readline = require('readline');

const { v4: uuidv4 } = require('uuid');

// For downloading youtube videos
const ytdl = require('ytdl-core');
const ffmpegPath = require('ffmpeg-static');
const cp = require('child_process');

// For searching youtube videos. The spotify downloader requires this
const youtubeSearch = require('yt-search');

// Adding metadata to newly created music files
// const NodeID3 = require('node-id3');
const ffmpeg = require('fluent-ffmpeg');

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
  mp4DownloadEnabled: false,
  dataDirectory: '',
});

// TODO: I don't think I should even save these, at least not all. Is there a way to just access the directory so we don't have to do this?
let songs = [];

/* Create the files to save settings */
// TODO: Use these instead of 'path.join()'. I don't know why I have so many duplicates
const dataDirectory = path.join(app.getPath('userData'), 'Data');
const settingsFile = dataDirectory + '\\settings.json';
const playlistsFile = dataDirectory + '\\playlists.json';
const effectCombosFile = dataDirectory + '\\effectCombos.json';
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory);
}
if (!fs.existsSync(settingsFile)) {
  fs.writeFileSync(settingsFile, defaultSettings);
}
if (!fs.existsSync(playlistsFile)) {
  fs.writeFileSync(playlistsFile, '');
}
if (!fs.existsSync(effectCombosFile)) {
  fs.writeFileSync(effectCombosFile, JSON.stringify({}));
}

/* Where the files are saved for the auto playing  */
let temporaryFilePath = null;
let newTemporaryFilePath = null;

app.name = 'Music Player';

// Register the custom protocol handler
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'myapp', // Use your own custom scheme
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

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
    folderPath = getParentDirectory(folderPath);

    let correctedPath = '';
    // If folderPath is empty, use the default path
    if (folderPath === '') {
      const settingsPath = createSettingsPath();

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

    console.error('Grabbing song data...');
    audios.forEach(async (file) => {
      try {
        const songData = await processSongMetadata(file, imageFiles);
        songs[songData.id] = songData;

        count++;
        if (count === audios.length) {
          mainWindow.webContents.send('GRAB_SONGS', songs);
        }
      } catch (error) {
        console.error('ERROR AT', count, '\nFile: ', file, '\nError: ', error);
        mainWindow.webContents.send('ERROR_MESSAGE', {
          title: 'Error',
          description: error.message,
        });
      }
    });
    console.error('Finished grabbing song data...');

    // audios.map((file) => {
    //   metadata
    //     .parseFile(file)
    //     .then((data) => {

    //       let title = data.common.title;
    //       let artist = data.common.artist;
    //       let album = data.common.album;
    //       let duration = data.format.duration;

    //       // Unique key, ! TODO: Should I do this different? Is this function costly?
    //       // Maybe do somehashing instead of this crude...
    //       let key = duration;

    //       // To avoid empty fields, if the file doesn't have the appropriate metadata, the file's name is used as the title, and the album and artist are set to "Unknown".
    //       if (
    //         typeof data.common.title === 'undefined' ||
    //         data.common.title.trim() === ''
    //       ) {
    //         title = path.basename(file).split('.').slice(0, -1).join('.');
    //       }
    //       if (
    //         typeof data.common.album === 'undefined' ||
    //         data.common.album.trim() === ''
    //       ) {
    //         album = 'Unknown Album';
    //       }
    //       if (
    //         typeof data.common.artist === 'undefined' ||
    //         data.common.artist.trim() === ''
    //       ) {
    //         artist = 'Unknown Artist';
    //       }

    //       /* Gets image for the song / album */
    //       const albumDir = path.dirname(file);
    //       let savedImage = undefined;
    //       for (image in imageFiles) {
    //         const imageDir = path.dirname(imageFiles[image]);
    //         if (albumDir === imageDir) {
    //           savedImage = imageFiles[image];
    //         }
    //       }

    //       // songs.push({
    //       //   id: key,
    //       //   file: file,
    //       //   title: title,
    //       //   artist: artist,
    //       //   album: album,
    //       //   duration: duration,
    //       //   albumImage: savedImage, // Init image
    //       // });
    //       songs[key] = {
    //         id: key,
    //         file: file,
    //         title: title,
    //         artist: artist,
    //         album: album,
    //         duration: duration,
    //         albumImage: savedImage, // Init image
    //       };

    //       // So we know when to end :)
    //       // Either this or more async + try blocks
    //       count++;
    //       if (count === audios.length) {
    //         mainWindow.webContents.send('GRAB_SONGS', songs);
    //       }
    //     })
    //     .catch((error) => {
    //       console.error('ERROR AT ', count, file, error);
    //       mainWindow.webContents.send('ERROR_MESSAGE', {
    //         title: 'Error',
    //         // description: `Unable to parse metadata of: ${file}`,
    //         description: error.message,
    //       });
    //     });
    // });
  });

  // Function to process song metadata
  const processSongMetadata = (file, imageFiles) => {
    if (
      file ===
      'E:\\MUSIC\\spotify-White Reaper - Judy French [OFFICIAL MUSIC VIDEO].mp3'
    )
      console.error('TOP', file, imageFiles);
    return new Promise((resolve, reject) => {
      try {
        metadata
          .parseFile(file)
          .then((data) => {
            if (
              file ===
              'E:\\MUSIC\\spotify-White Reaper - Judy French [OFFICIAL MUSIC VIDEO].mp3'
            )
              console.error('INSIDE');
            let title = data.common.title;
            let artist = data.common.artist;
            let album = data.common.album;
            let duration = data.format.duration;

            // Unique key, consider using a more robust method
            let key = duration;

            // To avoid empty fields, if the file doesn't have the appropriate metadata, use defaults
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

            // A lot of songs on youtube are in the format of "artist - title", so we do a check here to
            // Use a regular expression to split the string by "-"
            const parts = title.split(/\s*-\s*/);

            // Currently no support for multiple artists
            if (parts.length === 2) {
              // The first part (index 0) will be the artist, and the second part (index 1) will be the song title
              const titleArtist = parts[0];
              const songTitle = parts[1];

              if (artist === 'Unknown Artist' && titleArtist !== undefined) {
                artist = titleArtist;
              }
            }

            /* Gets image for the song/album */
            const albumDir = path.dirname(file);
            let savedImage = undefined;
            for (const image in imageFiles) {
              const imageDir = path.dirname(imageFiles[image]);
              if (albumDir === imageDir) {
                savedImage = imageFiles[image];
                break;
              }
            }

            const songData = {
              id: key,
              file: file,
              title: title,
              artist: artist,
              album: album,
              duration: duration,
              albumImage: savedImage, // Initialize image
            };

            resolve(songData);
          })
          .catch((error) => {
            resolve(error);
          });
      } catch (err) {
        console.error('ERROR', err);
      }
    });
  };

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

    // console.log('SETTING CURRENT TEMP FILE PATH TO: ', newTemporaryFilePath);
    // newTemporaryFilePath is updated in SAVE_TEMP_SONG, which will be the next song that gets deleted
    temporaryFilePath = newTemporaryFilePath;
  });

  /********************************************** */
  /**
   * Starts the spotify login with the user id
   */

  // var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
  // var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  var spotify_client_id = '0f4a9e39a958421b8650f7a9142baefd';
  var spotify_client_secret = 'd67ebb6b783e447c89d53175e8116752';

  // my application redirect uri
  // const redirectUri = 'http://localhost:8888/call';
  // const redirectUri = 'http://localhost/auth/callback';
  const redirectUri = 'myapp://oauth-callback';

  var SpotifyWebApi = require('spotify-web-api-node');
  var spotifyApi;

  function createSpotifyClient(code) {
    // credentials are optional
    spotifyApi = new SpotifyWebApi({
      clientId: spotify_client_id,
      clientSecret: spotify_client_secret,
      redirectUri: redirectUri,
    });
    console.log('SETTING WITH : ', code);

    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code).then(
      function (data) {
        console.log('The token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        console.log('The refresh token is ' + data.body['refresh_token']);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        // getMe();
        getUserPlaylists(code);
      },
      function (err) {
        console.log('Something went wrong!', err);
      }
    );

    // Retrieve an access token.
    // spotifyApi.clientCredentialsGrant().then(
    //   function (data) {
    //     console.log('The access token expires in ' + data.body['expires_in']);
    //     console.log('The access token is ' + data.body['access_token']);

    //     // Save the access token so that it's used in future calls
    //     spotifyApi.setAccessToken(data.body['access_token']);

    //     getUserPlaylists();
    //     getMe();
    //   },
    //   function (err) {
    //     console.log(
    //       'Something went wrong when retrieving an access token',
    //       err
    //     );
    //   }
    // );

    function getMe() {
      spotifyApi.getMe().then(
        function (data) {
          console.log(
            'Some information about the authenticated user',
            data.body
          );
        },
        function (err) {
          console.log('Something went wrong!', err);
        }
      );
    }

    function getUserPlaylists(code) {
      spotifyApi.getUserPlaylists().then(
        function (data) {
          console.log('Retrieved playlists', data.body);
          mainWindow.webContents.send('start-spotify-login', code, data.body);
        },
        function (err) {
          console.log('Something went wrong!', err);
        }
      );
    }
  }

  // TODO: This only gets the first 100 songs...
  // There is no way to increase the limit. But you can use {offset: 100}.
  // Easy solution could be to add a 'next page' button to load the next set
  ipcMain.on('get-spotify-playlist', (event, playlistId) => {
    spotifyApi.getPlaylist(playlistId).then(
      function (data) {
        console.log('Some information about this playlist', data.body);
        mainWindow.webContents.send('get-spotify-playlist', data.body);
      },
      function (err) {
        console.log('Something went wrong!', err);
      }
    );
  });

  // Handle custom protocol requests
  protocol.registerFileProtocol('myapp', (request, callback) => {
    // Handle custom protocol requests here
    const url = new URL(request.url);
    // Extract the 'code' parameter from the query string
    const code = url.searchParams.get('code');

    // Handle the URL and perform necessary actions (e.g., extract tokens)
    // You may want to close the window and continue the OAuth flow in the main window.
    console.log(code);

    createSpotifyClient(code);
  });

  ipcMain.on('start-spotify-login', (event) => {
    const spotifyClientId = spotify_client_id;
    const scope = 'streaming user-read-email user-read-private';
    const state = generateRandomString(16);
    const authUrl =
      `https://accounts.spotify.com/authorize/?` +
      `response_type=code&` +
      `client_id=${spotifyClientId}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    // shell.openExternal(authUrl);
    mainWindow.loadURL(authUrl);

    // createSpotifyClient();
  });

  // Prepare to filter only the callbacks for my redirectUri
  // const filter = {
  //   urls: [redirectUri + '*'],
  // };
  // intercept all the requests for that includes my redirect uri
  // mainWindow.webContents.on('will-navigate', function (event, newUrl) {
  //   console.log('WILL-NAVIGATE', newUrl);
  //   // More complex code to handle tokens goes here
  // });

  /****************************************************** */

  /**
   * Gets all user settings. Called when the user navigates to the settings page
   */
  ipcMain.on('GET_SETTINGS', (event) => {
    // const settings = getSettings();
    // const songDirectory = settings.libraryDirectory;

    // const outputDirectory = dataDirectory;

    // const output = {
    //   libraryDirectory: songDirectory,
    //   dataDirectory: dataDirectory,
    // };

    mainWindow.webContents.send('GET_SETTINGS', getSettings());
  });

  ipcMain.on('SAVE_SETTINGS', (event, updatedSettings) => {
    // TODO Everywhere there is "settingsPath", should I modularize? Just make this a global variable...
    const settingsPath = createSettingsPath();

    let settings = getSettings();
    for (let setting in updatedSettings) {
      settings[setting] = updatedSettings[setting];
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
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
   * Get all user effect combos
   */
  ipcMain.on('GRAB_EFFECT_COMBOS', (event) => {
    // Get all, if any, existing effects
    const effectCombos = getEffectCombos(effectCombosFile);
    mainWindow.webContents.send('GRAB_EFFECT_COMBOS', effectCombos);
  });

  /**
   * Saves a new effect combo to the local filesystem
   */
  ipcMain.on('SAVE_EFFECT_COMBO', (event, effectName, effects) => {
    // Get all, if any, existing effects
    let effectCombos = getEffectCombos(effectCombosFile);

    // Create a new combo object
    // const newCombo = {
    //   name: effectName,
    //   effects: effects,
    // };

    // Add the new combo to the list of combos
    // effectCombos.push(newCombo);
    effectCombos[effectName] = effects;

    // Save the updated list of combos back to the JSON file
    try {
      fs.writeFileSync(effectCombosFile, JSON.stringify(effectCombos, null, 2));
    } catch (error) {
      console.error('Error writing combos file:', error);
    }

    // Send the new effects back to the client
    mainWindow.webContents.send('SAVE_EFFECT_COMBO', effectCombos);
  });

  /**
   * Downloads the youtube video from the specified url
   */
  // TODO: ADD A Progress bar: https://github.com/fent/node-ytdl-core/blob/master/example/ffmpeg.js
  ipcMain.on('DOWNLOAD_YOUTUBE_VID', async (event, videoUrl) => {
    downloadYoutubeVideo(videoUrl);

    // Start the download
    //   ytdl(videoUrl, downloadOptions)
    //     .pipe(
    //       fs.createWriteStream(
    //         path.join(downloadOptions.directory, downloadOptions.filename)
    //       )
    //     )
    //     .on('finish', () => {
    //       console.error('FINISHED DOWNLOADING');
    //       mainWindow.webContents.send(
    //         'download-success',
    //         'Download completed!'
    //       );
    //     })
    //     .on('error', (error) => {
    //       console.error('Error downloading video', error.message);
    //       mainWindow.webContents.send('download-error', error.message);
    //     });
    // } catch (error) {
    //   console.error('Error fetching video', error.message);

    //   // maybe use error.name === 'SyntaxError' instead?
    //   if (error.message === 'Invalid or unexpected token') {
    //     // This error usually happens when the ytdl package is broken
    //     console.error('ytdl package is most likely broken');
    //   }

    //   mainWindow.webContents.send('download-error', error.message);
    // }
  });

  ipcMain.on('DOWNLOAD_SPOTIFY_SONG', async (event, songDetails) => {
    // Get the song url
    const result = await youtubeSearch(songDetails.name + songDetails.artist);
    const url = result.all[0].url; // TODO: What happens if all is empty? Is that possible? 'all' is an array of the search results...

    // download the song from youtube
    downloadYoutubeVideo(url, songDetails);
  });

  /**
   *
   *
   * Helper functions
   *
   *
   *
   */

  /**
   * Creates the settings file and returns the location of it
   * @returns
   */
  function createSettingsPath() {
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
      settingsPath = createSettingsPath();
    }

    const settingsData = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(settingsData);
  }

  /* 
    I dont like spotifyDetails. It was the easiest way to implement albeit a bit ugly
  */
  async function downloadYoutubeVideo(url, spotifyDetails) {
    console.log('----------------------------------------------------');
    console.log('DOWNLOADING VIDEO');
    console.log('Youtube URL is: ', url);

    // Get the youtube video title
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title.replace('|', ''); // Must remove special characters or FFMPEG will crash
    console.log('Got video detail');

    // Get where we are saving the video to
    const settings = getSettings();
    const songDirectory = settings.libraryDirectory;

    /* Setup progress tracking */
    const tracker = {
      start: Date.now(),
      audio: { downloaded: 0, total: Infinity },
      video: { downloaded: 0, total: Infinity },
      merged: { frame: 0, speed: '0x', fps: 0 },
    };

    // Prepare the progress bar
    let progressbarHandle = null;
    const progressbarInterval = 1000;
    const showProgress = () => {
      readline.cursorTo(process.stdout, 0);
      const toMB = (i) => (i / 1024 / 1024).toFixed(2);

      process.stdout.write(
        `Audio  | ${(
          (tracker.audio.downloaded / tracker.audio.total) *
          100
        ).toFixed(2)}% processed `
      );
      process.stdout.write(
        `(${toMB(tracker.audio.downloaded)}MB of ${toMB(
          tracker.audio.total
        )}MB).${' '.repeat(10)}\n`
      );

      process.stdout.write(
        `Video  | ${(
          (tracker.video.downloaded / tracker.video.total) *
          100
        ).toFixed(2)}% processed `
      );
      process.stdout.write(
        `(${toMB(tracker.video.downloaded)}MB of ${toMB(
          tracker.video.total
        )}MB).${' '.repeat(10)}\n`
      );

      process.stdout.write(
        `Merged | processing frame ${tracker.merged.frame} `
      );
      process.stdout.write(
        `(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(
          10
        )}\n`
      );

      process.stdout.write(
        `running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(
          2
        )} Minutes.`
      );

      readline.moveCursor(process.stdout, 0, -3);
    };

    // Downloading audio only
    if (!settings.mp4DownloadEnabled) {
      const outputVagueFilePath = path.join(
        songDirectory,
        `spotify-vague-${videoTitle}.mp3`
      );
      const outputFilePath = path.join(
        songDirectory,
        `spotify-${videoTitle}.mp3`
      );
      const writeStream = fs.createWriteStream(outputVagueFilePath);

      // let songData = await processSongMetadata(outputFilePath, []);
      console.error('SONG DATA IS: ', spotifyDetails);

      const audioStream = ytdl(url, { filter: 'audioonly' })
        // .pipe(writeStream)
        .on('progress', (_, downloaded, total) => {
          tracker.audio = { downloaded, total };
          showProgress();
          mainWindow.webContents.send(
            'ffmpeg-progress',
            `FFmpeg Progress: ${downloaded / total}% done`,
            (downloaded / total) * 100,
            spotifyDetails.name
          );
        });

      audioStream
        .pipe(writeStream)
        .on('close', async (msg) => {
          // TODO
          // if (attchingExtraDetails) {
          //   mainWindow.webContents.send(
          //     'download-success',
          //     'Download completed!',
          //     {}
          //   );
          // }
          songData = await writeSpotifyDetails(
            outputVagueFilePath,
            // path.join(songDirectory, `TEST.mp3`),
            outputFilePath,
            spotifyDetails
          );
          mainWindow.webContents.send(
            'download-success',
            'Download completed!',
            songData
          );
        })
        .on('error', (err) => {
          console.error('Error downloading song', err);
        });

      return new Promise((resolve, reject) => {
        // audioStream.on('finish', () => {
        //   console.error('SUCCESSFULLY DOWNLOADED');
        //   resolve(outputFilePath);
        //   mainWindow.webContents.send(
        //     'download-success',
        //     'Download completed!',
        //     songData
        //   );
        // });
        // audioStream.on('error', (error) => {
        //   console.error('ERROR DOWNLOADING');
        //   reject(error);
        //   mainWindow.webContents.send(
        //     'download-error',
        //     `FFmpeg process exited with code ${code}`
        //   );
        // });
      });
    }

    // Use ytdl to download the video and audio separately
    // This is necessary because for higher quality videos, Youtube downloads the audio and video separately
    // Get audio and video streams
    const audioStream = ytdl(url, { quality: 'highestaudio' }).on(
      'progress',
      (_, downloaded, total) => {
        tracker.audio = { downloaded, total };
        showProgress();
      }
    );
    const videoStream = ytdl(url, { quality: 'highestvideo' }).on(
      'progress',
      (_, downloaded, total) => {
        tracker.video = { downloaded, total };
        showProgress();
      }
    );

    // Construct the output file path using the video title and song directory
    const outputFilePath = path.join(songDirectory, `${videoTitle}.mp4`);

    // Spawn FFmpeg process to combine video and audio
    console.log('Creating ffmpeg process...');
    const ffmpegProcess = cp.spawn(
      ffmpegPath,
      [
        // Remove ffmpeg's console spamming
        '-loglevel',
        '8',
        '-hide_banner',
        // Set inputs
        '-i',
        'pipe:4',
        '-i',
        'pipe:5',
        // Map audio & video from streams
        '-map',
        '0:a',
        '-map',
        '1:v',
        // Keep encoding
        '-c:v',
        'copy',
        // Define output file
        outputFilePath,
      ],
      {
        windowsHide: true,
        stdio: [
          /* Standard: stdin, stdout, stderr */
          'inherit',
          'inherit',
          'inherit',
          /* Custom: pipe:3, pipe:4, pipe:5 */
          'pipe',
          'pipe',
          'pipe',
        ],
      }
    );
    console.log('Created ffmpeg process');

    // C O M B I N E
    console.log('Combining video and audio...');
    audioStream.pipe(ffmpegProcess.stdio[4]);
    videoStream.pipe(ffmpegProcess.stdio[5]);

    // When an error is encountered or we finished processing
    ffmpegProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('Video downloaded and combined successfully');

        // We can download from both the youtube tab and the spotify tab
        // If we are downloading from spotify, we want to use the data supplied from them
        // If just from youtube, we have to get our data from the video information
        let songData;
        if (spotifyDetails) {
          //TODO I think since we have to download it a second time, it is reducing quality... Also doubles the time it takes to download
          // So I should add a button in settings to toggle if spotifyDetails is used. Toggle it in DOWNLOAD_SPOTIFY_SONG
          songData = await writeSpotifyDetails(
            outputFilePath,
            path.join(songDirectory, `spotify-${videoTitle}.mp4`),
            spotifyDetails
          );
        } else {
          songData = await processSongMetadata(outputFilePath, []);
        }

        mainWindow.webContents.send(
          'download-success',
          'Download completed!',
          songData
        );
        console.log('Download completed, sent song data');
      } else {
        console.error(`FFmpeg process exited with code ${code}`);
        mainWindow.webContents.send(
          'download-error',
          `FFmpeg process exited with code ${code}`
        );
      }

      clearInterval(progressbarHandle);
    });

    // Updates the progress bar
    // ffmpegProcess.stdio[3].on('data', (chunk) => {
    //   console.log('WORKING');
    //   // Start the progress bar
    //   if (!progressbarHandle)
    //     progressbarHandle = setInterval(showProgress, progressbarInterval);
    //   // Parse the param=value list returned by ffmpeg
    //   const lines = chunk.toString().trim().split('\n');
    //   const args = {};
    //   for (const l of lines) {
    //     const [key, value] = l.split('=');
    //     args[key.trim()] = value.trim();
    //   }
    //   tracker.merged = args;
    // });

    // When a file of the same name already exists in the current dir. Im not entirely sure if this code only applies to that but good enough for now
    ffmpegProcess.stdio[4].on('error', (err) => {
      console.error('FFmpeg audio output error:', err);

      if (err.code === 'EPIPE') {
        mainWindow.webContents.send(
          'download-error',
          `FFmpeg process exited with code ${err.code}. FILE ALREADY EXISTS`
        );
      }
    });
  }

  /**
   * Writes the given file details from Spotify into the file
   * @param {string} inputFilePath - Path to the original MP4 file
   * @param {string} outputFilePath - Path to the new output file
   * @param {object} metadata - New metadata values
   * @returns {Promise<void>} - A promise that resolves when the metadata is edited successfully
   */
  function writeSpotifyDetails(inputFilePath, outputFilePath, metadata) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('--------------------------------');
        console.log('METADATA');
        console.log(metadata);
        console.log('--------------------------------');
        await ffmpeg(inputFilePath)
          .outputOption('-metadata', `title=${metadata.name}`)
          .outputOption('-metadata', `artist=${metadata.artist}`)
          .outputOption('-metadata', `album=${metadata.album}`)
          // Add more metadata options as needed
          .output(outputFilePath)
          .on('progress', (progress) => {
            console.log(
              `FFmpeg Progress: ${progress.percent}% done, ${progress.timemark}`
            );
            console.log('DATA : ', metadata.name, progress);
            mainWindow.webContents.send(
              'ffmpeg-progress',
              `FFmpeg Progress: ${progress.percent}% done, ${progress.timemark}`,
              progress.percent,
              metadata.name
            );
          })
          .on('end', async () => {
            console.log('Metadata edited successfully');

            // Delete the original file (inputFilePath)
            // I have to do this because ffmpeg doesnt let you edit files you read. So you need two different files...
            // await fs.unlink(inputFilePath);
            await fsPromises.unlink(inputFilePath);

            resolve();
          })
          .on('error', (err) => {
            console.error('Error editing metadata:', err);
            reject(err);
          })
          .run();
      } catch (error) {
        console.error('Error editing metadata:', error);
        reject(error);
      }
    });
  }

  function writeMetadata(title, filePath) {
    // A lot of songs on youtube are in the format of "artist - title", so we do a check here to
    // Use a regular expression to split the string by "-"
    const parts = title.split(/\s*-\s*/);

    // The first part (index 0) will be the artist, and the second part (index 1) will be the song title
    const artist = parts[0];
    const songTitle = parts[1];

    // Read the existing tags from the file
    const tags = NodeID3.read(filePath);

    // Construct the metadata object with artist and title tags
    // Update the artist and title tags
    tags.artist = artist;
    tags.title = songTitle;

    // Write the metadata to the output file
    NodeID3.write(tags, filePath, (error, buffer) => {
      if (error) {
        console.error('Error writing metadata to the output file:', error);
      } else {
        console.log('Metadata written to the output file.', tags);
      }
    });
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

  function getEffectCombos(filePath) {
    let effectCombos = {}; // Should I reget this everytime?
    try {
      const effectComboData = fs.readFileSync(filePath, 'utf-8');
      effectCombos = JSON.parse(effectComboData);
    } catch (error) {
      console.error('Error reading effect combos file:', error);
    }

    return effectCombos;
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

    return folderPath;
  }

  /**
   * Changes the current song directory into the new given directory.
   * Also saves the change so on next boot, the new directory will be loaded
   * @param {String} newLibraryDirectory - Directory path
   */
  function updateLibraryDirectory(newLibraryDirectory) {
    const settingsPath = createSettingsPath(); // TODO: Can I combine this function with getSettings?

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
