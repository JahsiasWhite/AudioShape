import { useState } from 'react';

export const Tools = (fileLocation) => {
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
    console.error(
      'FETCHING WITH : ',
      fileLocation + '    SHOULD BE AFTER LOCATIONOUTPUT'
    );
    const response = await fetch(fileLocation);
    const audioData = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    console.error('IN ASYNC');

    return audioBuffer;
  };

  return {
    getCurrentAudioBuffer,
  };
};
