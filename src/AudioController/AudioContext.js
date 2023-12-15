import React, { createContext, useState, useEffect, useContext } from 'react';

// Very helpful audio processing library
import * as Tone from 'tone';

import { AudioObject } from './AudioObject';
import { AudioControls } from './AudioControls';
import { PlayerManager } from './PlayerManager';

// Setup this controller
const AudioContext = createContext();
export const useAudioPlayer = () => useContext(AudioContext);

const DEFAULT_SPEEDUP = 1.2;
const DEFAULT_SLOWDOWN = 0.8;

export const AudioProvider = ({ children }) => {
  /* General songs */
  const [loadedSongs, setLoadedSongs] = useState({});
  const [visibleSongs, setVisibleSongs] = useState({}); // ! TODO, I think this would work better as an array

  // Audio Object
  // src: file location
  // volume: number from 0-1 representing 0-100% volume
  const { currentSong } = AudioObject();

  // Controller for all basic audio controls
  // and settings?
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

  // Handles the overall functionality of playing and switching songs
  const {
    handleSongSelect,
    playNextSong,
    playPreviousSong,
    onSongEnded,
    restartCurrentSong,
    currentSongId,
    currentSongIndex,
  } = PlayerManager(currentSong, visibleSongs);

  /* Current song info */
  // const [currentSong, setCurrentSong] = useState(new Audio()); // Current playing audio object
  // const [currentSongIndex, setCurrentSongIndex] = useState(null);
  // const [currentSongId, setCurrentSongId] = useState(null);

  /* Playlists */
  const [playlists, setPlaylists] = useState([]);

  /* Settings */
  // const [volume, setVolume] = useState(1); // Initial volume is 100%
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [isMuted, setIsMuted] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  /* Effects */
  const [speedupIsEnabled, setSpeedupIsEnabled] = useState(false);
  const [slowDownIsEnabled, setSlowDownIsEnabled] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);

  /* Navigation */
  // ! Todo, should this be moved out of here? Is it in this context's scope?
  const [currentScreen, setCurrentScreen] = useState('All Songs');

  /* General */
  const [loadingQueue, setLoadingQueue] = useState([]);

  /*

██████   █████  ███████ ██  ██████      ██████  ██████  ███    ██ ████████ ██████   ██████  ██      
██   ██ ██   ██ ██      ██ ██          ██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      
██████  ███████ ███████ ██ ██          ██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      
██   ██ ██   ██      ██ ██ ██          ██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██      
██████  ██   ██ ███████ ██  ██████      ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ 

  */

  // const playAudio = () => {
  //   currentSong.play();
  //   setIsPlaying(true);
  // };

  // const pauseAudio = () => {
  //   currentSong.pause();
  //   setIsPlaying(false);
  // };

  // const changeVolume = (newVolume) => {
  //   currentSong.volume = newVolume;
  //   setVolume(newVolume);
  // };

  const [videoTime, setVideoTime] = useState(0);
  const changeVideoTime = (newVideoTime) => {
    setVideoTime(newVideoTime);
  };

  // const playPreviousSong = () => {
  //   if (currentSong) {
  //     currentSong.removeEventListener('ended', onSongEnded);
  //   }

  //   const previousIndex =
  //     (currentSongIndex - 1 + Object.keys(visibleSongs).length) %
  //     Object.keys(visibleSongs).length;
  //   setCurrentSongIndex(previousIndex);

  //   const songArray = Object.values(visibleSongs);
  //   const nextSongId = songArray[previousIndex].id;
  //   setCurrentSongId(nextSongId);
  // };

  // const playNextSong = () => {
  //   if (currentSong) {
  //     currentSong.removeEventListener('ended', onSongEnded);
  //   }

  //   const nextIndex = (currentSongIndex + 1) % Object.keys(visibleSongs).length;
  //   setCurrentSongIndex(nextIndex);

  //   // ! TODO: More modular, and I don't really like this
  //   const songArray = Object.values(visibleSongs); // REALLY? I only need one, not the whole thing
  //   const nextSongId = songArray[nextIndex].id;
  //   setCurrentSongId(nextSongId);
  // };

  // /**
  //  * Toggle mute
  //  */
  // const toggleMute = () => {
  //   setIsMuted(!isMuted);

  //   if (!isMuted) {
  //     changeVolume(0);
  //   } else {
  //     // TODO: set to previous value
  //     changeVolume(1);
  //   }
  // };

  /**
   * Toggles shuffle
   * TODO: Should I not make a new list? Better to create a list and set currentSongIndex to the values.
   */
  const toggleShuffle = () => {
    setIsRandomMode(!isRandomMode);

    if (!isRandomMode) {
      // Shuffle the visibleSongs array if random mode is enabled
      const shuffledSongs = [...visibleSongs];
      for (let i = shuffledSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSongs[i], shuffledSongs[j]] = [
          shuffledSongs[j],
          shuffledSongs[i],
        ];
      }
      setVisibleSongs(shuffledSongs);
    } else {
      // Restore the original order of songs if random mode is disabled
      setVisibleSongs(loadedSongs);
    }
  };

  // Current song changed! Update our variables
  // Essentially create the new song :)
  useEffect(() => {
    // ? Can we do something here so if this is null, we never would even end up here
    if (currentSongId === null) return;

    startLoading();

    /* Update the new file location */
    fileLocation = visibleSongs[currentSongId].file;

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

  const initCurrentSong = () => {
    currentSong.volume = volume;
    // currentSong.load(); // Load the new song's data
    currentSong.play();
    setIsPlaying(true);

    currentSong.addEventListener('ended', onSongEnded);
  };

  // const restartCurrentSong = () => {
  //   // currentSong.pause();
  //   currentSong.currentTime = 0;
  //   currentSong.play();
  // };

  /**
   * Resets the current song's effects to the default and restarts it
   */
  const resetCurrentSong = () => {
    // Reset the songs effects
    setCurrentEffectCombo('');

    // Change to the original file location
    currentSong.src = visibleSongs[currentSongId].file;

    // Start playing the song from the beginning
    restartCurrentSong();
  };

  // const onSongEnded = () => {
  //   // If we are looping the song, restart the current song
  //   // ! Broken because this function gets created before isLooping is set
  //   if (isLooping) {
  //     restartCurrentSong();
  //     return;
  //   }

  //   // Automatically play the next song when the current song ends
  //   playNextSong();
  // };

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
  };

  /*

███████ ███████ ███████ ███████  ██████ ████████ ███████ 
██      ██      ██      ██      ██         ██    ██      
█████   █████   █████   █████   ██         ██    ███████ 
██      ██      ██      ██      ██         ██         ██ 
███████ ██      ██      ███████  ██████    ██    ███████   

  */

  /**
   * Toggles whether the current and all future songs will be sped up
   */
  const toggleSpeedup = () => {
    if (currentSong) {
      // TODO: maybe make this its own function? gets used quite a bit
      currentSong.removeEventListener('ended', onSongEnded);
    }

    // They can't both be active
    if (slowDownIsEnabled) {
      setSlowDownIsEnabled(false);
    }

    fileLocation = visibleSongs[currentSongId].file; // TODO: Make this a function, set default fileLocation

    if (speedupIsEnabled) {
      setSpeedupIsEnabled(false);
      // handleSpeedChange(1);
      addEffect('speed', 1);
    } else {
      setSpeedupIsEnabled(true);
      // handleSpeedChange(DEFAULT_SPEEDUP);
      addEffect('speed', DEFAULT_SPEEDUP);
    }
  };

  /**
   * Toggles whether the current and all future songs will be slowed down
   */
  const toggleSlowDown = () => {
    if (currentSong) {
      // TODO: maybe make this its own function? gets used quite a bit
      currentSong.removeEventListener('ended', onSongEnded);
    }

    if (speedupIsEnabled) {
      setSpeedupIsEnabled(false);
    }

    fileLocation = visibleSongs[currentSongId].file;

    if (slowDownIsEnabled) {
      setSlowDownIsEnabled(false);
      // handleSpeedChange(1);
      addEffect('speed', 1);
    } else {
      setSlowDownIsEnabled(true);
      // handleSpeedChange(DEFAULT_SLOWDOWN);
      addEffect('speed', DEFAULT_SLOWDOWN);
    }
    // return;
    // setSlowDownIsEnabled(!slowDownIsEnabled);
    // handleSpeedChange(1.2);
  };

  const [effects, setEffects] = useState({});
  const [savedEffects, setSavedEffects] = useState({});
  const [effectsEnabled, setEffectsEnabled] = useState(false);
  const [currentEffectCombo, setCurrentEffectCombo] = useState('');
  var fileLocation; // TODO
  /**
   * Applies the given effect to the current song
   * @param {*} effect
   * @param {*} value
   */
  const runEffect = async (effect, value) => {
    // TODO: Does this one really have to be different
    if (effect === 'speed') {
      handleSpeedChange(value);
      return;
    }

    // Find the current function for the corresponding effect
    let effectFunction;
    switch (effect) {
      case 'reverb':
      case 'reverbWetness':
        effectFunction = applyReverb;
        break;
      case 'delay':
        effectFunction = applyDelay;
        break;
      case 'bitCrusher':
        effectFunction = applyBitCrusher;
        break;
      case 'pitchShift':
        effectFunction = applyPitchShift;
        break;
      default:
        console.error(`Unknown effect: ${effect}`);
        return;
    }

    // Get our new audio data
    const audioBuffer = await getCurrentAudioBuffer();
    const renderedBuffer = await renderAudioWithEffect(
      audioBuffer,
      effectFunction,
      value
    );

    // Save the new song
    downloadAudio(renderedBuffer);
  };

  const addEffect = async (currentEffect, value, fL) => {
    /* Make effects unclickable while the current song is being edited */
    startLoading(currentEffect);

    // Save the new speed. RN only used for the video player
    if (currentEffect === 'speed') {
      setCurrentSpeed(value);
    }

    // Add our effects to the list
    // Check if the effect was turned off
    // TODO: Get the actual defaults, kinda fcking up with reverb wetness rn
    if (value === 1 || value === false) {
      delete effects[currentEffect];
      fileLocation = visibleSongs[currentSongId].file;

      // TODO ! Have to add all other effects back now
      const otherEffect = Object.keys(effects);
      console.error(otherEffect);
      if (otherEffect[0] === undefined) {
        // play original song
        console.error('PLAYING ORIGINAL SONG');

        // TODO I THINK THESE HAPPEN A FEW TIMES, MAKE IN OWN FUNCTION?
        /* Start playing the new song */
        currentSong.src = fileLocation;
        initCurrentSong();
        // setCurrentSong(currentSong);

        /* Make the effects clickable again */
        finishLoading();
      } else {
        // loop through all other effects
        runEffect(otherEffect[0], effects[otherEffect[0]]);
      }

      return;
    } else {
      effects[currentEffect] = value;
    }
    setEffects(effects);

    /* Annoying check, this will run if we aren't coming from applySavedEffects. IE: just editing one at a time and not using saved effects */
    if (fL === undefined) {
      // Check if there are multiple effects
      const hasMultipleEffects = Object.keys(effects).length > 1;

      if (hasMultipleEffects) {
        // If multiple effects, modify the temp file location
        fileLocation = currentSong.src;
      } else {
        // If only one effect, modify the default file location
        fileLocation = visibleSongs[currentSongId].file;
      }
    }

    await runEffect(currentEffect, value);
    await getTempSong();
  };

  const applySavedEffects = async (comboName) => {
    // The first effect will be applied to the original file
    fileLocation = visibleSongs[currentSongId].file;

    console.error(savedEffects, comboName, savedEffects[comboName]);
    if (savedEffects[comboName]) {
      setEffectsEnabled(true);
      setCurrentEffectCombo(comboName); // TODO ALSO REDUNDANT

      // Start loading the all effects
      // startLoading(savedEffects[comboName]);

      for (const effect in savedEffects[comboName]) {
        effectThreshold++;

        const effectValue = savedEffects[comboName][effect];
        // console.error(effect, effectValue);
        // console.error(fileLocation);
        // runEffect(effect, effectValue);
        await addEffect(effect, effectValue, fileLocation); // TODO I dont like this, kinda sloppy
        fileLocation = currentSong.src; // All subsequent effects will be applied to the temp file

        // Finish loading the effect
        finishLoading(effect);
      }
    } else {
      // NOT A COMBO
    }
  };

  /**
   * Gets the current song's audio data from the file system
   * @param {*} audioContext
   * @returns
   */
  const getCurrentAudioBuffer = async () => {
    // let filePath = currentSongId;
    // let filePath = index === undefined ? currentSongIndex : index;
    // if (filePath === null) return;
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // const response = await fetch(visibleSongs[filePath].file);
    // const response = await fetch(currentSong.src);
    const response = await fetch(fileLocation);
    const audioData = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(audioData);

    return audioBuffer;
  };

  /**
   * Changes the current song's speed and saves the new, edited song so it can be played
   * Speed has to be rendered differently than the other effects because 'duration' must be changed
   * @param {*} newSpeed
   * @param {*} index
   */
  const handleSpeedChange = async (newSpeed, index) => {
    // Load the current song's audio buffer
    const audioBuffer = await getCurrentAudioBuffer();

    const renderedBuffer = await renderAudioWithSpeedChange(
      audioBuffer,
      newSpeed
    );

    downloadAudio(renderedBuffer);
    // getTempSong(); // ? Need an await here?
  };
  function applySpeedChange(audioBuffer, speedChange) {
    const player = new Tone.Player(audioBuffer).toDestination();
    player.playbackRate = speedChange;
    return player;
  }
  async function renderAudioWithSpeedChange(audioBuffer, speedChange) {
    const duration = audioBuffer.duration / speedChange;
    return await Tone.Offline(async ({ transport }) => {
      const source = applySpeedChange(audioBuffer, speedChange);
      source.start();
    }, duration);
  }

  async function renderAudioWithEffect(
    audioBuffer,
    effectFunction,
    effectParams
  ) {
    const duration = audioBuffer.duration;
    return await Tone.Offline(async ({ transport }) => {
      const source = effectFunction(audioBuffer, effectParams);
      source.start();
    }, duration);
  }

  function applyReverb(audioBuffer, wetValue) {
    // const reverb = new Tone.Reverb().toDestination();
    // const player = new Tone.Player(audioBuffer).connect(reverb);

    // // Default is one, only have to change it if the user changes it though
    // // Scale of 0-1
    // if (wetValue) {
    //   reverb.wet.value = wetValue;
    // }

    const reverbTest = new Tone.Freeverb(0.8, 8000).toDestination();
    // console.error(
    //   reverbTest.wet.value, // 0-1, determines how much the original signal is mixed with the reverb signal. 1 === 100%, 0 === 0% meaning it will be the original audio
    //   reverbTest.roomSize.value, // 0-1, how expansive the reverb sounds. 1 === large room/long decay time.
    //   reverbTest.dampening // 1000-10000, controls how quickly high-frequency content decays over time. The lower the value, the 'brighter' and more reflective it sounds. High values make the reverb sound darker and less reflective
    // );

    reverbTest.wet.value = 0.7;
    reverbTest.roomSize.value = 0.8;
    reverbTest.dampening = 8000;
    const player = new Tone.Player(audioBuffer).connect(reverbTest);

    return player;
  }

  function applyDelay(audioBuffer, delayTime, feedback) {
    const delay = new Tone.FeedbackDelay({
      delayTime: delayTime, // Adjust this value to set the delay time (in seconds)
      feedback: 0.5, // Adjust this value to set the feedback amount (0 to 1). Determines how much is fedback, 1 indicates full feedback (infinitely recycled) and 0 meens no feedback (only original audio is heard)
    }).toDestination();

    const player = new Tone.Player(audioBuffer).connect(delay);

    return player;
  }

  function applyBitCrusher(audioBuffer, bits, frequency) {
    const bitCrusher = new Tone.BitCrusher({
      bits: bits, // Number of bits to reduce the audio to (e.g., 4 bits for a lo-fi effect) ! 16 is CD quality
      // frequency: 1000, // Sample rate reduction frequency (controls the downsampling effect) ! I THINK 44,100 is the typical frequency
    }).toDestination();

    const player = new Tone.Player(audioBuffer).connect(bitCrusher);

    return player;
  }

  function applyPitchShift(audioBuffer, pitch) {
    const pitchShift = new Tone.PitchShift().toDestination();
    pitchShift.pitch = pitch; // +12 === one octave up

    const player = new Tone.Player(audioBuffer).connect(pitchShift);

    return player;
  }

  async function downloadAudio(audioBuffer) {
    const wavBytes = createWavBytes(audioBuffer);
    window.electron.ipcRenderer.sendMessage('SAVE_TEMP_SONG', wavBytes);
    // getTempSong();
  }

  /*

███████  █████  ██    ██ ██ ███    ██  ██████  
██      ██   ██ ██    ██ ██ ████   ██ ██       
███████ ███████ ██    ██ ██ ██ ██  ██ ██   ███ 
     ██ ██   ██  ██  ██  ██ ██  ██ ██ ██    ██ 
███████ ██   ██   ████   ██ ██   ████  ██████  

  */

  const addSong = (song) => {
    loadedSongs[song.id] = song;
    setLoadedSongs(loadedSongs);
  };

  /**
   * Gets the updated temporary song
   */
  const getTempSong = async () => {
    return new Promise((resolve) => {
      window.electron.ipcRenderer.once(
        'TEMP_SONG_SAVED',
        async (outputPath) => {
          await handleTempSongSaved(outputPath);
          resolve();
        }
      );
    });
  };

  var effectThreshold = 0;
  /**
   * Saves the new temporary song from the server and sets it to the current song
   * @param {*} outputPath
   */
  const handleTempSongSaved = (outputPath) => {
    // This function gets called twice for some odd reason, need to just fix that, then I don't need this
    // if (currentSongIndex === null) return;
    console.error('SAVED :  ', effects);

    /* Update the new file path */
    currentSong.src = outputPath;

    /* 
      If effectThreshold == 0, we are just changing one effect at a time and thus can play the new song immediately.
      If effectThreshold != 0, we are applying multiple effects at once (using an effect combo), so we only want to play the song when the last effect is added 
    */
    if (
      effectThreshold === 0 ||
      effectThreshold === Object.keys(effects).length
    ) {
      /* Start playing the new song */
      initCurrentSong();
      // setCurrentSong(currentSong);

      /* Make the effects clickable again */
      // setEffectsClickable(true);
      finishLoading();

      effectThreshold = 0;
    }

    /* Play the new temp song */
    // initCurrentSong();
    // setCurrentSong(currentSong);

    /* Cleanup old file */
    window.electron.ipcRenderer.sendMessage('DELETE_TEMP_SONG');
  };

  /**
   * Sends the edited audio to the server to be saved to the file system
   */
  async function handleSongExport() {
    const audioBuffer = await getCurrentAudioBuffer();

    downloadAudio(audioBuffer);
  }

  function createWavBytes(buffer) {
    /* All of this stuff is really annoying. Unfortunately, ipcRenderer can't take in audioBuffer objects so we have to break it down */
    // Float32Array samples
    const [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)];
    // interleaved
    const interleaved = new Float32Array(left.length + right.length);
    for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
      interleaved[dst] = left[src];
      interleaved[dst + 1] = right[src];
    }
    // get WAV file bytes and audio params of your audio source
    const wavBytes = getWavBytes(interleaved.buffer, {
      isFloat: true, // floating point or 16-bit integer
      numChannels: buffer.numberOfChannels,
      sampleRate: buffer.sampleRate,
    });

    return wavBytes;
  }

  // Returns Uint8Array of WAV bytes
  function getWavBytes(buffer, options) {
    const type = options.isFloat ? Float32Array : Uint16Array;
    const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

    const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
    const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

    // prepend header, then add pcmBytes
    wavBytes.set(headerBytes, 0);
    wavBytes.set(new Uint8Array(buffer), headerBytes.length);

    return wavBytes;
  }

  // adapted from https://gist.github.com/also/900023
  // Returns Uint8Array of WAV header bytes
  function getWavHeader(options) {
    const numFrames = options.numFrames;
    const numChannels = options.numChannels || 2;
    const sampleRate = options.sampleRate || 44100;
    const bytesPerSample = options.isFloat ? 4 : 2;
    const format = options.isFloat ? 3 : 1;

    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;

    const buffer = new ArrayBuffer(44);
    const dv = new DataView(buffer);

    let p = 0;

    function writeString(s) {
      for (let i = 0; i < s.length; i++) {
        dv.setUint8(p + i, s.charCodeAt(i));
      }
      p += s.length;
    }
    function writeUint32(d) {
      dv.setUint32(p, d, true);
      p += 4;
    }
    function writeUint16(d) {
      dv.setUint16(p, d, true);
      p += 2;
    }

    writeString('RIFF'); // ChunkID
    writeUint32(dataSize + 36); // ChunkSize
    writeString('WAVE'); // Format
    writeString('fmt '); // Subchunk1ID
    writeUint32(16); // Subchunk1Size
    writeUint16(format); // AudioFormat https://i.stack.imgur.com/BuSmb.png
    writeUint16(numChannels); // NumChannels
    writeUint32(sampleRate); // SampleRate
    writeUint32(byteRate); // ByteRate
    writeUint16(blockAlign); // BlockAlign
    writeUint16(bytesPerSample * 8); // BitsPerSample
    writeString('data'); // Subchunk2ID
    writeUint32(dataSize); // Subchunk2Size

    return new Uint8Array(buffer);
  }

  const createPlaylist = (playlistName) => {
    window.electron.ipcRenderer.sendMessage('CREATE_PLAYLIST', playlistName);
  };

  /**
   * Callback from the server of the new playlist creation
   */
  useEffect(() => {
    const handlePlaylistAdded = (newPlaylists) => {
      setPlaylists(newPlaylists);
    };

    window.electron.ipcRenderer.once('CREATE_PLAYLIST', handlePlaylistAdded);
  }, [playlists]);

  /**
   * Initial call to get all effect combos
   */
  window.electron.ipcRenderer.on('GRAB_EFFECT_COMBOS', (newEffectCombos) => {
    setSavedEffects(newEffectCombos);
  });

  const saveEffects = (comboName) => {
    // Save the effectCombo permanently
    window.electron.ipcRenderer.sendMessage(
      'SAVE_EFFECT_COMBO',
      comboName,
      effects
    );
  };

  useEffect(() => {
    const handleEffectComboAdded = (newEffectCombos) => {
      setSavedEffects(newEffectCombos);
    };

    window.electron.ipcRenderer.once(
      'SAVE_EFFECT_COMBO',
      handleEffectComboAdded
    );
  }, [savedEffects]);

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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
