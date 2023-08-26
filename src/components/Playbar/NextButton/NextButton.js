import React from 'react';
import './NextButton.css';

import NextButtonSVG from './NextButton.svg';

import { useAudioPlayer } from '../../AudioContext';

function NextButton() {
  const { playNextSong } = useAudioPlayer();

  return (
    <img className="next-button" src={NextButtonSVG} onClick={playNextSong} />
  );
}

export default NextButton;
