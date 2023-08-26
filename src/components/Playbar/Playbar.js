import React, { useState, useEffect } from 'react';
import './playbar.css';

import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';
import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name
import PlaybackTimer from './PlaybackTimer/PlaybackTimer';
import speedupButtonSVG from './speedup-button.svg';

import { useAudioPlayer } from '../AudioContext';

function Playbar() {
  const { visibleSongs, currentSongIndex } = useAudioPlayer();

  // ! Should currentSong actually be the index int?
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [currentSong, setcurrentSong] = useState(new Audio()); // Current playing audio object
  // const [volume, setVolume] = useState(1); // Initial volume is 100%

  // // Current song changed! Update our variables
  // // Essentially create the new song :)
  // useEffect(() => {
  //   // ? Can we do something here so if this is null, we never would even end up here
  //   if (currentSongIndex === null) return;

  //   const newSong = visibleSongs[currentSongIndex];

  //   currentSong.src = newSong.file;
  //   currentSong.volume = volume;
  //   currentSong.load(); // Load the new song's data
  //   currentSong.play();
  //   setIsPlaying(true);

  //   // audio.volume = volume;
  //   currentSong.addEventListener('ended', () => {
  //     // Automatically play the next song when the current song ends
  //     playNextSong();
  //   });

  //   setcurrentSong(currentSong);
  // }, [currentSongIndex]);

  // ? Toggles the audio
  // Less ternary I guess? ... if we convert to func
  // useEffect(() => {
  //   if (isPlaying) {
  //     playAudio();
  //   } else {
  //     pauseAudio();
  //   }
  // }, [isPlaying]);

  // const playAudio = () => {
  //   currentSong.play();
  //   setIsPlaying(true);
  // };

  // const pauseAudio = () => {
  //   currentSong.pause();
  //   setIsPlaying(false);
  // };

  // const handleVolumeChange = (newVolume) => {
  //   setVolume(newVolume);
  //   currentSong.volume = newVolume;
  // };

  // const playPreviousSong = () => {
  //   const previousIndex =
  //     (currentSongIndex - 1 + visibleSongs.length) % visibleSongs.length;
  //   setCurrentSongIndex(previousIndex);
  // };

  // const playNextSong = () => {
  //   const nextIndex = (currentSongIndex + 1) % visibleSongs.length;
  //   setCurrentSongIndex(nextIndex);
  // };

  return (
    <div className="playbar">
      {/* <audio
        preload="auto"
        src="E:\MUSIC\Lil Uzi Vert\AI Lil Uzi Vert - peace V1.mp3"
      ></audio> */}
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
          <PreviousButton />
          <PlayButton />
          <NextButton />
          <img className="speedup-button" src={speedupButtonSVG}></img>
        </div>
        <PlaybackTimer />
      </div>
      <VolumeControl />
    </div>
  );
}

export default Playbar;
