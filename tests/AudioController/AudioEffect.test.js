import { renderHook, act } from '@testing-library/react';
import { AudioEffects } from '../../src/AudioController/AudioEffects';

// import * as Tone from 'tone';
// jest.mock('tone');

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
};

const fileLocation = 'sample-file';
const visibleSongs = {
  song1: { id: 'song1', file: 'sample-file' },
};
const currentSongId = 'song1';

describe('AudioEffects', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      AudioEffects({
        currentSong: currentSong,
        fileLocation: fileLocation,
        onSongEnded: jest.fn(),
        visibleSongs: visibleSongs,
        currentSongId: currentSongId,
        startLoading: jest.fn(),
        finishLoading: jest.fn(),
        downloadAudio: jest.fn(),
        handleTempSongSaved: jest.fn(),
        initCurrentSong: jest.fn(),
        DEFAULT_SPEEDUP: 1,
        DEFAULT_SLOWDOWN: 0.5,
        getCurrentAudioBuffer: jest.fn(),
      })
    );

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(false);
    expect(result.current.currentEffectCombo).toBe('');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);
  });

  it('should add and apply an effect', async () => {
    const { result } = renderHook(() =>
      AudioEffects({
        currentSong: currentSong,
        fileLocation: fileLocation,
        onSongEnded: jest.fn(),
        visibleSongs: visibleSongs,
        currentSongId: currentSongId,
        startLoading: jest.fn(),
        finishLoading: jest.fn(),
        downloadAudio: jest.fn(),
        handleTempSongSaved: jest.fn(),
        initCurrentSong: jest.fn(),
        DEFAULT_SPEEDUP: 1,
        DEFAULT_SLOWDOWN: 0.5,
        getCurrentAudioBuffer: jest.fn(),
      })
    );

    // act(() => {
    //     result.current.
    //   });

    // Initial state assertions
    expect(result.current.effectsEnabled).toBe(false);
    expect(result.current.currentEffectCombo).toBe('');
    expect(result.current.currentSpeed).toBe(1);
    expect(result.current.speedupIsEnabled).toBe(false);
    expect(result.current.slowDownIsEnabled).toBe(false);

    // Add an effect
    // act(() => {
    //   result.current.addEffect('reverb', 0.7, 'sample-file');
    // });

    // // Wait for effect to be applied
    // await waitForNextUpdate();

    // // Assertions after adding an effect
    // expect(result.current.effectsEnabled).toBe(true);
    // expect(result.current.currentEffectCombo).toBe('');
    // expect(result.current.currentSpeed).toBe(1);
    // expect(result.current.speedupIsEnabled).toBe(false);
    // expect(result.current.slowDownIsEnabled).toBe(false);
    // Add more assertions based on your logic

    // Apply saved effects
    // act(() => {
    //   result.current.applySavedEffects('SavedCombo');
    // });

    // // Wait for saved effects to be applied
    // await waitForNextUpdate();

    // Assertions after applying saved effects
    // Add your assertions based on the expected state after applying saved effects

    // Other test cases can be added similarly
  });
});
