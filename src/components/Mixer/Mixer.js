import React, { useState, useEffect } from 'react';
import './Mixer.css';

import AudioPlugin from './AudioPlugin';

import { useAudioPlayer } from '../AudioContext';

// The user can select which song they want to edit or just come in here and choose which song after
function Mixer({ selectedIndex, setSelectedIndex }) {
  const { visibleSongs } = useAudioPlayer();

  const currentSong = visibleSongs[selectedIndex];

  /**
   * Once we leave this page, reset the selected song index
   */
  useEffect(() => {
    return () => {
      setSelectedIndex(null);
    };
  }, []);

  return (
    <div className="mixer">
      {currentSong && <div>{currentSong.title}</div>}
      <AudioPlugin />
    </div>
  );
}

export default Mixer;
