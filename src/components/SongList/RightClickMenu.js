import React, { useState, useEffect } from 'react';

import ContextMenu from './ContextMenu/ContextMenu';

import { useAudioPlayer } from '../../AudioController/AudioContext';

export default function RightClickMenu({ clickData }) {
  const { setCurrentScreen } = useAudioPlayer();

  useEffect(() => {
    // No data or toggled off
    if (!clickData[0]) {
      setIsContextMenuActive(false);
      return;
    }

    setContextMenuPosition({ x: clickData[0], y: clickData[1] });
    setContextMenuSongData(clickData[2]);
    setIsContextMenuActive(true);
  }, [clickData]);

  /**
   * Stuff to handle right click menu... this should be in its RightClickMenu component
   * TODO: This should not be in SongList either because we will prob want to right click other
   * stuff in the future
   */
  const [isContextMenuActive, setIsContextMenuActive] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuSongData, setContextMenuSongData] = useState(null);

  const hideContextMenu = () => {
    setIsContextMenuActive(false);
  };

  function handleSongEditClick(id) {
    handleSongEdit(id);
    setCurrentScreen('mixer');
  }

  return (
    <>
      {isContextMenuActive && contextMenuSongData && (
        <ContextMenu
          onContextMenu={hideContextMenu} // Prob dont need, just hides the menu if you right click it
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
          songData={contextMenuSongData}
          hideContextMenu={hideContextMenu}
          handleSongEditClick={handleSongEditClick}
        />
      )}
    </>
  );
}
