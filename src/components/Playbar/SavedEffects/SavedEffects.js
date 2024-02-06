import React, { useState, useEffect } from 'react';
import './SavedEffects.css';
import { useAudioPlayer } from '../../../AudioController/AudioContext';

import EffectsSVG from '../EffectsSVG';

const SavedEffects = () => {
  const { savedEffects, applySavedEffects, currentEffectCombo } =
    useAudioPlayer();
  const [isVisible, setIsVisible] = useState(false);

  const toggleShowing = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleApplyEffect = (comboName) => {
    applySavedEffects(comboName);
  };

  // TODO: This should only run once. Will run everytime we switch between fullscreen mode though :(
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('GRAB_EFFECT_COMBOS');
  }, []);

  useEffect(() => {
    console.error('HMMM: ', currentEffectCombo);
  }, [currentEffectCombo]);

  return (
    <div className="saved-effects">
      {/* Button to toggle visibility */}
      {/* <button
        className={`saved-effects-button ${
          currentEffectCombo !== '' ? 'saved-effects-enabled' : ''
        } `}
        onClick={toggleShowing}
      >
        Show Saved Effects
      </button> */}
      <EffectsSVG
        // className={`saved-effects-button ${
        //   currentEffectCombo !== '' ? 'saved-effects-enabled' : ''
        // } `}
        effectsEnabled={currentEffectCombo}
        onClick={toggleShowing}
      />

      {/* Popup displaying saved effects */}
      {isVisible && (
        <div className="popup-container">
          <div onClick={handleClose} className="close-menu">
            X
          </div>
          <div className="saved-effects-content">
            <h3>Saved Effects</h3>
            {Object.keys(savedEffects).map((comboName, index) => (
              <div
                key={index}
                className={`saved-effect-item ${
                  comboName === currentEffectCombo
                    ? 'saved-effect-item-enabled'
                    : ''
                }`}
                onClick={() => handleApplyEffect(comboName)}
              >
                {comboName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedEffects;
