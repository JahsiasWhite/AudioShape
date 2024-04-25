// ! I think this component is being recreated way too many times
import React, { useState, useEffect } from 'react';

import './AudioPlugin.css';

import Knob from './Knob';
import EffectNamePopup from '../Popups/EffectNamePopup';

import { useAudioPlayer } from '../../AudioController/AudioContext';

// DREADBOX INSPIRED

const AudioPlugin = () => {
  const [showSavePopup, setShowSavePopup] = useState(false);

  // DEFAULT VALUES
  const initialKnobValues = {
    speedKnobValue: 50,
    reverbKnobValue: 100,
    delayKnobValue: 0,
    bitCrusherKnobValue: 16,
    pitchShiftKnobValue: 0,
  };
  let INIT_MULTIPLIER = 1;

  const {
    addEffect,
    effects,
    resetCurrentSong,
    setIsLooping,
    currentEffectCombo,
    savedEffects,
    saveEffects,
    loadingQueue,
    handleSongExport,
  } = useAudioPlayer();

  console.error('HMM', savedEffects[currentEffectCombo]);
  if (savedEffects[currentEffectCombo] !== undefined) {
    Object.keys(savedEffects[currentEffectCombo]).forEach((effect) => {
      if (effect === 'speed') {
        INIT_MULTIPLIER = savedEffects[currentEffectCombo][effect];
      }
    });
  }

  console.error(initialKnobValues.speedKnobValue);
  const [speedKnobValue, setSpeedKnobValue] = useState(
    initialKnobValues.speedKnobValue * INIT_MULTIPLIER
  );
  const [multiplier, setMultiplier] = useState(INIT_MULTIPLIER);

  const [reverbKnobValue, setReverbKnobValue] = useState(100);
  // const [wetValue, setWetValue] = useState(1);
  const [reverbIsActive, setreverbIsActive] = useState(false);

  const [delayKnobValue, setDelayKnobValue] = useState(0);
  const [delayValue, setDelayValue] = useState(0);

  const [bitCrusherKnobValue, setBitCrusherKnobValue] = useState(16);
  const [bitCrusherValue, setBitCrusherValue] = useState(0);

  const [pitchShiftKnobValue, setPitchShiftKnobValue] = useState(0);
  const [pitchShiftValue, setPitchShiftValue] = useState(0);

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
  const bitCrusherKnobStyles = {
    size: 75,
    numTicks: 16,
    degrees: 260,
    min: 1,
    max: 16,
    value: bitCrusherKnobValue,
    color: true,
  };
  const pitchShiftKnobStyles = {
    size: 75,
    numTicks: 25,
    degrees: 260,
    min: -23,
    max: 24,
    value: pitchShiftKnobValue,
    color: true,
  };

  const interpolateValue = (range, value, knobValues) => {
    // Use linear interpolation to map the newValue to the desired range
    const mappedValue =
      ((value - knobValues.min) / (knobValues.max - knobValues.min)) *
        (range[1] - range[0]) +
      range[0];

    // Round to two decimal places
    const roundedMappedValue = parseFloat(mappedValue.toFixed(2));

    return roundedMappedValue;
  };

  /**
   * Default speedup is 1.2, default slowdown is .8
   *
   * Here, we will let the range be from .1 to 2. Where '2' is the fasted, and '.1' is the slowest
   * @param {*} newValue - The value coming from the knob
   */
  const mapValueToSpeed = (newValue) => {
    // Our desired range
    const speedRange = [0.1, 2];

    // Get the correct value from the knob
    const mappedValue = interpolateValue(speedRange, newValue, speedKnobStyles);

    setSpeedKnobValue(newValue);
    setMultiplier(mappedValue);

    addEffect('speed', mappedValue);
  };

  const toggleReverb = () => {
    setreverbIsActive(!reverbIsActive);

    // handleReverbChange();
    addEffect('reverb', !reverbIsActive);
  };

  const mapValueToReverbWetness = (newValue) => {
    // Our desired range
    const reverbRange = [0, 1];

    const mappedValue = interpolateValue(
      reverbRange,
      newValue,
      reverbKnobStyles
    );

    setReverbKnobValue(newValue);
    // setWetValue(mappedValue);

    addEffect('reverbWetness', mappedValue);
  };

  const mapValueToDelay = (newValue) => {
    // Our desired range
    const delayRange = [0, 5];

    const mappedValue = interpolateValue(delayRange, newValue, delayKnobStyles);

    setDelayKnobValue(newValue);
    setDelayValue(mappedValue);

    addEffect('delay', mappedValue);
  };

  const mapValueToBitCrusher = (newValue) => {
    // IDK why I need this
    if (newValue === 0) {
      newValue = 1;
    }

    setBitCrusherKnobValue(newValue);
    // setBitCrusherValue(newValue);

    addEffect('bitCrusher', newValue);
  };

  const mapValueToPitchShift = (newValue) => {
    setPitchShiftKnobValue(newValue);
    // setPitchShiftValue(mappedValue);

    addEffect('pitchShift', newValue);
  };

  const saveSettings = () => {
    // saveEffects('Effect1');
    setShowSavePopup(true);
  };

  const closeNamePopup = () => {
    setShowSavePopup(false);
  };

  const resetSong = () => {
    // Reset knob values to their initial values
    resetKnobValues();

    // Restart the current playing song
    resetCurrentSong();
  };

  /**
   * This just resets the visual knob values, doesn't actually change anything
   */
  const resetKnobValues = () => {
    setSpeedKnobValue(initialKnobValues.speedKnobValue);
    setMultiplier(1);
    setReverbKnobValue(initialKnobValues.reverbKnobValue);
    setDelayKnobValue(initialKnobValues.delayKnobValue);
    setDelayValue(0);
    setBitCrusherKnobValue(initialKnobValues.bitCrusherKnobValue);
    setPitchShiftKnobValue(initialKnobValues.pitchShiftKnobValue);
  };

  /* When editing a song, we want it to stay */
  // useEffect(() => {
  //   setIsLooping(true);

  //   return () => {
  //     setIsLooping(false);
  //   };
  // }, []);

  return (
    <div
      className={`audio-plugin ${loadingQueue.length > 0 ? 'unclickable' : ''}`}
    >
      <div className="plugin-settings-container">
        <div className="plugin-button-container">
          Export
          <div
            className="synth-button"
            onClick={() => {
              handleSongExport();
            }}
          ></div>
        </div>
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
      </div>

      {showSavePopup && (
        <EffectNamePopup effects={effects} closeNamePopup={closeNamePopup} />
      )}

      <div className={`modifiers-container`}>
        <div className="module-container">
          <div className="header">SPEED</div>
          <div className="speed-body">
            <Knob customProps={speedKnobStyles} onChange={mapValueToSpeed} />
            <p>MULTIPLIER: {multiplier}x</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">
            <div className="plugin-button-container header-button">
              <div
                className={`synth-button  ${
                  reverbIsActive ? 'button-active' : ''
                }`}
                onClick={toggleReverb}
              ></div>
            </div>
            <div>REVERB</div>
          </div>
          <div
            className={`speed-body ${reverbIsActive ? '' : 'inactive-module'}`}
          >
            <Knob
              customProps={reverbKnobStyles}
              onChange={mapValueToReverbWetness}
            />
            <p>WET: {reverbKnobValue}%</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">DELAY</div>
          <div className="speed-body">
            <Knob customProps={delayKnobStyles} onChange={mapValueToDelay} />
            <p>DELAY: {delayValue}s</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">BIT CRUSHER</div>
          <div className="speed-body">
            <Knob
              customProps={bitCrusherKnobStyles}
              onChange={mapValueToBitCrusher}
            />
            <p>CRUSH: {bitCrusherKnobValue} bit</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">PITCH SHIFT</div>
          <div className="speed-body">
            <Knob
              customProps={pitchShiftKnobStyles}
              onChange={mapValueToPitchShift}
            />
            <p>SHIFT: {pitchShiftKnobValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlugin;
