import React, { createContext, useState, useEffect, useContext } from 'react';

const AudioContext = createContext();

export const useAudioPlayer = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  /* General songs */
  const [loadedSongs, setLoadedSongs] = useState([]);
  const [visibleSongs, setVisibleSongs] = useState([]);

  /* Current song info */
  const [currentSong, setCurrentSong] = useState(new Audio()); // Current playing audio object
  const [currentSongIndex, setCurrentSongIndex] = useState(null);

  /* Playlists */
  const [playlists, setPlaylists] = useState([]);

  /* Sample song */
  const [sampleSong, setSampleSong] = useState(new Audio());

  /* Settings */
  const [volume, setVolume] = useState(1); // Initial volume is 100%
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);

  /* Effects */
  const [speedupIsEnabled, setSpeedupIsEnabled] = useState(false);
  const [slowDownIsEnabled, setSlowDownIsEnabled] = useState(false);

  /* Navigation */
  // ! Todo, should this be moved out of here? Is it in this context's scope?
  const [currentScreen, setCurrentScreen] = useState('All Songs');

  const playAudio = () => {
    currentSong.play();
    setIsPlaying(true);

    stopSampleAudio();
  };

  const pauseAudio = () => {
    currentSong.pause();
    setIsPlaying(false);

    stopSampleAudio();
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
  };

  const playPreviousSong = () => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const previousIndex =
      (currentSongIndex - 1 + visibleSongs.length) % visibleSongs.length;
    setCurrentSongIndex(previousIndex);
  };

  const playNextSong = () => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const nextIndex = (currentSongIndex + 1) % visibleSongs.length;
    setCurrentSongIndex(nextIndex);
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
    if (currentSongIndex === null) return;

    /* Stop playing the sample audio before playing the new song */
    stopSampleAudio();

    /* If speed up is enabled, edit the song first and then play */
    if (speedupIsEnabled) {
      // sppedup
      handleSpeedChange(0.8);
      return;
    } else if (slowDownIsEnabled) {
      handleSpeedChange(1.2);
      return;
    } else {
      const newSong = visibleSongs[currentSongIndex];
      currentSong.src = newSong.file;
    }

    /* (Re)Initializes the current song */
    initCurrentSong();

    setCurrentSong(currentSong);
  }, [currentSongIndex]);

  const initCurrentSong = () => {
    currentSong.volume = volume;
    // currentSong.load(); // Load the new song's data
    currentSong.play();
    setIsPlaying(true);

    // currentSong.addEventListener('ended', () => {
    //   console.error('REMOVING LISTENER');
    //   // Automatically play the next song when the current song ends
    //   playNextSong();
    // });
    currentSong.addEventListener('ended', onSongEnded);
  };

  const onSongEnded = () => {
    // Automatically play the next song when the current song ends
    playNextSong();
  };

  /* When the songs first load, we want all songs to be shown */
  const initialSongLoad = (songs) => {
    setLoadedSongs(songs);
    setVisibleSongs(songs);
  };

  /* When a song is double-clicked, change the current song to that one! */
  const handleSongSelect = (songIndex) => {
    setCurrentSongIndex(songIndex);
  };

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

    if (speedupIsEnabled) {
      setSpeedupIsEnabled(false);
      handleSpeedChange(1);
    } else {
      setSpeedupIsEnabled(true);
      handleSpeedChange(0.8);
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

    if (slowDownIsEnabled) {
      setSlowDownIsEnabled(false);
      handleSpeedChange(1);
    } else {
      setSlowDownIsEnabled(true);
      handleSpeedChange(1.2);
    }
    // return;
    // setSlowDownIsEnabled(!slowDownIsEnabled);
    // handleSpeedChange(1.2);
  };

  /**
   * Changes the speed of the current song
   * @param {*} newSpeed
   */
  const handleSpeedChange = async (newSpeed, index) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    /* index is only given when using sample audio, if auto-speedup play is enabled, the path should just be the current playing song */
    let filePath = index === undefined ? currentSongIndex : index;

    if (filePath === null) return;

    // Load the current song's audio buffer
    const response = await fetch(visibleSongs[filePath].file);
    const audioData = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(audioData);

    // Create a new audio buffer with increased playback speed
    // .5 === 2x speed, 2 === .5x speed
    const newLength = audioBuffer.duration * newSpeed;
    const newSampleCount = Math.ceil(newLength * audioBuffer.sampleRate);

    // Gets how much faster the new song is
    const speedupMultiplier = audioBuffer.duration / newLength;
    console.error('CHANGING SPEED BY x', speedupMultiplier);

    // Initialize the new buffer with the new sample count and duration
    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      newSampleCount,
      audioBuffer.sampleRate
    );

    /* Copies the audio data to the new buffer */
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const oldData = audioBuffer.getChannelData(channel);
      const newData = newBuffer.getChannelData(channel);

      for (let i = 0; i < newBuffer.length; i++) {
        const oldIndex = Math.floor(i / newSpeed);
        newData[i] = oldData[oldIndex] || 0;
      }
    }

    // Stop the current sample song to get ready to play the new one
    pauseAudio();

    // Create a new audio source node with the modified buffer
    const source = audioContext.createBufferSource();

    source.buffer = newBuffer;
    source.connect(audioContext.destination); // Connect the node to the destination so we can hear the sound
    source.index = filePath;

    // TODO: This doesnt work for some reason
    /* Changes the volume */
    // const gainNode = audioContext.createGain();
    // gainNode.gain.value = 0.1; // Set the volume to half
    // source.connect(gainNode);
    // console.error(gainNode.gain.value);
    // gainNode.connect(audioContext.destination);

    /* If we're using auto-play speedup, the current song should be the one changing */
    /* We have to save a temporary local copy to play the audio and still have full functionality */
    if (index === undefined) {
      const wavBytes = createWavBytes(source);
      window.electron.ipcRenderer.sendMessage('SAVE_TEMP_SONG', wavBytes);
      getTempSong();
      return;
    }

    // ! I dont think this ever gets reached now, which isn't bad
    return;
    console.error('HERE I AM I GUESS');

    source.start(0);
    setSampleSong(source);
  };

  const handleReverbChange = async () => {
    /* Works as .start() but not for saving :( */
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Load the current song's audio buffer
    const response = await fetch(visibleSongs[currentSongIndex].file);
    const audioData = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;

    const impulseResponseURL = 'path/to/impulse-response.wav'; // Replace with the path to your impulse response file

    // Start playing your audio source
    audioSource.connect(audioContext.destination);

    // Add reverb to the audio source
    await addReverbToAudio(audioContext, audioSource, visibleSongs[0].file);

    audioSource.start(0);

    // const wavBytes = createWavBytes(audioSource);
    // window.electron.ipcRenderer.sendMessage('SAVE_TEMP_SONG', wavBytes);
    // getTempSong();
    console.error('PLAYING');
    /* */

    // const testContext = new (window.AudioContext ||
    //   window.webkitAudioContext)();
    // const testSource = testContext.createBufferSource();
    // const impulse = impulseResponse(testContext, 1, 1, 1);
    // testSource.buffer = impulse;
    // testSource.connect(testContext.destination);
    // testSource.start(0);
    // console.error(testSource);
  };
  async function addReverbToAudio(
    audioContext,
    audioSource,
    impulseResponseURL
  ) {
    // Load the impulse response from a WAV file
    const response = await fetch(impulseResponseURL);
    const arrayBuffer = await response.arrayBuffer();
    const impulseResponseBuffer = await audioContext.decodeAudioData(
      arrayBuffer
    );

    // Create a ConvolverNode and set its buffer to the loaded impulse response
    const convolver = audioContext.createConvolver();
    convolver.buffer = impulseResponseBuffer;

    // Connect your existing audio source to the ConvolverNode
    audioSource.connect(convolver);

    // Connect the ConvolverNode to the audio destination (speakers)
    convolver.connect(audioContext.destination);
    console.error('REVERB ADDED');
  }
  function impulseResponse(audioContext, duration, decay, reverse) {
    var sampleRate = audioContext.sampleRate;
    var length = sampleRate * duration;
    var impulse = audioContext.createBuffer(2, length, sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    if (!decay) decay = 2.0;
    for (var i = 0; i < length; i++) {
      var n = reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  }

  // useEffect(() => {
  //   console.error('HMM');
  //   // If these aren't enabled, we dont have a temp song so just leave
  //   if (!slowDownIsEnabled && !speedupIsEnabled) return;

  //   // console.error('CALLING handleTempSongSaved');
  //   // window.electron.ipcRenderer.once('TEMP_SONG_SAVED', handleTempSongSaved);

  //   return () => {
  //     console.error('HI');
  //     // Clean up the event listener when the component unmounts
  //     // window.electron.ipcRenderer.removeAllListeners('TEMP_SONG_SAVED');
  //   };
  // }, [currentSongIndex]); // Uhhhh do i need this ? Or can it just be empty?

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
   * Safely stops the sample song
   */
  const stopSampleAudio = () => {
    if (sampleSong.stop) {
      sampleSong.stop();
    }
  };

  /**
   * Sends the edited audio to the server to be saved to the file system
   */
  function handleSongExport(inputSong) {
    inputSong = sampleSong;

    const wavBytes = createWavBytes(inputSong);

    window.electron.ipcRenderer.sendMessage(
      'SAVE_SONG',
      wavBytes,
      visibleSongs[inputSong.index].file // ! MAKE INPUTSONG
    );
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
        loadedSongs,
        visibleSongs,
        currentScreen,
        setCurrentScreen,
        setVisibleSongs,
        currentSong,
        currentSongIndex,
        sampleSong,
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
        handleSpeedChange,
        handleReverbChange,
        toggleSpeedup,
        toggleSlowDown,
        speedupIsEnabled,
        slowDownIsEnabled,
        handleSongExport,
        playlists,
        setPlaylists,
        createPlaylist,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
