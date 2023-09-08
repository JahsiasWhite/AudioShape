import React, { useState } from 'react';
import './Queue.css';
import { useAudioPlayer } from '../../AudioContext';

const Queue = () => {
  const { visibleSongs, currentSongIndex, playlists } = useAudioPlayer();
  const [isVisible, setIsVisible] = useState(false);

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="queue">
      <h2 onClick={handleOpen}>QUEUE</h2>
      <div className={`queue-popup ${isVisible ? 'showing' : ''}`}>
        <div onClick={handleClose}>Close</div>
        {/* Add your queue content here */}
        {isVisible && (
          <div className="queue-content">
            <h3>Queue Content</h3>
            {/* Render your queue items here, starting from currentSongIndex */}
            {visibleSongs.slice(currentSongIndex).map((song, index) => (
              <div key={index}>
                {index === 0 ? 'Current Song: ' + song.title : song.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
