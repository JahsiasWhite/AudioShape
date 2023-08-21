import React from 'react';
import './playbar.css';

import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';

function Playbar() {
  return (
    <div className="playbar">
      <div className="current-song">
        <span id="song-title">Song Title</span>
        <span id="artist">Artist</span>
      </div>
      <div className="playbar-controls">
        <PreviousButton />
        <PlayButton />
        <NextButton />
      </div>
      <div className="volume-controls">
        <div className="volume-icon">VOLUME</div>
      </div>
    </div>
  );
}

export default Playbar;
