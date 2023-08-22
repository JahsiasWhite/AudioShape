import React, { useState, useEffect } from 'react';
import './playbar.css';

import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';
import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name

function Playbar({ currentSong }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(new Audio());
  const [volume, setVolume] = useState(1); // Initial volume is 100%

  // Current song changed! Update our variables
  // Essentially create the new song :)
  useEffect(() => {
    // ? Can we do something here so if this is null, we never would even end up here
    if (currentSong === null) return;

    const audio = new Audio(currentSong.file);
    // audio.src = currentSong.file; // Assuming currentSong includes the file URL

    audio.volume = volume;
    audio.addEventListener('ended', () => {
      // Automatically play the next song when the current song ends
      // Call a function to play the next song here
    });
    setAudioElement(audio);
  }, [currentSong]);

  // Toggles the audio
  // Less ternary I guess? ... if we convert to func
  // useEffect(() => {
  //   if (isPlaying) {
  //     playAudio();
  //   } else {
  //     pauseAudio();
  //   }
  // }, [isPlaying]);

  // When a new song is selected, it will auto play :D
  useEffect(() => {
    playAudio();
  }, [audioElement]);

  const playAudio = () => {
    audioElement.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioElement.pause();
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    audioElement.volume = newVolume;
  };

  return (
    <div className="playbar">
      <audio
        preload="auto"
        src="E:\MUSIC\Lil Uzi Vert\AI Lil Uzi Vert - peace V1.mp3"
      ></audio>
      <div className="current-song">
        <span id="song-title">
          {currentSong ? currentSong.title : 'No song playing'}
        </span>
        <span id="artist">{currentSong ? currentSong.artist : ''}</span>
      </div>
      <div className="playbar-controls">
        <PreviousButton />
        <PlayButton
          onClick={isPlaying ? pauseAudio : playAudio}
          isPlaying={isPlaying}
        />
        <NextButton />
      </div>
      <VolumeControl onVolumeChange={handleVolumeChange} />
    </div>
  );
}

export default Playbar;
