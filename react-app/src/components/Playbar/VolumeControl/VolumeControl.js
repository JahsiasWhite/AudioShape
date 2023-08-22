// function VolumeControl() {
//   return (
//     <div className="volume-controls">
//       <div className="volume-icon">VOLUME</div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import './VolumeControl.css';

function VolumeControl({ onVolumeChange }) {
  const [volume, setVolume] = useState(100); // Initial volume is 100

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    onVolumeChange(newVolume / 100); // Convert to a range between 0 and 1
  };

  return (
    <div className="volume-control">
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
