import React, { useState } from 'react';
import './VolumeControl.css';

import VolumeMaxSVG from './volume-max.svg';
import VolumeLowSVG from './volume-low.svg';
import VolumeQuietSVG from './volume-quiet.svg';

import { useAudioPlayer } from '../../AudioContext';

function VolumeControl() {
  const { changeVolume } = useAudioPlayer();

  const [volume, setVolume] = useState(100); // Local variable for showing volume, its different than what the audio player needs

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    // onVolumeChange(newVolume / 100); // Convert to a range between 0 and 1
    changeVolume(newVolume / 100);
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
