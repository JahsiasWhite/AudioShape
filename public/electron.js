const {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  globalShortcut,
  dialog,
} = require('electron');

const path = require('path');
const fs = require('fs');
const url = require('url');
const logger = require('./mainLogger');

const {
  SAVE_TEMP_SONG,
  DELETE_TEMP_SONG,
  SAVE_SONG,
  SETUP_FILE_CONVERTER,
  SETUP_SETINGS,
  SETUP_PLAYLISTS,
  SETUP_EFFECTS,
  SETUP_HISTORY,
  SETUP_SONG_DOWNLOADS,
  SETUP_GET_SONGS,
} = require('./ipcMain');

// Initialize application constants and file paths
function initializeAppConstants() {
  const dataDirectory = path.join(app.getPath('userData'), 'Data');

  const defaultSettings = JSON.stringify({
    libraryDirectory: '',
    loop: 'none',
    volume: 100,
    allowRemote: true,
    mp4DownloadEnabled: false,
    spotifyEnabled: false,
    dataDirectory: dataDirectory,
    attchingExtraDetails: true,
  });

  const settingsFile = path.join(dataDirectory, 'settings.json');
  const playlistsFile = path.join(dataDirectory, 'playlists.json');
  const effectCombosFile = path.join(dataDirectory, 'effectCombos.json');
  const historyFile = path.join(dataDirectory, 'history.json');
  const tempSongFolder = path.join(dataDirectory, 'temp-songs');

  return {
    dataDirectory,
    defaultSettings,
    settingsFile,
    playlistsFile,
    effectCombosFile,
    historyFile,
    tempSongFolder,
  };
}

const {
  dataDirectory,
  defaultSettings,
  settingsFile,
  playlistsFile,
  effectCombosFile,
  historyFile,
  tempSongFolder,
} = initializeAppConstants();

logger.init(dataDirectory);
logger.info(`AudioShape v${app.getVersion()} starting`);
ipcMain.on('LOG', (_event, { ts, level, msg }) => {
  logger[level === 'ERROR' ? 'error' : 'warn'](`[renderer] ${msg}`);
});
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
if (!fs.existsSync(historyFile)) {
  fs.writeFileSync(historyFile, JSON.stringify([]));
}

app.name = 'AudioShape';

