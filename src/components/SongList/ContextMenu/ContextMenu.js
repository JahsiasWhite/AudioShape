import React from 'react';
import './ContextMenu.css'; // Generic?

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function ContextMenu({ onContextMenu, style, songData, hideContextMenu }) {
  const { addToQueue } = useAudioPlayer();

  const handleContextMenu = (event) => {
    event.preventDefault();
    onContextMenu(event);
  };

  const addSongToQueue = () => {
    addToQueue(songData.id);
    hideContextMenu();
  };

  return (
    <div
      className="context-menu-container"
      style={style}
      onContextMenu={handleContextMenu}
    >
      <ul className="context-menu">
        <li>Add to playlist</li>
        <li>Edit</li>
        <li onClick={addSongToQueue}>Add to queue</li>
      </ul>
    </div>
  );
}

export default ContextMenu;
