import React from 'react';
import {
  render,
  renderHook,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from '@testing-library/react';
import AudioPlugin from '../../../src/components/Mixer/AudioPlugin.js';
import AudioContext, {
  AudioProvider,
} from '../../../src/AudioController/AudioContext';

const loadedSongs = [
  {
    title: 'title',
    artist: 'artist',
  },
  {
    title: 'title2',
    artist: 'artist2',
  },
];
const savedEffects = {};
const mockCurrentSong = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
const effects = { 1: {} };
const loadingQueue = ['effect1'];

var mockSetVisibleSongs;
var handleSongSelectMock;
var clearEffectsMock;
var setEffectsMock;
jest.mock('../../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    effects: effects,
    setEffects: (setEffectsMock = jest.fn()),
    loadingQueue: loadingQueue,
    currentSpeed: 1,
    currentSong: mockCurrentSong,
    savedEffects: savedEffects,
    currentEffectCombo: '',
    clearEffects: (clearEffectsMock = jest.fn()),
    addEffect: jest.fn(),
  });

  return {
    ...jest.requireActual('../../../src/AudioController/AudioContext'),
    useAudioPlayer,
  };
});

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    on: jest.fn(),
    once: jest.fn(),
    sendMessage: jest.fn(),
  },
};

describe('<AudioPlugin />', () => {
  it('renders AudioPlugin correctly', () => {
    const { container } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>,
    );

    expect(container).toBeDefined();
  });

  it('handles reset button correctly', async () => {
    const buttonText = 'Reset';
    const { getByText } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>,
    );

    const resetDiv = getByText(buttonText);
    expect(resetDiv).toBeDefined();

    const resetButton = resetDiv.querySelector('.synth-button');
    expect(resetButton).toBeDefined();

    // Click reset button
    fireEvent.click(resetButton);

    expect(clearEffectsMock).toHaveBeenCalledTimes(1);
    expect(getByText('MULTIPLIER: 1x')).not.toBeNull();
  });

  it('speed knob should work', async () => {
    const { container, getByText } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>,
    );

    // Multiplier is default to 1x
    const multiplier = getByText('MULTIPLIER: 1x');
    expect(multiplier).not.toBeNull();

    const speedContainer = container.querySelector('.speed-body');
    expect(speedContainer).toBeDefined();

    const speedKnob = speedContainer.querySelector('.knob-svg');
    expect(speedKnob).not.toBeNull();

    // Drag speed to the right
    fireEvent.mouseDown(speedKnob);
    await act(async () => {
      fireEvent.mouseMove(document, { clientX: 10, clientY: 0 });
      fireEvent.mouseUp(document);
    });

    // There is a small delay for the UI to update that we have to wait for
    await waitFor(() => {
      expect(getByText('MULTIPLIER: 0.39x')).not.toBeNull();
    });
  });

  it('speed knob position should update when reset button is pressed', async () => {
    const { container, getByText } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>,
    );

    // Multiplier is default to 1x
    const multiplier = getByText('MULTIPLIER: 1x');
    const speedContainer = container.querySelector('.speed-body');

    const speedKnob = speedContainer.querySelector('.knob-svg');
    expect(speedKnob).not.toBeNull();

    // Simulate moving speed knob to the right
    fireEvent.mouseDown(speedKnob);
    await act(async () => {
      fireEvent.mouseMove(document, { clientX: 10, clientY: 0 });
      fireEvent.mouseUp(document);
    });

    // There is a small delay for the UI to update that we have to wait for
    await waitFor(() => {
      expect(getByText('MULTIPLIER: 0.39x')).not.toBeNull();

      // Click Reset button
      const resetDiv = getByText('Reset');
      const resetButton = resetDiv.querySelector('.synth-button');
      fireEvent.click(resetButton);

      const resetMultiplier = getByText('MULTIPLIER: 1x');
      expect(resetMultiplier).not.toBeNull();
    });
  });

  it('speed knob position should update when a speed effect is added (like toggleSpeedup)', async () => {
    // Mock the useAudioPlayer hook to simulate currentSpeed changes
    const mockUseAudioPlayer =
      require('../../../src/AudioController/AudioContext').useAudioPlayer;

    // First render with default speed
    mockUseAudioPlayer.mockReturnValue({
      effects: effects,
      setEffects: setEffectsMock,
      loadingQueue: loadingQueue,
      currentSpeed: 1, // Default speed
      currentSong: mockCurrentSong,
      savedEffects: savedEffects,
      currentEffectCombo: '',
      clearEffects: clearEffectsMock,
      addEffect: jest.fn(),
    });

    const { container, getByText, rerender } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>,
    );

    // Multiplier is default to 1x
    expect(getByText('MULTIPLIER: 1x')).not.toBeNull();
    const speedContainer = container.querySelector('.speed-body');
    expect(speedContainer).not.toBeNull();

    // Make sure default multiplier is correct
    expect(getByText('MULTIPLIER: 1x')).not.toBeNull();

    // Now simulate a speed effect being added (like toggleSpeedup would do)
    // Update the mock to return a new currentSpeed value
    mockUseAudioPlayer.mockReturnValue({
      effects: effects,
      setEffects: setEffectsMock,
      loadingQueue: loadingQueue,
      currentSpeed: 1.2, // Speed effect applied
      currentSong: mockCurrentSong,
      savedEffects: savedEffects,
      currentEffectCombo: '',
      clearEffects: clearEffectsMock,
      addEffect: jest.fn(),
    });

    // Rerender the component to trigger the useEffect
    rerender(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>,
    );

    // The multiplier display should now reflect the new speed
    await waitFor(() => {
      expect(getByText('MULTIPLIER: 1.2x')).not.toBeNull();
    });
  });

  it('updates EQ readouts when a saved preset with EQ is applied', async () => {
    const mockUseAudioPlayer =
      require('../../../src/AudioController/AudioContext').useAudioPlayer;

    mockUseAudioPlayer.mockReturnValue({
      effects: {},
      setEffects: jest.fn(),
      loadingQueue: [],
      currentSpeed: 1,
      currentSong: mockCurrentSong,
      savedEffects: {
        eqBank: {
          low: [-30, 0, 30],
          mid: [-30, 0, 30],
          high: [-30, 0, 30],
        },
      },
      currentEffectCombo: 'eqBank',
      clearEffects: clearEffectsMock,
      addEffect: jest.fn(),
      saveEffects: jest.fn(),
      handleSongExport: jest.fn(),
      speedupIsEnabled: false,
      slowdownIsEnabled: false,
      toggleSpeedup: jest.fn(),
      effectsEnabled: true,
    });

    const { getByText } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>,
    );

    await waitFor(() => {
      expect(getByText(/LOW: -23/)).not.toBeNull();
      expect(getByText(/MID: 1/)).not.toBeNull();
      expect(getByText(/HIGH: 24/)).not.toBeNull();
    });

    mockUseAudioPlayer.mockReturnValue({
      effects: effects,
      setEffects: setEffectsMock,
      loadingQueue: loadingQueue,
      currentSpeed: 1,
      currentSong: mockCurrentSong,
      savedEffects: savedEffects,
      currentEffectCombo: '',
      clearEffects: clearEffectsMock,
      addEffect: jest.fn(),
      saveEffects: jest.fn(),
      handleSongExport: jest.fn(),
      speedupIsEnabled: false,
      slowdownIsEnabled: false,
      toggleSpeedup: jest.fn(),
      effectsEnabled: false,
    });
  });
});
