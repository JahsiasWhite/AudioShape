// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';
import ContextMenu from './ContextMenu/ContextMenu';

function SongList({ onSongSelect, currentSongIndex, songs }) {
  // FULL LIST OF SONGS, TODO: Remove? TOO MUCH DATA?
  const [visibleSongs, setVisibleSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Once songs are loaded in, we know we are done loading
   */
  useEffect(() => {
    //  ! Only change loading state if there are visible songs
    if (isLoading && visibleSongs.length > 0) {
      setIsLoading(false);
    }
  }, [visibleSongs]);

  /**
   * Takes in all the songs we are supposed to see and updates the view
   */
  useEffect(() => {
    // If songs is the same as visible songs, dont do anything?
    setVisibleSongs(songs);
  }, [songs]);

  /**
   * Stuff to handle right clicks... this should be in its own component
   * TODO: This should not be in SongList either because we will prob want to right click other
   * stuff in the future
   */
  const [isContextMenuActive, setIsContextMenuActive] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const handleContextMenu = (event) => {
    // Handle the context menu here, e.g., show/hide the menu
    event.preventDefault();
    console.error('Right-clicked!', event.clientX, event.clientY);
    const { clientX, clientY } = event;
    setContextMenuPosition({ x: clientX, y: clientY });
    setIsContextMenuActive(true);
  };
  const hideContextMenu = () => {
    setIsContextMenuActive(false);
  };

  return (
    <div className="song-list-container">
      {isLoading ? (
        <p>Loading...</p>
      ) : visibleSongs.length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <FolderSelection />
        </div>
      ) : (
        <div>
          <ul className="song-list">
            {visibleSongs.map((song, index) => (
              <li
                key={index}
                onClick={() => {
                  onSongSelect(index);
                  setIsContextMenuActive(false);
                }}
                onContextMenu={handleContextMenu} // Handle right-clicks
                style={{ color: currentSongIndex === index ? 'green' : '' }}
              >
                <div>{song.title}</div>
                <div>{song.artist}</div>
                <div>{song.album}</div>
                <div>{song.duration}</div>
              </li>
            ))}
          </ul>
          {isContextMenuActive && (
            <ContextMenu
              onContextMenu={hideContextMenu} // Prob dont need, just hides the menu if you right click it
              style={{
                top: contextMenuPosition.y,
                left: contextMenuPosition.x,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SongList;
