// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';
import ContextMenu from './ContextMenu/ContextMenu';
import DropdownMenu from './DropdownMenu/DropdownMenu';

import DownArrowSVG from './down-arrow.svg';

function SongList({ onSongSelect, currentSongIndex, songs }) {
  // FULL LIST OF SONGS, TODO: Remove? TOO MUCH DATA?
  const [visibleSongs, setVisibleSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* For the audio editor drop down */
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    const { clientX, clientY } = event;
    setContextMenuPosition({ x: clientX, y: clientY });
    setIsContextMenuActive(true);
  };
  const hideContextMenu = () => {
    setIsContextMenuActive(false);
  };

  /* Toggles the dropdown menu */
  const [openIndex, setOpenIndex] = useState(null); // Index of the open dropdown
  const handleToggleDropdown = (index) => {
    if (openIndex === index) {
      setOpenIndex(null); // Close the dropdown if already open
    } else {
      setOpenIndex(index); // Open the dropdown
    }
  };

  /* Toggles showing the playlist menu */
  const handlePlaylistEdit = (index) => {
    console.error(index);
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
              <div className="song">
                <li
                  key={index} // TODO Fix this to be more appropriate/an actual unique key, when the page changes to artists for example, the indices are all messed up
                  onDoubleClick={() => {
                    onSongSelect(index);
                  }}
                  onClick={() => {
                    setIsContextMenuActive(false); // Hide the 'right-click' menu when we left-click
                  }}
                  onContextMenu={handleContextMenu} // Open context menu when we right-click
                  style={{ color: currentSongIndex === index ? 'green' : '' }}
                  className="list-item"
                >
                  {song.albumImage && (
                    <img
                      className="list-image"
                      src={song.albumImage}
                      alt={`${song.album} cover`}
                    />
                  )}
                  <div className="song-details">
                    <div>{song.title}</div>
                    <div>{song.artist}</div>
                    <div>{song.album}</div>
                    {/* <div>{song.duration}</div> */}
                  </div>
                  <div className="right-side">
                    <div
                      className="plus-sign"
                      onClick={() => handlePlaylistEdit(index)}
                    >
                      +
                    </div>
                    <img
                      className="dropdown-button"
                      src={DownArrowSVG}
                      onClick={() => handleToggleDropdown(index)}
                    ></img>
                  </div>
                  {/* {openIndex === index && <DropdownMenu isOpen={true} />} */}
                </li>
                {openIndex === index && (
                  <DropdownMenu isOpen={true} song={song} />
                )}
              </div>
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
