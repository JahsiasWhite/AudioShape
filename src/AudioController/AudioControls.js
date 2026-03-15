import React, { useState, useEffect } from 'react';

var prevVolume = 1;
export const AudioControls = (currentSong) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Load saved volume from settings on startup
  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('RETURN_VOLUME', (savedVolume) => {
      const vol = savedVolume / 100;
      currentSong.volume = vol;
      setVolume(vol);
      prevVolume = vol;
      removeListener?.();
    });
    window.electron.ipcRenderer.sendMessage('GET_VOLUME');
    return () => removeListener?.();
  }, []);

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

    if (newVolume !== 0) {
      prevVolume = newVolume;
      window.electron.ipcRenderer.sendMessage('SAVE_SETTINGS', { volume: Math.round(newVolume * 100) });
    }
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
