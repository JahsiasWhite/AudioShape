import React, { useState, useEffect } from 'react';

import './FullscreenView.css';

import AudioSpectrum from '../AudioSpectrum/AudioSpectrum.js';
import Playbar from '../Playbar/Playbar.js';
import FullscreenPlaybar from '../Playbar/FullscreenPlaybar.js';

import { useAudioPlayer } from '../AudioContext';

const FullscreenView = ({ toggleFullscreen }) => {
  const { visibleSongs, currentSongIndex, currentSong } = useAudioPlayer();
  const song = visibleSongs[currentSongIndex];

  return (
    <div className="fullscreen-view">
      {song && song.albumImage && (
        <img
          className="song-image"
          src={song.albumImage}
          alt={`${song.album} cover`}
        />
      )}
      {song && (
        <div className="fullscreen-song-details">
          <div>{song.title}</div>
          <div>{song.artist}</div>
          <div>{song.album}</div>{' '}
        </div>
      )}
      <AudioSpectrum song={currentSong} />

      {/* <div
        className={`playbar-container ${
          playbarVisible ? 'playbar-container.show' : ''
        }`}
      >
        {' '} */}
      <FullscreenPlaybar toggleFullscreen={toggleFullscreen} />
      {/* <Playbar toggleFullscreen={toggleFullscreen} /> */}
      {/* </div> */}
    </div>
  );
};

export default FullscreenView;
