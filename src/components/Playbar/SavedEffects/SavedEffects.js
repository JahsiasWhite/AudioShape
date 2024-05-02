// TODO: Is this rendered from the start? Should I only show this when its selected

import React, { useState, useEffect } from 'react';
import './SavedEffects.css';
import { useAudioPlayer } from '../../../AudioController/AudioContext';

import EffectsSVG from '../EffectsSVG';

const SavedEffects = () => {
  const { currentEffectCombo, setTogglePopup } = useAudioPlayer();
  const [isVisible, setIsVisible] = useState(false);

  const toggleShowing = () => {
    setIsVisible(!isVisible);
    setTogglePopup(!isVisible);
  };

  // TODO: This should only run once. Will run everytime we switch between fullscreen mode though :(
  // useEffect(() => {
  //   window.electron.ipcRenderer.sendMessage('GRAB_EFFECT_COMBOS');
  // }, []);

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
    </div>
  );
};

export default SavedEffects;
