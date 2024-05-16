import React, { useState, useEffect } from 'react';

import './FullscreenView.css';

import AudioSpectrum from '../AudioSpectrum/AudioSpectrum.js';
import FullscreenPlaybar from '../Playbar/FullscreenPlaybar.js';
import VideoPlayer from './VideoPlayer/VideoPlayer.js';

import { useAudioPlayer } from '../../AudioController/AudioContext';

const FullscreenView = ({ toggleFullscreen }) => {
  const { visibleSongs, currentSongId, currentSong } = useAudioPlayer(); // TODO: Do I have to import currentSong
  const song = visibleSongs[currentSongId];

  // TODO: Changing volume rerenders this component...
  console.error(song, currentSong);

  // Need to know if the current song has a video or not
  const isMP4 = song && song.file.endsWith('.mp4');

  return (
    <div className="fullscreen-view">
      {!isMP4 ? (
        <>
          {/* {song && song.albumImage && (
            // <img
            //   className="song-image"
            //   src={song.albumImage}
            //   alt={`${song.album} cover`}
            // />
          )} */}
          {song && (
            <div className="fullscreen-song-details">
              {song.albumImage && (
                <img
                  className="song-image"
                  src={song.albumImage}
                  alt={`${song.album} cover`}
                />
              )}

              <div style={{ marginLeft: '2%' }}>
                <div style={{ fontSize: '35px' }}>{song.title}</div>
                <div style={{ fontSize: '17px' }}>{song.artist}</div>
                <div style={{ fontSize: '17px' }}>{song.album}</div>{' '}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="fullscreen-song-details">
          {/* <div>{song.title}</div> */}
        </div>
      )}

      <div className="middle-content">
        {isMP4 ? (
          <VideoPlayer songFile={song.file} song={currentSong} />
        ) : (
          <AudioSpectrum song={currentSong} />
        )}
      </div>

      <FullscreenPlaybar toggleFullscreen={toggleFullscreen} />
    </div>
  );
};

export default FullscreenView;
