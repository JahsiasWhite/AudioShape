const { ipcMain } = require('electron');

const fs = require('fs');
const fsPromises = require('fs').promises; // For deleting files
const { v4: uuidv4 } = require('uuid');
const { glob } = require('glob');
const ffmpeg = require('fluent-ffmpeg');

// Logging
const Logger = require('./mainLogger');

// Annoying way to import this tbh
let metadata;
import('music-metadata').then((module) => {
  metadata = module;
});

// For searching youtube videos. The spotify downloader requires this
const youtubeSearch = require('yt-search');

const { create: createYoutubeDl } = require('youtube-dl-exec');

/**
 * Resolves the yt-dlp binary path for both dev and packaged Electron builds.
 * In packaged builds, asarUnpack places the binary in app.asar.unpacked.
 */
function getYoutubeDl() {
  const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const unpackedPath = path.join(
    process.resourcesPath,
    'app.asar.unpacked',
    'node_modules',
    'youtube-dl-exec',
    'bin',
    binaryName,
  );
  const devPath = path.join(
    __dirname,
    '..',
    'node_modules',
    'youtube-dl-exec',
    'bin',
    binaryName,
  );
  const binaryPath = fs.existsSync(unpackedPath) ? unpackedPath : devPath;
  Logger.info(
    `[youtube-dl] using binary: ${binaryPath} (exists: ${fs.existsSync(binaryPath)})`,
  );
  return createYoutubeDl(binaryPath);
}

const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

/* Where the files are saved for the auto playing  */
let temporaryFilePath = null;
let newTemporaryFilePath = null;
let userDataPath = null;
let effectCombosFile = null;

/* Hmmmm */
let mainWindow = undefined;

