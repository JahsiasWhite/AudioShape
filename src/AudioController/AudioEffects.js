import { useState, useEffect } from 'react';

import { updateLiveEffect, resetAllLiveEffects } from './LiveEffectsChain.js';

export const AudioEffects = (
  currentSong,
  visibleSongs,
  currentSongId,
  DEFAULT_SPEEDUP,
  DEFAULT_SLOWDOWN,
) => {
  const [effects, setEffects] = useState({});
  const [savedEffects, setSavedEffects] = useState({});
  const [effectsEnabled, setEffectsEnabled] = useState(false);
  const [currentEffectCombo, setCurrentEffectCombo] = useState('');
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [speedupIsEnabled, setSpeedupIsEnabled] = useState(false);
  const [slowDownIsEnabled, setSlowDownIsEnabled] = useState(false);
  const [effectSongId, setEffectSongId] = useState(null);

  /**
   * Applies an effect instantly via the live audio chain.
   * Speed is still applied via playbackRate; all other effects update live nodes.
   */
  const addEffect = (currentEffect, value) => {
    if (currentEffect === 'speed') {
      setCurrentSpeed(value);
      currentSong.playbackRate = value;
      currentSong.defaultPlaybackRate = value;
      return;
    }

    // Turning an effect off
    if (value === false) {
      const { [currentEffect]: _, ...remainingEffects } = effects;
      setEffects(remainingEffects);
      updateLiveEffect(currentEffect, false);
      return;
    }

    setEffects((prev) => ({ ...prev, [currentEffect]: value }));
    updateLiveEffect(currentEffect, value);
  };

  const toggleSavedEffectOff = () => {
    resetCurrentSong();
  };

  /**
   * Applies a saved effect combo instantly via the live audio chain.
   */
  const applySavedEffects = (comboName) => {
    const isSameCombo = currentEffectCombo === comboName;
    const isSameSong = effectSongId === currentSongId;
    if (isSameCombo && isSameSong) {
      toggleSavedEffectOff();
      return;
    }

    // Reset all live nodes and state before applying the new combo
    resetAllLiveEffects();
    setEffects({});
    setCurrentSpeed(1);
    currentSong.playbackRate = 1;
    currentSong.defaultPlaybackRate = 1;

    if (savedEffects[comboName]) {
      setEffectsEnabled(true);
      setCurrentEffectCombo(comboName);
      setEffectSongId(currentSongId);
      setSpeedupIsEnabled(false);
      setSlowDownIsEnabled(false);

      const newEffects = {};
      for (const [effect, value] of Object.entries(savedEffects[comboName])) {
        if (effect === 'speed') {
          setCurrentSpeed(value);
          currentSong.playbackRate = value;
          currentSong.defaultPlaybackRate = value;
        } else {
          updateLiveEffect(effect, value);
          newEffects[effect] = value;
        }
      }
      setEffects(newEffects);
    }
  };

  /**
   * Toggles whether the current and all future songs will be sped up
   */
  const toggleSpeedup = () => {
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
   * Initial call to get all effect combos
   */
  window.electron.ipcRenderer.on('GRAB_EFFECT_COMBOS', (newEffectCombos) => {
    setSavedEffects(newEffectCombos);
  });

  const saveEffects = (comboName) => {
    const effectsToSave =
      currentSpeed !== 1 ? { ...effects, speed: currentSpeed } : effects;

    window.electron.ipcRenderer.sendMessage(
      'SAVE_EFFECT_COMBO',
      comboName,
      effectsToSave,
    );
  };

  const handleEffectComboAdded = (newEffectCombos) => {
    setSavedEffects(newEffectCombos);
  };

  useEffect(() => {
    window.electron.ipcRenderer.once(
      'SAVE_EFFECT_COMBO',
      handleEffectComboAdded,
    );
  }, [savedEffects]);

  /**
   * Resets the current song's effects to defaults and restarts it
   */
  const clearEffects = () => {
    const wasPaused = currentSong.paused;
    resetAllLiveEffects();
    setEffects({});
    setEffectSongId(null);
    setCurrentEffectCombo('');
    setEffectsEnabled(false);
    setSpeedupIsEnabled(false);
    setSlowDownIsEnabled(false);
    setCurrentSpeed(1);
    currentSong.playbackRate = 1;
    currentSong.defaultPlaybackRate = 1;
    if (wasPaused) currentSong.pause();
  };

  const resetCurrentSong = () => {
    clearEffects();

    if (!currentSongId) return;

    console.error('Resetting current song to:', visibleSongs, currentSongId);
    currentSong.src = visibleSongs[currentSongId].file;
    restartCurrentSong();
  };

  const restartCurrentSong = () => {
    currentSong.currentTime = 0;
    currentSong.play();
  };

  return {
    addEffect,
    applySavedEffects,
    toggleSpeedup,
    toggleSlowDown,
    saveEffects,
    clearEffects,
    resetCurrentSong,
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
