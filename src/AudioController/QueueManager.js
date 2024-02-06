import { useState } from 'react';

export const QueueManager = (currentSong, visibleSongs) => {
  const [currentSongId, setCurrentSongId] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [songQueue, setQueue] = useState([]);

  // Once the queue is empty, the songs will play through whatever environment they are in, being the next songs
  const [nextSongs, setNextSongs] = useState([]);

  // Record of all songs that played
  const [history, setHistory] = useState([]);

  /* When a song is double-clicked, change the current song to that one! */
  const handleSongSelect = (songId) => {
    // ! TODO: Don't love this
    const index = Object.keys(visibleSongs).findIndex(
      (key) => visibleSongs[key].id === songId
    );

    setCurrentSongId(songId);
    setCurrentSongIndex(index);
    // setHistory((oldHistory) => [...oldHistory, songId]);

    const upNext = Object.keys(visibleSongs).slice(index + 1);
    setNextSongs(upNext);
  };

  const playNextSong = () => {
    if (currentSong) {
      console.error('HI');
      currentSong.removeEventListener('ended', onSongEnded);
    }

    setHistory((oldHistory) => [...oldHistory, currentSongId]);

    // If we're using the queue
    if (songQueue.length > 0) {
      const curSong = songQueue.shift();

      setQueue(songQueue);
      setCurrentSongId(curSong);
      // setHistory((oldHistory) => [...oldHistory, curSong]);

      // Else if we're not using the queue, and just playing the next song up in line
    } else {
      const nextIndex =
        (currentSongIndex + 1) % Object.keys(visibleSongs).length;
      setCurrentSongIndex(nextIndex);
      console.log('NEXT SONG IS : ', nextIndex, visibleSongs);

      // ! TODO: More modular, and I don't really like this
      const songArray = Object.values(visibleSongs); // REALLY? I only need one, not the whole thing
      const nextSongId = songArray[nextIndex].id;
      setCurrentSongId(nextSongId);
      // setHistory((oldHistory) => [...oldHistory, nextSongId]);

      const upNext = Object.keys(visibleSongs).slice(nextIndex + 1);
      setNextSongs(upNext);
    }
  };

  const playPreviousSong = () => {
    const previousId = history.pop();

    if (previousId === undefined) return;

    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    setCurrentSongIndex(Object.keys(visibleSongs).indexOf('' + previousId));
    setCurrentSongId(previousId);

    // const upNext = Object.keys(visibleSongs).slice(previousIndex + 1);
    // setNextSongs(upNext);
  };

  const onSongEnded = () => {
    // If we are looping the song, restart the current song
    // ! Broken because this function gets created before isLooping is set
    // if (isLooping) {
    //   restartCurrentSong();
    //   return;
    // }

    console.log('SONG ENDED', currentSong, currentSongId);
    // setHistory((oldHistory) => [...oldHistory, currentSongId]);
    // Automatically play the next song when the current song ends
    playNextSong();
  };

  const addToQueue = (songId) => {
    setQueue((prevQueue) => {
      console.error(prevQueue);

      return [...prevQueue, songId];
    });
    // songQueue.push(songId);
    console.error('Added to queue: ', songQueue);
  };

  const removeFromQueue = (index) => {
    setQueue((prevQueue) => prevQueue.filter((_, i) => i !== index));

    // if (index > -1) {
    //   // only splice array when item is found
    //   songQueue.splice(index, 1); // 2nd parameter means remove one item only
    // }
  };

  const popQueue = (cb) => {
    if (songQueue.length === 0) cb([]);

    console.log(songQueue);
    const newQueue = songQueue.slice(1);
    console.log('SETTING QUEUE: ', newQueue);
    setQueue(newQueue);
    // songQueue = newQueue;

    // Invoke the callback with the updated queue
    cb(newQueue);
  };

  // Rearranges the order of songs in the queue
  // Parameters:
  //   - startIndex: Original index of the song in the queue
  //   - endIndex: New index where the song should be moved to in the queue
  const rearrangeQueue = (startIndex, endIndex) => {
    const updatedQueue = [...songQueue];
    const [movedItem] = updatedQueue.splice(startIndex, 1);
    updatedQueue.splice(endIndex, 0, movedItem);
    setQueue(updatedQueue);
    // songQueue = updatedQueue;
  };

  const setCurrentSongInQueue = (songId) => {
    console.log(songQueue);
    popQueue((updatedQueue) => {
      console.log(updatedQueue);
      // Place new song to the start of the queue
      const newQueue = [songId, ...updatedQueue];
      setQueue(newQueue);
      // songQueue = newQueue;
      console.log('NEW songQueue value: ' + newQueue);
    }); // Remove current song from the list
    console.log(songQueue);
  };

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
  };
};
