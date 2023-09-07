import React, { createContext, useState, useEffect, useContext } from 'react';

const AudioContext = createContext();

export const useAudioPlayer = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [loadedSongs, setLoadedSongs] = useState([]);
  const [visibleSongs, setVisibleSongs] = useState([]);

  const [currentSong, setCurrentSong] = useState(new Audio()); // Current playing audio object\

  const [currentSongIndex, setCurrentSongIndex] = useState(null);

  /* Playlists */
  const [playlists, setPlaylists] = useState([]);

  /* Sample song */
  const [sampleSong, setSampleSong] = useState(new Audio());

  const [volume, setVolume] = useState(1); // Initial volume is 100%
  const [isPlaying, setIsPlaying] = useState(false);

  const [speedupIsEnabled, setSpeedupIsEnabled] = useState(false);
  const [slowDownIsEnabled, setSlowDownIsEnabled] = useState(false);

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
    currentSong.volume = newVolume;
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
    initCurentSong();

    setCurrentSong(currentSong);
  }, [currentSongIndex]);

  const initCurentSong = () => {
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

  /* When a song is double-clicked */
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

    if (slowDownIsEnabled) {
      setSlowDownIsEnabled(false);
    }

    setSpeedupIsEnabled(!speedupIsEnabled);
    handleSpeedChange(0.8);
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

    setSlowDownIsEnabled(!slowDownIsEnabled);
    handleSpeedChange(1.2);
  };

  /**
   * Changes the speed of the current song and starts playing a sample
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
    source.index = index === undefined ? currentSongIndex : index;

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
      return;
    }

    source.start(0);
    setSampleSong(source);
  };
  useEffect(() => {
    // If these aren't enabled, we dont have a temp song so just leave
    if (!slowDownIsEnabled && !speedupIsEnabled) return;

    window.electron.ipcRenderer.once('TEMP_SONG_SAVED', handleTempSongSaved);

    return () => {
      console.error('HI');
      // Clean up the event listener when the component unmounts
      // window.electron.ipcRenderer.removeAllListeners('TEMP_SONG_SAVED');
    };
  }, [currentSongIndex]); // Uhhhh do i need this ? Or can it just be empty?

  useEffect(() => {
    console.error('CHANGED', speedupIsEnabled, slowDownIsEnabled);
    window.electron.ipcRenderer.once('TEMP_SONG_SAVED', handleTempSongSaved);
  }, [speedupIsEnabled, slowDownIsEnabled]);

  const handleTempSongSaved = (outputPath) => {
    if (currentSongIndex === null) return;

    console.error('CHANGING SRC', currentSongIndex, outputPath);
    currentSong.src = outputPath;

    initCurentSong();
    setCurrentSong(currentSong);

    /* Cleanup old file */
    window.electron.ipcRenderer.sendMessage('DELETE_TEMP_SONG');
  };

  /**
   * Helper to stop the sample song
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
        playPreviousSong,
        playNextSong,
        handleSpeedChange,
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
