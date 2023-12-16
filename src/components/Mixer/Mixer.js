import React, { useState, useEffect } from 'react';
import './Mixer.css';

import AudioPlugin from './AudioPlugin';

import { useAudioPlayer } from '../../AudioController/AudioContext';

// The user can select which song they want to edit or just come in here and choose which song after
function Mixer({ selectedIndex, setSelectedIndex }) {
  const { visibleSongs, currentEffectCombo, setEffects } = useAudioPlayer();

  const currentSong = visibleSongs[selectedIndex];

  /**
   * Once we leave this page, reset the selected song index
   */
  useEffect(() => {
    return () => {
      setSelectedIndex(null);

      // Also reset any effects we messed with
      // !TODO: Will this break anything if we have a preset enabled? Because shouldn't we still have 'speed' for example be an effect?
      // its working like that but it still might have bigger consequences down the line
      setEffects({});
    };
  }, []);

  return (
    <div className="mixer">
      {/* {currentSong && <div>{currentSong.title}</div>} */}
      {currentEffectCombo && (
        <div>Current Effect Combo: {currentEffectCombo}</div>
      )}
      <AudioPlugin />
    </div>
  );
}

export default Mixer;
