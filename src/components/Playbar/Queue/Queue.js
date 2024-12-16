import React, { useState, useEffect } from 'react';
import './Queue.css';
import { useAudioPlayer } from '../../../AudioController/AudioContext';

import QueueSVG from './queue.svg';

const Queue = () => {
  const {
    loadedSongs,
    visibleSongs,
    currentSongId,
    currentSongIndex,
    handleSongSelect,
    songQueue,
    nextSongs,
  } = useAudioPlayer();
  const [isVisible, setIsVisible] = useState(false);

  const toggleShowing = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSongSelectQueue = (id) => {
    handleSongSelect(id);
  };

  return (
    <div className="queue">
      <img
        className="queue-button"
        src={QueueSVG}
        onClick={toggleShowing}
      ></img>
      {isVisible && (
        <div className="popup-container">
          <div onClick={handleClose} className="close-menu">
            X
          </div>
          <div className="test-queue">
            <div>
              <h3>Current Song</h3>
              {currentSongId && (
                <div
                  key={songQueue[0]}
                  className={`queue-item current-song-queue
                `}
                >
                  {loadedSongs[currentSongId].title}
                </div>
              )}
            </div>
            <h3>Queue</h3>
            {songQueue.length > 0 &&
              songQueue.map((id, index) => (
                <div
                  key={id}
                  className="queue-item"
                  onDoubleClick={() => handleSongSelectQueue(id)}
                >
                  {loadedSongs[id].title}
                </div>
              ))}
          </div>
          <div className="secondary-queue">
            <h3>Next</h3>
            {nextSongs &&
              nextSongs.map((id, index) => (
                <div
                  key={id}
                  className="queue-item"
                  onDoubleClick={() => handleSongSelectQueue(parseFloat(id))}
                >
                  {loadedSongs[id].title}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Queue;
