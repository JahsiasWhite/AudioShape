import React, { useState } from 'react';
import './ContextMenu.css'; // Generic?

import PlaylistMenu from '../../PlaylistMenu/PlaylistMenu';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function ContextMenu({ onContextMenu, style, songData, hideContextMenu }) {
  const { addToQueue, visibleSongs } = useAudioPlayer();

  const handleContextMenu = (event) => {
    event.preventDefault();
    onContextMenu(event);
  };

  const addSongToQueue = () => {
    addToQueue(songData.id);
    hideContextMenu();
  };

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const addToPlaylist = (event) => {
    setShowPlaylistMenu(true);
  };

  return (
    <>
      {showPlaylistMenu ? (
        <PlaylistMenu
          song={visibleSongs[songData.id]}
          // closePlaylistMenu={closePlaylistMenu}
          closePlaylistMenu={handleContextMenu}
        />
      ) : (
        <div
          className="context-menu-container"
          style={style}
          onContextMenu={handleContextMenu}
        >
          <ul className="context-menu">
            <li onClick={addToPlaylist}>Add to playlist</li>
            <li>Edit</li>
            <li onClick={addSongToQueue}>Add to queue</li>
          </ul>
        </div>
      )}
    </>
  );
}

export default ContextMenu;
