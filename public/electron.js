const { app, BrowserWindow, ipcMain, protocol } = require('electron');

const path = require('path');
const fs = require('fs');
const url = require('url');

// TODO Put these all in one function...
const {
  SAVE_TEMP_SONG,
  DELETE_TEMP_SONG,
  SAVE_SONG,
  SETUP_SETINGS,
  SETUP_PLAYLISTS,
  SETUP_EFFECTS,
  SETUP_SONG_DOWNLOADS,
  SETUP_GET_SONGS,
} = require('./ipcMain');

// TODO: Use these instead of 'path.join()'. I don't know why I have so many duplicates
const dataDirectory = path.join(app.getPath('userData'), 'Data'); // Gets the path to the data folder

/* Globals */
let defaultSettings = JSON.stringify({
  libraryDirectory: '',
  loop: 'none',
  volume: 100,
  allowRemote: true,
  mp4DownloadEnabled: false,
  spotifyEnabled: false,
  dataDirectory: dataDirectory,
  attchingExtraDetails: true,
});

/* Create the files to save settings */
const settingsFile = dataDirectory + '\\settings.json';
const playlistsFile = dataDirectory + '\\playlists.json';
const effectCombosFile = dataDirectory + '\\effectCombos.json';
const tempSongFolder = dataDirectory + '\\temp-songs';
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory);
}
if (!fs.existsSync(tempSongFolder)) {
  fs.mkdirSync(tempSongFolder);
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

    // Hides the toolbar but it can still be reactived by pressing 'alt'
    autoHideMenuBar: true,

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

  /* Init ipcMain functions. This is so the server and client can communicate */
  SETUP_GET_SONGS(mainWindow);
  SAVE_TEMP_SONG(tempSongFolder, mainWindow);
  DELETE_TEMP_SONG();
  SAVE_SONG(dataDirectory);
  SETUP_SETINGS(mainWindow, app.getPath('userData'));
  SETUP_PLAYLISTS(mainWindow, app.getPath('userData'));
  SETUP_EFFECTS(mainWindow, effectCombosFile);
  SETUP_SONG_DOWNLOADS(mainWindow);

  /********************************************** */
  /**
   * Starts the spotify login with the user id
   */

  var spotify_client_id = '0f4a9e39a958421b8650f7a9142baefd';
  const redirectUri = 'myapp://oauth-callback';
  var SpotifyWebApi = require('spotify-web-api-node');
  var spotifyApi;

  function createSpotifyClient(code) {
    // credentials are optional
    spotifyApi = new SpotifyWebApi({
      clientId: spotify_client_id,
      // clientSecret: spotify_client_secret,
      redirectUri: redirectUri,
    });
    console.log('SETTING WITH : ', code);

    // Create the authorization URL
    const scopes = ['streaming', 'user-read-email', 'user-read-private'];
    const state = generateRandomString(16);
    const showDialog = true;
    const responseType = 'token';
    var authorizeURL = spotifyApi.createAuthorizeURL(
      scopes,
      state,
      showDialog,
      responseType
    );
    console.log('URL  IS : ', authorizeURL);
    return authorizeURL;

    // Retrieve an access token and a refresh token
    // spotifyApi.authorizationCodeGrant(code).then(
    //   function (data) {
    //     console.log('The token expires in ' + data.body['expires_in']);
    //     console.log('The access token is ' + data.body['access_token']);
    //     console.log('The refresh token is ' + data.body['refresh_token']);

    //     // Set the access token on the API object to use it in later calls
    //     spotifyApi.setAccessToken(data.body['access_token']);
    //     spotifyApi.setRefreshToken(data.body['refresh_token']);

    //     // getMe();
    //     getUserPlaylists(code);
    //   },
    //   function (err) {
    //     console.log('Something went wrong!', err);
    //   }
    // );

    // function getMe() {
    //   spotifyApi.getMe().then(
    //     function (data) {
    //       console.log(
    //         'Some information about the authenticated user',
    //         data.body
    //       );
    //     },
    //     function (err) {
    //       console.log('Something went wrong!', err);
    //     }
    //   );
    // }

    // function getUserPlaylists(code) {
    //   spotifyApi.getUserPlaylists().then(
    //     function (data) {
    //       console.log('Retrieved playlists', data.body);
    //       mainWindow.webContents.send('start-spotify-login', code, data.body);
    //     },
    //     function (err) {
    //       console.log('Something went wrong!', err);
    //     }
    //   );
    // }
  }

  ipcMain.on('get-spotify-playlist', (event, playlistId, offset) => {
    console.log(playlistId);
    spotifyApi.getPlaylistTracks(playlistId, { offset: offset }).then(
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
    // const url = new URL(request.url);
    // Extract the 'code' parameter from the query string
    // const code = url.searchParams.get('code');

    // Handle the URL and perform necessary actions (e.g., extract tokens)
    // You may want to close the window and continue the OAuth flow in the main window.
    console.log('request IS: ', request);
    const url = request.url;

    // if (url.includes('error=access_denied')) {
    //   mainWindow.webContents.send('start-spotify-login', 'quit');
    //   return;
    // }

    const accessTokenData = url.split('#')[1];
    console.log('accessTokenData   ', accessTokenData);
    // Split the access token parameters by the ampersand (&) symbol
    const paramPairs = accessTokenData.split('&');
    console.log('paramPairs   ', paramPairs);
    // Iterate through each parameter pair to find the access token
    let accessToken;
    for (const paramPair of paramPairs) {
      console.log('paramPair   ', paramPair);
      const [key, value] = paramPair.split('=');
      if (key === 'access_token') {
        accessToken = value;
        break; // Stop iterating after finding the access token
      }
    }
    console.log('ACCESS TOKEN IS: ', accessToken);
    spotifyApi.setAccessToken(accessToken);
    // mainWindow.webContents.send('spotify-get-user-playlists', code, data.body);
    getUserPlaylists();

    // Retrieve an access token and a refresh token
    // spotifyApi.authorizationCodeGrant(accessToken).then(
    //   function (data) {
    //     console.log('The token expires in ' + data.body['expires_in']);
    //     console.log('The access token is ' + data.body['access_token']);
    //     console.log('The refresh token is ' + data.body['refresh_token']);

    //     // Set the access token on the API object to use it in later calls
    //     spotifyApi.setAccessToken(data.body['access_token']);
    //     spotifyApi.setRefreshToken(data.body['refresh_token']);

    //     // getMe();
    //     getUserPlaylists(code);
    //   },
    //   function (err) {
    //     console.log('Something went wrong!', err);
    //   }
    // );

    // createSpotifyClient(code);
  });

  function getUserPlaylists() {
    spotifyApi.getUserPlaylists().then(
      function (data) {
        console.log('Retrieved playlists', data.body);
        mainWindow.webContents.send('get-user-playlists', data.body);
      },
      function (err) {
        console.log('Something went wrong!', err);
      }
    );
  }

  ipcMain.on('start-spotify-login', (event) => {
    // const spotifyClientId = spotify_client_id;
    // const scopes = ['streaming', 'user-read-email', 'user-read-private'];
    // const state = generateRandomString(16);
    // const showDialog = true;
    // const responseType = 'token';
    // const authUrl =
    //   `https://accounts.spotify.com/authorize/?` +
    //   `response_type=code&` +
    //   `client_id=${spotifyClientId}&` +
    //   `scope=${encodeURIComponent(scope)}&` +
    //   `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    //   `state=${state}`;

    // function getUserPlaylists(code) {
    //   spotifyApi.getUserPlaylists().then(
    //     function (data) {
    //       console.log('Retrieved playlists', data.body);
    //       mainWindow.webContents.send('get-user-playlists', code, data.body);
    //     },
    //     function (err) {
    //       console.log('Something went wrong!', err);
    //     }
    //   );
    // }
    if (spotifyApi !== undefined) {
      getUserPlaylists();
      return;
    }

    const authUrl = createSpotifyClient();
    console.log('AUTHURLIS: ', authUrl);

    // mainWindow.webContents.send('start-spotify-login', authUrl);
    // shell.openExternal(authUrl);
    createLoginWindow(authUrl);
    function createLoginWindow(url) {
      const loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Initially hide the window
      });

      loginWindow.loadURL(url);

      // Listen for the window to be ready to receive messages
      // loginWindow.webContents.on('did-finish-load', (e) => {
      //   console.log('FINISHED LOADING:   ', e);
      // loginWindow.webContents.send('start-spotify-login'); // Send a message to the login window

      // getUserPlaylists('test');
      // loginWindow.close();
      // });

      // Listen for messages from the login window
      // ipcMain.on('did-navigate', (event, message) => {
      //   console.log('MESSAGE IS: ', message);
      //   // if (message.type === 'close-login-window') {
      //   loginWindow.close(); // Close the login window
      //   // }
      // });

      loginWindow.once('ready-to-show', () => {
        loginWindow.show();
      });
    }

    // shell.openExternal(authUrl);
    // mainWindow.loadURL(authUrl);
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

  var generateRandomString = function (length) {
    var text = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
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
