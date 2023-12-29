// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';
import ContextMenu from './ContextMenu/ContextMenu';
import PlaylistMenu from '../PlaylistMenu/PlaylistMenu';

import DownArrowSVG from './down-arrow.svg';
import PlusButtonSVG from './add-svgrepo-com.svg';

import { useAudioPlayer } from '../../AudioController/AudioContext';

function SongList({ handleSongEdit, toggleSection }) {
  const {
    handleSongSelect,
    visibleSongs,
    currentSongId,
    currentScreen,
    setCurrentScreen,
  } = useAudioPlayer();

  const [isLoading, setIsLoading] = useState(true);

  function handleSongEditClick(id) {
    handleSongEdit(id);
    setCurrentScreen('mixer');
  }

  /**
   * Once songs are loaded in, we know we are done loading
   */
  useEffect(() => {
    if (Object.keys(visibleSongs).length > 0) {
      setIsLoading(false);
    }
  }, [visibleSongs]);

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
  const [contextMenuSongData, setContextMenuSongData] = useState(null);

  const handleContextMenu = (event, songData) => {
    // Handle the context menu here, e.g., show/hide the menu
    event.preventDefault();
    const { clientX, clientY } = event;
    setContextMenuPosition({ x: clientX, y: clientY });
    setContextMenuSongData(songData);
    setIsContextMenuActive(true);
  };
  const hideContextMenu = () => {
    setIsContextMenuActive(false);
  };

  const [playlistMenuIndex, setPlaylistMenuOpen] = useState(-1);
  /* Toggles showing the playlist menu */
  const handlePlaylistEdit = (index) => {
    // Open or close the playlist menu
    setPlaylistMenuOpen(index);
  };
  const closePlaylistMenu = () => {
    // Close the playlist menu
    setPlaylistMenuOpen(-1);
  };

  return (
    <div className="song-list-container">
      <div className="song-list-header">{currentScreen}</div>
      {isLoading ? (
        <p>Loading...</p>
      ) : visibleSongs.length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <FolderSelection />
        </div>
      ) : (
        <div>
          <div className="num-songs">
            {Object.keys(visibleSongs).length} songs
          </div>
          <ul className="song-list">
            {Object.keys(visibleSongs).map((key) => (
              <div className="song" key={key}>
                <li
                  key={key} // TODO Fix this to be more appropriate/an actual unique key, when the page changes to artists for example, the indices are all messed up
                  onDoubleClick={() => {
                    handleSongSelect(visibleSongs[key].id);
                  }}
                  onClick={() => {
                    setIsContextMenuActive(false); // Hide the 'right-click' menu when we left-click
                  }}
                  onContextMenu={
                    (event) => handleContextMenu(event, visibleSongs[key]) // Pass the song data when right-clicking
                  }
                  className={`list-item ${
                    currentSongId === visibleSongs[key].id ? 'highlighted' : ''
                  }`}
                >
                  {visibleSongs[key].albumImage && (
                    <img
                      className="list-image"
                      src={visibleSongs[key].albumImage}
                      alt={`${visibleSongs[key].album} cover`}
                    />
                  )}
                  <div className="song-details">
                    <div
                      className={`song-title ${
                        currentSongId === visibleSongs[key].id
                          ? ''
                          : 'header-color'
                      }`}
                    >
                      {visibleSongs[key].title}
                    </div>
                    <div>{visibleSongs[key].artist}</div>
                    <div>{visibleSongs[key].album}</div>
                  </div>
                  <div className="right-side">
                    <img
                      className="plus-sign"
                      src={PlusButtonSVG}
                      onClick={() => handlePlaylistEdit(visibleSongs[key].id)}
                    ></img>
                    <img
                      className="dropdown-button"
                      src={DownArrowSVG}
                      onClick={() => handleSongEditClick(visibleSongs[key].id)}
                    ></img>
                  </div>
                </li>
              </div>
            ))}
          </ul>
          {isContextMenuActive && contextMenuSongData && (
            <ContextMenu
              onContextMenu={hideContextMenu} // Prob dont need, just hides the menu if you right click it
              style={{
                top: contextMenuPosition.y,
                left: contextMenuPosition.x,
              }}
              songData={contextMenuSongData}
              hideContextMenu={hideContextMenu}
            />
          )}
          {/* Render the PlaylistMenu when playlistMenuIndex has a real index */}
          {playlistMenuIndex != -1 && (
            <PlaylistMenu
              song={visibleSongs[playlistMenuIndex]}
              closePlaylistMenu={closePlaylistMenu}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SongList;
