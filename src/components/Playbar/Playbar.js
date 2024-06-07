import React, { useState, useEffect } from 'react';
import './playbar.css';

import CenterPlaybar from './CenterPlaybar';
import FullscreenSVG from './Fullscreen.svg';
import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name
import Queue from './Queue/Queue';

import { useAudioPlayer } from '../../AudioController/AudioContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import ShuffleButtonSVG from './ShuffleButtonSVG';

function Playbar({ toggleFullscreen }) {
  const {
    visibleSongs,
    currentSongId,
    toggleShuffle,
    shuffleIsEnabled,
    loadingQueue,
    effects,
  } = useAudioPlayer();

  console.error(
    'LoadingQueue.length: ',
    loadingQueue.length,
    'Object.keys(effects).length : ',
    Object.keys(effects).length
  );

  const shuffleHelper = () => {
    console.error(shuffleIsEnabled);
    toggleShuffle();
  };

  const scrollToCurrentSong = () => {
    document
      .getElementById(currentSongId)
      .scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
            <span id="song-title" onClick={scrollToCurrentSong}>
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

      <CenterPlaybar />

      <div className="playbar-right-side">
        <ShuffleButtonSVG
          shuffleIsEnabled={shuffleIsEnabled}
          onClick={() => {
            shuffleHelper();
          }}
        />
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
