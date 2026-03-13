import React from 'react';
import './NextButton.css';

import { ReactComponent as NextButtonSVG } from './NextButton.svg';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function NextButton() {
  const { playNextSong } = useAudioPlayer();

  return (
    <NextButtonSVG className="next-button" onClick={playNextSong} />
  );
}

export default NextButton;
