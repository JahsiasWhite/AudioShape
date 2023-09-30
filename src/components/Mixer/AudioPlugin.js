// ! I think this component is being recreated way too many times
import React, { useState, useEffect } from 'react';

import './AudioPlugin.css';

import Knob from './Knob';

import { useAudioPlayer } from '../AudioContext';

// DREADBOX INSPIRED

const AudioPlugin = () => {
  const {
    handleSpeedChange,
    handleReverbChange,
    resetCurrentSong,
    setIsLooping,
  } = useAudioPlayer();

  const [speedKnobValue, setSpeedKnobValue] = useState(50);
  const [multiplier, setMultiplier] = useState(1);

  const [reverbKnobValue, setReverbKnobValue] = useState(50);
  const [delayKnobValue, setDelayKnobValue] = useState(50);

  /* Styles for the different knobs */
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
    const slowdownRange = [0.1, 2];

    // Use linear interpolation to map the newValue to the desired range
    const mappedValue =
      ((newValue - speedKnobStyles.min) /
        (speedKnobStyles.max - speedKnobStyles.min)) *
        (slowdownRange[1] - slowdownRange[0]) +
      slowdownRange[0];

    // Round mappedValue to one decimal place
    const roundedMappedValue = parseFloat(mappedValue.toFixed(1));

    setSpeedKnobValue(newValue);
    setMultiplier(roundedMappedValue);

    handleSpeedChange(roundedMappedValue);
  };

  const mapValueToReverb = (newValue) => {
    handleReverbChange();
  };

  const mapValueToDelay = (newValue) => {};

  const saveSettings = () => {
    console.error(multiplier, reverbKnobValue, delayKnobValue);
  };

  const resetSong = () => {
    resetCurrentSong();
  };

  /* When editing a song, we want it to stay */
  // useEffect(() => {
  //   setIsLooping(true);

  //   return () => {
  //     setIsLooping(false);
  //   };
  // }, []);

  return (
    <div className="audio-plugin">
      <div className="module-container">
        <div className="header">SPEED</div>
        <div className="speed-body">
          <Knob customProps={speedKnobStyles} onChange={mapValueToSpeed} />
          {/* <div className="knob-details">
            <div>x.5</div>
            <div>x10</div>
          </div> */}
          <p>MULTIPLIER: {multiplier}</p>
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
      <div className="plugin-button-container">
        Save
        <div
          className="synth-button"
          onClick={() => {
            saveSettings();
          }}
        ></div>
      </div>
      <div className="plugin-button-container">
        Reset
        <div
          className="synth-button"
          onClick={() => {
            resetSong();
          }}
        ></div>
      </div>
      <div className="plugin-button-container">
        Export
        <div
          className="synth-button"
          onClick={() => {
            handleSongExport();
          }}
        ></div>
      </div>
    </div>
  );
};

export default AudioPlugin;
