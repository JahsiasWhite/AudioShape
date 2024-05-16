import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../../AudioController/AudioContext';

// TODO: Instead of exit button, click on outside of menu to close
// TODO: Add song.id !!!!

function EffectNamePopup({ effects, closeNamePopup }) {
  const [newEffectName, setNewEffectName] = useState('');

  const saveEffect = () => {
    if (newEffectName === '') return;

    // Save the effectCombo permanently
    window.electron.ipcRenderer.sendMessage(
      'SAVE_EFFECT_COMBO',
      newEffectName,
      effects
    );

    closeNamePopup();
  };

  return (
    <div className="popup-container">
      <div className="close-menu" onClick={closeNamePopup}>
        X
      </div>
      <div className="create-playlist">
        <input
          type="text"
          placeholder="Enter effect name"
          value={newEffectName}
          onChange={(e) => setNewEffectName(e.target.value)}
        />
        <button onClick={saveEffect}>Save</button>
      </div>
    </div>
  );
}

export default EffectNamePopup;
