import React, { useState, useEffect } from 'react';
import './playbar.css';

import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';
import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name
import PlaybackTimer from './PlaybackTimer/PlaybackTimer';
import Queue from './Queue/Queue';
import SavedEffects from './SavedEffects/SavedEffects';

import SlowDownButtonSVG from './SlowDownButtonSVG';
import SpeedupButtonSVG from './SpeedupButtonSVG';
import FullscreenSVG from './Fullscreen.svg';

import { useAudioPlayer } from '../../AudioController/AudioContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

function Playbar({ toggleFullscreen }) {
  const {
    visibleSongs,
    currentSongId,
    toggleSpeedup,
    speedupIsEnabled,
    toggleSlowDown,
    slowDownIsEnabled,

    loadingQueue,
    effects,
  } = useAudioPlayer();

  console.error('HI THERE: ', loadingQueue.length, Object.keys(effects).length);

  return (
    <div className="playbar">
      <div className="current-song">
        {/* TODO Clean this up? */}
        {visibleSongs[currentSongId] &&
          visibleSongs[currentSongId].albumImage && (
            <img
              className="playbar-image"
              src={visibleSongs[currentSongId].albumImage}
              alt={`${visibleSongs[currentSongId].album} cover`}
            />
          )}
        {loadingQueue.length > 0 ? (
          <>
            <LoadingSpinner />
            {-1 * (loadingQueue.length - Object.keys(effects).length) +
              '/' +
              Object.keys(effects).length +
              'effects'}
          </>
        ) : (
          <div className="song-details">
            <span id="song-title">
              {visibleSongs[currentSongId]
                ? visibleSongs[currentSongId].title
                : 'No song playing'}
            </span>
            <span id="artist">
              {visibleSongs[currentSongId]
                ? visibleSongs[currentSongId].artist
                : ''}
            </span>
          </div>
        )}
      </div>
      <div className="playbar-controls">
        <SavedEffects />
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
        <img
          className="fullscreen-button"
          src={FullscreenSVG}
          onClick={() => {
            toggleFullscreen();
          }}
        ></img>
        <VolumeControl />
      </div>
    </div>
  );
}

export default Playbar;
