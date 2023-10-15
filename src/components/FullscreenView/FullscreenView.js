import React, { useState, useEffect } from 'react';

import './FullscreenView.css';

import AudioSpectrum from '../AudioSpectrum/AudioSpectrum.js';
import FullscreenPlaybar from '../Playbar/FullscreenPlaybar.js';
import VideoPlayer from './VideoPlayer/VideoPlayer.js';

import { useAudioPlayer } from '../AudioContext';

const FullscreenView = ({ toggleFullscreen }) => {
  const { visibleSongs, currentSongId, currentSong } = useAudioPlayer(); // TODO: Do I have to import currentSong
  const song = visibleSongs[currentSongId];

  console.error(song, currentSong);

  // Need to know if the current song has a video or not
  const isMP4 = song && song.file.endsWith('.mp4');

  return (
    <div className="fullscreen-view">
      {!isMP4 ? (
        <>
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
        </>
      ) : (
        <div className="fullscreen-song-details">
          {/* <div>{song.title}</div> */}
        </div>
      )}

      {isMP4 ? (
        // If it's an MP4, show the video element
        // <video
        //   className="song-video"
        //   autoPlay
        //   controls={false}
        //   muted={true} // Mute the video
        //   ref={(videoRef) => {
        //     if (videoRef) {
        //       videoRef.currentTime = currentSong.currentTime; // Set the video's currentTime
        //     }
        //   }}
        // >
        //   <source src={song.file} type="video/mp4" />
        //   Your device doesn't support video streaming
        // </video>
        <VideoPlayer songFile={song.file} song={currentSong} />
      ) : (
        <AudioSpectrum song={currentSong} />
      )}

      <FullscreenPlaybar toggleFullscreen={toggleFullscreen} />
    </div>
  );
};

export default FullscreenView;
