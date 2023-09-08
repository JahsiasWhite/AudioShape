import React, { useState, useEffect } from 'react';
import './playbar.css';

import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';
import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name
import PlaybackTimer from './PlaybackTimer/PlaybackTimer';
import Queue from './Queue/Queue';

import SlowDownButtonSVG from './SlowDownButtonSVG';
import SpeedupButtonSVG from './SpeedupButtonSVG';

import { useAudioPlayer } from '../AudioContext';

function Playbar({ toggleFullscreen }) {
  const {
    visibleSongs,
    currentSongIndex,
    toggleSpeedup,
    speedupIsEnabled,
    toggleSlowDown,
    slowDownIsEnabled,
  } = useAudioPlayer();

  return (
    <div className="playbar">
      <div className="current-song">
        {/* TODO Clean this up? */}
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
      </div>
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

      <div className="playbar-right-side">
        <Queue />
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
    </div>
  );
}

export default Playbar;
