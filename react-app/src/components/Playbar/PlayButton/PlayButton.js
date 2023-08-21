import React from 'react';
import './PlayButton.css';

import PlayButtonSVG from './PlayButton.svg';

function PlayButton() {
  return <img className="play-button" src={PlayButtonSVG} />;
}

export default PlayButton;
