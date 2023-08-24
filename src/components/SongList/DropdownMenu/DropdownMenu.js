// ! Rename this? This is really the DJ

import React from 'react';
import './DropdownMenu.css';

function DropdownMenu({ isOpen, song }) {
  let sampleAudio = null;

  // TODO: Clean this up! Its real bad
  const handleSpeedChange = async (newSpeed) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Load the current song's audio buffer
    const response = await fetch(song.file);
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

      console.error(audioBuffer.length, newBuffer.length, newSampleCount);
      for (let i = 0; i < newBuffer.length; i++) {
        const oldIndex = Math.floor(i / newSpeed);
        newData[i] = oldData[oldIndex] || 0;
      }
    }

    // ? Should I do the above on the server as well?
    // TODO ? Before sending should I allow a preview?

    // Stop the current sample song to get ready to play the new one
    if (sampleAudio) {
      sampleAudio.stop();
    }

    // Create a new audio source node with the modified buffer
    const source = audioContext.createBufferSource();
    source.buffer = newBuffer;
    source.connect(audioContext.destination); // Connect the node to the destination so we can hear the sound
    source.start(0);
    sampleAudio = source;

    /* All of this stuff is really annoying. Unfortunately, ipcRenderer can't take in audioBuffer objects so we have to break it down */
    // Float32Array samples
    const [left, right] = [
      newBuffer.getChannelData(0),
      newBuffer.getChannelData(1),
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
      numChannels: newBuffer.numberOfChannels,
      sampleRate: newBuffer.sampleRate,
    });
    window.electron.ipcRenderer.sendMessage('SAVE_SONG', wavBytes, song.file);
  };
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
  // returns Uint8Array of WAV header bytes
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
    <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
      <div
        onClick={() => {
          handleSpeedChange(0.8);
        }}
      >
        Speed up
      </div>
      <div
        onClick={() => {
          handleSpeedChange(1.2);
        }}
      >
        Slow and reverb
      </div>
      <div>Export</div>
    </div>
  );
}

export default DropdownMenu;
