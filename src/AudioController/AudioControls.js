import React, { useState } from 'react';

var prevVolume = 1;
export const AudioControls = (currentSong) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Initial volume is 100%
  // const [prevVolume, setPrevVolume] = useState(1); // Keeps track of the volume. So when muting, it will go back to its original state. TODO: Instead of this, can I just grab from the file?
  const [isMuted, setIsMuted] = useState(false);

  const playAudio = () => {
    // Duration is probably not the best way to check but it's easy
    console.log(currentSong);
    const songLoaded = !isNaN(currentSong.duration);
    if (!songLoaded) return;

    currentSong.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    currentSong.pause();
    setIsPlaying(false);
  };

  const changeVolume = (newVolume) => {
    currentSong.volume = newVolume;
    setVolume(newVolume);

    if (newVolume !== 0) prevVolume = newVolume;
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);

    if (!isMuted) {
      changeVolume(0);
    } else {
      console.error('PREVVOLUME: ', prevVolume);
      // TODO: set to previous value
      changeVolume(prevVolume);
    }
  };

  return {
    playAudio,
    pauseAudio,
    changeVolume,
    toggleMute,
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
  };
};
