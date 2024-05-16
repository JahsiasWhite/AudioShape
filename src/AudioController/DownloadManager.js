import { useState } from 'react';

export const DownloadManager = (
  currentSong,
  finishLoading,
  initCurrentSong,
  getCurrentAudioBuffer
) => {
  /**
   * Saves the new temporary song from the server and sets it to the current song
   * @param {*} outputPath
   */
  const handleTempSongSaved = (outputPath, numEffects, effectThreshold) => {
    // This function gets called twice for some odd reason, need to just fix that, then I don't need this
    // if (currentSongIndex === null) return;
    // console.error('SAVED :  ', effects);

    /* Update the new file path */
    currentSong.src = outputPath;

    /* 
      If effectThreshold == 0, we are just changing one effect at a time and thus can play the new song immediately.
      If effectThreshold != 0, we are applying multiple effects at once (using an effect combo), so we only want to play the song when the last effect is added 
    */
    if (effectThreshold === 0 || effectThreshold === numEffects) {
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
    const audioBuffer = await getCurrentAudioBuffer(currentSong.src);

    const wavBytes = createWavBytes(audioBuffer);
    window.electron.ipcRenderer.sendMessage('SAVE_SONG', wavBytes);
    // downloadAudio(audioBuffer);
  }

  async function downloadAudio(audioBuffer) {
    const wavBytes = createWavBytes(audioBuffer);
    window.electron.ipcRenderer.sendMessage('SAVE_TEMP_SONG', wavBytes);
    // getTempSong();
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

  return {
    handleSongExport,
    handleTempSongSaved,
    downloadAudio,
  };
};
