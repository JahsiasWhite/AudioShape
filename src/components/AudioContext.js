import React, { createContext, useState, useEffect, useContext } from 'react';

const AudioContext = createContext();

export const useAudioPlayer = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [loadedSongs, setLoadedSongs] = useState([]);
  const [visibleSongs, setVisibleSongs] = useState([]); //!!!! SET THIS EMPTY ARRAY JUST CHANGED FOR TESTING

  const [currentSong, setcurrentSong] = useState(new Audio()); // Current playing audio object
  const [currentSongIndex, setCurrentSongIndex] = useState(null); //  !!!!! TODO SET THIS TO NULL JUST CHANGED FOR TESTING

  const [volume, setVolume] = useState(1); // Initial volume is 100%
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    currentSong.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    currentSong.pause();
    setIsPlaying(false);
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    currentSong.volume = newVolume;
  };

  const playPreviousSong = () => {
    const previousIndex =
      (currentSongIndex - 1 + visibleSongs.length) % visibleSongs.length;
    setCurrentSongIndex(previousIndex);
  };

  const playNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % visibleSongs.length;
    setCurrentSongIndex(nextIndex);
  };

  // Current song changed! Update our variables
  // Essentially create the new song :)
  useEffect(() => {
    // ? Can we do something here so if this is null, we never would even end up here
    if (currentSongIndex === null) return;

    const newSong = visibleSongs[currentSongIndex];

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

  /* When the songs first load, we want all songs to be shown */
  const initialSongLoad = (songs) => {
    setLoadedSongs(songs);
    setVisibleSongs(songs);
  };

  /* When a song is double-clicked */
  const handleSongSelect = (songIndex) => {
    setCurrentSongIndex(songIndex);
  };

  return (
    <AudioContext.Provider
      value={{
        initialSongLoad,
        loadedSongs,
        visibleSongs,
        setVisibleSongs,
        currentSong,
        currentSongIndex,
        handleSongSelect,
        isPlaying,
        playAudio,
        pauseAudio,
        changeVolume,
        playPreviousSong,
        playNextSong,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
