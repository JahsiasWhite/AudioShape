import React, { useState } from 'react';

function Mixer() {
  // State for EQ settings
  const [eqSettings, setEqSettings] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
  });

  // State for playback speed
  const [speed, setSpeed] = useState(1);

  // Function to handle EQ adjustments
  const handleEqChange = (event) => {
    const { name, value } = event.target;
    setEqSettings((prevSettings) => ({
      ...prevSettings,
      [name]: parseInt(value),
    }));
  };

  // Function to handle speed adjustment
  const handleSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

  return (
    <div className="mixer">
      <h2>Music Editor</h2>

      {/* EQ Controls */}
      <div className="eq-controls">
        <h3>Equalizer</h3>
        <div>
          <label>Bass:</label>
          <input
            type="range"
            min="-12"
            max="12"
            name="bass"
            value={eqSettings.bass}
            onChange={handleEqChange}
          />
        </div>
        <div>
          <label>Mid:</label>
          <input
            type="range"
            min="-12"
            max="12"
            name="mid"
            value={eqSettings.mid}
            onChange={handleEqChange}
          />
        </div>
        <div>
          <label>Treble:</label>
          <input
            type="range"
            min="-12"
            max="12"
            name="treble"
            value={eqSettings.treble}
            onChange={handleEqChange}
          />
        </div>
      </div>

      {/* Speed Control */}
      <div className="speed-control">
        <h3>Playback Speed</h3>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={handleSpeedChange}
        />
        <p>Speed: {speed.toFixed(1)}x</p>
      </div>

      {/* Additional Controls */}
      {/* Add more controls for other features you want to implement */}
    </div>
  );
}

export default Mixer;
