import { useState, useEffect } from 'react';

import {
  renderAudioWithEffect,
  renderAudioWithSpeedChange,
} from './ToneEffects.js';

export const AudioEffects = (
  currentSong,
  fileLocation,
  onSongEnded,
  visibleSongs,
  currentSongId,
  startLoading,
  finishLoading,
  downloadAudio,
  handleTempSongSaved,
  initCurrentSong,
  DEFAULT_SPEEDUP,
  DEFAULT_SLOWDOWN,
  getCurrentAudioBuffer
) => {
  const [effects, setEffects] = useState({});
  const [savedEffects, setSavedEffects] = useState({});
  const [effectsEnabled, setEffectsEnabled] = useState(false);
  const [currentEffectCombo, setCurrentEffectCombo] = useState('');
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [speedupIsEnabled, setSpeedupIsEnabled] = useState(false);
  const [slowDownIsEnabled, setSlowDownIsEnabled] = useState(false);
  const [effectSongId, setEffectSongId] = useState(null);

  //   var fileLocation; // TODO
  var effectThreshold = 0;

  /**
   * Applies the given effect to the current song
   * @param {*} effect
   * @param {*} value
   */
  const runEffect = async (effect, value) => {
    if (!effect) {
      console.error(`No effect given: ${effect}`);
      return;
    }

    // Speed works differently from all other effects
    if (effect === 'speed') {
      handleSpeedChange(value);
      return;
    }

    // Get our new audio data
    const audioBuffer = await getCurrentAudioBuffer(fileLocation);
    const renderedBuffer = await renderAudioWithEffect(
      audioBuffer,
      effect,
      value
    );

    // Save the new song
    downloadAudio(renderedBuffer);
  };

  const addEffect = async (currentEffect, value, fL) => {
    console.log('ADDING EFFECT: ' + currentEffect);

    if (!currentSongId) {
      console.log('No song selected, returning');
      effects[currentEffect] = value;
      setEffects(effects);
      return;
    }

    /* Make effects unclickable while the current song is being edited */
    startLoading(currentEffect);

    // Save the new speed. RN only used for the video player
    if (currentEffect === 'speed') {
      setCurrentSpeed(value);
    }

    // Add our effects to the list
    // Check if the effect was turned off
    // TODO: Get the actual defaults, kinda fcking up with reverb wetness rn
    if (value === 1 || value === false) {
      delete effects[currentEffect];
      fileLocation = visibleSongs[currentSongId].file;

      // TODO ! Have to add all other effects back now
      const otherEffect = Object.keys(effects);
      console.log(otherEffect);
      if (otherEffect[0] === undefined) {
        // play original song
        console.log('PLAYING ORIGINAL SONG');

        // TODO I THINK THESE HAPPEN A FEW TIMES, MAKE IN OWN FUNCTION?
        /* Start playing the new song */
        currentSong.src = fileLocation;
        initCurrentSong();
        // setCurrentSong(currentSong);

        /* Make the effects clickable again */
        finishLoading();
      } else {
        // loop through all other effects
        runEffect(otherEffect[0], effects[otherEffect[0]]);
      }

      return;
    } else {
      effects[currentEffect] = value;
    }

    setEffects(effects);

    /* Annoying check, this will run if we aren't coming from applySavedEffects. IE: just editing one at a time and not using saved effects OR using a speed preset */
    if (fL === undefined) {
      // Check if there are multiple effects
      const hasMultipleEffects = Object.keys(effects).length > 1;

      if (hasMultipleEffects) {
        // If multiple effects, modify the temp file location
        fileLocation = currentSong.src;
      } else {
        // If only one effect, modify the default file location
        fileLocation = visibleSongs[currentSongId].file;
      }
    }

    console.log('Running effect: ', currentEffect, value);
    await runEffect(currentEffect, value);
    await getTempSong();
  };

  const toggleSavedEffectOff = () => {
    console.log('Toggling saved effect off');
    resetCurrentSong();
    finishLoading();
  };

  const applySavedEffects = async (comboName) => {
    // Toggling off
    const isSameCombo = currentEffectCombo === comboName;
    const isSameSong = effectSongId === currentSongId;
    if (isSameCombo && isSameSong) {
      toggleSavedEffectOff();
      return;
    }

    // The first effect will be applied to the original file
    if (currentSongId) fileLocation = visibleSongs[currentSongId].file;

    if (savedEffects[comboName]) {
      setEffectsEnabled(true);
      setCurrentEffectCombo(comboName); // TODO ALSO REDUNDANT
      setEffectSongId(currentSongId);

      // Disable any other effects
      setSpeedupIsEnabled(false);
      setSlowDownIsEnabled(false);

      // Start loading the all effects
      // startLoading(savedEffects[comboName]);

      for (const effect in savedEffects[comboName]) {
        effectThreshold++;

        const effectValue = savedEffects[comboName][effect];
        // console.error(effect, effectValue);
        // console.error(fileLocation);
        // runEffect(effect, effectValue);
        await addEffect(effect, effectValue, fileLocation); // TODO I dont like this, kinda sloppy
        fileLocation = currentSong.src; // All subsequent effects will be applied to the temp file

        // Finish loading the effect
        finishLoading(effect);
      }
    } else {
      // NOT A COMBO
    }
  };

  /**
   * Toggles whether the current and all future songs will be sped up
   */
  const toggleSpeedup = () => {
    if (currentSong) {
      // TODO: maybe make this its own function? gets used quite a bit
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const newSpeed = speedupIsEnabled ? 1 : DEFAULT_SPEEDUP;
    setSpeedupIsEnabled(!speedupIsEnabled);
    setSlowDownIsEnabled(false);

    addEffect('speed', newSpeed);

    if (!speedupIsEnabled) {
      setEffectsEnabled(false);
      setCurrentEffectCombo('');
    }
  };

  /**
   * Toggles whether the current and all future songs will be slowed down
   */
  const toggleSlowDown = () => {
    if (currentSong) {
      // TODO: maybe make this its own function? gets used quite a bit
      currentSong.removeEventListener('ended', onSongEnded);
    }

    const newSpeed = slowDownIsEnabled ? 1 : DEFAULT_SLOWDOWN;
    setSlowDownIsEnabled(!slowDownIsEnabled);
    setSpeedupIsEnabled(false);

    addEffect('speed', newSpeed);

    if (!slowDownIsEnabled) {
      setEffectsEnabled(false);
      setCurrentEffectCombo('');
    }
  };

  /**
   * Gets the updated temporary song
   */
  const getTempSong = async () => {
    return new Promise((resolve) => {
      window.electron.ipcRenderer.once(
        'TEMP_SONG_SAVED',
        async (outputPath) => {
          await handleTempSongSaved(
            outputPath,
            Object.keys(effects).length,
            effectThreshold
          );
          resolve();
        }
      );
    });
  };

  /**
   * Initial call to get all effect combos
   */
  window.electron.ipcRenderer.on('GRAB_EFFECT_COMBOS', (newEffectCombos) => {
    setSavedEffects(newEffectCombos);
  });

  const saveEffects = (comboName) => {
    // Save the effectCombo permanently
    window.electron.ipcRenderer.sendMessage(
      'SAVE_EFFECT_COMBO',
      comboName,
      effects
    );
  };

  const handleEffectComboAdded = (newEffectCombos) => {
    setSavedEffects(newEffectCombos);
  };

  useEffect(() => {
    window.electron.ipcRenderer.once(
      'SAVE_EFFECT_COMBO',
      handleEffectComboAdded
    );
  }, [savedEffects]); // TODO: Cant I just make this a function? No need for a useEffect

  /* SPEEDUP EFFECT */
  /**
   * Changes the current song's speed and saves the new, edited song so it can be played
   * Speed has to be rendered differently than the other effects because 'duration' must be changed
   * @param {*} newSpeed
   * @param {*} index
   */
  const handleSpeedChange = async (newSpeed, index) => {
    // Load the current song's audio buffer
    const audioBuffer = await getCurrentAudioBuffer(fileLocation);

    const renderedBuffer = await renderAudioWithSpeedChange(
      audioBuffer,
      newSpeed
    );

    downloadAudio(renderedBuffer);
    // getTempSong(); // ? Need an await here?
  };

  /**
   * Resets the current song's effects to the default and restarts it
   */
  const resetCurrentSong = () => {
    // Reset the songs effects
    setEffects({});
    setEffectSongId(null);
    setCurrentEffectCombo('');
    setEffectsEnabled(false);
    setSpeedupIsEnabled(false);
    setSlowDownIsEnabled(false);

    if (!currentSongId) return;

    // Change to the original file location
    currentSong.src = visibleSongs[currentSongId].file;

    // Start playing the song from the beginning
    restartCurrentSong();
  };

  const restartCurrentSong = () => {
    // currentSong.pause();
    currentSong.currentTime = 0;
    currentSong.play();
  };

  return {
    runEffect,
    addEffect,
    applySavedEffects,
    toggleSpeedup,
    toggleSlowDown,
    // renderAudioWithEffect,
    handleSpeedChange,
    saveEffects,
    resetCurrentSong,
    fileLocation,
    effects,
    setEffects,
    savedEffects,
    setSavedEffects,
    effectsEnabled,
    setEffectsEnabled,
    currentEffectCombo,
    setCurrentEffectCombo,
    currentSpeed,
    setCurrentSpeed,
    speedupIsEnabled,
    setSpeedupIsEnabled,
    slowDownIsEnabled,
    setSlowDownIsEnabled,
  };
};
