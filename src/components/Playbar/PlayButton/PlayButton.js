import React from 'react';
import './PlayButton.css';

import PlayButtonSVG from './PlayButton.svg';
import PauseButtonSVG from './PauseButton.svg';

function PlayButton({ onClick, isPlaying }) {
  return (
    <img
      className="play-button"
      src={isPlaying ? PauseButtonSVG : PlayButtonSVG}
      onClick={onClick}
    />
  );
}

export default PlayButton;
