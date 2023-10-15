import React, { useState, useEffect } from 'react';

import { useAudioPlayer } from '../../AudioContext';

function PlaybackTimer() {
  const { currentSong, changeVideoTime } = useAudioPlayer();

  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    currentSong.addEventListener('timeupdate', updateTime);

    return () => {
      currentSong.removeEventListener('timeupdate', updateTime);
    };
  }, [currentSong]);

  const updateTime = () => {
    // TODO, this just refreshes the component, not really necessary to actually set anything??
    setCurrentTime(currentSong.currentTime);
  };

  const handleTimeChange = (event) => {
    const newTime = parseFloat(event.target.value);
    currentSong.currentTime = newTime;
    setCurrentTime(newTime);

    // If video is playing
    changeVideoTime(newTime);
  };

  // Helper function to format time (in seconds) as mm:ss
  function formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds)) timeInSeconds = 0;

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  return (
    <div className="playback-timer">
      {formatTime(currentTime)}
      <div className="playback-bar">
        <input
          type="range"
          min="0"
          max={currentSong.duration ? currentSong.duration : 0}
          value={currentTime}
          onChange={handleTimeChange}
          className="playback-bar"
        />
      </div>
      {formatTime(currentSong.duration)}
    </div>
  );
}

export default PlaybackTimer;
