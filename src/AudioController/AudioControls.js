import React, { useState } from 'react';

export const AudioControls = (currentSong) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Initial volume is 100%
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
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);

    if (!isMuted) {
      changeVolume(0);
    } else {
      // TODO: set to previous value
      changeVolume(1);
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
