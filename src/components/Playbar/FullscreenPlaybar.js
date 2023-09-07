import React, { useState, useEffect } from 'react';
import './FullscreenPlaybar.css';

import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';
import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name
import PlaybackTimer from './PlaybackTimer/PlaybackTimer';

import SlowDownButtonSVG from './SlowDownButtonSVG';
import SpeedupButtonSVG from './SpeedupButtonSVG';

import { useAudioPlayer } from '../AudioContext';

function FullscreenPlaybar({ toggleFullscreen }) {
  const { toggleSpeedup, speedupIsEnabled, toggleSlowDown, slowDownIsEnabled } =
    useAudioPlayer();

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
      {/* <div className="current-song">
         TODO Clean this up? 
        {visibleSongs[currentSongIndex] &&
          visibleSongs[currentSongIndex].albumImage && (
            <img
              className="playbar-image"
              src={visibleSongs[currentSongIndex].albumImage}
              alt={`${visibleSongs[currentSongIndex].album} cover`}
            />
          )}
        <div className="song-details">
          <span id="song-title">
            {visibleSongs[currentSongIndex]
              ? visibleSongs[currentSongIndex].title
              : 'No song playing'}
          </span>
          <span id="artist">
            {visibleSongs[currentSongIndex]
              ? visibleSongs[currentSongIndex].artist
              : ''}
          </span>
        </div>
      </div> */}

      <div className="playbar-controls">
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
      </div>
      <VolumeControl />
      <div
        className="fullscreen-button"
        onClick={() => {
          toggleFullscreen();
        }}
      >
        +
      </div>
    </div>
  );
}

export default FullscreenPlaybar;
