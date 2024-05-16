import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../../AudioController/AudioContext';

const EffectTooltip = ({ effects }) => {
  return (
    <div className="effect-tooltip">
      <ul>
        {Object.keys(effects).map((effect, index) => (
          <li key={index}>{effect + ' : ' + effects[effect]}</li>
        ))}
      </ul>
    </div>
  );
};

export default function PopupMenu() {
  const { savedEffects, applySavedEffects, currentEffectCombo, togglePopup } =
    useAudioPlayer();
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredEffect, setHoveredEffect] = useState(null);

  const toggleShowing = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    toggleShowing();
  }, [togglePopup]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleApplyEffect = (comboName) => {
    applySavedEffects(comboName);
    handleClose();
  };

  const handleShowTooltip = (comboName) => {
    setHoveredEffect(comboName);
  };

  // TODO: This should only run once. Will run everytime we switch between fullscreen mode though :(
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('GRAB_EFFECT_COMBOS');
  }, []);

  useEffect(() => {
    console.error('HMMM: ', currentEffectCombo);
  }, [currentEffectCombo]);

  return (
    <>
      {isVisible && (
        <div className="popup-container">
          <div onClick={handleClose} className="close-menu">
            X
          </div>
          <div className="saved-effects-container">
            <h3>Saved Effects</h3>
            <div className="saved-effects-content">
              <div>
                {Object.keys(savedEffects).map((comboName, index) => (
                  <div
                    key={index}
                    className={`saved-effect-item ${
                      comboName === currentEffectCombo
                        ? 'saved-effect-item-enabled'
                        : ''
                    }`}
                    onClick={() => handleApplyEffect(comboName)}
                    onMouseEnter={() => handleShowTooltip(comboName)}
                    onMouseLeave={() => setHoveredEffect(null)}
                  >
                    <div className="combo-name">{comboName}</div>
                  </div>
                ))}
              </div>
              <div>
                {hoveredEffect && (
                  <EffectTooltip effects={savedEffects[hoveredEffect]} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
