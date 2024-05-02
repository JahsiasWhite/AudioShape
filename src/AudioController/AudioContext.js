import React, { createContext, useState, useEffect, useContext } from 'react';

import { AudioObject } from './AudioObject';
import { AudioControls } from './AudioControls';
import { QueueManager } from './QueueManager';
import { AudioEffects } from './AudioEffects';
import { DownloadManager } from './DownloadManager';
import { PlaylistsManager } from './PlaylistsManager';
import { Tools } from './Tools';

// Sets up this context to be the main controller for the application
const AudioContext = createContext();
export const useAudioPlayer = () => useContext(AudioContext);

var fileLocation;

const DEFAULT_SPEEDUP = 1.2;
const DEFAULT_SLOWDOWN = 0.8;

export const AudioProvider = ({ children }) => {
  /* General songs */
  const [loadedSongs, setLoadedSongs] = useState({});
  const [visibleSongs, setVisibleSongs] = useState({}); // ! TODO, I think this would work better as an array

  /* General */
  const [loadingQueue, setLoadingQueue] = useState([]);

  const initCurrentSong = () => {
    currentSong.volume = volume;
    // currentSong.load(); // Load the new song's data
    currentSong.play();
    setIsPlaying(true);

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
    // let filePath = currentSongId;
    // let filePath = index === undefined ? currentSongIndex : index;
    // if (filePath === null) return;
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

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
    console.log('Finished loading', effect, queue);
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

  const { handleSongExport, handleTempSongSaved, downloadAudio } =
    DownloadManager(
      currentSong,
      finishLoading,
      initCurrentSong,
      getCurrentAudioBuffer
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
  } = QueueManager(currentSong, visibleSongs);

  // Handles all audio effects
  const {
    runEffect,
    addEffect,
    applySavedEffects,
    toggleSpeedup,
    toggleSlowDown,
    renderAudioWithEffect,
    handleSpeedChange,
    saveEffects,
    resetCurrentSong,
    effects,
    setEffects,
    savedEffects,
    setSavedEffects,
    effectsEnabled,
    setEffectsEnabled,
    currentEffectCombo,
    setCurrentEffectCombo,
    currentSpeed,
    setCurrentSpeed,
    speedupIsEnabled,
    setSpeedupIsEnabled,
    slowDownIsEnabled,
    setSlowDownIsEnabled,
  } = AudioEffects(
    currentSong,
    fileLocation,
    onSongEnded,
    visibleSongs,
    currentSongId,
    startLoading,
    finishLoading,
    downloadAudio,
    handleTempSongSaved,
    initCurrentSong,
    DEFAULT_SPEEDUP,
    DEFAULT_SLOWDOWN,
    getCurrentAudioBuffer,
    loadingQueue
  );

  // Handles playlists
  const { createPlaylist, playlists, setPlaylists } = PlaylistsManager();

  /* Settings */
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  /* Navigation */
  // ! Todo, should this be moved out of here? Is it in this context's scope?
  const [currentScreen, setCurrentScreen] = useState('All Songs');

  /* Toggle showing popup menu */
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

  /**
   * Toggles shuffle
   * TODO: Should I not make a new list? Better to create a list and set currentSongIndex to the values.
   */
  // const toggleShuffle = () => {
  //   setIsRandomMode(!isRandomMode);

  //   if (!isRandomMode) {
  //     // Shuffle the visibleSongs array if random mode is enabled
  //     const shuffledSongs = [...visibleSongs];
  //     for (let i = shuffledSongs.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1));
  //       [shuffledSongs[i], shuffledSongs[j]] = [
  //         shuffledSongs[j],
  //         shuffledSongs[i],
  //       ];
  //     }
  //     setVisibleSongs(shuffledSongs);
  //   } else {
  //     // Restore the original order of songs if random mode is disabled
  //     setVisibleSongs(loadedSongs);
  //   }
  // };

  // ! I can put this in AudioEffects.js and it will work properly.
  // Current song changed! Update our variables
  // Essentially create the new song :)
  useEffect(() => {
    // ? Can we do something here so if this is null, we never would even end up here
    if (currentSongId === null) return;

    // TODO If we are on a non songpage, spotify playlist for example, and the song ends, visibleSongs will be []
    // visibleSongs should NOT BE DEPENDENT on what screen is showing
    // Shouldn't need once I implement
    if (!visibleSongs[currentSongId]) return;

    startLoading();

    /* Update the new file location */

    fileLocation = visibleSongs[currentSongId].file;
    console.error('SETTING FILE LOCATION TO : ' + fileLocation);

    /* If effects are enabled, apply them to the new song */
    if (effectsEnabled) {
      applySavedEffects(currentEffectCombo);
      return;
    }

    /* If speed up is enabled, edit the song first and then play */
    if (speedupIsEnabled) {
      // handleSpeedChange(DEFAULT_SPEEDUP);
      addEffect('speed', DEFAULT_SPEEDUP);
      return;
    } else if (slowDownIsEnabled) {
      // handleSpeedChange(DEFAULT_SLOWDOWN);
      addEffect('speed', DEFAULT_SLOWDOWN);
      return;
    } else {
      currentSong.src = fileLocation;
    }

    /* (Re)Initializes the current song */
    initCurrentSong();

    // setCurrentSong(currentSong);

    finishLoading();
  }, [currentSongId]);

  /* When the songs first load, we want all songs to be shown */
  const initialSongLoad = (songs) => {
    setLoadedSongs(songs);
    setVisibleSongs(songs);
  };

  window.electron.ipcRenderer.on('GRAB_SONGS', (retrievedSongs) => {
    initialSongLoad(retrievedSongs);
  });

  // /* When a song is double-clicked, change the current song to that one! */
  // const handleSongSelect = (songId) => {
  //   // setCurrentSongIndex(songIndex);
  //   setCurrentSongId(songId);

  //   // ! TODO: Don't love this
  //   const index = Object.keys(visibleSongs).findIndex(
  //     (key) => visibleSongs[key].id === songId
  //   );
  //   setCurrentSongIndex(index);
  // };

  /*

███████  █████  ██    ██ ██ ███    ██  ██████  
██      ██   ██ ██    ██ ██ ████   ██ ██       
███████ ███████ ██    ██ ██ ██ ██  ██ ██   ███ 
     ██ ██   ██  ██  ██  ██ ██  ██ ██ ██    ██ 
███████ ██   ██   ████   ██ ██   ████  ██████  

  */

  /**
   * Adds a new song to the list of songs
   * @param {Audio Object} song
   */
  const addSong = (song) => {
    loadedSongs[song.id] = song;
    setLoadedSongs(loadedSongs);
  };

  return (
    <AudioContext.Provider
      value={{
        initialSongLoad,
        loadingQueue,
        resetCurrentSong,
        loadedSongs,
        visibleSongs,
        currentScreen,
        setCurrentScreen,
        setVisibleSongs,
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
        savedEffects,
        effects,
        setEffects,
        applySavedEffects,
        currentEffectCombo,
        toggleSpeedup,
        toggleSlowDown,
        speedupIsEnabled,
        slowDownIsEnabled,
        handleSongExport,
        addSong,
        playlists,
        setPlaylists,
        createPlaylist,
        setIsLooping,
        addToQueue,
        songQueue,
        nextSongs,
        toggleShuffle,
        shuffleIsEnabled,
        togglePopup,
        setTogglePopup,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;
