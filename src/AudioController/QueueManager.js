import { useState } from 'react';

export const QueueManager = (currentSong, visibleSongs) => {
  const [currentSongId, setCurrentSongId] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);

  /* When a song is double-clicked, change the current song to that one! */
  const handleSongSelect = (songId) => {
    // setCurrentSongIndex(songIndex);
    setCurrentSongId(songId);

    // ! TODO: Don't love this
    const index = Object.keys(visibleSongs).findIndex(
      (key) => visibleSongs[key].id === songId
    );
    setCurrentSongIndex(index);
  };

  const playNextSong = () => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const nextIndex = (currentSongIndex + 1) % Object.keys(visibleSongs).length;
    setCurrentSongIndex(nextIndex);

    // ! TODO: More modular, and I don't really like this
    const songArray = Object.values(visibleSongs); // REALLY? I only need one, not the whole thing
    const nextSongId = songArray[nextIndex].id;
    setCurrentSongId(nextSongId);
  };

  const playPreviousSong = () => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const previousIndex =
      (currentSongIndex - 1 + Object.keys(visibleSongs).length) %
      Object.keys(visibleSongs).length;
    setCurrentSongIndex(previousIndex);

    const songArray = Object.values(visibleSongs);
    const nextSongId = songArray[previousIndex].id;
    setCurrentSongId(nextSongId);
  };

  const onSongEnded = () => {
    // If we are looping the song, restart the current song
    // ! Broken because this function gets created before isLooping is set
    // if (isLooping) {
    //   restartCurrentSong();
    //   return;
    // }

    // Automatically play the next song when the current song ends
    playNextSong();
  };

  /**
   * Resets the current song's effects to the default and restarts it
   */
  const resetCurrentSong = () => {
    // Reset the songs effects
    setCurrentEffectCombo('');

    // Change to the original file location
    currentSong.src = visibleSongs[currentSongId].file;

    // Start playing the song from the beginning
    restartCurrentSong();
  };

  const restartCurrentSong = () => {
    // currentSong.pause();
    currentSong.currentTime = 0;
    currentSong.play();
  };

  return {
    handleSongSelect,
    playNextSong,
    playPreviousSong,
    onSongEnded,
    resetCurrentSong,
    restartCurrentSong,
    currentSongId,
    currentSongIndex,
  };
};
