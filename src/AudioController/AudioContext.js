import React, { createContext, useState, useEffect, useContext } from 'react';

import { AudioObject } from './AudioObject';
import { AudioControls } from './AudioControls';
import { QueueManager } from './QueueManager';
import { AudioEffects } from './AudioEffects';
import { DownloadManager } from './DownloadManager';
import { PlaylistsManager } from './PlaylistsManager';
import { Tools } from './Tools';
import { setupLiveEffectsChain } from './LiveEffectsChain';
import { renderAudioWithAllEffects } from './ToneEffects';

// Sets up this context to be the main controller for the application
const AudioContext = createContext();
export const useAudioPlayer = () => useContext(AudioContext);

var fileLocation;

// TODO Put these in a Constants file
const DEFAULT_SPEEDUP = 1.2;
const DEFAULT_SLOWDOWN = 0.8;

export const AudioProvider = ({ children }) => {
  const MAX_HISTORY_ITEMS = 100;

  /* General songs */
  const [loadedSongs, setLoadedSongs] = useState({});
  const [visibleSongs, setVisibleSongs] = useState({}); // ! TODO, I think this would work better as an array
  const [initSongsLoading, setInitSongsLoading] = useState(true);
  const [listeningHistory, setListeningHistory] = useState([]);

  /* General */
  const [loadingQueue, setLoadingQueue] = useState([]);

  const initCurrentSong = async () => {
    await setupLiveEffectsChain(currentSong); // No-op after first call (resolves instantly)
    currentSong.volume = volume;
    try {
      await currentSong.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play song:', err);
      setIsPlaying(false);
      return;
    }

    console.error('Adding event listener for onSongEnded');
    currentSong.addEventListener('ended', onSongEnded);
  };

  /* TOOLS */
  /**
   * Gets the current song's audio data from the file system
   * @param {*} audioContext
   * @returns
   */
  const getCurrentAudioBuffer = async (file) => {
    try {
      // let filePath = currentSongId;
      // let filePath = index === undefined ? currentSongIndex : index;
      // if (filePath === null) return;
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();

      // const response = await fetch(visibleSongs[filePath].file);
      // const response = await fetch(currentSong.src);

      if (file) {
        fileLocation = file;
      }

      console.error(file);
      console.error(fileLocation);
      const response = await fetch(fileLocation);
      const audioData = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioData);

      return audioBuffer;
    } catch (error) {
      // TODO: Sometimes this comes in here when it shouldn't
      console.error('Error fetching audio buffer:', error);
      return null;
    }
  };

  /**
   * Starts loading a new process
   * @param {String} effectName
   */
  const startLoading = (effectName) => {
    // let queue = [];
    // if (effects !== undefined) {
    //   queue = Object.keys(effects);
    // }

    console.log('Starting loading', effectName, loadingQueue);
    setLoadingQueue([...loadingQueue, effectName]);
  };

  /**
   * Finish loading the given process
   * @param {*} effect
   */
  const finishLoading = (effect) => {
    let queue = [];
    if (effect !== undefined) {
      queue = loadingQueue.filter((curEffect) => curEffect !== effect);
    }
    console.log('Finished loading... Effect: ', effect, ' Queue: ', queue);
    setLoadingQueue(queue);

    // Keep the song centered
    setTimeout(() => {
      const songDiv = document.getElementById(currentSongId);
      if (songDiv)
        songDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Extra tools to help with stuff
  // const { getCurrentAudioBuffer } = Tools(fileLocation);

  /**
   * Audio object
   * src: file location
   * volume: number from 0-1 representing
   */
  const { currentSong } = AudioObject();

  /**
   * Controller for all basic audio control and settings
   */
  const {
    playAudio,
    pauseAudio,
    changeVolume,
    toggleMute,
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
  } = AudioControls(currentSong);

  const { handleSongExport, downloadAudio } =
    DownloadManager(
      currentSong,
      finishLoading,
      initCurrentSong,
      getCurrentAudioBuffer,
    );

  // Handles the overall functionality of playing and switching songs
  const {
    handleSongSelect,
    playNextSong,
    playPreviousSong,
    onSongEnded,
    currentSongId,
    currentSongIndex,
    addToQueue,
    removeFromQueue,
    rearrangeQueue,
    songQueue,
    nextSongs,
    toggleShuffle,
    shuffleIsEnabled,
    loopIsEnabled,
  } = QueueManager(currentSong, visibleSongs, loadedSongs);

  // Handles all audio effects
  const {
    addEffect,
    applySavedEffects,
    toggleSpeedup,
    toggleSlowDown,
    saveEffects,
    deleteEffectCombo,
    renameEffectCombo,
    clearEffects,
    resetCurrentSong,
    effects,
    setEffects,
    savedEffects,
    currentEffectCombo,
    currentSpeed,
    speedupIsEnabled,
    slowDownIsEnabled,
  } = AudioEffects(
    currentSong,
    visibleSongs,
    currentSongId,
    DEFAULT_SPEEDUP,
    DEFAULT_SLOWDOWN,
  );

  // Handles playlists
  const { createPlaylist, playlists, setPlaylists } = PlaylistsManager();

  /* Settings */
  // const [isLooping, setIsLooping] = useState(false);

  /* Navigation */
  // ! Todo, should this be moved out of here? Is it in this context's scope?
  const [currentScreen, setCurrentScreen] = useState('All Songs');

  /* Toggle showing popup menu */
  // ! This is needed! So the popups work in fullscreen
  const [togglePopup, setTogglePopup] = useState(false);

  /*

██████   █████  ███████ ██  ██████      ██████  ██████  ███    ██ ████████ ██████   ██████  ██      
██   ██ ██   ██ ██      ██ ██          ██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      
██████  ███████ ███████ ██ ██          ██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      
██   ██ ██   ██      ██ ██ ██          ██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██      
██████  ██   ██ ███████ ██  ██████      ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ 

  */

  const [videoTime, setVideoTime] = useState(0);
  const changeVideoTime = (newVideoTime) => {
    setVideoTime(newVideoTime);
  };

  // Current song changed — just point the audio element at the new file.
  // The live effects chain stays wired and automatically applies to whatever is playing.
  useEffect(() => {
    console.error('SONG CHANGED TO ', currentSongId);
    if (currentSongId === null) return;
    if (!loadedSongs[currentSongId]) return;

    startLoading();

    fileLocation = loadedSongs[currentSongId].file;
    fileLocation = fileLocation.replace(/[#\$]/g, (match) =>
      match === '#' ? '%23' : '$'
    );
    console.error('SETTING FILE LOCATION TO : ' + fileLocation);

    currentSong.src = fileLocation;

    /* Restore speed for the new song (non-speed effects apply automatically via the live chain) */
    if (speedupIsEnabled) {
      addEffect('speed', DEFAULT_SPEEDUP);
    } else if (slowDownIsEnabled) {
      addEffect('speed', DEFAULT_SLOWDOWN);
    } else if (currentSpeed !== 1) {
      currentSong.playbackRate = currentSpeed;
      currentSong.defaultPlaybackRate = currentSpeed;
    }

    initCurrentSong();
    finishLoading();

    if ('mediaSession' in navigator) {
      const song = loadedSongs[currentSongId];
      const artwork = song?.albumImage
        ? [{ src: `file:///${song.albumImage.replace(/\\/g, '/')}`, type: 'image/jpeg' }]
        : [];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song?.title ?? '',
        artist: song?.artist ?? '',
        album: song?.album ?? '',
        artwork,
      });
    }

    setListeningHistory((currentHistory) => {
      const lastEntry = currentHistory[0];
      if (lastEntry && lastEntry.songId === currentSongId) {
        return currentHistory;
      }

      const song = loadedSongs[currentSongId];
      const updatedHistory = [
        {
          songId: currentSongId,
          playedAt: new Date().toISOString(),
          title: song?.title ?? 'Unknown Title',
          artist: song?.artist ?? 'Unknown Artist',
          album: song?.album ?? 'Unknown Album',
          albumImage: song?.albumImage ?? null,
        },
        ...currentHistory,
      ].slice(0, MAX_HISTORY_ITEMS);

      window.electron.ipcRenderer.sendMessage('SAVE_HISTORY', updatedHistory);
      return updatedHistory;
    });
  }, [currentSongId]);

  useEffect(() => {
    const unsubHistory = window.electron.ipcRenderer.on(
      'RETURN_HISTORY',
      (history) => {
        setListeningHistory(Array.isArray(history) ? history : []);
      },
    );
    window.electron.ipcRenderer.sendMessage('GET_HISTORY');
    return () => {
      unsubHistory?.();
    };
  }, []);

  /* Media key IPC + navigator.mediaSession action handlers */
  useEffect(() => {
    const handlePlayPause = () => { if (isPlaying) pauseAudio(); else playAudio(); };
    const r1 = window.electron.ipcRenderer.on('MEDIA_PLAY_PAUSE', handlePlayPause);
    const r2 = window.electron.ipcRenderer.on('MEDIA_NEXT_TRACK', playNextSong);
    const r3 = window.electron.ipcRenderer.on('MEDIA_PREV_TRACK', playPreviousSong);
    const r4 = window.electron.ipcRenderer.on('MEDIA_STOP', pauseAudio);

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', playAudio);
      navigator.mediaSession.setActionHandler('pause', pauseAudio);
      navigator.mediaSession.setActionHandler('nexttrack', playNextSong);
      navigator.mediaSession.setActionHandler('previoustrack', playPreviousSong);
      navigator.mediaSession.setActionHandler('stop', pauseAudio);
    }

    return () => { r1?.(); r2?.(); r3?.(); r4?.(); };
  }, [isPlaying, playAudio, pauseAudio, playNextSong, playPreviousSong]);

  /* Keep isPlaying in sync with the actual audio element state */
  useEffect(() => {
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    currentSong.addEventListener('play', onPlay);
    currentSong.addEventListener('pause', onPause);
    return () => {
      currentSong.removeEventListener('play', onPlay);
      currentSong.removeEventListener('pause', onPause);
    };
  }, []);

  /* When the songs first load, we want all songs to be shown */
  const initialSongLoad = (songs, isComplete = true) => {
    setLoadedSongs(songs);
    setVisibleSongs(songs);
    if (isComplete) setInitSongsLoading(false);
  };

  /* Called when a new directory is selected — clears old songs and shows loading */
  const startSongsLoading = () => {
    setInitSongsLoading(true);
    setVisibleSongs({});
    setLoadedSongs({});
  };

  window.electron.ipcRenderer.on('GRAB_SONGS', ({ songs, isComplete }) => {
    console.error('GOT SONGS: ', songs);
    initialSongLoad(songs, isComplete);
  });

  /**
   * Adds a new song to the list of songs
   * @param {Audio Object} song
   */
  const addSong = (song) => {
    const updatedSongs = { ...loadedSongs, [song.id]: song };
    setLoadedSongs(updatedSongs);
    setVisibleSongs(updatedSongs);
  };

  const clearListeningHistory = () => {
    setListeningHistory([]);
    window.electron.ipcRenderer.sendMessage('CLEAR_HISTORY');
  };

  return (
    <AudioContext.Provider
      value={{
        initialSongLoad,
        startSongsLoading,
        loadingQueue,
        clearEffects,
        resetCurrentSong,
        loadedSongs,
        visibleSongs,
        currentScreen,
        setCurrentScreen,
        setVisibleSongs,
        initSongsLoading,
        listeningHistory,
        currentSong,
        currentSongIndex,
        currentSongId,
        handleSongSelect,
        isPlaying,
        playAudio,
        pauseAudio,
        volume,
        changeVolume,
        isMuted,
        toggleMute,
        currentSpeed,
        videoTime,
        changeVideoTime,
        playPreviousSong,
        playNextSong,
        addEffect,
        saveEffects,
        deleteEffectCombo,
        renameEffectCombo,
        savedEffects,
        effects,
        setEffects,
        applySavedEffects,
        currentEffectCombo,
        toggleSpeedup,
        toggleSlowDown,
        speedupIsEnabled,
        slowDownIsEnabled,
        handleSongExport: async () => {
          const nonSpeedEffects = Object.entries(effects).filter(([name]) => name !== 'speed');
          if (nonSpeedEffects.length > 0) {
            // Render all active effects offline first, then export the result
            const audioBuffer = await getCurrentAudioBuffer(fileLocation);
            if (audioBuffer) {
              const rendered = await renderAudioWithAllEffects(audioBuffer, effects);
              downloadAudio(rendered);
              const tempPath = await new Promise((resolve) => {
                window.electron.ipcRenderer.once('TEMP_SONG_SAVED', (outputPath) => resolve(outputPath));
              });
              const result = await handleSongExport(currentSpeed, tempPath);
              window.electron.ipcRenderer.sendMessage('DELETE_TEMP_SONG');
              return result;
            }
          }
          return handleSongExport(currentSpeed);
        },
        addSong,
        playlists,
        setPlaylists,
        createPlaylist,
        addToQueue,
        songQueue,
        nextSongs,
        toggleShuffle,
        shuffleIsEnabled,
        loopIsEnabled,
        togglePopup,
        setTogglePopup,
        clearListeningHistory,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;
