import { useState, useCallback, useEffect, useRef } from 'react';

// If the current song has played for more than this many seconds,
// going to the previous song will restart this song instead of going to the previous song
const TOTAL_SECONDS_TO_RESTART = 3;

/** Resolve index in ordered keys for a song id, storage key, or id string. */
function findKeyIndexForSongId(songKeys, visibleSongs, songId) {
  return songKeys.findIndex((key) => {
    const row = visibleSongs[key];
    if (!row) return false;
    if (key === songId || String(key) === String(songId)) return true;
    const rid = row.id;
    if (rid == null) return false;
    return rid === songId || String(rid) === String(songId);
  });
}

export const QueueManager = (currentSong, visibleSongs, loadedSongs) => {
  const [currentSongId, setCurrentSongId] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [songQueue, setQueue] = useState([]);
  const [nextSongs, setNextSongs] = useState([]);
  const [history, setHistory] = useState([]);
  // playMode cycles: 'normal' → 'shuffle' → 'loop' → 'normal'
  const [playMode, setPlayMode] = useState('normal');
  const shuffleIsEnabled = playMode === 'shuffle';
  const loopIsEnabled = playMode === 'loop';

  /** Display / playback order from the song list (sort + search). Falls back to Object.keys(visibleSongs). */
  const playbackOrderKeysRef = useRef(null);

  const getPlaybackKeys = useCallback(() => {
    const custom = playbackOrderKeysRef.current;
    if (custom && custom.length > 0) {
      return custom.filter((k) => visibleSongs != null && visibleSongs[k] != null);
    }
    return Object.keys(visibleSongs || {});
  }, [visibleSongs]);

  const getLibraryKeys = useCallback(() => {
    const keys = Object.keys(loadedSongs || {});
    return keys.length > 0 ? keys : Object.keys(visibleSongs || {});
  }, [loadedSongs, visibleSongs]);

  const syncPlaybackOrder = useCallback(
    (orderedKeys) => {
      if (!orderedKeys || orderedKeys.length === 0) {
        return;
      }
      playbackOrderKeysRef.current = orderedKeys;
      setNextSongs(() => {
        if (shuffleIsEnabled) {
          const upNext = orderedKeys.filter((key) => {
            const row = visibleSongs[key];
            const id = row?.id != null ? row.id : key;
            return id !== currentSongId && String(id) !== String(currentSongId);
          });
          for (let i = upNext.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [upNext[i], upNext[j]] = [upNext[j], upNext[i]];
          }
          return upNext;
        }

        if (currentSongId == null) {
          return orderedKeys;
        }
        const idx = findKeyIndexForSongId(
          orderedKeys,
          visibleSongs,
          currentSongId,
        );
        if (idx === -1) {
          return orderedKeys.filter((key) => {
            const row = visibleSongs[key];
            const id = row?.id != null ? row.id : key;
            return id !== currentSongId && String(id) !== String(currentSongId);
          });
        }
        return orderedKeys.slice(idx + 1);
      });
    },
    [shuffleIsEnabled, currentSongId, visibleSongs],
  );

  // Populate nextSongs when songs first load (so the queue tab isn't empty)
  useEffect(() => {
    if (
      visibleSongs &&
      Object.keys(visibleSongs).length > 0 &&
      currentSongId === null
    ) {
      const custom = playbackOrderKeysRef.current;
      const keys =
        custom && custom.length > 0
          ? custom.filter((k) => visibleSongs[k])
          : Object.keys(visibleSongs);
      setNextSongs(keys);
    }
  }, [visibleSongs, currentSongId]);

  const handleSongSelect = useCallback(
    (songId) => {
      const songKeys = getPlaybackKeys();

      const index = findKeyIndexForSongId(songKeys, visibleSongs, songId);

      setCurrentSongId(songId);
      setCurrentSongIndex(index);

      let upNext = [...songKeys];
      if (shuffleIsEnabled) {
        for (let i = upNext.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [upNext[i], upNext[j]] = [upNext[j], upNext[i]];
        }
      } else {
        upNext = songKeys.slice(index + 1);
      }
      setNextSongs(upNext);
    },
    [visibleSongs, shuffleIsEnabled, getPlaybackKeys],
  );

  // Make playNextSong a useCallback so we can reference it in onSongEnded
  const playNextSong = useCallback(() => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    if (!loadedSongs || Object.keys(loadedSongs).length === 0) {
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
        setNextSongs((currentNextSongs) => {
          let nextSongId = currentNextSongs[0];
          const remainingNextSongs = currentNextSongs.slice(1);

          if (nextSongId === undefined) {
            const firstKey = getLibraryKeys()[0];
            const firstMeta = firstKey != null ? visibleSongs[firstKey] : null;
            handleSongSelect(firstMeta != null ? firstMeta.id : firstKey);
            return remainingNextSongs;
          }

          const order = getPlaybackKeys();
          setCurrentSongIndex(order.indexOf(nextSongId));
          const nextMeta = visibleSongs[nextSongId];
          setCurrentSongId(nextMeta != null ? nextMeta.id : nextSongId);
          return remainingNextSongs;
        });
      }
      return currentQueue;
    });
  }, [
    currentSong,
    currentSongId,
    loadedSongs,
    visibleSongs,
    getPlaybackKeys,
    getLibraryKeys,
    handleSongSelect,
  ]);

  // Define onSongEnded using useCallback to maintain reference stability
  const onSongEnded = useCallback(() => {
    playNextSong();
  }, [playNextSong]);

  const playPreviousSong = useCallback(() => {
    // Should just restart the current song if it has been playing for more than a few seconds
    if (currentSong && currentSong.currentTime > TOTAL_SECONDS_TO_RESTART) {
      currentSong.currentTime = 0;
      currentSong.play();
      return;
    }

    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    setHistory((currentHistory) => {
      const previousId = currentHistory[currentHistory.length - 1];

      const songKeys = getPlaybackKeys();

      // If we have a song in history, play that
      if (previousId !== undefined) {
        const newHistory = currentHistory.slice(0, -1);
        setNextSongs((current) => [currentSongId, ...current]);
        const prevIdx = findKeyIndexForSongId(
          songKeys,
          visibleSongs,
          previousId,
        );
        setCurrentSongIndex(prevIdx >= 0 ? prevIdx : null);
        setCurrentSongId(previousId);
        return newHistory;
      }

      // If no song in history, get the previous song from the song list
      const currentIndex = findKeyIndexForSongId(
        songKeys,
        visibleSongs,
        currentSongId,
      );

      // If we're not at the start of the list, play the previous song
      if (currentIndex > 0) {
        const previousKey = songKeys[currentIndex - 1];
        const prevSong = visibleSongs[previousKey];
        setNextSongs((current) => [currentSongId, ...current]);
        setCurrentSongIndex(currentIndex - 1);
        setCurrentSongId(prevSong != null ? prevSong.id : previousKey);
      }

      return currentHistory;
    });
  }, [currentSong, currentSongId, visibleSongs, onSongEnded, getPlaybackKeys]);

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

  // Cycles: normal → shuffle → loop → normal
  const toggleShuffle = useCallback(() => {
    setPlayMode((current) => {
      if (current === 'normal') {
        const keys = getPlaybackKeys();
        const upNext = keys.filter((key) => {
          const row = visibleSongs[key];
          const id = row?.id != null ? row.id : key;
          return id !== currentSongId && String(id) !== String(currentSongId);
        });
        for (let i = upNext.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [upNext[i], upNext[j]] = [upNext[j], upNext[i]];
        }
        setNextSongs(upNext);
        currentSong.loop = false;
        return 'shuffle';
      }

      if (current === 'shuffle') {
        const songKeys = getPlaybackKeys();
        const idx = currentSongIndex ?? -1;
        setNextSongs(songKeys.slice(idx + 1));
        currentSong.loop = true;
        return 'loop';
      }

      currentSong.loop = false;
      const songKeys = getPlaybackKeys();
      const idx = currentSongIndex ?? -1;
      setNextSongs(songKeys.slice(idx + 1));
      return 'normal';
    });
  }, [currentSong, visibleSongs, currentSongIndex, currentSongId, getPlaybackKeys]);

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
    loopIsEnabled,
    syncPlaybackOrder,
  };
};