function resolveWindowIconPath() {
  const candidates = [
    path.join(__dirname, 'logo.png'),
    path.join(__dirname, '..', 'src', 'logo.png'),
  ];
  // Windows often cannot use icons that only exist inside app.asar; keep logo in asarUnpack.
  if (app.isPackaged) {
    candidates.unshift(
      path.join(process.resourcesPath, 'app.asar.unpacked', 'src', 'logo.png'),
    );
  }
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

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
  const windowIcon = resolveWindowIconPath();

  // Create our app
  const mainWindow = new BrowserWindow({
    width: app.isPackaged ? 800 : 1100, // If we are debugging, we want to double the width for the debug window
    height: 600,

    // Hides the toolbar but it can still be reactived by pressing 'alt'
    autoHideMenuBar: true,

    // Remove the native title bar; we use a custom one in React
    frame: false,

    ...(windowIcon ? { icon: windowIcon } : {}),

    webPreferences: {
      // Set the path of an additional "preload" script that can be used to
      // communicate between node-land and browser-land.
      preload: path.join(__dirname, 'preload.js'),

      nodeIntegration: true,
      // enableRemoteModule: true,
      // contextIsolation: false,

      // Don't allow dev tools on production version
      devTools: !app.isPackaged,

      // So we can play local files
      webSecurity: false,
    },
  });

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, '..', 'build', 'index.html'),
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
  SETUP_FILE_CONVERTER(mainWindow);
  SETUP_SETINGS(mainWindow, app.getPath('userData'));
  SETUP_PLAYLISTS(mainWindow, app.getPath('userData'));
  SETUP_EFFECTS(mainWindow, effectCombosFile);
  SETUP_HISTORY(mainWindow, app.getPath('userData'));
  SETUP_SONG_DOWNLOADS(mainWindow);

  // Native folder picker: avoids renderer webkitdirectory crawl on huge trees.
  ipcMain.handle('SELECT_LIBRARY_DIRECTORY', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });

    if (result.canceled || !result.filePaths?.length) {
      return null;
    }

    return result.filePaths[0];
  });

  /* Window control handlers for the custom title bar */
  ipcMain.on('WINDOW_MINIMIZE', () => mainWindow.minimize());
  ipcMain.on('WINDOW_MAXIMIZE', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('WINDOW_CLOSE', () => mainWindow.close());

  /********************************************** */
  /**
   * Starts the spotify login with the user id
   */

  const crypto = require('crypto');
  var spotify_client_id = '0f4a9e39a958421b8650f7a9142baefd';
  const redirectUri = 'myapp://oauth-callback';
  var SpotifyWebApi = require('spotify-web-api-node');
  var spotifyApi;
  var loginWindowRef = null;
  var pkceCodeVerifier = null;

  function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
  }

  function generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  function createSpotifyClient() {
    spotifyApi = new SpotifyWebApi({
      clientId: spotify_client_id,
      redirectUri: redirectUri,
    });

    const scopes = ['streaming', 'user-read-email', 'user-read-private'];
    const state = generateRandomString(16);
    pkceCodeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(pkceCodeVerifier);

    const authorizeURL =
      `https://accounts.spotify.com/authorize?` +
      `client_id=${spotify_client_id}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `state=${encodeURIComponent(state)}&` +
      `show_dialog=true&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    console.log('URL  IS : ', authorizeURL);
    return authorizeURL;
  }

  async function exchangeCodeForToken(code) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: spotify_client_id,
      code_verifier: pkceCodeVerifier,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || data.error || 'Token exchange failed');
    }
    return data;
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
      },
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

    // Parse the authorization code from the callback URL: myapp://oauth-callback?code=...
    const callbackUrl = new URL(url);
    const code = callbackUrl.searchParams.get('code');
    const error = callbackUrl.searchParams.get('error');

    callback({ error: -3 }); // Resolve the protocol request (no file to serve)

    if (loginWindowRef) {
      loginWindowRef.close();
      loginWindowRef = null;
    }

    if (error || !code) {
      console.error('Spotify auth error or missing code:', error || url);
      return;
    }

    exchangeCodeForToken(code)
      .then((tokenData) => {
        console.log('Access token received');
        spotifyApi.setAccessToken(tokenData.access_token);
        if (tokenData.refresh_token) {
          spotifyApi.setRefreshToken(tokenData.refresh_token);
        }
        getUserPlaylists();
      })
      .catch((err) => {
        console.error('Token exchange failed:', err.message);
      });
  });

  function getUserPlaylists() {
    spotifyApi.getUserPlaylists().then(
      function (data) {
        console.log('Retrieved playlists', data.body);
        mainWindow.webContents.send('get-user-playlists', data.body);
      },
      function (err) {
        console.log('Something went wrong!', err);
      },
    );
  }

  ipcMain.on('start-spotify-login', (event) => {
    if (spotifyApi !== undefined && spotifyApi.getAccessToken()) {
      getUserPlaylists();
      return;
    }

    const authUrl = createSpotifyClient();
    console.log('AUTHURLIS: ', authUrl);

    // mainWindow.webContents.send('start-spotify-login', authUrl);
    // shell.openExternal(authUrl);
    createLoginWindow(authUrl);
    function createLoginWindow(url) {
      loginWindowRef = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
      });

      loginWindowRef.loadURL(url);

      loginWindowRef.once('ready-to-show', () => {
        loginWindowRef.show();
      });

      loginWindowRef.on('closed', () => {
        loginWindowRef = null;
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

  /* Media key global shortcuts */
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('MEDIA_PLAY_PAUSE');
  });
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.send('MEDIA_NEXT_TRACK');
  });
  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.send('MEDIA_PREV_TRACK');
  });
  globalShortcut.register('MediaStop', () => {
    mainWindow.webContents.send('MEDIA_STOP');
  });

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
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
