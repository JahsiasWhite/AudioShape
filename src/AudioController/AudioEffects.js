import { useState, useEffect } from 'react';

// Very helpful audio processing library
import * as Tone from 'tone';

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

  //   var fileLocation; // TODO
  var effectThreshold = 0;

  /**
   * Applies the given effect to the current song
   * @param {*} effect
   * @param {*} value
   */
  const runEffect = async (effect, value) => {
    // TODO: Does this one really have to be different
    if (effect === 'speed') {
      handleSpeedChange(value);
      return;
    }

    // Find the current function for the corresponding effect
    let effectFunction;
    switch (effect) {
      case 'reverb':
      case 'reverbWetness':
        effectFunction = applyReverb;
        break;
      case 'delay':
        effectFunction = applyDelay;
        break;
      case 'bitCrusher':
        effectFunction = applyBitCrusher;
        break;
      case 'pitchShift':
        effectFunction = applyPitchShift;
        break;
      default:
        console.error(`Unknown effect: ${effect}`);
        return;
    }

    // Get our new audio data
    const audioBuffer = await getCurrentAudioBuffer(fileLocation);
    const renderedBuffer = await renderAudioWithEffect(
      audioBuffer,
      effectFunction,
      value
    );

    // Save the new song
    downloadAudio(renderedBuffer);
  };

  const addEffect = async (currentEffect, value, fL) => {
    console.error('ADDING EFFECT: ' + currentEffect);
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
      console.error(otherEffect);
      if (otherEffect[0] === undefined) {
        // play original song
        console.error('PLAYING ORIGINAL SONG');

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

    /* Annoying check, this will run if we aren't coming from applySavedEffects. IE: just editing one at a time and not using saved effects */
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

    await runEffect(currentEffect, value);
    await getTempSong();
  };

  const applySavedEffects = async (comboName) => {
    // The first effect will be applied to the original file
    fileLocation = visibleSongs[currentSongId].file;

    console.error(savedEffects, comboName, savedEffects[comboName]);
    if (savedEffects[comboName]) {
      setEffectsEnabled(true);
      setCurrentEffectCombo(comboName); // TODO ALSO REDUNDANT

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

    // They can't both be active
    if (slowDownIsEnabled) {
      setSlowDownIsEnabled(false);
    }

    fileLocation = visibleSongs[currentSongId].file; // TODO: Make this a function, set default fileLocation

    if (speedupIsEnabled) {
      setSpeedupIsEnabled(false);
      // handleSpeedChange(1);
      addEffect('speed', 1);
    } else {
      setSpeedupIsEnabled(true);
      // handleSpeedChange(DEFAULT_SPEEDUP);
      addEffect('speed', DEFAULT_SPEEDUP);
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

    if (speedupIsEnabled) {
      setSpeedupIsEnabled(false);
    }

    fileLocation = visibleSongs[currentSongId].file;

    if (slowDownIsEnabled) {
      setSlowDownIsEnabled(false);
      // handleSpeedChange(1);
      addEffect('speed', 1);
    } else {
      setSlowDownIsEnabled(true);
      // handleSpeedChange(DEFAULT_SLOWDOWN);
      addEffect('speed', DEFAULT_SLOWDOWN);
    }
    // return;
    // setSlowDownIsEnabled(!slowDownIsEnabled);
    // handleSpeedChange(1.2);
  };

  async function renderAudioWithEffect(
    audioBuffer,
    effectFunction,
    effectParams
  ) {
    const duration = audioBuffer.duration;
    return await Tone.Offline(async ({ transport }) => {
      const source = effectFunction(audioBuffer, effectParams);
      source.start();
    }, duration);
  }

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

  useEffect(() => {
    const handleEffectComboAdded = (newEffectCombos) => {
      setSavedEffects(newEffectCombos);
    };

    window.electron.ipcRenderer.once(
      'SAVE_EFFECT_COMBO',
      handleEffectComboAdded
    );
  }, [savedEffects]);

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
  function applySpeedChange(audioBuffer, speedChange) {
    const player = new Tone.Player(audioBuffer).toDestination();
    player.playbackRate = speedChange;
    return player;
  }
  async function renderAudioWithSpeedChange(audioBuffer, speedChange) {
    const duration = audioBuffer.duration / speedChange;
    return await Tone.Offline(async ({ transport }) => {
      const source = applySpeedChange(audioBuffer, speedChange);
      source.start();
    }, duration);
  }

  /* REVERB EFFECT */
  function applyReverb(audioBuffer, wetValue) {
    // const reverb = new Tone.Reverb().toDestination();
    // const player = new Tone.Player(audioBuffer).connect(reverb);

    const reverb = new Tone.Freeverb().toDestination();

    // Defaults
    const WET_VALUE = 0.5; // 0-1, determines how much the original signal is mixed with the reverb signal. 1 === 100%, 0 === 0% meaning it will be the original audio
    const ROOM_SIZE = 0.5; // 0-1, how expansive the reverb sounds. 1 === large room/long decay time.
    const DAMPENING_VALUE = 8000; // 1000-10000, controls how quickly high-frequency content decays over time. The lower the value, the 'brighter' and more reflective it sounds. High values make the reverb sound darker and less reflective
    reverb.wet.value = WET_VALUE; // Also known as 'mix'
    reverb.roomSize.value = ROOM_SIZE;
    reverb.dampening = DAMPENING_VALUE; // Also known as 'Tone'

    if (wetValue) {
      reverb.wet.value = wetValue;
    }

    const player = new Tone.Player(audioBuffer).connect(reverb);

    return player;
  }

  /* DELAY EFFECT */
  function applyDelay(audioBuffer, delayTime, feedback) {
    const delay = new Tone.FeedbackDelay({
      delayTime: delayTime, // Adjust this value to set the delay time (in seconds)
      feedback: 0.5, // Adjust this value to set the feedback amount (0 to 1). Determines how much is fedback, 1 indicates full feedback (infinitely recycled) and 0 meens no feedback (only original audio is heard)
    }).toDestination();

    const player = new Tone.Player(audioBuffer).connect(delay);

    return player;
  }

  /* BIT CRUSHER EFFECT */
  function applyBitCrusher(audioBuffer, bits, frequency) {
    const bitCrusher = new Tone.BitCrusher({
      bits: bits, // Number of bits to reduce the audio to (e.g., 4 bits for a lo-fi effect) ! 16 is CD quality
      // frequency: 1000, // Sample rate reduction frequency (controls the downsampling effect) ! I THINK 44,100 is the typical frequency
    }).toDestination();

    const player = new Tone.Player(audioBuffer).connect(bitCrusher);

    return player;
  }

  /* PITCH SHIFT EFFECT */
  function applyPitchShift(audioBuffer, pitch) {
    const pitchShift = new Tone.PitchShift().toDestination();
    pitchShift.pitch = pitch; // +12 === one octave up

    const player = new Tone.Player(audioBuffer).connect(pitchShift);

    return player;
  }

  /**
   * Resets the current song's effects to the default and restarts it
   */
  const resetCurrentSong = () => {
    // Reset the songs effects
    setCurrentEffectCombo('');

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
    renderAudioWithEffect,
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
