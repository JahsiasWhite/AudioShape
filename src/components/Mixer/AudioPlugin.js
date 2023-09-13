// ! I think this component is being recreated way too many times
import React, { useState } from 'react';

import './AudioPlugin.css';

import Knob from './Knob';

import { useAudioPlayer } from '../AudioContext';

// DREADBOX INSPIRED

const AudioPlugin = () => {
  const { handleSpeedChange, handleSongExport } = useAudioPlayer();

  const [speedKnobValue, setSpeedKnobValue] = useState(50);
  const [reverbKnobValue, setReverbKnobValue] = useState(50);
  const [delayKnobValue, setDelayKnobValue] = useState(50);

  const speedKnobStyles = {
    size: 75,
    numTicks: 25,
    degrees: 260,
    min: 1,
    max: 100,
    value: speedKnobValue,
    color: true,
  };
  const reverbKnobStyles = {
    size: 75,
    numTicks: 25,
    degrees: 260,
    min: 1,
    max: 100,
    value: reverbKnobValue,
    color: true,
  };
  const delayKnobStyles = {
    size: 75,
    numTicks: 25,
    degrees: 260,
    min: 1,
    max: 100,
    value: delayKnobValue,
    color: true,
  };

  /**
   * Default speedup is 0.8, default slowdown is 1.2
   *
   * Here, we will let the range be from .1 to 2. Where '2' is the slowest, and '.1' is the fastest
   * @param {*} newValue - The value coming from the knob
   */
  const mapValueToSpeed = (newValue) => {
    // Our desired range
    const slowdownRange = [2, 0.1];

    // Use linear interpolation to map the newValue to the desired range
    const mappedValue =
      ((newValue - speedKnobStyles.min) /
        (speedKnobStyles.max - speedKnobStyles.min)) *
        (slowdownRange[1] - slowdownRange[0]) +
      slowdownRange[0];

    setSpeedKnobValue(newValue);
    handleSpeedChange(mappedValue);
  };

  const mapValueToReverb = (newValue) => {};

  const mapValueToDelay = (newValue) => {};

  return (
    <div className="audio-plugin">
      <div className="module-container">
        <div className="header">SPEED</div>
        <div className="speed-body">
          <Knob customProps={speedKnobStyles} onChange={mapValueToSpeed} />
          <p>MULTIPLIER</p>
        </div>
      </div>

      <div className="module-container">
        <div className="header">REVERB</div>
        <div className="speed-body">
          <Knob customProps={reverbKnobStyles} onChange={mapValueToReverb} />
          <p>LEVEL</p>
        </div>
      </div>

      <div className="module-container">
        <div className="header">DELAY</div>
        <div className="speed-body">
          <Knob customProps={delayKnobStyles} onChange={mapValueToDelay} />
          <p>TIME</p>
        </div>
      </div>
      {/* <div className="module-container">
        <Knob customProps={testKnobStyles} />
      </div> */}
      {/* <div
        className="export-button"
        onClick={() => {
          handleSongExport();
        }}
      >
        Export
      </div> */}
    </div>
  );
};

export default AudioPlugin;
