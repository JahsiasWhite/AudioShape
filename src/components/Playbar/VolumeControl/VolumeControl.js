import React, { useState, useEffect } from 'react';
import './VolumeControl.css';

import VolumeMaxSVG from './volume-max.svg';
import VolumeLowSVG from './volume-low.svg';
import VolumeQuietSVG from './volume-quiet.svg';

import { useAudioPlayer } from '../../AudioContext';

function VolumeControl() {
  const { volume, changeVolume, toggleMute } = useAudioPlayer();

  // const [localVolume, setLocalVolume] = useState(100); // TODO: Move this to audiocontext to fix toggle mute issues
  const localVolume = volume * 100;

  /**
   * Changing the input slider
   * @param {*} event
   */
  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;

    // setLocalVolume(newVolume);
    changeVolume(newVolume / 100); // Convert to a range between 0 and 1
  };

  /* When the mute button is toggled */
  // useEffect(() => {
  //   if (isMuted) {
  //     setLocalVolume(0);
  //   } else {
  //     console.error(volume);
  //     setLocalVolume(volume * 100); // Convert from the 0-1 range
  //   }
  // }, [isMuted]);

  /* Update the input slider when the volume changes */
  // useEffect(() => {
  //   setLocalVolume(volume * 100);
  // }, [volume]);

  return (
    <div className="volume-control">
      <img
        className="volume-icon"
        src={
          localVolume > 60
            ? VolumeMaxSVG
            : localVolume > 0
            ? VolumeLowSVG
            : VolumeQuietSVG
        }
        onClick={toggleMute}
      ></img>
      <input
        type="range"
        min="0"
        max="100"
        value={localVolume}
        onChange={handleVolumeChange}
        className="volume-slider"
      />
    </div>
  );
}

export default VolumeControl;
