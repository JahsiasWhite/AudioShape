import React from 'react';
import './PlayButton.css';

import PlayButtonSVG from './PlayButton.svg';
import PauseButtonSVG from './PauseButton.svg';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function PlayButton() {
  const { isPlaying, pauseAudio, playAudio } = useAudioPlayer();

  return (
    <img
      className="play-button"
      src={isPlaying ? PauseButtonSVG : PlayButtonSVG}
      onClick={isPlaying ? pauseAudio : playAudio}
    />
  );
}

export default PlayButton;
