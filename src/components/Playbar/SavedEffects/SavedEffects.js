// TODO: Is this rendered from the start? Should I only show this when its selected

import React, { useState, useEffect } from 'react';
import './SavedEffects.css';
import { useAudioPlayer } from '../../../AudioController/AudioContext';

import EffectsSVG from '../EffectsSVG';

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

const SavedEffects = () => {
  const { savedEffects, applySavedEffects, currentEffectCombo } =
    useAudioPlayer();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredEffect, setHoveredEffect] = useState(null);

  const toggleShowing = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleApplyEffect = (comboName) => {
    applySavedEffects(comboName);
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
    <div className="saved-effects">
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
    </div>
  );
};

export default SavedEffects;
