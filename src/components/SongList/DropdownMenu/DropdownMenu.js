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

    window.electron.ipcRenderer.sendMessage('SAVE_SONG', newSpeed, song.file);
  };

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
