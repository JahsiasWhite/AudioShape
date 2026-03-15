import { renderHook, act } from '@testing-library/react';
import { AudioEffects } from '../../src/AudioController/AudioEffects';

// import * as Tone from 'tone';
// jest.mock('tone');

// import ToneEffects from '../../src/AudioController/ToneEffects';

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    sendMessage: jest.fn(),
    once: jest.fn(),
    on: jest.fn(),
  },
};

const currentSong = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  src: 'sample-file',
  play: jest.fn(),
  playbackRate: 1,
  defaultPlaybackRate: 1,
};

const visibleSongs = {
  song1: { id: 'song1', file: 'sample-file' },
  song2: { id: 'song2', file: 'sample-file2' },
};
const currentSongId = 'song1';

jest.mock('../../src/AudioController/ToneEffects', () => {
  return {
    renderAudioWithEffect: jest.fn().mockResolvedValue({
      getChannelData: jest.fn(),
      numberOfChannels: 2,
      sampleRate: 44100,
      duration: 10,
    }),
    renderAudioWithSpeedChange: jest.fn().mockResolvedValue({
      getChannelData: jest.fn(),
      numberOfChannels: 2,
      sampleRate: 44100,
      duration: 10,
    }),
  };
});

describe('AudioEffects', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(false);
    expect(result.current.currentEffectCombo).toBe('');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should not crash when speedup is used with no song playing', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.toggleSpeedup();
    });

    // Initial state assertions
    expect(result.current.speedupIsEnabled).toBe(true);
  });

  it('should add and apply a custom effect with speed', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.setSavedEffects({ effect: { speed: 1.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(true);
    expect(result.current.currentEffectCombo).toBe('effect');
    expect(result.current.currentSpeed).toBe(1.5);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should turn off the current effect', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.setSavedEffects({ effect: { reverb: 0.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(false);
    expect(result.current.currentEffectCombo).toBe('');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should turn off the current effect if there is no song', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        undefined, // currentSongId
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.setSavedEffects({ effect: { reverb: 0.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(false);
    expect(result.current.currentEffectCombo).toBe('');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should reset current song', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.toggleSpeedup();
    });

    act(() => {
      result.current.resetCurrentSong();
    });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(false);
    expect(result.current.currentEffectCombo).toBe('');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should reset when no song is selected', async () => {
    const currentSong = {
      src: null,
    };
    const currentSongId = null;
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.resetCurrentSong();
    });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(false);
    expect(result.current.currentEffectCombo).toBe('');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should add and apply a custom effect with reverb', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.setSavedEffects({ effect: { reverb: 0.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(true);
    expect(result.current.currentEffectCombo).toBe('effect');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should add and apply a custom effect with delay', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.setSavedEffects({ effect: { delay: 0.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(true);
    expect(result.current.currentEffectCombo).toBe('effect');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should remove saved combo effects when switching to a different saved combo', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.setSavedEffects({ effect: { speed: 0.5, p: 0.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect');
    });

    act(() => {
      result.current.setSavedEffects({ effect0: { delay: 0.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect0');
    });

    act(() => {
      result.current.setSavedEffects({ effect2: { reverb: 0.5 } });
    });

    act(() => {
      result.current.applySavedEffects('effect2');
    });

    // Initial state assertions
    expect(result.current.effects).toEqual({ reverb: 0.5 });
    expect(result.current.effectsEnabled).toBe(true);
    expect(result.current.currentEffectCombo).toBe('effect2');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should handle a saved combo with only speed (no rendered effects)', async () => {
    const { result } = renderHook(() =>
      AudioEffects(
        currentSong,
        visibleSongs,
        currentSongId,
        1,
        0.5,
      ),
    );

    act(() => {
      result.current.setSavedEffects({ speedOnly: { speed: 1.5 } });
    });

    act(() => {
      result.current.applySavedEffects('speedOnly');
    });

    expect(result.current.effectsEnabled).toBe(true);
    expect(result.current.currentEffectCombo).toBe('speedOnly');
    expect(result.current.currentSpeed).toBe(1.5);
    expect(currentSong.playbackRate).toBe(1.5);
  });
});
