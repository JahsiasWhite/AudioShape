import React, { useState } from 'react';
import './VolumeControl.css';

import VolumeMaxSVG from './volume-max.svg';
import VolumeLowSVG from './volume-low.svg';
import VolumeQuietSVG from './volume-quiet.svg';

function VolumeControl({ onVolumeChange }) {
  const [volume, setVolume] = useState(100); // Initial volume is 100

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    onVolumeChange(newVolume / 100); // Convert to a range between 0 and 1
  };

  return (
    <div className="volume-control">
      <img
        className="volume-icon"
        src={
          volume > 60
            ? VolumeMaxSVG
            : volume > 0
            ? VolumeLowSVG
            : VolumeQuietSVG
        } // Show max icon when above 50%
      ></img>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
        className="volume-slider"
      />
    </div>
  );
}

export default VolumeControl;
