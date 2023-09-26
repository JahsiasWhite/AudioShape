import React, { useState } from 'react';
import './Queue.css';
import { useAudioPlayer } from '../../AudioContext';

const Queue = () => {
  const { visibleSongs, currentSongIndex, playlists, handleSongSelect } =
    useAudioPlayer();
  const [isVisible, setIsVisible] = useState(false);

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSongSelectQueue = (index) => {
    handleSongSelect(index + currentSongIndex);
  };

  return (
    <div className="queue">
      <h2 onClick={handleOpen}>QUEUE</h2>
      <div className={`queue-popup ${isVisible ? 'showing' : ''}`}>
        <div onClick={handleClose} className="close-menu">
          X
        </div>
        {isVisible && (
          <div className="queue-content">
            <h3>Queue</h3>
            {visibleSongs.slice(currentSongIndex).map((song, index) =>
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
                  onDoubleClick={() => handleSongSelectQueue(index)}
                >
                  {song.title}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
