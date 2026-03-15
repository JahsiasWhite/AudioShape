import React from 'react';
import './PreviousButton.css';

import { ReactComponent as PreviousButtonSVG } from './PreviousButton.svg';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function PreviousButton() {
  const { playPreviousSong } = useAudioPlayer();

  return (
    <PreviousButtonSVG
      className="previous-button"
      onClick={playPreviousSong}
    />
  );
}

export default PreviousButton;
