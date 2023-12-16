import { useState } from 'react';

export const QueueManager = (currentSong, visibleSongs) => {
  const [currentSongId, setCurrentSongId] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [songQueue, setQueue] = useState([]);
  // let songQueue = [];

  /* When a song is double-clicked, change the current song to that one! */
  const handleSongSelect = (songId) => {
    // setCurrentSongIndex(songIndex);
    setCurrentSongId(songId);

    // ! TODO: Don't love this
    const index = Object.keys(visibleSongs).findIndex(
      (key) => visibleSongs[key].id === songId
    );

    console.error(
      'SETTING SONG TO INDEX: ' +
        index +
        '   ' +
        visibleSongs[Object.keys(visibleSongs)[index]].title
    );

    setCurrentSongIndex(index);

    // Fix queue
    setCurrentSongInQueue(songId); // Add the clicked song to the top of the list
  };

  const playNextSong = () => {
    if (currentSong) {
      currentSong.removeEventListener('ended', onSongEnded);
    }

    // Remove the current song from the queue
    popQueue();

    const nextIndex = (currentSongIndex + 1) % Object.keys(visibleSongs).length;
    setCurrentSongIndex(nextIndex);

    // ! TODO: More modular, and I don't really like this
    const songArray = Object.values(visibleSongs); // REALLY? I only need one, not the whole thing
    const nextSongId = songArray[nextIndex].id;
    // setCurrentSongId(nextSongId);
    if (songQueue.length > 0) {
      // If there are songs in the queue, play the next song in the queue
      const [nextQueueSongId, ...restQueue] = songQueue;
      setQueue(restQueue);
      // songQueue = restQueue;
      setCurrentSongId(nextQueueSongId);
    } else {
      // If the queue is empty, play the next song in the visibleSongs list
      setCurrentSongId(nextSongId);
    }
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

    console.error('SONG ENDED', currentSong, currentSongId);
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

  const popQueue = () => {
    if (songQueue.length === 0) return;

    console.error(songQueue);
    const newQueue = songQueue.slice(1);
    console.error('SETTING QUEUE: ', newQueue);
    setQueue(newQueue);
    // songQueue = newQueue;
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
    popQueue(); // Remove current song from the list

    // Place new song to the start of the queue
    const newQueue = [songId, ...songQueue];
    setQueue(newQueue);
    // songQueue = newQueue;
    console.error('NEW songQueue value: ' + songQueue);
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
  };
};
