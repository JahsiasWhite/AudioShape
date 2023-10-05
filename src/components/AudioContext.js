import React, { createContext, useState, useEffect, useContext } from 'react';

// Very helpful audio processing library
import * as Tone from 'tone';

const AudioContext = createContext();

export const useAudioPlayer = () => useContext(AudioContext);

const DEFAULT_SPEEDUP = 1.2;
const DEFAULT_SLOWDOWN = 0.8;

export const AudioProvider = ({ children }) => {
  /* General songs */
  const [loadedSongs, setLoadedSongs] = useState({});
  const [visibleSongs, setVisibleSongs] = useState({}); // ! TODO, I think this would work better as an array

  /* Current song info */
  const [currentSong, setCurrentSong] = useState(new Audio()); // Current playing audio object
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [currentSongId, setCurrentSongId] = useState(null);

  /* Playlists */
  const [playlists, setPlaylists] = useState([]);

  /* Settings */
  const [volume, setVolume] = useState(1); // Initial volume is 100%
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  /* Effects */
  const [speedupIsEnabled, setSpeedupIsEnabled] = useState(false);
  const [slowDownIsEnabled, setSlowDownIsEnabled] = useState(false);

  /* Navigation */
  // ! Todo, should this be moved out of here? Is it in this context's scope?
  const [currentScreen, setCurrentScreen] = useState('All Songs');

  /*

██████   █████  ███████ ██  ██████      ██████  ██████  ███    ██ ████████ ██████   ██████  ██      
██   ██ ██   ██ ██      ██ ██          ██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      
██████  ███████ ███████ ██ ██          ██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      
██   ██ ██   ██      ██ ██ ██          ██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██      
██████  ██   ██ ███████ ██  ██████      ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ 

  */

  const playAudio = () => {
    currentSong.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    currentSong.pause();
    setIsPlaying(false);
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
  };

  const playPreviousSong = () => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const previousIndex =
      (currentSongIndex - 1 + Object.keys(visibleSongs).length) %
      Object.keys(visibleSongs).length;
    setCurrentSongIndex(previousIndex);

    const songArray = Object.values(visibleSongs);
    const nextSongId = songArray[previousIndex].id;
    setCurrentSongId(nextSongId);
  };

  const playNextSong = () => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const nextIndex = (currentSongIndex + 1) % Object.keys(visibleSongs).length;
    setCurrentSongIndex(nextIndex);

    // ! TODO: More modular, and I don't really like this
    const songArray = Object.values(visibleSongs); // REALLY? I only need one, not the whole thing
    const nextSongId = songArray[nextIndex].id;
    setCurrentSongId(nextSongId);
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (isMuted) {
      setVolume(0);
    } else {
      // TODO: set to previous value
      setVolume(1);
    }
  }, [isMuted]);

  /* When the volume changes, edit the audio object to reflect the change */
  useEffect(() => {
    currentSong.volume = volume;
  }, [volume]);

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

    /* Update the new file location */
    fileLocation = visibleSongs[currentSongId].file;

    /* If speed up is enabled, edit the song first and then play */
    if (speedupIsEnabled) {
      handleSpeedChange(DEFAULT_SPEEDUP);
      return;
    } else if (slowDownIsEnabled) {
      handleSpeedChange(DEFAULT_SLOWDOWN);
      return;
    } else {
      const newSong = visibleSongs[currentSongId];
      currentSong.src = newSong.file;
    }

    /* (Re)Initializes the current song */
    initCurrentSong();

    setCurrentSong(currentSong);
  }, [currentSongId]);

  const initCurrentSong = () => {
    currentSong.volume = volume;
    // currentSong.load(); // Load the new song's data
    currentSong.play();
    setIsPlaying(true);

    currentSong.addEventListener('ended', onSongEnded);
  };

  const restartCurrentSong = () => {
    // currentSong.pause();
    currentSong.currentTime = 0;
    currentSong.play();
  };

  /**
   * Resets the current song's effects to the default and restarts it
   */
  const resetCurrentSong = () => {
    // Reset the effects here as well

    restartCurrentSong();
  };

  const onSongEnded = () => {
    // If we are looping the song, restart the current song
    // ! Broken because this function gets created before isLooping is set
    if (isLooping) {
      restartCurrentSong();
      return;
    }

    // Automatically play the next song when the current song ends
    playNextSong();
  };

  /* When the songs first load, we want all songs to be shown */
  const initialSongLoad = (songs) => {
    // ! IS THIS FUNCTION USED? I THINK IT MIGHT JUST BE REDUNDANT
    setLoadedSongs(songs);
    setVisibleSongs(songs);
  };

  /* When a song is double-clicked, change the current song to that one! */
  const handleSongSelect = (songId) => {
    // setCurrentSongIndex(songIndex);
    setCurrentSongId(songId);

    // ! TODO: Don't love this
    const index = Object.keys(visibleSongs).findIndex(
      (key) => visibleSongs[key].id === songId
    );
    setCurrentSongIndex(index);
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
      handleSpeedChange(1);
    } else {
      setSpeedupIsEnabled(true);
      handleSpeedChange(DEFAULT_SPEEDUP);
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
      handleSpeedChange(1);
    } else {
      setSlowDownIsEnabled(true);
      handleSpeedChange(DEFAULT_SLOWDOWN);
    }
    // return;
    // setSlowDownIsEnabled(!slowDownIsEnabled);
    // handleSpeedChange(1.2);
  };

  /**
   * Applies the given effect to the current song
   * @param {*} effect
   * @param {*} value
   */
  const runEffect = (effect, value) => {
    if (effect === 'speed') {
      handleSpeedChange(value);
    }
    if (effect === 'reverb') {
      handleReverbChange();
    }
    if (effect === 'reverbWetness') {
      handleReverbChange(value);
    }
    if (effect === 'delay') {
      handleDelayChange(value);
    }
    if (effect === 'bitCrusher') {
      handleBitcrusherChange(value);
    }
  };

  const [effects, setEffects] = useState({});
  var fileLocation;
  const addEffect = (currentEffect, value) => {
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
      } else {
        // loop through all other effects
        runEffect(otherEffect[0], effects[otherEffect[0]]);
      }

      return;
    } else {
      effects[currentEffect] = value;
    }
    setEffects(effects);

    // Check if there are multiple effects
    const hasMultipleEffects = Object.keys(effects).length > 1;

    if (hasMultipleEffects) {
      // If multiple effects, modify the temp file location
      fileLocation = currentSong.src;
    } else {
      // If only one effect, modify the default file location
      fileLocation = visibleSongs[currentSongId].file;
    }

    runEffect(currentEffect, value);
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

  const handleReverbChange = async (wetValue) => {
    // Load the current song's audio buffer
    const audioBuffer = await getCurrentAudioBuffer();

    const renderedBuffer = await renderAudioWithReverb(audioBuffer, wetValue);

    downloadAudio(renderedBuffer);
  };
  function applyReverb(audioBuffer, wetValue) {
    const reverb = new Tone.Reverb().toDestination();
    const player = new Tone.Player(audioBuffer).connect(reverb);

    // Default is one, only have to change it if the user changes it though
    // Scale of 0-1
    if (wetValue) {
      reverb.wet.value = wetValue;
    }

    return player;
  }
  async function renderAudioWithReverb(audioBuffer, wetValue) {
    const duration = audioBuffer.duration;
    return await Tone.Offline(async ({ transport }) => {
      const source = applyReverb(audioBuffer, wetValue);
      source.start();
    }, duration);
  }

  const handleDelayChange = async (delayValue) => {
    // Load the current song's audio buffer
    const audioBuffer = await getCurrentAudioBuffer();

    // Add the effect
    const renderedBuffer = await renderAudioWithDelay(audioBuffer, delayValue);

    // Save the new song
    downloadAudio(renderedBuffer);
  };

  function applyDelay(audioBuffer, delayTime, feedback) {
    const delay = new Tone.FeedbackDelay({
      delayTime: 1, // Adjust this value to set the delay time (in seconds)
      feedback: 0.5, // Adjust this value to set the feedback amount (0 to 1). Determines how much is fedback, 1 indicates full feedback (infinitely recycled) and 0 meens no feedback (only original audio is heard)
    }).toDestination();

    const player = new Tone.Player(audioBuffer).connect(delay);

    return player;
  }

  // TODO: Can this be more generic?
  async function renderAudioWithDelay(audioBuffer, delayValue) {
    const duration = audioBuffer.duration;
    return await Tone.Offline(async ({ transport }) => {
      const source = applyDelay(audioBuffer, delayValue);
      source.start();
    }, duration);
  }

  const handleBitcrusherChange = async (bitCrusherValue) => {
    // Load the current song's audio buffer
    const audioBuffer = await getCurrentAudioBuffer();

    // Add the effect
    const renderedBuffer = await renderAudioWithBitCrusher(
      audioBuffer,
      bitCrusherValue
    );

    console.error('WITH BITCRUSHER ', renderedBuffer);
    // Save the new song
    downloadAudio(renderedBuffer);
  };

  function applyBitCrusher(audioBuffer, bits, frequency) {
    const bitCrusher = new Tone.BitCrusher({
      bits: 2, // Number of bits to reduce the audio to (e.g., 4 bits for a lo-fi effect) ! 16 is CD quality
      // frequency: 1000, // Sample rate reduction frequency (controls the downsampling effect) ! I THINK 44,100 is the typical frequency
    }).toDestination();

    const player = new Tone.Player(audioBuffer).connect(bitCrusher);

    return player;
  }

  // TODO: Can this be more generic?
  async function renderAudioWithBitCrusher(audioBuffer, bitCrusherValue) {
    const duration = audioBuffer.duration;
    return await Tone.Offline(async ({ transport }) => {
      const source = applyBitCrusher(audioBuffer, bitCrusherValue);
      source.start();
    }, duration);
  }

  async function downloadAudio(audioBuffer) {
    const player = new Tone.Player().toDestination();

    // const renderedBuffer = await renderAudioWithReverb(audioBuffer);
    player.buffer = audioBuffer;
    // player.start();

    const wavBytes = createWavBytes(player); // ! TODO: Just put the buffer in then we dont have to create a new player
    window.electron.ipcRenderer.sendMessage('SAVE_TEMP_SONG', wavBytes);
    getTempSong();
  }

  /*

███████  █████  ██    ██ ██ ███    ██  ██████  
██      ██   ██ ██    ██ ██ ████   ██ ██       
███████ ███████ ██    ██ ██ ██ ██  ██ ██   ███ 
     ██ ██   ██  ██  ██  ██ ██  ██ ██ ██    ██ 
███████ ██   ██   ████   ██ ██   ████  ██████  

  */

  /**
   * Gets the updated temporary song
   */
  const getTempSong = () => {
    window.electron.ipcRenderer.once('TEMP_SONG_SAVED', handleTempSongSaved);
  };

  /**
   * Saves the new temporary song from the server and sets it to the current song
   * @param {*} outputPath
   */
  const handleTempSongSaved = (outputPath) => {
    // This function gets called twice for some odd reason, need to just fix that, then I don't need this
    // if (currentSongIndex === null) return;

    currentSong.src = outputPath;

    initCurrentSong();
    setCurrentSong(currentSong);

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

  function createWavBytes(inputSong) {
    /* All of this stuff is really annoying. Unfortunately, ipcRenderer can't take in audioBuffer objects so we have to break it down */
    // Float32Array samples
    const [left, right] = [
      inputSong.buffer.getChannelData(0),
      inputSong.buffer.getChannelData(1),
    ];
    // interleaved
    const interleaved = new Float32Array(left.length + right.length);
    for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
      interleaved[dst] = left[src];
      interleaved[dst + 1] = right[src];
    }
    // get WAV file bytes and audio params of your audio source
    const wavBytes = getWavBytes(interleaved.buffer, {
      isFloat: true, // floating point or 16-bit integer
      numChannels: inputSong.buffer.numberOfChannels,
      sampleRate: inputSong.buffer.sampleRate,
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

  return (
    <AudioContext.Provider
      value={{
        initialSongLoad,
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
        playPreviousSong,
        playNextSong,
        addEffect,
        toggleSpeedup,
        toggleSlowDown,
        speedupIsEnabled,
        slowDownIsEnabled,
        handleSongExport,
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
