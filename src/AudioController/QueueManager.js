import { useState, useCallback } from 'react';

export const QueueManager = (currentSong, visibleSongs, loadedSongs) => {
  const [currentSongId, setCurrentSongId] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [songQueue, setQueue] = useState([]);
  const [nextSongs, setNextSongs] = useState([]);
  const [history, setHistory] = useState([]);
  const [shuffleIsEnabled, setShuffleIsEnabled] = useState(false);

  // Make playNextSong a useCallback so we can reference it in onSongEnded
  const playNextSong = useCallback(() => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    if (loadedSongs.length === 0) {
      return;
    }

    setHistory((oldHistory) => [...oldHistory, currentSongId]);

    // Use functional updates to ensure we have the latest state
    setQueue((currentQueue) => {
      if (currentQueue.length > 0) {
        const [nextSong, ...remainingQueue] = currentQueue;
        setCurrentSongId(nextSong);
        return remainingQueue;
      } else {
        console.log('SETTING NEXT SONGS:');
        setNextSongs((currentNextSongs) => {
          let nextSongId = currentNextSongs[0];
          const remainingNextSongs = currentNextSongs.slice(1);

          if (nextSongId === undefined) {
            nextSongId = Object.keys(visibleSongs)[0];
            handleSongSelect(parseFloat(nextSongId));
            return remainingNextSongs;
          }

          setCurrentSongIndex(Object.keys(loadedSongs).indexOf(nextSongId)); // TODO: Not loadedSongs or visibleSongs but visibleSongs when the player selected play on a song
          setCurrentSongId(parseFloat(nextSongId));
          return remainingNextSongs;
        });
      }
      return currentQueue;
    });
  }, [currentSong, currentSongId, loadedSongs]);

  // Define onSongEnded using useCallback to maintain reference stability
  const onSongEnded = useCallback(() => {
    playNextSong();
  }, [playNextSong]);

  const handleSongSelect = useCallback(
    (songId) => {
      console.error('INSIDE');

      const index = Object.keys(visibleSongs).findIndex(
        (key) => visibleSongs[key].id === songId
      );

      setCurrentSongId(songId);
      setCurrentSongIndex(index);

      let upNext = Object.keys(visibleSongs);
      if (shuffleIsEnabled) {
        for (let i = upNext.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [upNext[i], upNext[j]] = [upNext[j], upNext[i]];
        }
      } else {
        upNext = upNext.slice(index + 1);
      }
      setNextSongs(upNext);
    },
    [visibleSongs, shuffleIsEnabled]
  );

  const playPreviousSong = useCallback(() => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    setHistory((currentHistory) => {
      const previousId = currentHistory[currentHistory.length - 1];

      // If we have a song in history, play that
      if (previousId !== undefined) {
        const newHistory = currentHistory.slice(0, -1);
        setNextSongs((current) => [currentSongId, ...current]);
        setCurrentSongIndex(Object.keys(visibleSongs).indexOf('' + previousId));
        setCurrentSongId(previousId);
        return newHistory;
      }

      // If no song in history, get the previous song from the song list
      const songKeys = Object.keys(visibleSongs);
      const currentIndex = songKeys.indexOf('' + currentSongId);

      // If we're not at the start of the list, play the previous song
      if (currentIndex > 0) {
        const previousSongId = songKeys[currentIndex - 1];
        // If the ID is numeric (even if stored as string), convert it, otherwise keep as string
        const processedId = !isNaN(previousSongId)
          ? parseFloat(previousSongId)
          : previousSongId;
        setNextSongs((current) => [currentSongId, ...current]);
        setCurrentSongIndex(currentIndex - 1);
        setCurrentSongId(processedId);
      }
      // If we're at the start, we could optionally wrap around to the end
      // else {
      //   const lastSongId = parseFloat(songKeys[songKeys.length - 1]);
      //   setNextSongs((current) => [currentSongId, ...current]);
      //   setCurrentSongIndex(songKeys.length - 1);
      //   setCurrentSongId(lastSongId);
      // }

      return currentHistory;
    });
  }, [currentSong, currentSongId, visibleSongs, onSongEnded]);

  const addToQueue = useCallback((songId) => {
    setQueue((currentQueue) => [...currentQueue, songId]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((currentQueue) => currentQueue.filter((_, i) => i !== index));
  }, []);

  const rearrangeQueue = useCallback((startIndex, endIndex) => {
    setQueue((currentQueue) => {
      const updatedQueue = [...currentQueue];
      const [movedItem] = updatedQueue.splice(startIndex, 1);
      updatedQueue.splice(endIndex, 0, movedItem);
      return updatedQueue;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleIsEnabled((current) => {
      if (current) {
        setNextSongs(Object.keys(visibleSongs).slice(currentSongIndex + 1));
        return false;
      }

      const upNext = Object.keys(visibleSongs).filter(
        (key) => parseFloat(key) !== currentSongId
      );
      for (let i = upNext.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [upNext[i], upNext[j]] = [upNext[j], upNext[i]];
      }
      setNextSongs(upNext);
      return true;
    });
  }, [visibleSongs, currentSongIndex, currentSongId]);

  return {
    handleSongSelect,
    playNextSong,
    playPreviousSong,
    onSongEnded,
    currentSongId,
    currentSongIndex,
    addToQueue,
    removeFromQueue,
    rearrangeQueue,
    songQueue,
    nextSongs,
    toggleShuffle,
    shuffleIsEnabled,
  };
};
