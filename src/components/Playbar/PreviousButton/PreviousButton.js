import React from 'react';
import './PreviousButton.css';

import PreviousButtonSVG from './PreviousButton.svg';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function PreviousButton() {
  const { playPreviousSong } = useAudioPlayer();

  return (
    <img
      className="previous-button"
      src={PreviousButtonSVG}
      onClick={playPreviousSong}
    />
  );
}

export default PreviousButton;
