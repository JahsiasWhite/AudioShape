import React from 'react';
import './PlayButton.css';

import { ReactComponent as PlayButtonSVG } from './PlayButton.svg';
import { ReactComponent as PauseButtonSVG } from './PauseButton.svg';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

function PlayButton() {
  const { isPlaying, pauseAudio, playAudio } = useAudioPlayer();

  return isPlaying ? (
    <PauseButtonSVG className="play-button" onClick={pauseAudio} />
  ) : (
    <PlayButtonSVG className="play-button" onClick={playAudio} />
  );
}

export default PlayButton;
