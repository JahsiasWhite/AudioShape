import React, { useState, useEffect } from 'react';
import './FullscreenPlaybar.css';

import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name
import CenterPlaybar from './CenterPlaybar';

import { useAudioPlayer } from '../../AudioController/AudioContext';

function FullscreenPlaybar({ toggleFullscreen }) {
  const { currentSongId } = useAudioPlayer();

  const [playbarVisible, setPlaybarVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);

  // Function to hide the playbar after 1 second
  const hidePlaybar = () => {
    clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      setPlaybarVisible(false);
    }, 1000);
    setTimeoutId(newTimeoutId);
  };

  // Function to show the playbar
  const showPlaybar = () => {
    clearTimeout(timeoutId);
    setPlaybarVisible(true);
  };

  const exitFullscreen = () => {
    toggleFullscreen();

    // Scrolls to the current song // TODO: I dont like this here. SHould probably make all of these a function as well
    setTimeout(() => {
      const songDiv = document.getElementById(currentSongId);
      if (songDiv)
        songDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Add mousemove event listener to detect mouse position
  useEffect(() => {
    const handleMouseMove = (event) => {
      const mouseY = event.clientY;

      // Show playbar if mouse is near the bottom of the screen
      if (mouseY >= window.innerHeight - window.innerHeight * 0.15) {
        showPlaybar();
      } else {
        hidePlaybar();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [timeoutId]);

  return (
    <div
      className={`fullscreen-playbar ${
        playbarVisible ? 'fullscreen-playbar-show' : ''
      }`}
    >
      {/* <div className="playbar-controls">
        <div className="buttons-container">
          <SlowDownButtonSVG
            slowDownIsEnabled={slowDownIsEnabled}
            onClick={() => {
              toggleSlowDown();
            }}
          ></SlowDownButtonSVG>
          <PreviousButton />
          <PlayButton />
          <NextButton />
          <SpeedupButtonSVG
            speedupIsEnabled={speedupIsEnabled}
            onClick={() => {
              toggleSpeedup();
            }}
          ></SpeedupButtonSVG>
        </div>
        <PlaybackTimer />
      </div> */}
      <CenterPlaybar />

      <VolumeControl />
      <div
        className="fullscreen-button"
        onClick={() => {
          exitFullscreen();
        }}
      >
        +
      </div>
    </div>
  );
}

export default FullscreenPlaybar;