/* When auto playing with edits on, we have to save the song to have full editing control */
// TODO: Is there a way to not have to save file? Can't we just use in-memory buffers?
const SAVE_TEMP_SONG = (dataDirectory, mainWindow) => {
  ipcMain.on('SAVE_TEMP_SONG', async (event, audioData) => {
    console.error('Saving temp song');
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
};

/**
 * Songs are created when we autoplay songs with custom settings, so they must be deleted when they are finished playing.
 */
const DELETE_TEMP_SONG = () => {
  ipcMain.on('DELETE_TEMP_SONG', async (event) => {
    console.error('DELETING TEMP SONG', temporaryFilePath);
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
};

/**
 * Builds a chain of atempo filters to cover the full 0.1–2.0 speed range.
 * The atempo filter only accepts values between 0.5 and 2.0, so speeds outside
 * that range are achieved by chaining multiple filters.
 */
function buildAtempoFilters(speed) {
  const filters = [];
  let s = speed;
  while (s < 0.5) {
    filters.push('atempo=0.5');
    s /= 0.5;
  }
  while (s > 2.0) {
    filters.push('atempo=2.0');
    s /= 2.0;
  }
  filters.push(`atempo=${parseFloat(s.toFixed(6))}`);
  return filters.join(',');
}

/**
 * Exports the given song, baking in the speed effect if needed.
 * Preserves the source file format: .mp4 sources are exported as .mp4 (with
 * video speed adjusted), everything else is exported as .mp3.
 */
const SAVE_SONG = (dataDirectory) => {
  ipcMain.on('SAVE_SONG', async (event, sourcePath, speed) => {
    try {
      // Cleanup the sourcePath: 'file:///C:/Example' -> 'C:/Example'
      sourcePath = decodeURIComponent(sourcePath.replace('file:///', ''));

      // Preserve the source format: .mp4 stays .mp4, everything else → .mp3
      const sourceExt = path.extname(sourcePath).toLowerCase();
      const outputExt = sourceExt === '.mp4' ? '.mp4' : '.mp3';
      const newFilePath = path.join(
        dataDirectory,
        `export-${uuidv4()}${outputExt}`,
      );

      console.error('Source: ', sourcePath);
      console.error('New Path: ', newFilePath);
      console.error('Speed: ', speed);

      if (speed && speed !== 1) {
        const atempoChain = buildAtempoFilters(speed);
        await new Promise((resolve, reject) => {
          let cmd = ffmpeg(sourcePath).audioFilters(atempoChain);

          if (sourceExt === '.mp4') {
            // Adjust video speed to match audio
            cmd = cmd.videoFilters(`setpts=PTS/${speed}`);
          } else {
            cmd = cmd.noVideo();
          }

          cmd
            .output(newFilePath)
            .on('end', () => {
              console.error('Saved song with speed effect.');
              resolve();
            })
            .on('error', (err) => {
              console.error('Error applying speed effect:', err);
              reject(err);
            })
            .run();
        });
      } else {
        await fs.promises.copyFile(sourcePath, newFilePath);
        console.error('Saved song.');
      }

      event.reply('SAVE_SONG_RESULT', { success: true, path: newFilePath });
    } catch (err) {
      console.error('Error saving song:', err);
      event.reply('SAVE_SONG_RESULT', { success: false, error: err.message });
    }
  });
};

const SETUP_SETINGS = (mainWindow, dataDirectory) => {
  Logger.info('Initializing settings');

  userDataPath = dataDirectory; // TODO I dont like this tbh
  /**
   * Gets all user settings. Called when the user navigates to the settings page
   */
  ipcMain.on('GET_SETTINGS', (event) => {
    mainWindow.webContents.send('GET_SETTINGS', getSettings());
  });
  ipcMain.on('GET_LAYOUT_SETTINGS', (event) => {
    mainWindow.webContents.send(
      'GET_LAYOUT_SETTINGS',
      getSettings().spotifyEnabled,
    );
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

  ipcMain.on('SAVE_COLOR_SETTINGS', (event, updatedColorSettings) => {
    // TODO Everywhere there is "settingsPath", should I modularize? Just make this a global variable...
    const settingsPath = createSettingsPath();

    let settings = getSettings();

    // Store all color settings inside a 'colors' object
    settings.colors = updatedColorSettings;

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  });

  ipcMain.on('GET_COLOR_SETTINGS', (event) => {
    mainWindow.webContents.send('RETURN_COLOR_SETTINGS', getSettings().colors);
  });

  ipcMain.on('GET_ROW_SIZE', (event) => {
    mainWindow.webContents.send('RETURN_ROW_SIZE', getSettings().rowSize ?? 50);
  });

  ipcMain.on('GET_VOLUME', (event) => {
    mainWindow.webContents.send('RETURN_VOLUME', getSettings().volume ?? 100);
  });
};

const SETUP_PLAYLISTS = (mainWindow, dataDirectory) => {
  userDataPath = dataDirectory; // TODO: Is this duplicate bad??
  /**
   * Get all user playlists
   */
  ipcMain.on('GET_PLAYLISTS', (event) => {
    // Get filepath
    const playlistsFilePath = path.join(userDataPath, 'Data', 'playlists.json');

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
    const playlistsFilePath = path.join(userDataPath, 'Data', 'playlists.json');

    // Get playlists
    const playlists = getPlaylists(playlistsFilePath);

    // Find the target playlist by ID (preferred) or by name (legacy fallback)
    const targetIndex = playlistToDelete.id
      ? playlists.findIndex((p) => p.id === playlistToDelete.id)
      : playlists.findIndex((p) => p.name === playlistToDelete.name);

    if (targetIndex !== -1) playlists.splice(targetIndex, 1);
    const updatedPlaylists = playlists;

    try {
      // Write the updated playlists back to the file
      fs.writeFileSync(
        playlistsFilePath,
        JSON.stringify(updatedPlaylists, null, 2),
      );

      // Update the new playlists
      mainWindow.webContents.send('GRAB_PLAYLISTS', updatedPlaylists);
    } catch (error) {
      Logger.error('Error deleting playlist:', error);

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
        userDataPath,
        'Data',
        'playlists.json',
      );
      const playlists = getPlaylists(playlistsFilePath);

      // Find the playlist by name
      const playlistIndex = playlists.findIndex(
        (playlist) => playlist.name === playlistName,
      );

      if (playlistIndex === -1) {
        // Playlist not found, handle accordingly (e.g., show an error)
        Logger.error(`Playlist "${playlistName}" not found.`);
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
          (s) => s !== songName,
        );
      } else {
        // Add the song to the playlist
        playlists[playlistIndex].songs.push(songName);
      }

      // TODO: Add song image here

      // Save the updated playlists data back to the file
      fs.writeFileSync(playlistsFilePath, JSON.stringify(playlists, null, 2));

      // Update the new playlists
      mainWindow.webContents.send('GRAB_PLAYLISTS', playlists);
    } catch (error) {
      // Handle any errors that occur during the process
      Logger.error('Error adding song to playlist:', error);
    }
  });
};

const SETUP_EFFECTS = (mainWindow, directory) => {
  effectCombosFile = directory;
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

    // Add the new combo to the list of combos
    // effectCombos.push(newCombo);
    effectCombos[effectName] = effects;

    // Save the updated list of combos back to the JSON file
    try {
      fs.writeFileSync(effectCombosFile, JSON.stringify(effectCombos, null, 2));
    } catch (error) {
      Logger.error('Error writing combos file:', error);
    }

    // Send the new effects back to the client
    mainWindow.webContents.send('SAVE_EFFECT_COMBO', effectCombos);
  });

  /**
   * Deletes a saved effect combo from the local filesystem
   */
  ipcMain.on('DELETE_EFFECT_COMBO', (event, effectName) => {
    let effectCombos = getEffectCombos(effectCombosFile);
    delete effectCombos[effectName];
    try {
      fs.writeFileSync(effectCombosFile, JSON.stringify(effectCombos, null, 2));
    } catch (error) {
      Logger.error('Error writing combos file:', error);
    }
    mainWindow.webContents.send('GRAB_EFFECT_COMBOS', effectCombos);
  });

  /**
   * Renames a saved effect combo in the local filesystem
   */
  ipcMain.on('RENAME_EFFECT_COMBO', (event, oldName, newName) => {
    let effectCombos = getEffectCombos(effectCombosFile);
    if (!effectCombos[oldName] || !newName.trim()) return;
    effectCombos[newName.trim()] = effectCombos[oldName];
    delete effectCombos[oldName];
    try {
      fs.writeFileSync(effectCombosFile, JSON.stringify(effectCombos, null, 2));
    } catch (error) {
      Logger.error('Error writing combos file:', error);
    }
    mainWindow.webContents.send('GRAB_EFFECT_COMBOS', effectCombos);
  });
};

const SETUP_SONG_DOWNLOADS = (mainW) => {
  mainWindow = mainW;
  /**
   * Downloads the youtube video from the specified url
   */
  ipcMain.on('DOWNLOAD_YOUTUBE_VID', async (event, videoUrl) => {
    downloadYoutubeVideo(videoUrl);
  });

  /**
   * Downloads a song from youtube using the search query
   */
  ipcMain.on(
    'DOWNLOAD_SONG_FROM_YOUTUBE_SEARCH',
    async (event, songDetails) => {
      const query = `${songDetails.name} ${songDetails.artist} audio`;
      const result = await youtubeSearch(query);

      if (result.all.length === 0) {
        console.error('No results found for the search query');
        return;
      }

      // download the song from youtube
      const url = result.all[0].url;
      downloadYoutubeVideo(url, songDetails);
    },
  );
};

// Function to process song metadata
const processSongMetadata = (file, imageMap) => {
  return new Promise((resolve, reject) => {
    try {
      if (path.extname(file).toLowerCase() === '.mkv') {
        resolve({
          id: file,
          file: file,
          title: path.basename(file).split('.').slice(0, -1).join('.'),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: undefined,
          albumImage: undefined,
          isVideo: false,
        });
        return;
      }

      const hasDirectoryImage = !!imageMap[path.dirname(file)]?.length;
      metadata
        .parseFile(file, { skipCovers: hasDirectoryImage })
        .then((data) => {
          let title = data.common.title;
          let artist = data.common.artist;
          let album = data.common.album;
          let duration = data.format.duration;

          let key = file;

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
          // Prioritizes the image with the same name as the song file
          // If none match, it will use an image found in the song directory
          // If no directory image is found, falls back to embedded album art
          // If no image is found, the frontend will check if the song is an .mp4 file
          // If it is, it will use a frame from the video as the album image
          const albumDir = path.dirname(file);
          const fileName = path
            .basename(file)
            .substring(0, file.lastIndexOf('.'));
          let savedImage = undefined;
          imageMap[albumDir]?.forEach((imageFile) => {
            if (savedImage === fileName) {
              savedImage = imageFile;
              return;
            }
            if (!savedImage) {
              savedImage = imageFile;
            }
          });

          // Fall back to embedded album art if no directory image was found
          if (
            !savedImage &&
            data.common.picture &&
            data.common.picture.length > 0
          ) {
            const pic = data.common.picture[0];
            savedImage = `data:${pic.format};base64,${Buffer.from(pic.data).toString('base64')}`;
          }

          const songData = {
            id: key,
            file: file,
            title: title,
            artist: artist,
            album: album,
            duration: duration,
            albumImage: savedImage,
            isVideo: path.extname(file).toLowerCase() === '.mp4',
          };

          resolve(songData);
        })
        .catch((error) => {
          reject(error);
        });
    } catch (err) {
      console.error('ERROR', err);
      resolve(null);
    }
  });
};

const SETUP_GET_SONGS = (mainW) => {
  mainWindow = mainW;
  ipcMain.on('GET_SONGS', async (event, folderPath) => {
    console.error('FOLDER PATH: ', folderPath);
    // folderPath = getParentDirectory(folderPath);
    // console.error('FOLDER PATH2: ', folderPath);

    let correctedPath = '';
    // If folderPath is empty, use the default path
    if (folderPath === '') {
      const settings = getSettings();

      correctedPath = settings.libraryDirectory;
      console.error('FOLDERPATH 3: ', correctedPath);
    } else {
      // Our string has '\' instead of '/' so we gotta fix that
      correctedPath = folderPath.replace(/\\/g, '/');

      // Save the new path to settings so when the app first starts, it will grab these
      updateLibraryDirectory(correctedPath);
    }

    // The user has not selected a directory, so we should return an empty object
    if (correctedPath === '') {
      event.reply('GRAB_SONGS', { songs: {}, isComplete: true });
      return;
    }

    // Get all songs in the given directory as well as all subdirectories
    const songTypes = 'mp3,wav,ogg,mp4,flac,m4a,mkv';
    const audios = await glob(correctedPath + '/**/*.{' + songTypes + '}');

    // Get and set a map of image files for easier access
    const imageFiles = await glob(correctedPath + '/**/*.{jpg,jpeg,png}');
    const imageMap = {};
    imageFiles.forEach((imageFile) => {
      const imageDir = path.dirname(imageFile);
      if (!imageMap[imageDir]) {
        imageMap[imageDir] = [];
      }
      imageMap[imageDir].push(imageFile);
    });
    console.error('Image Map: ', imageMap);

    // Make sure we have at least one song in the directory
    if (audios.length === 0) {
      // ! OUTPUT ERROR HERE?
      event.reply('GRAB_SONGS', { songs: {}, isComplete: true });
      return;
    }

    /* Get all songs */
    songs = {}; // ? Reset songs here?

    const total = audios.length;
    Logger.info(`Loading ${total} songs from ${correctedPath}`);
    console.log(`[Songs] Found ${total} songs — loading metadata...`);

    const BATCH_SIZE = 200;

    for (let i = 0; i < audios.length; i += BATCH_SIZE) {
      const batch = audios.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((file) =>
          processSongMetadata(file, imageMap).catch((error) => {
            console.error('ERROR\nFile: ', file, '\nError: ', error);
            Logger.error(
              'Error processing song metadata for file:',
              file,
              error,
            );
            return null;
          }),
        ),
      );

      batchResults.forEach((songData) => {
        if (songData) songs[songData.id] = songData;
      });

      const resolved = i + batch.length;
      const isComplete = resolved >= total;
      const pct = Math.round((resolved / total) * 100);
      console.log(
        `[Songs] ${resolved}/${total} (${pct}%)${isComplete ? ' — done!' : ''}`,
      );
      mainWindow.webContents.send('GRAB_SONGS', {
        songs,
        isComplete,
        progress: { resolved, total },
      });
    }
  });

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
};

/**
 *
 *
 * Helper functions
 *
 *
 *
 */

/**
 * Downloads an image from a URL to a local file path.
 * @param {string} url
 * @param {string} destPath
 * @returns {Promise<void>}
 */
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    protocol
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

/**
 * Embeds title/artist/album metadata (and optional cover art) into an audio file via ffmpeg.
 * Reads from inputFilePath, writes to outputFilePath, then deletes inputFilePath.
 * @param {string} inputFilePath
 * @param {string} outputFilePath
 * @param {object} metadata - { name, artist, album, imageUrl? }
 * @returns {Promise<void>}
 */
function embedMetadata(inputFilePath, outputFilePath, metadata) {
  return new Promise(async (resolve, reject) => {
    let tempImagePath = null;
    try {
      const ext = path.extname(inputFilePath).toLowerCase();
      const isVideoContainer = ['.mp4', '.webm', '.mkv', '.mov', '.m4v'].includes(
        ext,
      );
      // Album art as attached_pic is only wired for MP4; other containers get metadata only.
      const embedCoverInVideo = ['.mp4', '.m4v'].includes(ext);

      if (metadata.imageUrl && (!isVideoContainer || embedCoverInVideo)) {
        tempImagePath = path.join(os.tmpdir(), `cover-${Date.now()}.jpg`);
        await downloadImage(metadata.imageUrl, tempImagePath);
      }

      let cmd = ffmpeg(inputFilePath)
        .outputOption('-metadata', `title=${metadata.name}`)
        .outputOption('-metadata', `artist=${metadata.artist}`)
        .outputOption('-metadata', `album=${metadata.album}`);

      if (tempImagePath) {
        cmd = cmd.addInput(tempImagePath);
        if (embedCoverInVideo) {
          // MP4 has video at 0:v and audio at 0:a; mapping only 0:0 drops all audio.
          cmd = cmd
            .outputOption('-map', '0')
            .outputOption('-map', '1:0')
            .outputOption('-c', 'copy')
            .outputOption('-c:v:1', 'mjpeg')
            .outputOption('-disposition:v:1', 'attached_pic');
        } else {
          cmd = cmd
            .outputOption('-map', '0:0')
            .outputOption('-map', '1:0')
            .outputOption('-c:a', 'copy')
            .outputOption('-c:v', 'copy')
            .outputOption('-id3v2_version', '3')
            .outputOption('-metadata:s:v', 'title=Album cover')
            .outputOption('-metadata:s:v', 'comment=Cover (front)');
        }
      }

      cmd
        .output(outputFilePath)
        .on('progress', (progress) => {
          mainWindow.webContents.send(
            'ffmpeg-progress',
            `FFmpeg Progress: ${progress.percent}% done, ${progress.timemark}`,
            progress.percent,
            metadata.name,
          );
        })
        .on('end', async () => {
          if (tempImagePath) {
            try {
              await fsPromises.unlink(tempImagePath);
            } catch {}
          }
          await fsPromises.unlink(inputFilePath);
          resolve();
        })
        .on('error', async (err) => {
          Logger.error('Error embedding metadata:', err);
          if (tempImagePath) {
            try {
              await fsPromises.unlink(tempImagePath);
            } catch {}
          }
          reject(err);
        })
        .run();
    } catch (error) {
      Logger.error('Error embedding metadata:', error);
      if (tempImagePath) {
        try {
          await fsPromises.unlink(tempImagePath);
        } catch {}
      }
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

async function downloadYoutubeVideo(url, songDetails) {
  const settings = getSettings();
  const songDirectory = settings.libraryDirectory;

  if (songDirectory === '') {
    mainWindow.webContents.send(
      'download-error',
      `No valid song directory found. Please choose a song directory from the settings page to download songs.`,
    );
    return;
  }

  // Get video info
  const youtubeDl = getYoutubeDl();
  let info;
  try {
    info = await youtubeDl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
    });
  } catch (err) {
    Logger.error('Failed to get video info:', err.stderr || err.message || err);
    mainWindow.webContents.send(
      'download-error',
      `Failed to get video info: ${err.stderr || err.message}`,
    );
    return;
  }

  const videoTitle = info.title.replace(/[|\\/:*?"<>]/g, '');
  const embedExtraMetadata = settings.attchingExtraDetails ?? true;

  if (songDetails === undefined) {
    songDetails = {
      name: videoTitle,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
    };
  }

  // Downloading audio only (MP3)
  if (!settings.mp4DownloadEnabled) {
    const tempFilePath = path.join(songDirectory, `temp-${videoTitle}.mp3`);
    const finalFilePath = path.join(songDirectory, `${videoTitle}.mp3`);

    try {
      const subprocess = youtubeDl.exec(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0,
        output: tempFilePath,
        noPlaylist: true,
        noCheckCertificates: true,
      });

      const onMp3Progress = (data) => {
        const match = data.toString().match(/\[download\]\s+([\d.]+)%/);
        if (match) {
          const percent = parseFloat(match[1]);
          mainWindow.webContents.send(
            'ffmpeg-progress',
            `${Math.round(percent)}%`,
            percent,
            songDetails.name,
          );
        }
      };
      subprocess.stdout.on('data', onMp3Progress);
      subprocess.stderr.on('data', onMp3Progress);

      await subprocess;

      let songData;
      if (embedExtraMetadata) {
        await embedMetadata(tempFilePath, finalFilePath, songDetails);
        songData = await processSongMetadata(finalFilePath, {});
      } else {
        songData = await processSongMetadata(tempFilePath, {});
      }

      mainWindow.webContents.send(
        'download-success',
        'Download completed!',
        songData,
      );
    } catch (err) {
      Logger.error(
        'Error downloading audio:',
        err.stderr || err.message || err,
      );
      mainWindow.webContents.send(
        'download-error',
        songDetails.name,
        `${err.stderr || err.message || err}`,
      );
    }
    return;
  }

  // Downloading video + audio (MP4)
  const tempFilePath = path.join(songDirectory, `temp-${videoTitle}.mp4`);
  const finalFilePath = path.join(songDirectory, `${videoTitle}.mp4`);

  try {
    const subprocess = youtubeDl.exec(url, {
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
      mergeOutputFormat: 'mp4',
      output: tempFilePath,
      noPlaylist: true,
      noCheckCertificates: true,
    });

    // MP4 downloads video first (0→100%) then audio (0→100%), then merges.
    // We map these two phases onto a single 0–100% bar so it never resets.
    let mp4Phase = 1; // 1 = video, 2 = audio
    let lastMp4Percent = 0;
    const onMp4Progress = (data) => {
      const str = data.toString();
      if (
        str.includes('[Merger]') ||
        (str.includes('[ffmpeg]') && !str.match(/\[download\]/))
      ) {
        mainWindow.webContents.send(
          'ffmpeg-progress',
          'Merging...',
          99,
          videoTitle,
        );
        return;
      }
      const match = str.match(/\[download\]\s+([\d.]+)%/);
      if (match) {
        const percent = parseFloat(match[1]);
        // Detect phase switch: percent drops sharply after video finished
        if (
          mp4Phase === 1 &&
          percent < lastMp4Percent - 50 &&
          lastMp4Percent > 50
        ) {
          mp4Phase = 2;
        }
        lastMp4Percent = percent;
        const overall = mp4Phase === 1 ? percent / 2 : 50 + percent / 2;
        const label =
          mp4Phase === 1
            ? `Video ${Math.round(percent)}%`
            : `Audio ${Math.round(percent)}%`;
        mainWindow.webContents.send(
          'ffmpeg-progress',
          label,
          overall,
          videoTitle,
        );
      }
    };
    subprocess.stdout.on('data', onMp4Progress);
    subprocess.stderr.on('data', onMp4Progress);

    await subprocess;

    let songData;
    if (embedExtraMetadata) {
      await embedMetadata(tempFilePath, finalFilePath, songDetails);
      songData = await processSongMetadata(finalFilePath, {});
    } else {
      songData = await processSongMetadata(tempFilePath, {});
    }

    mainWindow.webContents.send(
      'download-success',
      'Download completed!',
      songData,
    );
  } catch (err) {
    Logger.error('Error downloading video:', err.stderr || err.message || err);
    mainWindow.webContents.send(
      'download-error',
      songDetails.name,
      `${err.stderr || err.message || err}`,
    );
  }
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

/**
 * Creates a new playlist with the given playlistName
 * @param {String} playlistName The name of the playlist
 * @returns [] of playlists with the newly created playlist
 */
function createPlaylist(playlistName) {
  // Get playlist location
  const playlistsFilePath = path.join(userDataPath, 'Data', 'playlists.json');

  // Get all, if any, existing playlists
  let playlists = getPlaylists(playlistsFilePath);

  // Create a new playlist object
  const newPlaylist = {
    id: uuidv4(),
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

/**
 * Gets all user playlists
 */
function getPlaylists(playlistsFilePath) {
  let playlists = []; // Should I reget this everytime?
  try {
    const playlistsData = fs.readFileSync(playlistsFilePath, 'utf-8');
    if (playlistsData === '') return playlists;
    playlists = JSON.parse(playlistsData);
  } catch (error) {
    console.error('Error reading playlists file:', error);
  }

  return playlists;
}

async function getAudioBuffer(wavBytes) {
  const wav = new Blob([wavBytes], { type: 'audio/wav' });
  return wav;
}

/**
 * Creates the settings file and returns the location of it
 * @returns
 */
function createSettingsPath() {
  const settingsPath = path.join(userDataPath, 'Data', 'settings.json');
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

module.exports = {
  SAVE_TEMP_SONG,
  DELETE_TEMP_SONG,
  SAVE_SONG,
  SETUP_SETINGS,
  SETUP_PLAYLISTS,
  SETUP_EFFECTS,
  SETUP_SONG_DOWNLOADS,
  SETUP_GET_SONGS,
};
