// ! I think this component is being recreated way too many times
import React, { useState, useEffect, useRef } from 'react';

import './AudioPlugin.css';

import Knob from './Knob';
import EffectNamePopup from '../Popups/EffectNamePopup';

import AutoWah from './PluginComponents/AutoWah';
import EQ from './PluginComponents/EQ';
import Chorus from './PluginComponents/Chorus';

import { useAudioPlayer } from '../../AudioController/AudioContext';

// DREADBOX INSPIRED

// TODO This whole component is pretty ugly

const AudioPlugin = () => {
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // null | 'exporting' | 'success' | 'error'

  // References to all child components
  // Required so we can use the reset button
  const eqRef = useRef();
  const autoWahRef = useRef();
  const chorusRef = useRef();

  // DEFAULT VALUES
  const initialKnobValues = {
    speedKnobValue: 50,
    reverbKnobValue: 100,
    delayKnobValue: 0,
    bitCrusherKnobValue: 16,
    pitchShiftKnobValue: 0,
  };
  let INIT_MULTIPLIER = 1;

  // TODO Redundant put in constants file
  const DEFAULT_SPEEDUP = 1.2;
  const DEFAULT_SLOWDOWN = 0.8;

  const {
    addEffect,
    effects,
    setEffects,
    resetCurrentSong,
    currentEffectCombo,
    savedEffects,
    saveEffects,
    loadingQueue,
    handleSongExport,
    speedupIsEnabled,
    slowdownIsEnabled,
    toggleSpeedup,
    currentSpeed,
    effectsEnabled,
  } = useAudioPlayer();

  if (savedEffects[currentEffectCombo] !== undefined) {
    Object.keys(savedEffects[currentEffectCombo]).forEach((effect) => {
      if (effect === 'speed') {
        INIT_MULTIPLIER = savedEffects[currentEffectCombo][effect];
      }
    });
  } else {
    INIT_MULTIPLIER = currentSpeed;
  }

  const [knobs, setKnobs] = useState({
    speed: initialKnobValues.speedKnobValue * INIT_MULTIPLIER,
    reverbIsActive: false,
    reverbWetness: 100,
    delay: 0,
    bitCrusher: 16,
    pitchShift: 0,
  });

  const [multiplier, setMultiplier] = useState(INIT_MULTIPLIER);

  // Sync speed knob position with currentSpeed changes from audio context
  useEffect(() => {
    // Only update if currentSpeed has changed
    const newSpeedKnobValue = initialKnobValues.speedKnobValue * currentSpeed;
    setKnobs((prevKnobs) => ({ ...prevKnobs, speed: newSpeedKnobValue }));
    setMultiplier(currentSpeed);
  }, [currentSpeed, savedEffects]);

  /* Styles for the different knobs */
  const speedKnobStyles = {
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: 1,
    max: 100,
  };
  const reverbKnobStyles = {
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: 1,
    max: 100,
    value: knobs.reverbWetness,
  };
  const delayKnobStyles = {
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: 1,
    max: 100,
    value: knobs.delay,
  };
  const bitCrusherKnobStyles = {
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: 1,
    max: 16,
    value: knobs.bitCrusher,
  };
  const pitchShiftKnobStyles = {
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: -23,
    max: 24,
    value: knobs.pitchShift,
  };

  const interpolateValue = (range, value, knobValues) => {
    // Use linear interpolation to map the newValue to the desired range
    const mappedValue =
      ((value - knobValues.min) / (knobValues.max - knobValues.min)) *
        (range[1] - range[0]) +
      range[0];

    // Round to two decimal places
    const roundedMappedValue = parseFloat(mappedValue.toFixed(2));

    // Clamp to the range — use min/max so inverted ranges (e.g. [0, -20]) work correctly
    const clampMin = Math.min(range[0], range[1]);
    const clampMax = Math.max(range[0], range[1]);
    if (roundedMappedValue < clampMin) return clampMin;
    if (roundedMappedValue > clampMax) return clampMax;

    return roundedMappedValue;
  };

  /**
   * Default buttons for speedup is 1.2, default slowdown is .8
   *
   * Here, we will let the range be from .1 to 2. Where '2' is the fasted, and '.1' is the slowest
   * @param {*} newValue - The value coming from the knob
   */
  const mapValueToSpeed = (newValue) => {
    // Our desired range
    const speedRange = [0.1, 2];

    // Get the correct value from the knob
    const mappedValue = interpolateValue(speedRange, newValue, speedKnobStyles);

    setKnobs((prevKnobs) => ({ ...prevKnobs, ['speed']: newValue })); // Visuals
    setMultiplier(mappedValue);
    addEffect('speed', mappedValue);
  };

  const mapValueToReverbWetness = (newValue) => {
    // Our desired range
    const reverbRange = [0, 1];

    const mappedValue = interpolateValue(
      reverbRange,
      newValue,
      reverbKnobStyles
    );

    setKnobs((prevKnobs) => ({ ...prevKnobs, ['reverbWetness']: newValue }));
    addEffect('reverbWetness', mappedValue);
  };

  const mapValueToDelay = (newValue) => {
    // Our desired range
    const delayRange = [0, 5];

    const mappedValue = interpolateValue(delayRange, newValue, delayKnobStyles);

    setKnobs((prevKnobs) => ({ ...prevKnobs, ['delay']: newValue }));
    addEffect('delay', mappedValue);
  };

  const updateKnobValue = (effectName, newValue) => {
    setKnobs((prevKnobs) => ({
      ...prevKnobs,
      [effectName]: newValue,
    }));
    addEffect(effectName, newValue);
  };

  const saveSettings = () => {
    setShowSavePopup(true);
  };

  const closeNamePopup = () => {
    setShowSavePopup(false);
  };

  const resetSong = () => {
    console.log('Resetting song...');

    // Reset knob values to their initial values
    resetKnobValues();

    // Restart the current playing song
    resetCurrentSong();

    setEffects({}); // Clear all effects
  };

  /**
   * This just resets the visual knob values, doesn't actually change anything
   */
  const resetKnobValues = () => {
    setKnobs({
      speed: initialKnobValues.speedKnobValue,
      reverbWetness: initialKnobValues.reverbKnobValue,
      delay: initialKnobValues.delayKnobValue,
      bitCrusher: initialKnobValues.bitCrusherKnobValue,
      pitchShift: initialKnobValues.pitchShiftKnobValue,
    });
    setMultiplier(1);
    eqRef.current.resetEq();
  };

  return (
    <div
      className={`audio-plugin ${loadingQueue.length > 0 ? 'unclickable' : ''}`}
    >
      <div className="plugin-settings-container">
        <div className="plugin-button-container">
          Export
          <div
            className="synth-button"
            onClick={async () => {
              if (exportStatus === 'exporting') return;
              setExportStatus('exporting');
              try {
                await handleSongExport();
                setExportStatus('success');
              } catch {
                setExportStatus('error');
              } finally {
                setTimeout(() => setExportStatus(null), 3000);
              }
            }}
          ></div>
          {exportStatus === 'exporting' && <span style={{ fontSize: '10px', color: '#aaa' }}>Saving...</span>}
          {exportStatus === 'success' && <span style={{ fontSize: '10px', color: '#4caf50' }}>Saved!</span>}
          {exportStatus === 'error' && <span style={{ fontSize: '10px', color: '#f44336' }}>Failed</span>}
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
            <Knob
              customProps={speedKnobStyles}
              knobValue={knobs.speed}
              onChange={mapValueToSpeed}
              live={true}
            />
            <p>MULTIPLIER: {multiplier}x</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">
            <div className="plugin-button-container header-button">
              <div
                className={`synth-button  ${
                  knobs.reverbIsActive ? 'button-active' : ''
                }`}
                onClick={() =>
                  updateKnobValue('reverbIsActive', !knobs.reverbIsActive)
                }
              ></div>
            </div>
            <div className={`${knobs.reverbIsActive ? '' : 'inactive-module'}`}>
              REVERB
            </div>
          </div>
          <div
            className={`speed-body ${
              knobs.reverbIsActive ? '' : 'inactive-module'
            }`}
          >
            <Knob
              customProps={reverbKnobStyles}
              onChange={mapValueToReverbWetness}
            />
            <p>WET: {knobs.reverbWetness}%</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">DELAY</div>
          <div className="speed-body">
            <Knob customProps={delayKnobStyles} onChange={mapValueToDelay} />
            <p>DELAY: {knobs.delay}s</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">BIT CRUSHER</div>
          <div className="speed-body">
            <Knob
              customProps={bitCrusherKnobStyles}
              onChange={(val) => updateKnobValue('bitCrusher', val)}
            />
            <p>CRUSH: {knobs.bitCrusher} bit</p>
          </div>
        </div>
        <div className="module-container">
          <div className="header">PITCH SHIFT</div>
          <div className="speed-body">
            <Knob
              customProps={pitchShiftKnobStyles}
              onChange={(val) => updateKnobValue('pitchShift', val)}
            />
            <p>SHIFT: {knobs.pitchShift}</p>
          </div>
        </div>
        <EQ
          interpolateValue={interpolateValue}
          addEffect={addEffect}
          ref={eqRef}
        />
        <AutoWah
          interpolateValue={interpolateValue}
          addEffect={addEffect}
          ref={autoWahRef}
        />
        <Chorus
          interpolateValue={interpolateValue}
          addEffect={addEffect}
          ref={chorusRef}
        />
      </div>
    </div>
  );
};

export default AudioPlugin;
