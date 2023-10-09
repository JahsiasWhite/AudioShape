import React, { useState } from 'react';
import './SavedEffects.css';
import { useAudioPlayer } from '../../AudioContext';

const SavedEffects = () => {
  const { savedEffects, applySavedEffects } = useAudioPlayer();
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

  return (
    <div className="saved-effects">
      {/* Button to toggle visibility */}
      <button className="saved-effects-button" onClick={toggleShowing}>
        Show Saved Effects
      </button>

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
                className="saved-effect-item"
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
