import React, { useState, useEffect } from 'react';
import './Queue.css';
import { useAudioPlayer } from '../../../AudioController/AudioContext';

import QueueSVG from './queue.svg';

const Queue = () => {
  const { visibleSongs, currentSongIndex, handleSongSelect, songQueue } =
    useAudioPlayer();
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

  useEffect(() => {
    console.error('SONG QUEUE CHANGED : ', songQueue);
  }, [songQueue]);

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
            <h3>Queue</h3>
            {songQueue.length > 0 &&
              songQueue.map((id, index) =>
                index === 0 ? (
                  <div
                    key={id}
                    className={`queue-item current-song-queue
                }`}
                  >
                    {'Current Song: ' + visibleSongs[id].title}
                  </div>
                ) : (
                  <div
                    key={id}
                    className="queue-item"
                    onDoubleClick={() => handleSongSelectQueue(id)}
                  >
                    {visibleSongs[id].title}
                  </div>
                )
              )}
          </div>
          <div className="secondary-queue">
            <h3>Next</h3>
            {visibleSongs &&
              Object.keys(visibleSongs)
                .slice(currentSongIndex + 1)
                .map((id, index) => (
                  <div
                    key={id}
                    className="queue-item"
                    onDoubleClick={() => handleSongSelectQueue(parseFloat(id))}
                  >
                    {visibleSongs[id].title}
                  </div>
                ))}
          </div>
          {/* {isVisible && (
            <div className="queue-content">
              <h3>Queue</h3>
              {Object.values(visibleSongs).map((song, index) =>
                index === 0 ? (
                  <div
                    key={index}
                    className={`queue-item current-song-queue
                  }`}
                  >
                    {'Current Song: ' + song.title}
                  </div>
                ) : (
                  <div
                    key={index}
                    className="queue-item"
                    onDoubleClick={() => handleSongSelectQueue(song.id)}
                  >
                    {song.title}
                  </div>
                )
              )}
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default Queue;
