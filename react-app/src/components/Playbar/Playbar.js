import React, { useState, useEffect } from 'react';
import './playbar.css';

import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';
import VolumeControl from './VolumeControl/VolumeControl'; // ! I don't know if I like this name

function Playbar({ currentSongIndex, loadedSongs, setCurrentSongIndex }) {
  // ! Should currentSong actually be the index int?
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setcurrentSong] = useState(new Audio()); // Current playing audio object
  const [volume, setVolume] = useState(1); // Initial volume is 100%
  // const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Current song changed! Update our variables
  // Essentially create the new song :)
  useEffect(() => {
    // ? Can we do something here so if this is null, we never would even end up here
    if (currentSongIndex === null) return;

    const newSong = loadedSongs[currentSongIndex];

    currentSong.src = newSong.file;
    currentSong.volume = volume;
    currentSong.load(); // Load the new song's data
    currentSong.play();
    setIsPlaying(true);

    // audio.volume = volume;
    currentSong.addEventListener('ended', () => {
      // Automatically play the next song when the current song ends
      playNextSong();
    });
    setcurrentSong(currentSong);
  }, [currentSongIndex]);

  // ? Toggles the audio
  // Less ternary I guess? ... if we convert to func
  // useEffect(() => {
  //   if (isPlaying) {
  //     playAudio();
  //   } else {
  //     pauseAudio();
  //   }
  // }, [isPlaying]);

  const playAudio = () => {
    currentSong.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    currentSong.pause();
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    currentSong.volume = newVolume;
  };

  const playPreviousSong = () => {
    const previousIndex =
      (currentSongIndex - 1 + loadedSongs.length) % loadedSongs.length;
    setCurrentSongIndex(previousIndex);
  };

  const playNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % loadedSongs.length;
    setCurrentSongIndex(nextIndex);
    console.error('SETTING CUR SONG', currentSong, currentSong.title);
  };

  return (
    <div className="playbar">
      <audio
        preload="auto"
        src="E:\MUSIC\Lil Uzi Vert\AI Lil Uzi Vert - peace V1.mp3"
      ></audio>
      <div className="current-song">
        <span id="song-title">
          {loadedSongs[currentSongIndex]
            ? loadedSongs[currentSongIndex].title
            : 'No song playing'}
        </span>
        <span id="artist">
          {loadedSongs[currentSongIndex]
            ? loadedSongs[currentSongIndex].artist
            : ''}
        </span>
      </div>
      <div className="playbar-controls">
        <PreviousButton onClick={playPreviousSong} />
        <PlayButton
          onClick={isPlaying ? pauseAudio : playAudio}
          isPlaying={isPlaying}
        />
        <NextButton onClick={playNextSong} />
      </div>
      <VolumeControl onVolumeChange={handleVolumeChange} />
    </div>
  );
}

export default Playbar;
