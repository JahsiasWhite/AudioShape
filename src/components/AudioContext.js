import React, { createContext, useState, useEffect, useContext } from 'react';

const AudioContext = createContext();

export const useAudioPlayer = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [loadedSongs, setLoadedSongs] = useState([]);
  const [visibleSongs, setVisibleSongs] = useState([]);

  const [currentSong, setCurrentSong] = useState(new Audio()); // Current playing audio object
  const [currentSongIndex, setCurrentSongIndex] = useState(null);

  /* Sample song */
  const [sampleSong, setSampleSong] = useState(new Audio());

  const [volume, setVolume] = useState(1); // Initial volume is 100%
  const [isPlaying, setIsPlaying] = useState(false);

  const [speedupIsEnabled, setSpeedupIsEnabled] = useState(false);

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
    const previousIndex =
      (currentSongIndex - 1 + visibleSongs.length) % visibleSongs.length;
    setCurrentSongIndex(previousIndex);
  };

  const playNextSong = () => {
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
      //return
      console.error('HI');
    } else {
      const newSong = visibleSongs[currentSongIndex];
      currentSong.src = newSong.file;
    }

    currentSong.volume = volume;
    currentSong.load(); // Load the new song's data
    currentSong.play();
    setIsPlaying(true);

    // audio.volume = volume;
    currentSong.addEventListener('ended', () => {
      // Automatically play the next song when the current song ends
      playNextSong();
    });

    setCurrentSong(currentSong);
  }, [currentSongIndex]);

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
    setSpeedupIsEnabled(!speedupIsEnabled);
    handleSpeedChange(0.8);
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
      console.error(source.index, currentSongIndex);
      const wavBytes = createWavBytes(source);
      window.electron.ipcRenderer.sendMessage('SAVE_TEMP_SONG', wavBytes);
      return;
    }

    source.start(0);
    setSampleSong(source);
  };
  useEffect(() => {
    const handleTempSongSaved = (outputPath) => {
      console.log('Temporary song saved at:', outputPath);
      // playNextSong();
      // = createNewSong();

      //   stopSampleAudio();
      currentSong.src = outputPath;
      // // currentSong.load(); // Load the song's new data
      playAudio();
      //   currentSong.play();
      //   setIsPlaying(true);
    };

    window.electron.ipcRenderer.on('TEMP_SONG_SAVED', handleTempSongSaved);

    return () => {
      // Clean up the event listener when the component unmounts
      window.electron.ipcRenderer.removeListener(
        'TEMP_SONG_SAVED',
        handleTempSongSaved
      );
    };
  }, []);

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
    console.error(inputSong);
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
    console.error(numFrames, buffer);

    const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
    console.error(headerBytes);
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
        changeVolume,
        playPreviousSong,
        playNextSong,
        handleSpeedChange,
        toggleSpeedup,
        handleSongExport,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
